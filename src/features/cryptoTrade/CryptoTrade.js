import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Alert, TextField, Paper, TableCell, Typography, Button, Grid, TableContainer, TableHead, Table, TableRow, TableBody } from '@mui/material'

import {
  launch,
  resetError,
  trade,
  selectCashBalance,
  selectInvestedAmount,
  selectInvestmentValue,
  selectInvestmentPnL,
  selectBaseCurrency,
  selectPortfolio,
  selectError
} from './cryptoTradeSlice';

export function CryptoTrade() {
  const portfolio = useSelector(selectPortfolio);
  const error = useSelector(selectError);
  const base_ccy = useSelector(selectBaseCurrency);
  const cash_balance = useSelector(selectCashBalance);
  const invested_amt = useSelector(selectInvestedAmount);
  const investment_value = useSelector(selectInvestmentValue);
  const investment_pnl = useSelector(selectInvestmentPnL);
  const dispatch = useDispatch();

  const [tradeQuantity, setTradeQuantity] = useState({})

  useEffect(() => {
    dispatch(launch(base_ccy, 100000000));
  }, [dispatch, base_ccy])

  useEffect(() => {
    setTimeout(() => { dispatch(resetError()); }, 5000)
  }, [dispatch, error])

  return (
    <div className="App">
      <Grid container>
        <Grid item xs={3}>
          <Typography variant='body1'>Cash Balance ({base_ccy})</Typography>
          <Typography variant='h6'>{cash_balance.toLocaleString('en-US', { style: 'currency', currency: `${base_ccy}` })}</Typography>
        </Grid>
        <Grid item xs={3}>
          <Typography variant='body1'>Invested Amount ({base_ccy})</Typography>
          <Typography variant='h6'>{invested_amt.toLocaleString('en-US', { style: 'currency', currency: `${base_ccy}` })}</Typography>
        </Grid>
        <Grid item xs={3}>
          <Typography variant='body1'>Investment Value ({base_ccy})</Typography>
          <Typography variant='h6'>{investment_value.toLocaleString('en-US', { style: 'currency', currency: `${base_ccy}` })}</Typography>
        </Grid>
        <Grid item xs={3}>
          <Typography variant='body1'>{investment_pnl >= 0 ? 'Profit' : 'Loss'} ({base_ccy})</Typography>
          <Typography variant='h6'>{Math.abs(investment_pnl).toLocaleString('en-US', { style: 'currency', currency: `${base_ccy}` })}</Typography>
        </Grid>
      </Grid>
      {error !== '' && <Alert severity="error">{error}</Alert>}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="left">Symbol</TableCell>
              <TableCell align="right">Quantity</TableCell>
              <TableCell align="right">Price</TableCell>
              <TableCell align="right">Value</TableCell>
              <TableCell />
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {portfolio.map((pos) => {
              const position = { ...pos };
              return <TableRow key={position.symbol}>
                <TableCell align='left'>{position?.symbol}</TableCell>
                <TableCell align='right'>{position?.quantity.toLocaleString('en-US')}</TableCell>
                <TableCell align='right'>{position?.price.toLocaleString('en-US', { style: 'currency', currency: `${base_ccy}` })}</TableCell>
                <TableCell align='right'>{position?.value.toLocaleString('en-US', { style: 'currency', currency: `${base_ccy}` })}</TableCell>
                <TableCell align='right' >
                  <TextField
                    id="trade-quantity"
                    label="Quantity"
                    variant="standard"
                    defaultValue={0.0}
                    onChange={(event) => {
                      const q = { ...tradeQuantity };
                      if (parseFloat(event.target.value) === NaN)
                        setTradeQuantity(0)
                      else {
                        q[position.symbol] = parseFloat(event.target.value)
                        setTradeQuantity(q)
                      }
                    }}
                  />
                  <Button onClick={() => {
                    if (!isNaN(tradeQuantity[position.symbol]))
                      dispatch(trade({ symbol: position?.symbol, side: 'B', quantity: tradeQuantity[position.symbol] }))
                  }}>Buy</Button>
                  <Button onClick={() => {
                    if (!isNaN(tradeQuantity[position.symbol]))
                      dispatch(trade({ symbol: position?.symbol, side: 'S', quantity: tradeQuantity[position.symbol] }))
                  }}>Sell</Button>
                </TableCell>
                <TableCell />
              </TableRow>
            }
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div >
  );
}

