import { motion } from "framer-motion";
import { LogOut, Newspaper, Radar, Star, TrendingUp } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `relative flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors ${
    isActive ? "text-amber-400" : "text-gray-300 hover:text-white"
  }`;

export default function Navbar() {
  const { isAuthenticated, username, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-gray-950/70 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 font-bold text-lg group"
        >
          <motion.div
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.4 }}
          >
            <Radar className="w-5 h-5 text-amber-400" />
          </motion.div>
          <span className="gradient-text">CoinRadar</span>
        </Link>

        <div className="flex items-center gap-1 text-sm">
          <NavLink to="/" end className={navLinkClass}>
            <TrendingUp className="w-4 h-4" /> Market
          </NavLink>
          <NavLink to="/news" className={navLinkClass}>
            <Newspaper className="w-4 h-4" /> News
          </NavLink>

          {isAuthenticated ? (
            <>
              <NavLink to="/watchlist" className={navLinkClass}>
                <Star className="w-4 h-4" /> Watchlist
              </NavLink>

              <div className="ml-3 flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 text-xs font-semibold">
                  {username?.charAt(0).toUpperCase()}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors px-2 py-1 rounded-md"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <NavLink to="/login" className={navLinkClass}>
              Login
            </NavLink>
          )}
        </div>
      </div>
    </nav>
  );
}
