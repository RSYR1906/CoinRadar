import client from "./client";
import type { WatchlistEntry, WatchlistEntryCreate, NoteUpdate } from "../types";

export const getWatchlist = () =>
  client.get<WatchlistEntry[]>("/watchlist");

export const addToWatchlist = (data: WatchlistEntryCreate) =>
  client.post("/watchlist", data);

export const removeFromWatchlist = (id: number) =>
  client.delete(`/watchlist/${id}`);

export const updateNote = (id: number, data: NoteUpdate) =>
  client.patch(`/watchlist/${id}/note`, data);
