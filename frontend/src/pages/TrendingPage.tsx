import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getTrending } from "../api/crypto";
import { Flame } from "lucide-react";

export default function TrendingPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["trending"],
    queryFn: () => getTrending().then((r) => r.data),
  });

  const coins = data?.coins ?? [];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Flame className="w-6 h-6 text-amber-400" /> Trending
      </h1>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-900 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {coins.map((c: any) => {
            const item = c.item;
            return (
              <Link
                key={item.id}
                to={`/coin/${item.id}`}
                className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-amber-400/50 transition-colors flex items-center gap-3"
              >
                {item.large && (
                  <img src={item.large} alt="" className="w-10 h-10 rounded-full" />
                )}
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-gray-400 uppercase">{item.symbol}</p>
                </div>
                <span className="ml-auto text-xs bg-gray-800 px-2 py-1 rounded text-gray-400">
                  #{item.market_cap_rank ?? "—"}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
