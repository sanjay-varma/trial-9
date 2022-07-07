import { APIKEY } from '../../config'

export function fetchSymbols() {
  return new Promise((resolve) =>
    fetch(`https://min-api.cryptocompare.com/data/top/totalvolfull?limit=10&tsym=USD&api_key=${APIKEY}`)
      .then((res) => res.json())
      .then((res) => {
        const symbols = res.Data.map((i) => { return i.CoinInfo.Name }, {});
        resolve(symbols)
      })
  );
}

export function fetchPrices(symbols, ccy) {
  return new Promise((resolve, reject) =>
    fetch(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${symbols.join(',')}&tsyms=${ccy}&api_key=${APIKEY}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.Response === 'Error') {
          console.error(res.Message);
          reject(res.Message)
        }

        else {
          const prices = Object.keys(res).reduce((pr, sym) => { pr[sym] = res[sym][ccy]; return pr }, {})
          resolve(prices)
        }
      })
  );
}
