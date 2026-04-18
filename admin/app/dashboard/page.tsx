"use client";
import React, { useEffect, useState } from "react";
import { api, AdminStats } from "@/lib/api";
import {
  Users, Building2, Newspaper, FileClock, FileCheck, FileX,
  AlertTriangle, TrendingUp, CalendarDays, RefreshCcw,
} from "lucide-react";

function cn(...cls: (string | boolean | undefined)[]) {
  return cls.filter(Boolean).join(" ");
}

const COLORS: Record<string, string> = {
  purple: "border-purple-500/20 from-purple-500/10 to-purple-600/5 [&_svg]:text-purple-400",
  blue:   "border-blue-500/20   from-blue-500/10   to-blue-600/5   [&_svg]:text-blue-400",
  violet: "border-violet-500/20 from-violet-500/10 to-violet-600/5 [&_svg]:text-violet-400",
  amber:  "border-amber-500/20  from-amber-500/10  to-amber-600/5  [&_svg]:text-amber-400",
  green:  "border-emerald-500/20 from-emerald-500/10 to-emerald-600/5 [&_svg]:text-emerald-400",
  red:    "border-red-500/20    from-red-500/10    to-red-600/5    [&_svg]:text-red-400",
};

function StatCard({ label, value, Icon, color }: { label: string; value: number; Icon: React.ElementType; color: string }) {
  return (
    <div className={cn("rounded-2xl border bg-gradient-to-br p-5 backdrop-blur-sm", COLORS[color])}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
          <p className="text-3xl font-bold text-white mt-1.5">{value}</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getStats()
      .then((r) => { if (r.success) setStats(r.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Here's a live snapshot of the platform.</p>
      </div>

      {/* Alert for pending docs */}
      {(stats?.pendingDocs ?? 0) > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
          <AlertTriangle size={18} className="text-amber-400 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-300">
              {stats!.pendingDocs} document{stats!.pendingDocs !== 1 ? "s" : ""} awaiting review
            </p>
            <p className="text-xs text-amber-500 mt-0.5">Founders are restricted until their docs are verified.</p>
          </div>
          <a href="/dashboard/docs"
            className="shrink-0 px-4 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-xs font-semibold text-amber-300 hover:bg-amber-500/30 transition-colors">
            Review Now →
          </a>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Regular Users"  value={stats?.totalUsers    ?? 0} Icon={Users}       color="purple" />
        <StatCard label="Founders"       value={stats?.totalFounders ?? 0} Icon={Building2}   color="blue"   />
        <StatCard label="Total Posts"    value={stats?.totalPosts    ?? 0} Icon={Newspaper}   color="violet" />
        <StatCard label="Events Listed"  value={stats?.totalEvents   ?? 0} Icon={CalendarDays} color="blue"  />
        <StatCard label="Pending Docs"   value={stats?.pendingDocs   ?? 0} Icon={FileClock}   color="amber"  />
        <StatCard label="Verified Docs"  value={stats?.verifiedDocs  ?? 0} Icon={FileCheck}   color="green"  />
        <StatCard label="Rejected Docs"  value={stats?.rejectedDocs  ?? 0} Icon={FileX}       color="red"    />
        <StatCard label="Pending Refunds" value={stats?.pendingRefunds ?? 0} Icon={RefreshCcw} color="amber" />
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { href: "/dashboard/docs",   Icon: FileCheck,    title: "Verify Documents", sub: "Review founder ownership docs",  accent: "purple" },
          { href: "/dashboard/users",  Icon: Users,        title: "Manage Users",     sub: "Browse all registered accounts", accent: "blue"   },
          { href: "/dashboard/events", Icon: CalendarDays, title: "Events",           sub: "View and manage platform events", accent: "violet" },
        ].map(({ href, Icon, title, sub, accent }) => (
          <a key={href} href={href}
            className="group p-5 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 transition-all">
            <Icon size={22} className={`text-${accent}-400 mb-3`} />
            <p className="text-sm font-semibold text-white">{title}</p>
            <p className="text-xs text-gray-500 mt-1">{sub}</p>
            <div className={`flex items-center gap-1 mt-3 text-xs text-${accent}-400 font-medium`}>
              <TrendingUp size={11} /> Open
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
