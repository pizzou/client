import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { userLoggedIn } from "../auth/authSlice";
import Cookies from "js-cookie";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_SERVER_URI,
    prepareHeaders: (headers) => {
      const accessToken = Cookies.get("accessToken");
      const refreshToken = Cookies.get("refreshToken");

      if (accessToken) {
        headers.set("Authorization", `Bearer ${accessToken}`);
      }
      if (refreshToken) {
        headers.set("x-refresh-token", refreshToken); // Use custom header for refresh token
      }

      // If you are sending JSON, it's good to ensure content type
      headers.set("Content-Type", "application/json");

      return headers;
    },
    credentials: "include", // Make sure credentials are included for cross-origin requests
  }),
  endpoints: (builder) => ({
    refreshToken: builder.query({
      query: () => ({
        url: "refresh",
        method: "GET",
        credentials: "include", // Ensures cookies are included in request
      }),
    }),
    loadUser: builder.query({
      query: () => ({
        url: "me",
        method: "GET",
        credentials: "include", // Ensures cookies are included in request
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
