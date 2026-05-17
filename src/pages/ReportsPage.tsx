import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import EmptyState from "../components/EmptyState";
import StatusPanel from "../components/StatusPanel";
import { fetchRealtimePrices } from "../services/cryptoApi";
import { useAppSelector } from "../store/hooks";
import { selectSelectedCoins } from "../store/selectors";

interface ChartPoint {
  time: string;
  [symbol: string]: number | string;
}

const chartColors = ["#22d3ee", "#f472b6", "#a78bfa", "#fbbf24", "#34d399", "#fb923c"];

function ReportsPage() {
  const selectedCoins = useAppSelector(selectSelectedCoins);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [latestPrices, setLatestPrices] = useState<Record<string, number>>({});
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const symbols = useMemo(
    () => selectedCoins.map((coin) => coin.symbol.toUpperCase()),
    [selectedCoins]
  );

  useEffect(() => {
    setChartData([]);
    setLatestPrices({});
    setLastUpdated("");
    setError(null);

    if (symbols.length === 0) {
      return;
    }

    const loadPrices = async () => {
      try {
        const prices = await fetchRealtimePrices(symbols);
        const nextPoint: ChartPoint = {
          time: new Date().toLocaleTimeString("en-US", {
            hour12: false,
            minute: "2-digit",
            second: "2-digit"
          })
        };

        symbols.forEach((symbol) => {
          nextPoint[symbol] = prices[symbol]?.USD ?? 0;
        });

        setLatestPrices(
          symbols.reduce<Record<string, number>>((nextPrices, symbol) => {
            nextPrices[symbol] = prices[symbol]?.USD ?? 0;
            return nextPrices;
          }, {})
        );
        setLastUpdated(nextPoint.time);
        setChartData((current) => [...current.slice(-59), nextPoint]);
        setError(null);
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : "Could not load live prices.");
      }
    };

    loadPrices();
    const intervalId = window.setInterval(loadPrices, 1000);

    return () => window.clearInterval(intervalId);
  }, [symbols]);

  if (selectedCoins.length === 0) {
    return (
      <EmptyState
        title="No selected coins"
        body="Select up to six coins on the home page to view a live USD report."
      />
    );
  }

  return (
    <section className="content-section">
      <div className="section-heading">
        <h2>Real-Time USD Report</h2>
        <p>{lastUpdated ? `Last updated ${lastUpdated}` : symbols.join(", ")}</p>
      </div>

      {error && <StatusPanel message={error} />}

      <div className="chart-surface">
        <div className="live-price-grid">
          {selectedCoins.map((coin, index) => {
            const symbol = coin.symbol.toUpperCase();
            const value = latestPrices[symbol];

            return (
              <div className="live-price" key={coin.id}>
                <span style={{ color: chartColors[index] }}>{symbol}</span>
                <strong>
                  {typeof value === "number" && value > 0
                    ? value.toLocaleString("en-US", {
                        style: "currency",
                        currency: "USD",
                        maximumFractionDigits: value > 100 ? 2 : 6
                      })
                    : "Waiting..."}
                </strong>
              </div>
            );
          })}
        </div>
        <ResponsiveContainer height={420} width="100%">
          <LineChart data={chartData} margin={{ top: 18, right: 28, bottom: 8, left: 8 }}>
            <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" strokeDasharray="4 4" />
            <XAxis
              dataKey="time"
              minTickGap={30}
              stroke="#64748b"
              tick={{ fill: "#94a3b8", fontSize: 12 }}
            />
            <YAxis
              stroke="#64748b"
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              tickFormatter={(value) =>
                `$${Number(value).toLocaleString("en-US", { maximumFractionDigits: 0 })}`
              }
            />
            <Tooltip
              contentStyle={{
                background: "rgba(15, 20, 35, 0.95)",
                border: "1px solid rgba(148, 163, 184, 0.2)",
                borderRadius: "10px",
                color: "#f1f5f9"
              }}
              formatter={(value, name) => [
                Number(value).toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                  maximumFractionDigits: Number(value) > 100 ? 2 : 6
                }),
                name
              ]}
            />
            {symbols.map((symbol, index) => (
              <Line
                dataKey={symbol}
                dot={false}
                key={symbol}
                stroke={chartColors[index]}
                strokeWidth={3}
                type="monotone"
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export default ReportsPage;
