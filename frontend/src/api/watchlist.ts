import type { NoteUpdate, WatchlistEntry, WatchlistEntryCreate } from "../types";
import client from "./client";

export const getWatchlist = () =>
  client.get<WatchlistEntry[]>("/watchlist");

export const addToWatchlist = (data: WatchlistEntryCreate) =>
  client.post("/watchlist", data);

export const removeFromWatchlist = (id: number) =>
  client.delete(`/watchlist/${id}`);

export const updateNote = (id: number, data: NoteUpdate) =>
  client.patch(`/watchlist/${id}/note`, data);
