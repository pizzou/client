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
export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    userLoggedIn: (state, action) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.user = action.payload.user; // Assign the user object here
    },
    userLoggedOut: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.user = null;
    },
  },
});

export const { userLoggedIn, userLoggedOut } = authSlice.actions;
export default authSlice.reducer;
