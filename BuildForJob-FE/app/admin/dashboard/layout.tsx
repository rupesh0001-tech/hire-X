"use client";
import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Shield,
  Users,
  FileCheck,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";

const NAV_ITEMS = [
  { name: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "All Users", href: "/admin/dashboard/users", icon: Users },
  { name: "Verify Docs", href: "/admin/dashboard/docs", icon: FileCheck },
];

function AdminSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [admin, setAdmin] = useState<{ firstName: string; lastName: string; email: string } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("admin_user");
    if (stored) setAdmin(JSON.parse(stored));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    router.push("/admin/login");
  };

  return (
    <div
      className={cn(
        "flex h-full flex-col bg-[#08080a] shrink-0 transition-all duration-300 ease-in-out border-r border-white/5",
        isOpen ? "w-60 opacity-100" : "w-0 opacity-0 overflow-hidden border-none pointer-events-none"
      )}
    >
      {isOpen && (
        <>
          {/* Brand */}
          <div className="flex items-center gap-3 px-5 py-5 border-b border-white/5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-violet-700 flex items-center justify-center shadow-lg shadow-purple-500/30 shrink-0">
              <Shield size={18} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-tight">Admin Portal</p>
              <p className="text-xs text-gray-500">BuildForJob</p>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                    isActive
                      ? "bg-purple-500/15 text-purple-300 border border-purple-500/20"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <item.icon
                    size={17}
                    className={cn(
                      "transition-colors",
                      isActive ? "text-purple-400" : "text-gray-500 group-hover:text-gray-300"
                    )}
                  />
                  {item.name}
                  {isActive && <ChevronRight size={14} className="ml-auto text-purple-400" />}
                </Link>
              );
            })}
          </nav>

          {/* Admin user at bottom */}
          <div className="px-3 pb-4 mt-auto">
            <div className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02] mb-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {admin?.firstName?.[0] ?? "A"}
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-xs font-semibold text-white truncate">
                  {admin ? `${admin.firstName} ${admin.lastName}` : "Admin"}
                </span>
                <span className="text-xs text-gray-500 truncate">{admin?.email}</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
            >
              <LogOut size={15} />
              Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.replace("/admin/login");
    } else {
      setChecked(true);
    }
  }, [router]);

  if (!checked) {
    return (
      <div className="min-h-screen bg-[#08080a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#08080a] overflow-hidden">
      {/* Dot grid bg */}
      <div
        className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#8b5cf6 0.5px, transparent 0.5px)`,
          backgroundSize: "24px 24px",
        }}
      />

      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative z-10">
        {/* Header */}
        <header className="h-14 flex shrink-0 items-center gap-4 border-b border-white/5 px-6 bg-black/40 backdrop-blur-md">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-white/10 transition-all text-gray-400 hover:text-white"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <div className="flex items-center gap-2">
            <Shield size={15} className="text-purple-400" />
            <span className="text-sm font-medium text-gray-400">Admin Dashboard</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/20 font-medium">
              Admin
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
