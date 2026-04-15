// Auth
export interface UserCreate {
  username: string;
  password: string;
}

export interface UserResponse {
  id: number;
  username: string;
  created_at: string;
}

export interface Token {
  access_token: string;
  token_type: string;
  username: string;
}

// Crypto
export interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number | null;
  market_cap: number | null;
  price_change_percentage_24h: number | null;
}

export interface CryptoListResponse {
  cryptos: CryptoData[];
  page: number;
  size: number;
  total: number;
  total_pages: number;
}

// Watchlist
export interface WatchlistEntryCreate {
  crypto_id: string;
  symbol: string;
  name: string;
  logo_url?: string;
  user_notes?: string;
}

export interface WatchlistEntry {
  id: number;
  crypto_id: string;
  symbol: string;
  name: string;
  logo_url: string;
  user_notes: string;
  current_price: number | null;
  market_cap: number | null;
  price_change_percentage_24h: number | null;
  added_at: string;
}

export interface NoteUpdate {
  note: string;
}

// News
export interface Article {
  id: number;
  published_date: number;
  title: string;
  url: string;
  image_url: string;
  body: string;
  tags: string;
  categories: string;
}

// WebSocket
export interface PriceUpdate {
  type: "price_update";
  data: CryptoData[];
}
