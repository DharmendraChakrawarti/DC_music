import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import playerReducer from './slices/playerSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    player: playerReducer,
  },
});
