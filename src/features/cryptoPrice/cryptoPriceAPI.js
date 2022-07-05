import { APIKEY } from '../../config'

export function fetchSymbols() {
  return new Promise((resolve) =>
    fetch(`https://min-api.cryptocompare.com/data/top/totalvolfull?limit=10&tsym=USD&api_key=${APIKEY}`)
      .then((res) => res.json())
      .then((res) => {
        const symbols = res.Data.reduce((o, i) => { o[i.CoinInfo.Name] = false; return o }, {});
        resolve({ symbols: symbols })
      })
  );
}

export function fetchPrices(sym) {
  return new Promise((resolve, reject) =>
    fetch(`https://min-api.cryptocompare.com/data/price?fsym=${sym}&tsyms=INR,USD,JPY&api_key=${APIKEY}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.Response === 'Error') {
          reject(res.Message)
        }

        else {
          resolve({ prices: { [sym]: res } })
        }
      })
  );
}
