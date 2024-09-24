import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { userLoggedIn } from "../auth/authSlice";
import Cookies from "js-cookie";

// API slice for handling requests
export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_SERVER_URI, // Ensure the environment variable is set correctly
    prepareHeaders: (headers) => {
      // Get tokens from cookies
      const accessToken = Cookies.get("accessToken");
      const refreshToken = Cookies.get("refreshToken");

      // Add Authorization header if access token exists
      if (accessToken) {
        headers.set("Authorization", `Bearer ${accessToken}`);
      }

      // Add custom header for refresh token if it exists
      if (refreshToken) {
        headers.set("x-refresh-token", refreshToken);
      }

      // Set Content-Type to application/json
      headers.set("Content-Type", "application/json");

      return headers;
    },
    credentials: "include", // Include credentials (like cookies) in cross-origin requests
  }),
  endpoints: (builder) => ({
    // Query to refresh token
    refreshToken: builder.query({
      query: () => ({
        url: "refresh",
        method: "GET",
        credentials: "include", // Ensure cookies are included in the request
      }),
    }),
    // Query to load user data based on tokens
    loadUser: builder.query({
      query: () => ({
        url: "me",
        method: "GET",
        credentials: "include", // Include cookies for authentication
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          // Await the result of the query
          const result = await queryFulfilled;

          // Dispatch userLoggedIn action to save tokens and user info in state
          dispatch(
            userLoggedIn({
              accessToken: result.data.accessToken, // Make sure these match your backend response structure
              refreshToken: result.data.refreshToken,
              user: result.data.user,
            })
          );
        } catch (error: any) {
          console.error("Error loading user:", error);

          // Handle specific errors such as token expiration or invalid request
          if (error?.status === 401) {
            console.log("Unauthorized: Access token is invalid or expired.");
          } else if (error?.status === 400) {
            console.log("Bad Request: Ensure the request is well-formed.");
          }
        }
      },
    }),
  }),
});

// Export hooks for the queries
export const { useRefreshTokenQuery, useLoadUserQuery } = apiSlice;
