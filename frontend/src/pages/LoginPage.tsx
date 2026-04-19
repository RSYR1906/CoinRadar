import { motion } from "framer-motion";
import { Radar } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        await register({ username, password });
        toast.success("Account created — please log in");
        setIsRegister(false);
      } else {
        await login({ username, password });
        navigate("/");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-sm"
      >
        <form
          onSubmit={handleSubmit}
          className="glass-card glow-border p-8 space-y-6"
        >
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-500/10 mb-2">
              <Radar className="w-6 h-6 text-amber-400" />
            </div>
            <h1 className="text-2xl font-bold">
              {isRegister ? "Create Account" : "Welcome Back"}
            </h1>
            <p className="text-sm text-gray-500">
              {isRegister
                ? "Join CoinRadar to track your portfolio"
                : "Sign in to your CoinRadar account"}
            </p>
          </div>

          <div className="space-y-1">
            <label className="block text-sm text-gray-400">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
              maxLength={50}
              className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2.5 focus:outline-none focus:border-amber-400/50 transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm text-gray-400">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              maxLength={50}
              className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2.5 focus:outline-none focus:border-amber-400/50 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full gradient-btn text-gray-900 font-semibold py-2.5 rounded-lg disabled:opacity-50"
          >
            {loading ? "…" : isRegister ? "Create Account" : "Sign In"}
          </button>

          <p className="text-center text-sm text-gray-500">
            {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="text-amber-400 hover:text-amber-300 transition-colors"
            >
              {isRegister ? "Sign in" : "Register"}
            </button>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
