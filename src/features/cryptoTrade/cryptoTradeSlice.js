import { createSlice } from '@reduxjs/toolkit';
import { fetchSymbols, fetchPrices } from './cryptoTradeAPI';

const initialState = {
  base_ccy: 'USD',
  symbols: [],
  cash_balance: 1000000.0,
  invested_amt: 0.0,
  investment_value: 0.0,
  investment_pnl: 0.0,
  portfolio: {},
  error: '',
  status: 'idle'
};

// The function below is called a thunk and allows us to perform async logic. It
// can be dispatched like a regular action: `dispatch(incrementAsync(10))`. This
// will call the thunk with the `dispatch` function as the first argument. Async
// code can then be executed and other actions can be dispatched. Thunks are
// typically used to make async requests.

export const cryptoTradeSlice = createSlice({
  name: 'cryptoTrade',
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    // Redux Toolkit allows us to write "mutating" logic in reducers. It
    // doesn't actually mutate the state because it uses the Immer library,
    // which detects changes to a "draft state" and produces a brand new
    // immutable state based off those changes

    // Use the PayloadAction type to declare the contents of `action.payload`
    setBaseCurrency: (state, action) => {
      state.base_ccy = action.payload;
    },

    setPrices: (state, action) => {
      state.status = 'idle';
      const p = action.payload;
      const pf = state.portfolio;
      var inv_value = 0.0;

      Object.keys(p).forEach((s) => {
        if (s in pf) {
          pf[s].price = p[s];
          pf[s].value = pf[s].quantity * pf[s].price;
          pf[s].pnl = pf[s].value - pf[s].amount
          inv_value += pf[s].value;
        } else
          pf[s] = {
            symbol: s,
            price: p[s],
            quantity: 0.0,
            value: 0.0,
            amount: 0.0,
            pnl: 0.0
          }
      })

      state.portfolio = pf;
      state.investment_value = inv_value;
      state.investment_pnl = state.investment_value - state.invested_amt;
    },

    setSymbols: (state, action) => {
      state.status = 'idle';
      const p = action.payload
      const portfolio = {};
      p.forEach((s) => {
        portfolio[s] = {
          symbol: s,
          price: 0.0,
          quantity: 0.0,
          value: 0.0,
          amount: 0.0,
          pnl: 0.0
        }
      })
      state.portfolio = portfolio;
      state.symbols = p;
    },

    resetError: (state, action) => {
      state.error = '';
    },

    resetPortfolio: (state, action) => {
      const { currency, amount } = action.payload;
      const portfolio = state.portfolio;
      Object.values(portfolio).forEach((pos) => {
        pos.quantity = 0.0;
        pos.price = 0.0;
        pos.value = 0.0;
        pos.amount = 0.0
        pos.pnl = 0.0
      })
      state.portfolio = portfolio;
      state.base_ccy = currency;
      state.cash_balance = amount;
      state.invested_amt = 0.0;
      state.investment_value = 0.0;
      state.investment_pnl = 0.0;
    },

    trade: (state, action) => {
      const { symbol, side, quantity: qty } = action.payload;
      const quantity = parseFloat(qty);
      const portfolio = { ...state.portfolio };
      const position = { ...portfolio[symbol] };
      portfolio[symbol] = position;
      const principal = (quantity * position.price);
      var cash_balance = state.cash_balance
      var invested_amt = state.invested_amt
      var investment_value = state.investment_value
      var investment_pnl = state.investment_pnl

      if (side === 'B' && principal > state.cash_balance) {
        state.error = `You cannot afford to buy ${quantity} ${symbol}`;
        return;
      }

      if (side === 'S' && quantity > position.quantity) {
        state.error = `You dont have ${quantity} ${symbol} to sell`
        return;
      }

      state.portfolio = portfolio;
      position.symbol = symbol;
      switch (side) {
        case 'B':
          position.quantity += quantity;
          position.value += principal;
          position.amount += principal;
          position.pnl = position.value - position.amount;

          cash_balance -= principal;
          invested_amt += principal;
          investment_value += principal;
          investment_pnl = investment_value - invested_amt;
          break;
        case 'S':
          position.quantity -= quantity;
          position.value -= (quantity * position.price);
          position.amount -= (quantity * position.price);
          position.pnl = position.value - position.amount;

          cash_balance += principal;
          invested_amt -= principal;
          investment_value -= principal;
          investment_pnl = investment_value - invested_amt;
          break;
        default:
          state.error = `invalid side - ${side}`
          return;
      }

      state.cash_balance = cash_balance;
      state.invested_amt = invested_amt;
      state.investment_value = investment_value;
      state.investment_pnl = investment_pnl;
    },
  },
});

export const { setBaseCurrency, setSymbols, setPrices, resetError, resetPortfolio, trade } = cryptoTradeSlice.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
export const selectSymbols = (state) => state?.cryptoTrade?.symbols
export const selectPortfolio = (state) => Object.values(state?.cryptoTrade?.portfolio);
export const selectBaseCurrency = (state) => state?.cryptoTrade?.base_ccy;
export const selectCashBalance = (state) => state?.cryptoTrade?.cash_balance;
export const selectInvestedAmount = (state) => state?.cryptoTrade?.invested_amt;
export const selectInvestmentValue = (state) => state?.cryptoTrade?.investment_value;
export const selectInvestmentPnL = (state) => state?.cryptoTrade?.investment_pnl;
export const selectError = (state) => state?.cryptoTrade?.error;
export const selectStatus = (state) => state?.cryptoTrade?.status;

// We can also write thunks by hand, which may contain both sync and async logic.
// Here's an example of conditionally dispatching actions based on current state.
export const launch = (currency, amount) => (dispatch, getState) => {
  setBaseCurrency(currency);
  resetPortfolio(currency, amount);
  fetchSymbols()
    .then((symbols) => {
      fetchPrices(symbols, currency)
        .then((prices) => {
          dispatch(setPrices(prices));
          setInterval(() => {
            fetchPrices(symbols, currency)
              .then((prices) => {
                dispatch(setPrices(prices));
              })
          }, 3000);
        })
      dispatch(setSymbols(symbols))
    })
};

export default cryptoTradeSlice.reducer;
