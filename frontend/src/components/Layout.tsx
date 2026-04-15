import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import { Toaster } from "react-hot-toast";

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Outlet />
      </main>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: { background: "#1f2937", color: "#f3f4f6" },
        }}
      />
    </div>
  );
}
