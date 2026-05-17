import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { loadMoreInfo } from "../store/coinsSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { toggleCoin } from "../store/selectionSlice";
import type { Coin } from "../types";

interface CoinCardProps {
  coin: Coin;
}

const moneyFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 8
});

function CoinCard({ coin }: CoinCardProps) {
  const dispatch = useAppDispatch();
  const [expanded, setExpanded] = useState(false);
  const isSelected = useAppSelector((state) => state.selection.selectedIds.includes(coin.id));
  const priceInfo = useAppSelector((state) => state.coins.moreInfo[coin.id]);
  const infoStatus = useAppSelector((state) => state.coins.moreInfoStatus[coin.id] ?? "idle");

  const handleMoreInfo = () => {
    const nextExpanded = !expanded;
    setExpanded(nextExpanded);

    if (nextExpanded && !priceInfo && infoStatus !== "loading") {
      dispatch(loadMoreInfo(coin.id));
    }
  };

  return (
    <article className={`coin-card${isSelected ? " coin-card--selected" : ""}`}>
      <div className="coin-card-top">
        <img src={coin.image} alt="" className="coin-icon" loading="lazy" />
        <div>
          <strong>{coin.symbol.toUpperCase()}</strong>
          <span>{coin.name}</span>
        </div>
        <label className="switch" aria-label={`Select ${coin.name}`}>
          <input
            checked={isSelected}
            onChange={() => dispatch(toggleCoin(coin.id))}
            type="checkbox"
          />
          <span className="switch-track" />
        </label>
      </div>

      <button className="coin-card-action" onClick={handleMoreInfo} type="button">
        {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        More Info
      </button>

      {expanded && (
        <div className="more-info">
          {infoStatus === "loading" && <p>Loading prices...</p>}
          {infoStatus === "failed" && <p>Could not load prices.</p>}
          {priceInfo && (
            <dl>
              <div>
                <dt>USD</dt>
                <dd>${moneyFormatter.format(priceInfo.usd)}</dd>
              </div>
              <div>
                <dt>EUR</dt>
                <dd>€{moneyFormatter.format(priceInfo.eur)}</dd>
              </div>
              <div>
                <dt>ILS</dt>
                <dd>₪{moneyFormatter.format(priceInfo.ils)}</dd>
              </div>
            </dl>
          )}
        </div>
      )}
    </article>
  );
}

export default CoinCard;
