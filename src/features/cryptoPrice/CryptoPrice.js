import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card, CardContent, CardActions, Typography, Button, FormControl, Grid, InputLabel, MenuItem, Select, Stack, CircularProgress } from '@mui/material'
import { Container } from '@mui/system';
import {
  fetchSymbolsAsync,
  fetchPricesAsync,
  chooseSymbol,
  showPrices,
  hidePrices,
  selectSymbols,
  selectSelectedSym,
  selectPrices,
  selectStatus
} from './cryptoPriceSlice';

export function CryptoPrice() {
  const symbols = useSelector(selectSymbols);
  const selected_sym = useSelector(selectSelectedSym);
  const status = useSelector(selectStatus);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchSymbolsAsync());
  }, [dispatch])

  const showCard = (sym) => {
    return <div key={sym}>
      <PriceCard key={sym} sym={sym} />
    </div>
  }

  const addSelected = () => {
    dispatch(showPrices(selected_sym));
  }

  return (
    <div className="App">
      <Stack spacing={2} direction="row">
        <FormControl>
          <InputLabel>Symbol</InputLabel>
          <Select
            value={selected_sym}
            label="Symbol"
            onChange={(e) => dispatch(chooseSymbol(e.target.value))}
          >
            {Object.keys(symbols).map((s) => {
              return <MenuItem key={s} value={s}>{s}</MenuItem>
            })}
          </Select>
        </FormControl>
        <Button variant='contained' onClick={addSelected}>Add</Button>
        {(status === 'loading') && <CircularProgress />}
      </Stack>
      <Container maxWidth={false} disableGutters>
        <Grid sx={{ flexGrow: 1 }} spacing={0} container justifyContent="space-evenly">
          {
            Object.keys(symbols).filter((i) => { return symbols[i] }).map((s) => {
              return showCard(s)
            })
          }
        </Grid>
      </Container>
    </div >
  );
}

export function PriceCard(props) {

  const prices = useSelector((state) => selectPrices(state, props.sym));
  const dispatch = useDispatch();

  const updatePrice = () => {
    dispatch(fetchPricesAsync(props.sym));
  }

  useEffect(() => {
    dispatch(fetchPricesAsync(props.sym));
  }, [dispatch, props.sym])

  useEffect(() => {
    let id = setInterval(updatePrice, 3000);
    return () => clearInterval(id);
  })

  return (
    <Grid item>
      <Card>
        <CardContent>
          <Typography variant="h3" component="div">
            {props.sym}
          </Typography>
          <Typography sx={{ mb: 1.5 }} color="text.secondary">
            {Object.keys(prices).map((curr) => {
              return <span key={curr}><strong>{curr}:&nbsp;</strong>{prices[curr]}<br /></span>
            })}
          </Typography>
        </CardContent>
        <CardActions>
          <Button variant='contained' onClick={() => dispatch(hidePrices(props.sym))}>Remove</Button>
        </CardActions>
      </Card>
    </Grid>
  );
}