import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { getCryptos, searchCryptos } from "../api/crypto";
import AnimatedPrice from "../components/AnimatedPrice";
import Sparkline from "../components/Sparkline";
import { usePriceUpdates } from "../hooks/usePriceUpdates";
import type { CryptoData } from "../types";

function formatPrice(n: number | null) {
  if (n == null) return "—";
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: n < 1 ? 6 : 2,
  });
}

function formatMarketCap(n: number | null) {
  if (n == null) return "—";
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  return `$${n.toLocaleString()}`;
}

function PctBadge({ pct }: { pct: number | null }) {
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

export default function HomePage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const liveUpdates = usePriceUpdates();

  const { data: listData, isLoading: listLoading } = useQuery({
    queryKey: ["cryptos", page],
    queryFn: () => getCryptos(page, 20).then((r) => r.data),
  });

  const { data: searchData, isLoading: searchLoading } = useQuery({
    queryKey: ["cryptoSearch", query],
    queryFn: () => searchCryptos(query).then((r) => r.data.results),
    enabled: query.length > 0,
  });

  const isSearching = query.length > 0;
  const cryptos: CryptoData[] = isSearching
    ? (searchData ?? [])
    : (listData?.cryptos ?? []);
  const loading = isSearching ? searchLoading : listLoading;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(search.trim());
    if (!search.trim()) setPage(1);
  };

  const merged = cryptos.map((c) => {
    const live = liveUpdates.get(c.id);
    return live ? { ...c, ...live } : c;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-3xl font-bold gradient-text">Market</h1>
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative glow-border rounded-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                if (!e.target.value.trim()) setQuery("");
              }}
              placeholder="Search coins…"
              className="bg-surface border border-white/[0.06] rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-amber-400/50 w-60 transition-colors"
            />
          </div>
        </form>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-14 rounded-lg animate-shimmer" />
          ))}
        </div>
      ) : (
        <>
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 text-xs uppercase tracking-wider border-b border-white/[0.04]">
                    <th className="py-3 px-4 w-10">#</th>
                    <th className="py-3 px-4">Coin</th>
                    <th className="py-3 px-4 text-right">Price</th>
                    <th className="py-3 px-4 text-right">24h</th>
                    <th className="py-3 px-4 text-right hidden md:table-cell">
                      7d Chart
                    </th>
                    <th className="py-3 px-4 text-right hidden sm:table-cell">
                      Market Cap
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {merged.map((coin, idx) => (
                    <motion.tr
                      key={coin.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.02 }}
                      className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors group"
                    >
                      <td className="py-3 px-4 text-gray-500 text-xs">
                        {isSearching ? idx + 1 : (page - 1) * 20 + idx + 1}
                      </td>
                      <td className="py-3 px-4">
                        <Link
                          to={`/coin/${coin.id}`}
                          className="flex items-center gap-3 group-hover:text-amber-400 transition-colors"
                        >
                          {coin.image && (
                            <img
                              src={coin.image}
                              alt=""
                              className="w-7 h-7 rounded-full"
                            />
                          )}
                          <div>
                            <span className="font-medium">{coin.name}</span>
                            <span className="ml-2 text-gray-500 uppercase text-xs">
                              {coin.symbol}
                            </span>
                          </div>
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <AnimatedPrice
                          value={coin.current_price}
                          format={formatPrice}
                        />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <PctBadge pct={coin.price_change_percentage_24h} />
                      </td>
                      <td className="py-3 px-4 text-right hidden md:table-cell">
                        {coin.sparkline_in_7d?.price ? (
                          <div className="flex justify-end">
                            <Sparkline
                              data={coin.sparkline_in_7d.price}
                              positive={
                                (coin.price_change_percentage_24h ?? 0) >= 0
                              }
                            />
                          </div>
                        ) : (
                          <span className="text-gray-600">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-gray-400 hidden sm:table-cell">
                        {formatMarketCap(coin.market_cap)}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {!isSearching && listData && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-4 py-1.5 rounded-full text-sm border border-white/[0.06] bg-surface hover:bg-surface-light disabled:opacity-30 transition-colors"
              >
                Prev
              </button>
              {Array.from(
                { length: Math.min(5, listData.total_pages) },
                (_, i) => {
                  const p =
                    Math.max(1, Math.min(page - 2, listData.total_pages - 4)) +
                    i;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-full text-sm transition-colors ${
                        p === page
                          ? "gradient-btn text-gray-900 font-semibold"
                          : "border border-white/[0.06] bg-surface hover:bg-surface-light text-gray-400"
                      }`}
                    >
                      {p}
                    </button>
                  );
                },
              )}
              <button
                onClick={() =>
                  setPage((p) => Math.min(listData.total_pages, p + 1))
                }
                disabled={page >= listData.total_pages}
                className="px-4 py-1.5 rounded-full text-sm border border-white/[0.06] bg-surface hover:bg-surface-light disabled:opacity-30 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
