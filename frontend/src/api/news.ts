import client from "./client";
import type { Article } from "../types";

export const getNews = (coin?: string) =>
  client.get<Article[]>("/news", { params: coin ? { coin } : {} });
