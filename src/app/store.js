import { configureStore } from '@reduxjs/toolkit';
import cryptoPriceReducer from '../features/cryptoPrice/cryptoPriceSlice';
import cryptoTradeReducer from '../features/cryptoTrade/cryptoTradeSlice';


export const store = configureStore({
  reducer: {
    cryptoPrice: cryptoPriceReducer,
    cryptoTrade: cryptoTradeReducer
  },
});
