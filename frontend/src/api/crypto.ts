import client from "./client";
import type { CryptoListResponse } from "../types";

export const getCryptos = (page = 1, size = 20) =>
  client.get<CryptoListResponse>("/cryptos", { params: { page, size } });

export const searchCryptos = (q: string) =>
  client.get<{ results: CryptoListResponse["cryptos"] }>("/cryptos/search", {
    params: { q },
  });

export const getTrending = () =>
  client.get("/cryptos/trending");

export const getCoinDetail = (coinId: string) =>
  client.get(`/cryptos/${coinId}`);

export const getCoinTickers = (coinId: string) =>
  client.get(`/cryptos/${coinId}/tickers`);
