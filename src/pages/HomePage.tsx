import CoinCard from "../components/CoinCard";
import EmptyState from "../components/EmptyState";
import StatusPanel from "../components/StatusPanel";
import { useAppSelector } from "../store/hooks";
import { selectFilteredCoins } from "../store/selectors";

function HomePage() {
  const coins = useAppSelector(selectFilteredCoins);
  const status = useAppSelector((state) => state.coins.status);
  const error = useAppSelector((state) => state.coins.error);
  const searchTerm = useAppSelector((state) => state.ui.searchTerm);

  if (status === "loading" || status === "idle") {
    return <StatusPanel className="status-panel--loading" message="Loading market data..." />;
  }

  if (status === "failed") {
    return <StatusPanel className="status-panel--error" message={error ?? "Could not load coins."} />;
  }

  return (
    <section className="content-section">
      <div className="section-heading">
        <h2>Top 100 Coins</h2>
        <p>{coins.length} visible</p>
      </div>

      {coins.length === 0 ? (
        <EmptyState
          title="No coins found"
          body={`No coin name or symbol matches "${searchTerm}".`}
        />
      ) : (
        <div className="coin-grid">
          {coins.map((coin) => (
            <CoinCard coin={coin} key={coin.id} />
          ))}
        </div>
      )}
    </section>
  );
}

export default HomePage;
