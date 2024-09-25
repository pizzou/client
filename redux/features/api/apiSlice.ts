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
        headers.set("access-token", accessToken);
      }
      if (refreshToken) {
        headers.set("refresh-token", refreshToken);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    refreshToken: builder.query({
      query: () => ({
        url: "refresh",
        method: "GET",
        credentials: "include" as const,
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          
          // Set the tokens as cookies
          Cookies.set('accessToken', result.data.accessToken, { sameSite: 'None', secure: true });
          Cookies.set('refreshToken', result.data.refreshToken, { sameSite: 'None', secure: true });

          // Dispatch the userLoggedIn action to store tokens and user in state
          dispatch(
            userLoggedIn({
              accessToken: result.data.accessToken,
              refreshToken: result.data.refreshToken,
              user: result.data.user,
            })
          );
        } catch (error) {
          console.error("Error refreshing token:", error);
        }
      },
    }),
    loadUser: builder.query({
      query: () => ({
        url: "me",
        method: "GET",
        credentials: "include" as const,
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          
          // Set the tokens as cookies
          Cookies.set('accessToken', result.data.accessToken, { sameSite: 'None', secure: true });
          Cookies.set('refreshToken', result.data.refreshToken, { sameSite: 'None', secure: true });

          // Dispatch the userLoggedIn action
          dispatch(
            userLoggedIn({
              accessToken: result.data.accessToken,
              refreshToken: result.data.refreshToken,
              user: result.data.user,
            })
          );
        } catch (error) {
          console.error("Error loading user:", error);
        }
      },
    }),
  }),
});

export const { useRefreshTokenQuery, useLoadUserQuery } = apiSlice;
