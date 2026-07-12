import { NavLink } from "react-router-dom";
import { TimerIcon, ListChecksIcon, LayoutDashboardIcon } from "lucide-react";

export default function Navbar() {
  const link =
    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors" +
    " text-slate-400 hover:text-white hover:bg-slate-700";
  const active = "bg-slate-700 text-white";

  return (
    <nav className="w-full bg-slate-900 border-b border-slate-700/60 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-xl font-bold text-indigo-400 tracking-tight">
          FocusFlow
        </span>
      </div>
      <div className="flex items-center gap-1">
        <NavLink
          to="/"
          end
          className={({ isActive }) => `${link} ${isActive ? active : ""}`}
        >
          <LayoutDashboardIcon size={16} />
          Dashboard
        </NavLink>
        <NavLink
          to="/timer"
          className={({ isActive }) => `${link} ${isActive ? active : ""}`}
        >
          <TimerIcon size={16} />
          Timer
        </NavLink>
        <NavLink
          to="/tasks"
          className={({ isActive }) => `${link} ${isActive ? active : ""}`}
        >
          <ListChecksIcon size={16} />
          Tasks
        </NavLink>
      </div>
    </nav>
  );
}
