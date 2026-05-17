export interface Coin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price?: number;
  market_cap?: number;
  total_volume?: number;
}

export interface CoinPriceInfo {
  usd: number;
  eur: number;
  ils: number;
}

export interface CoinDetails {
  id: string;
  symbol: string;
  name: string;
  image: {
    small: string;
    thumb: string;
  };
  market_data: {
    current_price: {
      usd: number;
      eur: number;
      ils: number;
    };
    market_cap: {
      usd: number;
    };
    total_volume: {
      usd: number;
    };
    price_change_percentage_30d_in_currency?: {
      usd?: number;
    };
    price_change_percentage_60d_in_currency?: {
      usd?: number;
    };
    price_change_percentage_200d_in_currency?: {
      usd?: number;
    };
  };
}

export interface AiCoinPayload {
  name: string;
  current_price_usd: number;
  market_cap_usd: number;
  volume_24h_usd: number;
  price_change_percentage_30d_in_currency: number;
  price_change_percentage_60d_in_currency: number;
  price_change_percentage_200d_in_currency: number;
}

export interface AiRecommendation {
  decision: "BUY" | "AVOID";
  explanation: string;
}

export type LoadingStatus = "idle" | "loading" | "succeeded" | "failed";
