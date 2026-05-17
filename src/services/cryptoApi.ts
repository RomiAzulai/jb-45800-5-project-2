import type { AiCoinPayload, AiRecommendation, Coin, CoinDetails, CoinPriceInfo } from "../types";

export async function fetchMarketCoins(): Promise<Coin[]> {
  const response = await fetch("/api/coins/markets");

  if (!response.ok) {
    throw new Error("Could not load coins.");
  }

  return response.json();
}

export async function fetchCoinDetails(coinId: string): Promise<CoinDetails> {
  const response = await fetch(`/api/coins/${encodeURIComponent(coinId)}?market_data=true`);

  if (!response.ok) {
    throw new Error("Could not load coin details.");
  }

  return response.json();
}

export async function fetchCoinPrices(coinId: string): Promise<CoinPriceInfo> {
  const details = await fetchCoinDetails(coinId);

  return {
    usd: details.market_data.current_price.usd,
    eur: details.market_data.current_price.eur,
    ils: details.market_data.current_price.ils
  };
}

export async function fetchRealtimePrices(symbols: string[]): Promise<Record<string, { USD: number }>> {
  if (symbols.length === 0) {
    return {};
  }

  const response = await fetch(
    `/api/realtime?symbols=${encodeURIComponent(symbols.join(","))}`
  );

  if (!response.ok) {
    throw new Error("Could not load real-time prices.");
  }

  return response.json();
}

export async function requestAiRecommendation(
  payload: AiCoinPayload,
  openAiApiKey: string
): Promise<AiRecommendation> {
  const trimmedKey = openAiApiKey.trim();

  if (!trimmedKey) {
    throw new Error("Enter your OpenAI API key to get a recommendation.");
  }

  const response = await fetch("/api/recommendation", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-OpenAI-Api-Key": trimmedKey
    },
    body: JSON.stringify({ coin: payload })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || data.details || "Could not generate recommendation.");
  }

  return data;
}

export function toAiPayload(details: CoinDetails): AiCoinPayload {
  return {
    name: details.name,
    current_price_usd: details.market_data.current_price.usd,
    market_cap_usd: details.market_data.market_cap.usd,
    volume_24h_usd: details.market_data.total_volume.usd,
    price_change_percentage_30d_in_currency:
      details.market_data.price_change_percentage_30d_in_currency?.usd ?? 0,
    price_change_percentage_60d_in_currency:
      details.market_data.price_change_percentage_60d_in_currency?.usd ?? 0,
    price_change_percentage_200d_in_currency:
      details.market_data.price_change_percentage_200d_in_currency?.usd ?? 0
  };
}
