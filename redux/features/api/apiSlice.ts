import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { userLoggedIn, userLoggedOut } from "../auth/authSlice";
import Cookies from "js-cookie";

// Function to handle token refresh
const refreshAccessToken = async () => {
  const refreshToken = Cookies.get("refreshToken");
  if (!refreshToken) return null;

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URI}/refresh`, {
      method: "GET",
      headers: {
        "x-refresh-token": refreshToken,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (response.ok) {
      const data = await response.json();
      Cookies.set("accessToken", data.accessToken);
      return data.accessToken;
    }
  } catch (error) {
    console.error("Token refresh failed:", error);
  }
  return null;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: async (args, api, extraOptions) => {
    let result = await fetchBaseQuery({
      baseUrl: process.env.NEXT_PUBLIC_SERVER_URI,
      credentials: "include",
      prepareHeaders: (headers) => {
        let accessToken = Cookies.get("accessToken");

        if (accessToken) {
          headers.set("Authorization", `Bearer ${accessToken}`);
        }
        const refreshToken = Cookies.get("refreshToken");
        if (refreshToken) {
          headers.set("x-refresh-token", refreshToken);
        }
        headers.set("Content-Type", "application/json");

        return headers;
      },
    })(args, api, extraOptions);

    if (result.error && result.error.status === 401) {
      // If access token is expired, attempt to refresh
      const newAccessToken = await refreshAccessToken();

      if (newAccessToken) {
        result = await fetchBaseQuery({
          baseUrl: process.env.NEXT_PUBLIC_SERVER_URI,
          credentials: "include",
          prepareHeaders: (headers) => {
            headers.set("Authorization", `Bearer ${newAccessToken}`);
            headers.set("Content-Type", "application/json");
            return headers;
          },
        })(args, api, extraOptions);
      } else {
        // If refresh fails, log the user out
        api.dispatch(userLoggedOut());
      }
    }

    return result;
  },
  endpoints: (builder) => ({
    loadUser: builder.query({
      query: () => ({
        url: "me",
        method: "GET",
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          dispatch(
            userLoggedIn({
              accessToken: result.data.accessToken,
              refreshToken: result.data.refreshToken,
              user: result.data.user,
            })
          );
        } catch (error: any) {
          console.log(error);
        }
      },
    }),
  }),
});

export const { useLoadUserQuery } = apiSlice;
