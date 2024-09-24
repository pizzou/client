import { PayloadAction, createSlice } from "@reduxjs/toolkit";

// Define a proper type for your user data
interface User {
  id: string;
  name: string;
  email: string;
}

// Modify the initial state to use this structure
const initialState = {
  accessToken: null,
  refreshToken: null,
  user: null as User | null, // Ensure user can be an object or null
};

// Update the reducer to handle an object for the user
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    userRegistration: (state, action: PayloadAction<{ token: string }>) => {
      state.token = action.payload.token;
    },
    userLoggedIn: (
      state: any,
      action: PayloadAction<{
        accessToken: string;
        user: string;
        refreshToken: string;
      }>
    ) => {
      state.token = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.user = action.payload.user;
    },
    userLoggedOut: (state) => {
      state.token = "";
      state.user = "";
    },
  },
});

export const { userRegistration, userLoggedIn, userLoggedOut } =
  authSlice.actions;

export default authSlice.reducer;
