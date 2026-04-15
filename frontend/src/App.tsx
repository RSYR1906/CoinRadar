import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import CoinDetailPage from "./pages/CoinDetailPage";
import TrendingPage from "./pages/TrendingPage";
import WatchlistPage from "./pages/WatchlistPage";
import NewsPage from "./pages/NewsPage";
import LoginPage from "./pages/LoginPage";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="coin/:coinId" element={<CoinDetailPage />} />
              <Route path="trending" element={<TrendingPage />} />
              <Route path="news" element={<NewsPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route
                path="watchlist"
                element={
                  <ProtectedRoute>
                    <WatchlistPage />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
