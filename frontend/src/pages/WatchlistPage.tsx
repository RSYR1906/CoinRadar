import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Pencil, Star, Trash2, X } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import {
  getWatchlist,
  removeFromWatchlist,
  updateNote,
} from "../api/watchlist";
import AnimatedPrice from "../components/AnimatedPrice";
import GlassCard from "../components/GlassCard";
import { usePriceUpdates } from "../hooks/usePriceUpdates";
import type { WatchlistEntry } from "../types";

function formatPrice(n: number | null) {
  if (n == null) return "—";
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: n < 1 ? 6 : 2,
  });
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

export default function WatchlistPage() {
  const queryClient = useQueryClient();
  const liveUpdates = usePriceUpdates();

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["watchlist"],
    queryFn: () => getWatchlist().then((r) => r.data),
  });

  const removeMutation = useMutation({
    mutationFn: (id: number) => removeFromWatchlist(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
      toast.success("Removed from watchlist");
    },
    onError: () => toast.error("Failed to remove"),
  });

  const merged = entries.map((e) => {
    const live = liveUpdates.get(e.crypto_id);
    if (!live) return e;
    return {
      ...e,
      current_price: live.current_price,
      market_cap: live.market_cap,
      price_change_percentage_24h: live.price_change_percentage_24h,
    };
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold gradient-text">Watchlist</h1>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl animate-shimmer" />
          ))}
        </div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
          <Star className="w-8 h-8 text-amber-400" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Your Watchlist is Empty</h1>
        <p className="text-gray-400 max-w-sm">
          Start tracking your favorite coins by adding them from the market
          page.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold gradient-text">Watchlist</h1>

      <div className="space-y-3">
        <AnimatePresence>
          {merged.map((entry) => (
            <motion.div
              key={entry.id}
              layout
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -80, transition: { duration: 0.2 } }}
            >
              <WatchlistCard
                entry={entry}
                onRemove={() => removeMutation.mutate(entry.id)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function WatchlistCard({
  entry,
  onRemove,
}: {
  entry: WatchlistEntry;
  onRemove: () => void;
}) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [note, setNote] = useState(entry.user_notes);

  const noteMutation = useMutation({
    mutationFn: () => updateNote(entry.id, { note }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
      setEditing(false);
      toast.success("Note updated");
    },
    onError: () => toast.error("Failed to update note"),
  });

  return (
    <GlassCard hover className="p-4">
      <div className="flex items-center gap-3">
        {entry.logo_url && (
          <img
            src={entry.logo_url}
            alt=""
            className="w-9 h-9 rounded-full ring-1 ring-white/10"
          />
        )}
        <div className="flex-1 min-w-0">
          <p className="font-semibold">
            {entry.name}{" "}
            <span className="text-gray-500 uppercase text-xs">
              {entry.symbol}
            </span>
          </p>
          <div className="flex items-center gap-3 mt-0.5">
            <AnimatedPrice
              value={entry.current_price}
              format={formatPrice}
              className="text-sm"
            />
            <PctBadge pct={entry.price_change_percentage_24h} />
          </div>
        </div>
        <button
          onClick={onRemove}
          className="text-gray-600 hover:text-red-400 p-2 rounded-lg hover:bg-red-400/10 transition-colors"
          title="Remove"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3 text-sm">
        {editing ? (
          <div className="flex gap-2">
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="flex-1 bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-amber-400/50 transition-colors"
              autoFocus
            />
            <button
              onClick={() => noteMutation.mutate()}
              className="text-green-400 hover:text-green-300 p-1.5 rounded-lg hover:bg-green-400/10 transition-colors"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setNote(entry.user_notes);
                setEditing(false);
              }}
              className="text-gray-400 hover:text-gray-300 p-1.5 rounded-lg hover:bg-white/[0.04] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 text-gray-500 hover:text-gray-300 transition-colors"
          >
            <Pencil className="w-3 h-3" />
            {entry.user_notes || "Add a note…"}
          </button>
        )}
      </div>
    </GlassCard>
  );
}
