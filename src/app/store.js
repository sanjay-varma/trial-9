import { configureStore } from '@reduxjs/toolkit';
import cryptoPriceReducer from '../features/cryptoPrice/cryptoPriceSlice';

export const store = configureStore({
  reducer: {
    cryptoPrice: cryptoPriceReducer,
  },
});
