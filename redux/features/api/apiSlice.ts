import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { userLoggedIn } from "../auth/authSlice";
import Cookies from "js-cookie";

// Define your user type based on the expected shape of the user data
interface User {
  id: string;
  name: string;
  email: string;
  // Add other user properties here as needed
}

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_SERVER_URI, // Ensure this is correct
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
    credentials: "include", // Ensure cross-origin requests include credentials
  }),
  endpoints: (builder) => ({
    refreshToken: builder.query({
      query: () => ({
        url: "refresh",
        method: "GET",
        credentials: "include", // Ensures cookies are included in the request
      }),
    }),
    loadUser: builder.query({
      query: () => ({
        url: "me",
        method: "GET",
        credentials: "include", // Ensures cookies are included in the request
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          const { data } = result;

          // Assuming data contains user details, you can structure it accordingly
          dispatch(
            userLoggedIn({
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
              user: {
                id: data.user.id,
                name: data.user.name,
                email: data.user.email,
                // Other user properties
              }, // Adjust the shape of the user object as needed
            })
          );
        } catch (error: any) {
          console.error(error);
        }
      },
    }),
  }),
});

export const { useRefreshTokenQuery, useLoadUserQuery } = apiSlice;
