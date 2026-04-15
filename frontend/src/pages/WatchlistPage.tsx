import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, Pencil, Check, X } from "lucide-react";
import toast from "react-hot-toast";
import { getWatchlist, removeFromWatchlist, updateNote } from "../api/watchlist";
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
  const color = pct >= 0 ? "text-up" : "text-down";
  return <span className={color}>{pct >= 0 ? "+" : ""}{pct.toFixed(2)}%</span>;
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
      <div className="space-y-3">
        <h1 className="text-2xl font-bold">Watchlist</h1>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 bg-gray-900 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold mb-2">Watchlist</h1>
        <p className="text-gray-400">
          Your watchlist is empty. Add coins from the market page.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Watchlist</h1>

      <div className="space-y-3">
        {merged.map((entry) => (
          <WatchlistCard
            key={entry.id}
            entry={entry}
            onRemove={() => removeMutation.mutate(entry.id)}
          />
        ))}
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
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
      <div className="flex items-center gap-3">
        {entry.logo_url && (
          <img src={entry.logo_url} alt="" className="w-8 h-8 rounded-full" />
        )}
        <div className="flex-1 min-w-0">
          <p className="font-semibold">
            {entry.name}{" "}
            <span className="text-gray-400 uppercase text-sm">{entry.symbol}</span>
          </p>
          <div className="flex gap-4 text-sm">
            <span className="font-mono">{formatPrice(entry.current_price)}</span>
            <PctBadge pct={entry.price_change_percentage_24h} />
          </div>
        </div>
        <button
          onClick={onRemove}
          className="text-gray-500 hover:text-red-400 p-1"
          title="Remove"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-2 text-sm">
        {editing ? (
          <div className="flex gap-2">
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm focus:outline-none focus:border-amber-400"
              autoFocus
            />
            <button
              onClick={() => noteMutation.mutate()}
              className="text-green-400 hover:text-green-300"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setNote(entry.user_notes);
                setEditing(false);
              }}
              className="text-gray-400 hover:text-gray-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1 text-gray-400 hover:text-gray-300"
          >
            <Pencil className="w-3 h-3" />
            {entry.user_notes || "Add a note…"}
          </button>
        )}
      </div>
    </div>
  );
}
