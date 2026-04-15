import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Radar, LogOut, Star, Newspaper, TrendingUp } from "lucide-react";

export default function Navbar() {
  const { isAuthenticated, username, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="bg-gray-900 text-white border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <Radar className="w-5 h-5 text-amber-400" />
          CoinRadar
        </Link>

        <div className="flex items-center gap-6 text-sm">
          <Link to="/" className="hover:text-amber-400 flex items-center gap-1">
            <TrendingUp className="w-4 h-4" /> Market
          </Link>
          <Link to="/news" className="hover:text-amber-400 flex items-center gap-1">
            <Newspaper className="w-4 h-4" /> News
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/watchlist" className="hover:text-amber-400 flex items-center gap-1">
                <Star className="w-4 h-4" /> Watchlist
              </Link>
              <span className="text-gray-400">{username}</span>
              <button
                onClick={handleLogout}
                className="hover:text-amber-400 flex items-center gap-1"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="hover:text-amber-400">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
