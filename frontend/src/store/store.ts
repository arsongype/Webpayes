import { configureStore, type ThunkAction, type Action } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import transactionReducer from './slices/transactionSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    transactions: transactionReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;