import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { Link } from "react-router-dom";
import { getTrending } from "../api/crypto";
import GlassCard from "../components/GlassCard";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function TrendingPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["trending"],
    queryFn: () => getTrending().then((r) => r.data),
  });

  const coins = data?.coins ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-3">
        <Flame className="w-7 h-7 text-amber-400" />
        <span className="gradient-text">Trending</span>
      </h1>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl animate-shimmer" />
          ))}
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          {coins.map((c: any, idx: number) => {
            const item = c.item;
            return (
              <motion.div key={item.id} variants={fadeUp}>
                <Link to={`/coin/${item.id}`}>
                  <GlassCard hover className="p-4 flex items-center gap-4">
                    {item.large && (
                      <img
                        src={item.large}
                        alt=""
                        className="w-11 h-11 rounded-full ring-1 ring-white/10"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{item.name}</p>
                      <p className="text-sm text-gray-500 uppercase">
                        {item.symbol}
                      </p>
                    </div>
                    <span className="flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400">
                      #{idx + 1}
                    </span>
                  </GlassCard>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
