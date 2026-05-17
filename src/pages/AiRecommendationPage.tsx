import { Bot, KeyRound, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { SESSION_OPENAI_API_KEY } from "../constants";
import EmptyState from "../components/EmptyState";
import StatusPanel from "../components/StatusPanel";
import { fetchCoinDetails, requestAiRecommendation, toAiPayload } from "../services/cryptoApi";
import { useAppSelector } from "../store/hooks";
import { selectSelectedCoins } from "../store/selectors";
import type { AiRecommendation } from "../types";

function loadStoredApiKey(): string {
  try {
    return sessionStorage.getItem(SESSION_OPENAI_API_KEY) ?? "";
  } catch {
    return "";
  }
}

function persistApiKey(value: string) {
  try {
    if (value.trim()) {
      sessionStorage.setItem(SESSION_OPENAI_API_KEY, value);
    } else {
      sessionStorage.removeItem(SESSION_OPENAI_API_KEY);
    }
  } catch {
    /* ignore quota / private mode */
  }
}

function AiRecommendationPage() {
  const selectedCoins = useAppSelector(selectSelectedCoins);
  const [activeCoinId, setActiveCoinId] = useState<string>("");
  const [openAiApiKey, setOpenAiApiKey] = useState(loadStoredApiKey);
  const [recommendation, setRecommendation] = useState<AiRecommendation | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "failed">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    persistApiKey(openAiApiKey);
  }, [openAiApiKey]);

  const selectedCoin = selectedCoins.find((coin) => coin.id === activeCoinId) ?? selectedCoins[0];

  const handleRecommendation = async () => {
    if (!selectedCoin) {
      return;
    }

    if (!openAiApiKey.trim()) {
      setStatus("failed");
      setError("Enter your OpenAI API key above to request a recommendation.");
      return;
    }

    setStatus("loading");
    setRecommendation(null);
    setError(null);

    try {
      const details = await fetchCoinDetails(selectedCoin.id);
      const result = await requestAiRecommendation(toAiPayload(details), openAiApiKey);
      setRecommendation(result);
      setStatus("idle");
    } catch (caughtError) {
      setStatus("failed");
      setError(caughtError instanceof Error ? caughtError.message : "Could not generate recommendation.");
    }
  };

  if (selectedCoins.length === 0) {
    return (
      <EmptyState
        title="No selected coins"
        body="Select one or more coins on the home page before requesting an AI recommendation."
      />
    );
  }

  return (
    <section className="content-section ai-layout">
      <div className="section-heading">
        <h2>AI Recommendation</h2>
        <p>{selectedCoins.length} selected</p>
      </div>

      <div className="ai-workspace">
        <div className="selector-panel" role="radiogroup" aria-label="Selected coins">
          {selectedCoins.map((coin) => (
            <label className="coin-radio" key={coin.id}>
              <input
                checked={selectedCoin?.id === coin.id}
                name="selectedCoin"
                onChange={() => setActiveCoinId(coin.id)}
                type="radio"
              />
              <img src={coin.image} alt="" />
              <span>{coin.name}</span>
            </label>
          ))}
        </div>

        <div className="recommendation-panel">
          <div className="ai-api-key-block">
            <label className="ai-api-key-label" htmlFor="openai-api-key">
              <KeyRound size={18} aria-hidden="true" />
              Your OpenAI API key
            </label>
            <input
              autoComplete="off"
              className="ai-api-key-input"
              id="openai-api-key"
              onChange={(event) => setOpenAiApiKey(event.target.value)}
              placeholder="sk-…"
              spellCheck={false}
              type="password"
              value={openAiApiKey}
            />
            <p className="ai-api-key-note">
              Used only for this page. Sent to this app’s API once per request and forwarded to OpenAI—not
              stored on the server. Saved in this browser tab until you close it. Get a key from{" "}
              <a href="https://platform.openai.com/api-keys" rel="noreferrer" target="_blank">
                OpenAI
              </a>
              .
            </p>
          </div>

          <button
            className="primary-button"
            disabled={status === "loading" || !openAiApiKey.trim()}
            onClick={handleRecommendation}
            type="button"
          >
            {status === "loading" ? <Loader2 className="spin" size={18} /> : <Bot size={18} />}
            Get Recommendation
          </button>

          {status === "failed" && <StatusPanel message={error ?? "Could not generate recommendation."} />}

          {recommendation && (
            <article className={`recommendation-result ${recommendation.decision.toLowerCase()}`}>
              <strong>{recommendation.decision === "BUY" ? "Worth considering" : "Avoid for now"}</strong>
              <p>{recommendation.explanation}</p>
            </article>
          )}
        </div>
      </div>
    </section>
  );
}

export default AiRecommendationPage;
