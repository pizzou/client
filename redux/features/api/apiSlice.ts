import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { userLoggedIn } from "../auth/authSlice";
import Cookies from "js-cookie";

// Base API slice for all API calls
export const apiSlice = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_SERVER_URI, // Ensure this is correctly set in your .env file
    credentials: 'include', // To send cookies with requests
    prepareHeaders: (headers, { getState }) => {
      // Get the access token from the cookie
      const token = Cookies.get('accessToken');
      
      // If the token exists, add it to the Authorization header
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      
      return headers;
    },
  }),
  endpoints: (builder) => ({
    // Refresh token endpoint
    refreshToken: builder.query({
      query: () => ({
        url: "refresh",
        method: "GET",
        credentials: "include",  // Include credentials for CORS requests
      }),
      // Optionally handle refresh token logic here
    }),

    // Load the current user details
    loadUser: builder.query({
      query: () => ({
        url: "me",
        method: "GET",
        credentials: "include",  // Ensure that cookies are included in requests
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          // Await the API call
          const result = await queryFulfilled;

          // Dispatch the userLoggedIn action to update the auth state
          dispatch(
            userLoggedIn({
              accessToken: result.data.accessToken,
              refreshToken: result.data.refreshToken,
              user: result.data.user,
            })
          );
        } catch (error: any) {
          console.error("Error loading user:", error);

          // Optionally handle specific error cases here, e.g., token expiry
          if (error?.error?.status === 401) {
            console.log("Token expired. Consider refreshing the token.");
            // You might want to trigger a token refresh here, or redirect to login
          }
        }
      },
    }),
  }),
});

// Export hooks for the queries
export const { useRefreshTokenQuery, useLoadUserQuery } = apiSlice;
