import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-6 sm:py-8 max-w-5xl pb-24 sm:pb-8">
        <Outlet />
      </main>
    </div>
  );
}
