import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const serverDir = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(serverDir, "../.env") });

const app = express();
const port = process.env.PORT || 4174;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

const COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3";
const CRYPTOCOMPARE_BASE_URL = "https://min-api.cryptocompare.com/data";
const CRYPTOCOMPARE_ASSET_BASE_URL = "https://www.cryptocompare.com";
const responseCache = new Map();

const symbolToCoinGeckoId = {
  BTC: "bitcoin",
  ETH: "ethereum",
  USDT: "tether",
  XRP: "ripple",
  BNB: "binancecoin",
  SOL: "solana",
  USDC: "usd-coin",
  DOGE: "dogecoin",
  ADA: "cardano",
  TRX: "tron",
  LINK: "chainlink",
  AVAX: "avalanche-2",
  XLM: "stellar",
  TON: "the-open-network",
  SHIB: "shiba-inu",
  DOT: "polkadot",
  BCH: "bitcoin-cash",
  LTC: "litecoin",
  UNI: "uniswap",
  LEO: "leo-token",
  DAI: "dai",
  HBAR: "hedera-hashgraph",
  NEAR: "near",
  ICP: "internet-computer",
  APT: "aptos",
  ETC: "ethereum-classic",
  XMR: "monero",
  OKB: "okb",
  CRO: "crypto-com-chain",
  FIL: "filecoin",
  ARB: "arbitrum",
  KAS: "kaspa",
  ATOM: "cosmos",
  VET: "vechain",
  INJ: "injective-protocol",
  OP: "optimism",
  AAVE: "aave",
  MKR: "maker",
  GRT: "the-graph",
  ALGO: "algorand",
  FTM: "fantom",
  RUNE: "thorchain",
  QNT: "quant-network",
  STX: "blockstack",
  SAND: "the-sandbox",
  MANA: "decentraland"
};

async function fetchUpstream(url) {
  const upstreamResponse = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "Cryptonite/1.0"
    }
  });

  const body = await upstreamResponse.text();

  return {
    ok: upstreamResponse.ok,
    status: upstreamResponse.status,
    contentType: upstreamResponse.headers.get("content-type") || "application/json",
    body
  };
}

function sendCachedOrError(response, cacheKey, status, body) {
  const cached = responseCache.get(cacheKey);

  if (cached) {
    response.set("X-Cryptonite-Cache", "stale").type(cached.contentType).send(cached.body);
    return;
  }

  response.status(status).type("application/json").send(body);
}

app.get("/api/coins/markets", async (_request, response) => {
  const cacheKey = "coins:markets";
  const url =
    `${COINGECKO_BASE_URL}/coins/markets?` +
    new URLSearchParams({
      vs_currency: "usd",
      order: "market_cap_desc",
      per_page: "100",
      page: "1"
    });

  try {
    const upstream = await fetchUpstream(url);

    if (upstream.ok) {
      responseCache.set(cacheKey, upstream);
      response.type(upstream.contentType).send(upstream.body);
      return;
    }

    const fallback = await fetchUpstream(
      `${CRYPTOCOMPARE_BASE_URL}/top/mktcapfull?limit=100&tsym=USD`
    );

    if (fallback.ok) {
      const parsed = JSON.parse(fallback.body);
      const rows = Array.isArray(parsed.Data) ? parsed.Data : [];

      if (rows.length === 0) {
        sendCachedOrError(response, cacheKey, upstream.status, upstream.body);
        return;
      }

      const coins = rows.map((item) => {
        const symbol = item.CoinInfo.Name;
        const raw = item.RAW?.USD ?? {};

        return {
          id: symbolToCoinGeckoId[symbol] ?? symbol.toLowerCase(),
          symbol: symbol.toLowerCase(),
          name: item.CoinInfo.FullName,
          image: item.CoinInfo.ImageUrl
            ? `${CRYPTOCOMPARE_ASSET_BASE_URL}${item.CoinInfo.ImageUrl}`
            : "",
          current_price: raw.PRICE ?? 0,
          market_cap: raw.MKTCAP ?? 0,
          total_volume: raw.TOTALVOLUME24HTO ?? raw.VOLUME24HOURTO ?? 0
        };
      });
      const body = JSON.stringify(coins);
      responseCache.set(cacheKey, { body, contentType: "application/json" });
      response.set("X-Cryptonite-Fallback", "cryptocompare").json(coins);
      return;
    }

    sendCachedOrError(response, cacheKey, upstream.status, upstream.body);
  } catch (error) {
    sendCachedOrError(
      response,
      cacheKey,
      502,
      JSON.stringify({
        message: "Could not fetch upstream cryptocurrency data.",
        details: error instanceof Error ? error.message : "Unknown error"
      })
    );
  }
});

app.get("/api/coins/:coinId", async (request, response) => {
  const cacheKey = `coins:${request.params.coinId}:${request.query.market_data === "true"}`;
  const url =
    `${COINGECKO_BASE_URL}/coins/${encodeURIComponent(request.params.coinId)}?` +
    new URLSearchParams({
      market_data: request.query.market_data === "true" ? "true" : "false"
    });

  try {
    const upstream = await fetchUpstream(url);

    if (upstream.ok) {
      responseCache.set(cacheKey, upstream);
      response.type(upstream.contentType).send(upstream.body);
      return;
    }

    sendCachedOrError(response, cacheKey, upstream.status, upstream.body);
  } catch (error) {
    sendCachedOrError(
      response,
      cacheKey,
      502,
      JSON.stringify({
        message: "Could not fetch upstream cryptocurrency data.",
        details: error instanceof Error ? error.message : "Unknown error"
      })
    );
  }
});

app.get("/api/realtime", async (request, response) => {
  const symbols = String(request.query.symbols || "")
    .split(",")
    .map((symbol) => symbol.trim().toUpperCase())
    .filter(Boolean)
    .slice(0, 6);

  if (symbols.length === 0) {
    response.json({});
    return;
  }

  const url =
    `${CRYPTOCOMPARE_BASE_URL}/pricemulti?` +
    new URLSearchParams({
      tsyms: "usd",
      fsyms: symbols.join(","),
      _: String(Date.now())
    });

  const upstream = await fetchUpstream(url);
  response
    .status(upstream.status)
    .set("Cache-Control", "no-store")
    .type(upstream.contentType)
    .send(upstream.body);
});

app.post("/api/recommendation", async (request, response) => {
  const clientKey = String(request.get("X-OpenAI-Api-Key") || "").trim();
  const apiKey = clientKey || process.env.OPENAI_API_KEY;

  if (!apiKey) {
    response.status(400).json({
      message:
        "No OpenAI API key provided. Paste your key in the AI Recommendation page, or set OPENAI_API_KEY in .env for local development."
    });
    return;
  }

  const coin = request.body?.coin;

  if (!coin?.name || typeof coin.current_price_usd !== "number") {
    response.status(400).json({ message: "A complete coin market payload is required." });
    return;
  }

  try {
    const openAiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "developer",
            content:
              "You are a cautious cryptocurrency analyst. Return only valid JSON with keys decision and explanation. decision must be either BUY or AVOID. Do not give financial guarantees."
          },
          {
            role: "user",
            content: `Assess whether this cryptocurrency currently looks worth buying based only on these market indicators: ${JSON.stringify(
              coin
            )}`
          }
        ]
      })
    });

    if (!openAiResponse.ok) {
      const errorText = await openAiResponse.text();
      let message = "OpenAI request failed.";

      try {
        const parsedError = JSON.parse(errorText);
        const openAiError = parsedError.error;

        if (openAiError?.code === "insufficient_quota") {
          message =
            "OpenAI quota exceeded. Check the API key project's billing, credits, and usage limits.";
        } else if (typeof openAiError?.message === "string") {
          message = openAiError.message;
        }
      } catch {
        message = errorText || message;
      }

      response.status(openAiResponse.status).json({
        message,
        details: errorText
      });
      return;
    }

    const data = await openAiResponse.json();
    const content = data.choices?.[0]?.message?.content ?? "{}";
    const recommendation = JSON.parse(content);

    response.json({
      decision: recommendation.decision === "BUY" ? "BUY" : "AVOID",
      explanation:
        typeof recommendation.explanation === "string"
          ? recommendation.explanation
          : "No explanation was returned."
    });
  } catch (error) {
    response.status(500).json({
      message: "Could not generate an AI recommendation.",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

app.listen(port, () => {
  console.log(`Recommendation server listening on http://localhost:${port}`);
});
