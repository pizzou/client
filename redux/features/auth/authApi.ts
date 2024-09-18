import { apiSlice } from "../api/apiSlice";
import { userLoggedIn, userLoggedOut, userRegistration } from "./authSlice";
import Cookies from "js-cookie";

type RegistrationResponse = {
  message: string;
  activationToken: string;
};

type RegistrationData = {
  email: string;
  password: string;
  name?: string;
};

// Authentication API with injected endpoints
export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Register mutation
    register: builder.mutation<RegistrationResponse, RegistrationData>({
      query: (data) => ({
        url: "registration",
        method: "POST",
        body: data,
        credentials: "include", // Include credentials (cookies) in request
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          dispatch(
            userRegistration({
              token: result.data.activationToken, // Store activation token
            })
          );
        } catch (error: any) {
          console.error("Registration Error:", error);
        }
      },
    }),

    // Activation mutation
    activation: builder.mutation({
      query: ({ activation_token, activation_code }) => ({
        url: "activate-user",
        method: "POST",
        body: { activation_token, activation_code }, // Send activation token and code
      }),
    }),

    // Login mutation
    login: builder.mutation({
      query: ({ email, password }: { email: string; password: string }) => ({
        url: "login",
        method: "POST",
        body: { email, password }, // Pass login credentials
        credentials: "include", // Include credentials (cookies) in request
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          // Store tokens in cookies
          Cookies.set("accessToken", result.data.accessToken);
          Cookies.set("refreshToken", result.data.refreshToken);

          // Dispatch login action with user data
          dispatch(
            userLoggedIn({
              accessToken: result.data.accessToken,
              refreshToken: result.data.refreshToken,
              user: result.data.user,
            })
          );
        } catch (error: any) {
          console.error("Login Error:", error);
        }
      },
    }),

    // Social Authentication mutation
    socialAuth: builder.mutation({
      query: ({ email, name, avatar }: { email: string; name: string; avatar?: string }) => ({
        url: "social-auth",
        method: "POST",
        body: { email, name, avatar }, // Pass social auth data
        credentials: "include", // Include credentials (cookies)
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          // Store tokens in cookies
          Cookies.set("accessToken", result.data.accessToken);
          Cookies.set("refreshToken", result.data.refreshToken);

          // Dispatch login action with user data
          dispatch(
            userLoggedIn({
              accessToken: result.data.accessToken,
              refreshToken: result.data.refreshToken,
              user: result.data.user,
            })
          );
        } catch (error: any) {
          console.error("Social Auth Error:", error);
        }
      },
    }),

    // Logout query
    logOut: builder.query({
      query: () => ({
        url: "logout",
        method: "GET",
        credentials: "include", // Include credentials for logout
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          await queryFulfilled;
          // Clear tokens from cookies
          Cookies.remove("accessToken");
          Cookies.remove("refreshToken");

          // Dispatch logout action
          dispatch(userLoggedOut());
        } catch (error: any) {
          console.error("Logout Error:", error);
        }
      },
    }),
  }),
});

// Export hooks for use in components
export const {
  useRegisterMutation,
  useActivationMutation,
  useLoginMutation,
  useSocialAuthMutation,
  useLogOutQuery,
} = authApi;
