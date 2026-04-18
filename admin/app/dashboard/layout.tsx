"use client";
import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Shield, LayoutDashboard, Users, FileCheck,
  LogOut, Menu, X, ChevronRight,
} from "lucide-react";

const NAV = [
  { label: "Overview",     href: "/dashboard",       icon: LayoutDashboard },
  { label: "All Users",    href: "/dashboard/users",  icon: Users },
  { label: "Verify Docs",  href: "/dashboard/docs",   icon: FileCheck },
];

function cn(...cls: (string | boolean | undefined)[]) {
  return cls.filter(Boolean).join(" ");
}

function Sidebar({ open }: { open: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const [admin, setAdmin] = useState<{ firstName: string; lastName: string; email: string } | null>(null);

  useEffect(() => {
    try { setAdmin(JSON.parse(localStorage.getItem("admin_user") || "null")); } catch {}
  }, []);

  const logout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    router.push("/login");
  };

  if (!open) return null;

  return (
    <aside className="flex h-full w-60 flex-col shrink-0 bg-[#08080a] border-r border-white/5">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-violet-700 flex items-center justify-center shadow-lg shadow-purple-500/30 shrink-0">
          <Shield size={18} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-white leading-tight">Admin Portal</p>
          <p className="text-xs text-gray-600">BuildForJob</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                active
                  ? "bg-purple-500/15 text-purple-300 border border-purple-500/20"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon size={17} className={cn(active ? "text-purple-400" : "text-gray-500 group-hover:text-gray-300")} />
              {item.label}
              {active && <ChevronRight size={14} className="ml-auto text-purple-400" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 space-y-2">
        {admin && (
          <div className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02]">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {admin.firstName[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{admin.firstName} {admin.lastName}</p>
              <p className="text-xs text-gray-600 truncate">{admin.email}</p>
            </div>
          </div>
        )}
        <button onClick={logout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm text-gray-500 hover:bg-red-500/10 hover:text-red-400 transition-all">
          <LogOut size={14} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("admin_token")) {
      router.replace("/login");
    } else {
      setReady(true);
    }
  }, [router]);

  if (!ready) return (
    <div className="min-h-screen bg-[#08080a] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="flex h-screen bg-[#08080a] overflow-hidden">
      {/* dot grid */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: `radial-gradient(#8b5cf6 0.5px,transparent 0.5px)`, backgroundSize: "24px 24px" }} />

      <Sidebar open={open} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative z-10">
        {/* Topbar */}
        <header className="h-14 flex shrink-0 items-center gap-4 border-b border-white/5 px-5 bg-black/40 backdrop-blur-md">
          <button onClick={() => setOpen(!open)}
            className="p-2 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white transition-colors">
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
          <Shield size={15} className="text-purple-400" />
          <span className="text-sm font-medium text-gray-400">Admin Dashboard</span>
          <span className="ml-auto text-xs px-2.5 py-1 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/20 font-semibold">
            ADMIN
          </span>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-8 scrollbar-hide">
          {children}
        </main>
      </div>
    </div>
  );
}
