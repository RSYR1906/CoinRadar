import { AnimatePresence, motion } from "framer-motion";
import { Toaster } from "react-hot-toast";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";

export default function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen text-gray-100">
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="max-w-7xl mx-auto px-4 py-6"
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "rgba(17, 24, 39, 0.9)",
            color: "#f3f4f6",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.06)",
          },
        }}
      />
    </div>
  );
}
