import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface UserPayload {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface AuthState {
  user: UserPayload | null;
}

const initialState: AuthState = {
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserPayload>) => {
      state.user = action.payload;
    },
    logout: (state) => {
      state.user = null;
    },
  },
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;
