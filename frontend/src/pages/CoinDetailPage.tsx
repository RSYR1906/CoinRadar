import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, Star } from "lucide-react";
import toast from "react-hot-toast";
import { Link, useParams } from "react-router-dom";
import { getCoinDetail, getCoinTickers } from "../api/crypto";
import { addToWatchlist } from "../api/watchlist";
import GlassCard from "../components/GlassCard";
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
  const isUp = pct >= 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-medium ${
        isUp ? "bg-up/10 text-up" : "bg-down/10 text-down"
      }`}
    >
      {isUp ? "▲" : "▼"} {Math.abs(pct).toFixed(2)}%
    </span>
  );
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

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
        <div className="h-8 w-48 rounded-lg animate-shimmer" />
        <div className="h-64 rounded-lg animate-shimmer" />
      </div>
    );
  }

  if (!coin) {
    return <p className="text-gray-400">Coin not found.</p>;
  }

  const market = coin.market_data;
  const tickers = tickerData?.tickers?.slice(0, 10) ?? [];

  return (
    <div className="space-y-8">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to market
      </Link>

      {/* Hero */}
      <div className="relative">
        <div className="absolute -inset-4 rounded-2xl bg-amber-500/5 blur-2xl pointer-events-none" />
        <div className="relative flex items-center gap-5 flex-wrap">
          {coin.image?.large && (
            <motion.img
              src={coin.image.large}
              alt=""
              className="w-14 h-14 rounded-full ring-2 ring-amber-400/20"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}
          <div>
            <h1 className="text-3xl font-bold">{coin.name}</h1>
            <span className="text-gray-400 uppercase font-medium">
              {coin.symbol}
            </span>
          </div>

          {market && (
            <div className="ml-0 sm:ml-4 flex items-baseline gap-3">
              <span className="text-2xl font-bold font-mono">
                {formatPrice(market.current_price?.usd)}
              </span>
              <PctBadge pct={market.price_change_percentage_24h} />
            </div>
          )}

          {isAuthenticated && (
            <button
              onClick={handleAddWatchlist}
              className="ml-auto gradient-btn flex items-center gap-1.5 px-4 py-2 rounded-lg text-gray-900 text-sm font-semibold"
            >
              <Star className="w-4 h-4" /> Add to Watchlist
            </button>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      {market && (
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={fadeUp}>
            <Stat
              label="24h Change"
              value={<PctBadge pct={market.price_change_percentage_24h} />}
            />
          </motion.div>
          <motion.div variants={fadeUp}>
            <Stat
              label="7d Change"
              value={<PctBadge pct={market.price_change_percentage_7d} />}
            />
          </motion.div>
          <motion.div variants={fadeUp}>
            <Stat
              label="30d Change"
              value={<PctBadge pct={market.price_change_percentage_30d} />}
            />
          </motion.div>
          <motion.div variants={fadeUp}>
            <Stat
              label="Market Cap"
              value={formatPrice(market.market_cap?.usd)}
            />
          </motion.div>
          <motion.div variants={fadeUp}>
            <Stat
              label="24h Volume"
              value={formatPrice(market.total_volume?.usd)}
            />
          </motion.div>
          <motion.div variants={fadeUp}>
            <Stat
              label="Circulating Supply"
              value={market.circulating_supply?.toLocaleString() ?? "—"}
            />
          </motion.div>
          <motion.div variants={fadeUp}>
            <Stat
              label="Total Supply"
              value={market.total_supply?.toLocaleString() ?? "—"}
            />
          </motion.div>
        </motion.div>
      )}

      {/* About */}
      {coin.description?.en && (
        <GlassCard className="p-5">
          <h2 className="font-semibold mb-3 text-gray-200">About</h2>
          <p
            className="text-sm text-gray-400 leading-relaxed line-clamp-6"
            dangerouslySetInnerHTML={{ __html: coin.description.en }}
          />
        </GlassCard>
      )}

      {/* Exchanges */}
      {tickers.length > 0 && (
        <div>
          <h2 className="font-semibold mb-3 text-gray-200">Top Exchanges</h2>
          <GlassCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 text-xs uppercase tracking-wider border-b border-white/[0.04]">
                    <th className="py-3 px-4">Exchange</th>
                    <th className="py-3 px-4">Pair</th>
                    <th className="py-3 px-4 text-right">Price</th>
                    <th className="py-3 px-4 text-right">Volume (24h)</th>
                  </tr>
                </thead>
                <tbody>
                  {tickers.map((t: any, i: number) => (
                    <tr
                      key={i}
                      className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-3 px-4">{t.market?.name ?? "—"}</td>
                      <td className="py-3 px-4 text-gray-400">
                        {t.base}/{t.target}
                      </td>
                      <td className="py-3 px-4 text-right font-mono">
                        ${Number(t.converted_last?.usd ?? 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-gray-400">
                        ${Number(t.converted_volume?.usd ?? 0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <GlassCard className="p-4">
      <p className="text-xs text-gray-500 mb-1.5">{label}</p>
      <p className="font-semibold">{value}</p>
    </GlassCard>
  );
}
