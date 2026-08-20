import { useState, type ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  CalendarClock,
  Inbox,
  LayoutDashboard,
  LogOut,
  MailPlus,
  Menu,
  Send,
  X,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/campaigns/new", label: "Create campaign", icon: MailPlus },
  { to: "/campaigns", label: "Campaigns", icon: Inbox },
  { to: "/emails/scheduled", label: "Scheduled", icon: CalendarClock },
  { to: "/emails/sent", label: "Sent", icon: Send },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  async function onLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-white shadow-inner">
          <Send className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">ReachInbox</p>
          <p className="text-xs text-slate-400">Email scheduler</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "bg-white/10 text-white"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-white/10 p-4">
        <div className="mb-3 flex items-center gap-3">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt=""
              className="h-9 w-9 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-800 text-sm font-semibold text-white">
              {(user?.name ?? user?.email ?? "?").slice(0, 1).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">
              {user?.name ?? "Signed in"}
            </p>
            <p className="truncate text-xs text-slate-400">{user?.email}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f4f6fb] lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="hidden bg-ink-950 lg:block">{sidebar}</aside>
      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/50"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <div className="relative h-full w-72 bg-ink-950 shadow-xl">{sidebar}</div>
        </div>
      ) : null}
      <div className="flex min-h-screen flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
          <span className="font-semibold text-slate-900">ReachInbox</span>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="rounded-lg border border-slate-200 p-2 text-slate-700"
            aria-label="Toggle navigation"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
