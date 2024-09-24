import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { userLoggedIn } from "../auth/authSlice";
import Cookies from "js-cookie";

interface LoadUserResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    // Add other user fields as needed
  };
}

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
        headers.set("x-refresh-token", refreshToken); // Custom header for refresh token
      }

      headers.set("Content-Type", "application/json");

      return headers;
    },
    credentials: "include", // Include credentials (cookies) in cross-origin requests
  }),
  endpoints: (builder) => ({
    refreshToken: builder.query<{ accessToken: string; refreshToken: string }, void>({
      query: () => ({
        url: "refresh",
        method: "GET",
        credentials: "include",
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;

          // Update tokens in state and cookies
          Cookies.set("accessToken", data.accessToken);
          Cookies.set("refreshToken", data.refreshToken);

          dispatch(
            userLoggedIn({
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
              user: {}, // Optionally add user data if returned
            })
          );
        } catch (error: any) {
          console.error("Error refreshing token:", error);
        }
      },
    }),
    loadUser: builder.query<LoadUserResponse, void>({
      query: () => ({
        url: "me",
        method: "GET",
        credentials: "include",
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;

          // Dispatch to save tokens and user information in state
          dispatch(
            userLoggedIn({
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
              user: data.user,
            })
          );
        } catch (error: any) {
          console.error("Error loading user:", error);
        }
      },
    }),
  }),
});

export const { useRefreshTokenQuery, useLoadUserQuery } = apiSlice;
