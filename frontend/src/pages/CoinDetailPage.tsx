import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Star } from "lucide-react";
import toast from "react-hot-toast";
import { getCoinDetail, getCoinTickers } from "../api/crypto";
import { addToWatchlist } from "../api/watchlist";
import { useAuth } from "../context/AuthContext";

function formatPrice(n: number | null | undefined) {
  if (n == null) return "—";
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: n < 1 ? 6 : 2,
  });
}

function PctBadge({ pct }: { pct: number | null | undefined }) {
  if (pct == null) return <span className="text-gray-500">—</span>;
  const color = pct >= 0 ? "text-up" : "text-down";
  return <span className={color}>{pct >= 0 ? "+" : ""}{pct.toFixed(2)}%</span>;
}

export default function CoinDetailPage() {
  const { coinId } = useParams<{ coinId: string }>();
  const { isAuthenticated } = useAuth();

  const { data: coin, isLoading } = useQuery({
    queryKey: ["coin", coinId],
    queryFn: () => getCoinDetail(coinId!).then((r) => r.data),
    enabled: !!coinId,
  });

  const { data: tickerData } = useQuery({
    queryKey: ["tickers", coinId],
    queryFn: () => getCoinTickers(coinId!).then((r) => r.data),
    enabled: !!coinId,
  });

  const handleAddWatchlist = async () => {
    if (!coin) return;
    try {
      await addToWatchlist({
        crypto_id: coin.id,
        symbol: coin.symbol,
        name: coin.name,
        logo_url: coin.image?.large || coin.image?.small || "",
      });
      toast.success(`${coin.name} added to watchlist`);
    } catch {
      toast.error("Failed to add to watchlist");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-gray-900 rounded animate-pulse" />
        <div className="h-64 bg-gray-900 rounded animate-pulse" />
      </div>
    );
  }

  if (!coin) {
    return <p className="text-gray-400">Coin not found.</p>;
  }

  const market = coin.market_data;
  const tickers = tickerData?.tickers?.slice(0, 10) ?? [];

  return (
    <div className="space-y-6">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-white">
        <ArrowLeft className="w-4 h-4" /> Back to market
      </Link>

      <div className="flex items-center gap-4 flex-wrap">
        {coin.image?.large && (
          <img src={coin.image.large} alt="" className="w-12 h-12 rounded-full" />
        )}
        <div>
          <h1 className="text-3xl font-bold">{coin.name}</h1>
          <span className="text-gray-400 uppercase">{coin.symbol}</span>
        </div>

        {isAuthenticated && (
          <button
            onClick={handleAddWatchlist}
            className="ml-auto flex items-center gap-1 px-3 py-1.5 rounded bg-amber-500 hover:bg-amber-600 text-gray-900 text-sm font-semibold"
          >
            <Star className="w-4 h-4" /> Add to Watchlist
          </button>
        )}
      </div>

      {market && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Stat label="Price" value={formatPrice(market.current_price?.usd)} />
          <Stat label="24h" value={<PctBadge pct={market.price_change_percentage_24h} />} />
          <Stat label="7d" value={<PctBadge pct={market.price_change_percentage_7d} />} />
          <Stat label="30d" value={<PctBadge pct={market.price_change_percentage_30d} />} />
          <Stat label="Market Cap" value={formatPrice(market.market_cap?.usd)} />
          <Stat label="24h Volume" value={formatPrice(market.total_volume?.usd)} />
          <Stat label="Circulating Supply" value={market.circulating_supply?.toLocaleString() ?? "—"} />
          <Stat label="Total Supply" value={market.total_supply?.toLocaleString() ?? "—"} />
        </div>
      )}

      {coin.description?.en && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <h2 className="font-semibold mb-2">About</h2>
          <p
            className="text-sm text-gray-300 leading-relaxed line-clamp-6"
            dangerouslySetInnerHTML={{ __html: coin.description.en }}
          />
        </div>
      )}

      {tickers.length > 0 && (
        <div>
          <h2 className="font-semibold mb-3">Top Exchanges</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-800">
                  <th className="py-2">Exchange</th>
                  <th className="py-2">Pair</th>
                  <th className="py-2 text-right">Price</th>
                  <th className="py-2 text-right">Volume (24h)</th>
                </tr>
              </thead>
              <tbody>
                {tickers.map((t: any, i: number) => (
                  <tr key={i} className="border-b border-gray-800/50">
                    <td className="py-2">{t.market?.name ?? "—"}</td>
                    <td className="py-2">
                      {t.base}/{t.target}
                    </td>
                    <td className="py-2 text-right font-mono">
                      ${Number(t.converted_last?.usd ?? 0).toLocaleString()}
                    </td>
                    <td className="py-2 text-right font-mono">
                      ${Number(t.converted_volume?.usd ?? 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-3">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}
