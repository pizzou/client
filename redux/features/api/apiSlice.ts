import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { userLoggedIn } from "../auth/authSlice";
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
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_SERVER_URI,
    prepareHeaders: async (headers) => {
      let accessToken = Cookies.get("accessToken");

      if (!accessToken) {
        // Attempt to refresh token if accessToken is not present or expired
        accessToken = await refreshAccessToken();
      }

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
    credentials: "include",
  }),
  endpoints: (builder) => ({
    refreshToken: builder.query({
      query: () => ({
        url: "refresh",
        method: "GET",
        credentials: "include",
      }),
    }),
    loadUser: builder.query({
      query: () => ({
        url: "me",
        method: "GET",
        credentials: "include",
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;

          // Dispatch to save tokens and user information in state
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

export const { useRefreshTokenQuery, useLoadUserQuery } = apiSlice;
