import { useEffect, useState } from "react";
import { selectPendingCoin, selectSelectedCoins } from "../store/selectors";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { dismissPendingSelection, replaceSelectedCoin } from "../store/selectionSlice";

function SelectionDialog() {
  const dispatch = useAppDispatch();
  const pendingCoin = useAppSelector(selectPendingCoin);
  const selectedCoins = useAppSelector(selectSelectedCoins);
  const [removeId, setRemoveId] = useState("");

  useEffect(() => {
    if (!pendingCoin) {
      setRemoveId("");
      return;
    }

    setRemoveId(selectedCoins[0]?.id ?? "");
  }, [pendingCoin, selectedCoins]);

  useEffect(() => {
    if (!pendingCoin) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        dispatch(dismissPendingSelection());
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dispatch, pendingCoin]);

  if (!pendingCoin) {
    return null;
  }

  const handleAccept = () => {
    if (!removeId) {
      return;
    }

    dispatch(replaceSelectedCoin({ removeId, addId: pendingCoin.id }));
  };

  return (
    <div className="dialog-backdrop" role="presentation">
      <section
        aria-labelledby="replace-dialog-title"
        aria-modal="true"
        className="replace-dialog"
        role="dialog"
      >
        <h2 id="replace-dialog-title">Maximum coins selected</h2>
        <p>
          You can select up to six coins. Choose one to remove so <strong>{pendingCoin.name}</strong>{" "}
          can be added.
        </p>

        <div className="replace-list" role="radiogroup" aria-label="Coins to remove">
          {selectedCoins.map((coin) => (
            <label className="coin-radio replace-radio" key={coin.id}>
              <input
                checked={removeId === coin.id}
                name="removeCoin"
                onChange={() => setRemoveId(coin.id)}
                type="radio"
                value={coin.id}
              />
              <img src={coin.image} alt="" />
              <span>
                {coin.symbol.toUpperCase()} — {coin.name}
              </span>
            </label>
          ))}
        </div>

        <div className="dialog-actions">
          <button
            className="info-button"
            onClick={() => dispatch(dismissPendingSelection())}
            type="button"
          >
            Close
          </button>
          <button
            className="primary-button"
            disabled={!removeId}
            onClick={handleAccept}
            type="button"
          >
            Accept
          </button>
        </div>
      </section>
    </div>
  );
}

export default SelectionDialog;
