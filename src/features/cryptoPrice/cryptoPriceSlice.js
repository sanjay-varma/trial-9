import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetchSymbols, fetchPrices } from './cryptoPriceAPI';

const initialState = {
  selected_sym: '',
  symbols: {},
  prices: {},
  status: 'idle'
};

// The function below is called a thunk and allows us to perform async logic. It
// can be dispatched like a regular action: `dispatch(incrementAsync(10))`. This
// will call the thunk with the `dispatch` function as the first argument. Async
// code can then be executed and other actions can be dispatched. Thunks are
// typically used to make async requests.
export const fetchSymbolsAsync = createAsyncThunk(
  'cryptoPrice/fetchSymbols',
  async () => {
    const response = await fetchSymbols();
    // The value we return becomes the `fulfilled` action payload
    return response.symbols;
  }
);

export const fetchPricesAsync = createAsyncThunk(
  'cryptoPrice/fetchPrices',
  async (sym) => {
    const response = await fetchPrices(sym);
    // The value we return becomes the `fulfilled` action payload
    return response.prices;
  }
);

export const cryptoPriceSlice = createSlice({
  name: 'cryptoPrice',
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    // Redux Toolkit allows us to write "mutating" logic in reducers. It
    // doesn't actually mutate the state because it uses the Immer library,
    // which detects changes to a "draft state" and produces a brand new
    // immutable state based off those changes

    // Use the PayloadAction type to declare the contents of `action.payload`
    chooseSymbol: (state, action) => {
      state.selected_sym = action.payload;
    },
    showPrices: (state, action) => {
      state.symbols[action.payload] = true;
    },
    hidePrices: (state, action) => {
      state.symbols[action.payload] = false;
      delete state.prices[action.payload];
    },
  },
  // The `extraReducers` field lets the slice handle actions defined elsewhere,
  // including actions generated by createAsyncThunk or in other slices.
  extraReducers: (builder) => {
    builder
      .addCase(fetchSymbolsAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchSymbolsAsync.fulfilled, (state, action) => {
        state.status = 'idle';
        // state.selected_sym = action.payload[0];
        state.symbols = action.payload;
      })
      .addCase(fetchPricesAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchPricesAsync.fulfilled, (state, action) => {
        state.status = 'idle';
        var p = action.payload;
        var pr = { ...state.prices };
        var np = Object.keys(p).reduce((pr, curr) => { pr[curr] = p[curr]; return pr }, pr)
        state.prices = np;
      });
  },
});

export const { chooseSymbol, showPrices, hidePrices } = cryptoPriceSlice.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
export const selectSymbols = (state) => state?.cryptoPrice?.symbols;
export const selectPrices = (state, sym) => { return state?.cryptoPrice?.prices[sym] || {}; }
export const selectSelectedSym = (state) => state?.cryptoPrice?.selected_sym;
export const selectStatus = (state) => state?.cryptoPrice?.status;

// We can also write thunks by hand, which may contain both sync and async logic.
// Here's an example of conditionally dispatching actions based on current state.
// export const incrementIfOdd = (amount) => (dispatch, getState) => {
//   const currentValue = selectCount(getState());
//   if (currentValue % 2 === 1) {
//     dispatch(incrementByAmount(amount));
//   }
// };

export default cryptoPriceSlice.reducer;
