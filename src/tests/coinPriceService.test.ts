import 'fetch-mock-jest';
import { fetchPrices } from '../coinPriceService';

jest.mock('node-fetch', () => require('fetch-mock-jest').sandbox());
const fetchMock = require('node-fetch');

const MOCK_VALUES = {
  "bitcoin": {
    "usd": 63720.68,
    "last_updated_at": 1721075406
  },
  "cardano": {
    "usd": 0.44,
    "last_updated_at": 1721075423
  },
  "ethereum": {
    "usd": 3444.16,
    "last_updated_at": 1721075408
  }
};

const API_KEY_ERROR = {
  "status": {
    "error_code": 10002,
    "error_message": "API Key Missing"
  }
}

describe('fetching prices from CoinGecko', () => {
  beforeEach(() => {
    fetchMock.reset();
  });

  it ("returns an empty list if the API_KEY is empty", async() => {
    fetchMock.get("begin:https://api.coingecko.com/api/v3/simple/price",
      Promise.resolve({ body: JSON.stringify(API_KEY_ERROR),  status: 401 })
    )

    const result = await fetchPrices("");
    expect(result.length).toEqual(0);
  });

  describe('When a valid API KEY is configured', () => {
    beforeEach(() => {
      fetchMock.get("begin:https://api.coingecko.com/api/v3/simple/price",
        Promise.resolve({ body: JSON.stringify(MOCK_VALUES),  status: 200 })
      )
    });

    it ("returns an non empty Array", async() => {
      const result = await fetchPrices("SOME_API_KEY");
      expect(result.length).toBeGreaterThan(0);
    });

    it ("maps CoinGecko response into CoinPrice interface", async () => {
      const result = await fetchPrices("SOME_API_KEY");

      expect(typeof result[0].name).toStrictEqual("string");
      expect(typeof result[0].value).toStrictEqual("number");
      expect(typeof result[0].currency).toStrictEqual("string");
      expect(typeof result[0].updatedAt).toStrictEqual("string");
    })
  });
});
