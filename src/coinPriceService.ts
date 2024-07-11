import { CoinPrice, ConinPriceList } from "./coinPriceInterface";
import fetch from 'node-fetch';

interface CoinGeckoData {
  usd: number,
  last_updated_at: number
}
interface CoinGeckoPayload {
  [key: string] : CoinGeckoData
}

const BASIC_LIST = 'bitcoin,ethereum,cardano';

export async function fetchPrices(apiKey: string, coinList: string = BASIC_LIST) : Promise<ConinPriceList> {
  const url : URL = new URL(`https://api.coingecko.com/api/v3/simple/price?&vs_currencies=usd&&include_last_updated_at=true&precision=2&ids=${coinList}`);
  const options = {
    method: 'GET',
    headers: {accept: 'application/json', 'x-cg-demo-api-key': apiKey}
  };
  const response: fetch.Response = await fetch(url, options)
  if (!response.ok) {
    return [];
  }
  const jsonData: CoinGeckoPayload = await response.json();

  const coinPrices : ConinPriceList = Object.keys(jsonData).map((coinName: string) => {
    const coinData : CoinGeckoData = jsonData[coinName];

    var updatedAt = new Date(0);
    updatedAt.setUTCSeconds(coinData.last_updated_at);

    return {
      name: coinName,
      value: coinData.usd,
      currency: 'USD',
      updatedAt: updatedAt.toLocaleString('da-DK')
    } as unknown as CoinPrice
  } )

  return coinPrices;
}
