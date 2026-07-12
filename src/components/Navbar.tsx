import { NavLink } from "react-router-dom";
import { TimerIcon, ListChecksIcon, LayoutDashboardIcon } from "lucide-react";

export default function Navbar() {
  const link =
    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors" +
    " text-slate-400 hover:text-white hover:bg-slate-700";
  const active = "bg-slate-700 text-white";

  const mobileLink =
    "flex flex-col items-center justify-center gap-1 flex-1 py-2 text-xs font-medium transition-colors text-slate-500 hover:text-slate-300";
  const mobileActive = "text-indigo-400";

  return (
    <>
      {/* Top bar */}
      <nav className="w-full bg-slate-900 border-b border-slate-700/60 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-indigo-400 tracking-tight">
            FocusFlow
          </span>
        </div>
        {/* Desktop nav — hidden on mobile */}
        <div className="hidden sm:flex items-center gap-1">
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

      {/* Mobile bottom navigation */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 z-50 bg-slate-900 border-t border-slate-700/60 flex safe-area-inset-bottom">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `${mobileLink} ${isActive ? mobileActive : ""}`
          }
        >
          <LayoutDashboardIcon size={20} />
          Dashboard
        </NavLink>
        <NavLink
          to="/timer"
          className={({ isActive }) =>
            `${mobileLink} ${isActive ? mobileActive : ""}`
          }
        >
          <TimerIcon size={20} />
          Timer
        </NavLink>
        <NavLink
          to="/tasks"
          className={({ isActive }) =>
            `${mobileLink} ${isActive ? mobileActive : ""}`
          }
        >
          <ListChecksIcon size={20} />
          Tasks
        </NavLink>
      </nav>
    </>
  );
}
