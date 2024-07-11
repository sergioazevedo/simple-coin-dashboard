export interface CoinPrice {
  name: string,
  value: number,
  currency: string,
  updatedAt?: string
}

export type ConinPriceList = Array<CoinPrice>;
