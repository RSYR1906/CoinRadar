import type { Article } from "../types";
import client from "./client";

export const getNews = (coin?: string) =>
  client.get<Article[]>("/news", { params: coin ? { coin } : {} });
