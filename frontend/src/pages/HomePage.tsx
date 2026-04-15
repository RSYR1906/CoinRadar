import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { getCryptos, searchCryptos } from "../api/crypto";
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
  const color = pct >= 0 ? "text-up" : "text-down";
  return <span className={color}>{pct >= 0 ? "+" : ""}{pct.toFixed(2)}%</span>;
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
    ? searchData ?? []
    : listData?.cryptos ?? [];
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
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-bold">Market</h1>
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                if (!e.target.value.trim()) setQuery("");
              }}
              placeholder="Search coins…"
              className="bg-gray-900 border border-gray-700 rounded pl-9 pr-3 py-1.5 text-sm focus:outline-none focus:border-amber-400 w-56"
            />
          </div>
        </form>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-12 bg-gray-900 rounded animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-800">
                  <th className="py-3 pr-2">#</th>
                  <th className="py-3">Coin</th>
                  <th className="py-3 text-right">Price</th>
                  <th className="py-3 text-right">24h %</th>
                  <th className="py-3 text-right hidden sm:table-cell">Market Cap</th>
                </tr>
              </thead>
              <tbody>
                {merged.map((coin, idx) => (
                  <tr
                    key={coin.id}
                    className="border-b border-gray-800/50 hover:bg-gray-900/50"
                  >
                    <td className="py-3 pr-2 text-gray-500">
                      {isSearching ? idx + 1 : (page - 1) * 20 + idx + 1}
                    </td>
                    <td className="py-3">
                      <Link
                        to={`/coin/${coin.id}`}
                        className="flex items-center gap-2 hover:text-amber-400"
                      >
                        {coin.image && (
                          <img src={coin.image} alt="" className="w-6 h-6 rounded-full" />
                        )}
                        <span className="font-medium">{coin.name}</span>
                        <span className="text-gray-500 uppercase">{coin.symbol}</span>
                      </Link>
                    </td>
                    <td className="py-3 text-right font-mono">
                      {formatPrice(coin.current_price)}
                    </td>
                    <td className="py-3 text-right font-mono">
                      <PctBadge pct={coin.price_change_percentage_24h} />
                    </td>
                    <td className="py-3 text-right font-mono hidden sm:table-cell">
                      {formatMarketCap(coin.market_cap)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!isSearching && listData && (
            <div className="flex items-center justify-center gap-4 pt-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 disabled:opacity-30"
              >
                Prev
              </button>
              <span className="text-sm text-gray-400">
                Page {page} / {listData.total_pages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(listData.total_pages, p + 1))}
                disabled={page >= listData.total_pages}
                className="px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 disabled:opacity-30"
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
