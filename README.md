# Cryptonite

A React, TypeScript, Redux cryptocurrency SPA for browsing coins, viewing real-time reports, and requesting an AI recommendation for selected coins.

## Run locally

```bash
npm install
npm run dev
```

The local app runs on `http://localhost:5174/`. The API helper server runs on `http://localhost:4174/`.

On **AI Recommendation**, each user enters their own OpenAI API key in the page (browser tab only). Optionally set `OPENAI_API_KEY` in `.env` from `.env.example` for local development fallback.
