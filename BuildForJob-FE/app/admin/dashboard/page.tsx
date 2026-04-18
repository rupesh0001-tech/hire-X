"use client";
import React, { useEffect, useState } from "react";
import { adminDataApi, AdminStats } from "@/apis/admin.api";
import {
  Users,
  FileCheck,
  FileX,
  FileClock,
  Newspaper,
  Building2,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: "purple" | "green" | "amber" | "red" | "blue" | "violet";
  trend?: string;
}

const COLOR_MAP = {
  purple: "from-purple-500/20 to-purple-600/10 border-purple-500/20 text-purple-400",
  green: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/20 text-emerald-400",
  amber: "from-amber-500/20 to-amber-600/10 border-amber-500/20 text-amber-400",
  red: "from-red-500/20 to-red-600/10 border-red-500/20 text-red-400",
  blue: "from-blue-500/20 to-blue-600/10 border-blue-500/20 text-blue-400",
  violet: "from-violet-500/20 to-violet-600/10 border-violet-500/20 text-violet-400",
};

function StatCard({ label, value, icon: Icon, color, trend }: StatCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-2xl border bg-gradient-to-br p-5 backdrop-blur-sm overflow-hidden",
        COLOR_MAP[color]
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">{label}</p>
          <p className="text-3xl font-bold text-white mt-1">{value}</p>
          {trend && <p className="text-xs text-gray-500 mt-1">{trend}</p>}
        </div>
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", `bg-${color}-500/20`)}>
          <Icon size={20} className={`text-${color}-400`} />
        </div>
      </div>
    </div>
  );
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminDataApi
      .getStats()
      .then((r) => { if (r.success) setStats(r.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const hasPending = (stats?.pendingDocs ?? 0) > 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome back, Admin. Here's what's happening.</p>
      </div>

      {/* Pending docs alert */}
      {hasPending && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
          <AlertTriangle size={18} className="text-amber-400 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-300">
              {stats!.pendingDocs} document{stats!.pendingDocs > 1 ? "s" : ""} awaiting review
            </p>
            <p className="text-xs text-amber-500 mt-0.5">
              Founders cannot promote posts or get founder tag until docs are verified.
            </p>
          </div>
          <a
            href="/admin/dashboard/docs"
            className="ml-auto shrink-0 px-4 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30 hover:bg-amber-500/30 transition-colors"
          >
            Review Now
          </a>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard label="Regular Users" value={stats?.totalUsers ?? 0} icon={Users} color="purple" />
        <StatCard label="Founders" value={stats?.totalFounders ?? 0} icon={Building2} color="blue" />
        <StatCard label="Total Posts" value={stats?.totalPosts ?? 0} icon={Newspaper} color="violet" />
        <StatCard label="Pending Docs" value={stats?.pendingDocs ?? 0} icon={FileClock} color="amber" />
        <StatCard label="Verified Docs" value={stats?.verifiedDocs ?? 0} icon={FileCheck} color="green" />
        <StatCard label="Rejected Docs" value={stats?.rejectedDocs ?? 0} icon={FileX} color="red" />
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-4">
        <a
          href="/admin/dashboard/docs"
          className="group p-5 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-colors"
        >
          <FileCheck size={22} className="text-purple-400 mb-3" />
          <p className="text-sm font-semibold text-white">Verify Documents</p>
          <p className="text-xs text-gray-500 mt-1">Review founder ownership documents</p>
          <div className="flex items-center gap-1 mt-3 text-xs text-purple-400 font-medium">
            <TrendingUp size={12} />
            <span>Go to Docs</span>
          </div>
        </a>
        <a
          href="/admin/dashboard/users"
          className="group p-5 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-colors"
        >
          <Users size={22} className="text-blue-400 mb-3" />
          <p className="text-sm font-semibold text-white">Manage Users</p>
          <p className="text-xs text-gray-500 mt-1">View all registered users and founders</p>
          <div className="flex items-center gap-1 mt-3 text-xs text-blue-400 font-medium">
            <TrendingUp size={12} />
            <span>View Users</span>
          </div>
        </a>
      </div>
    </div>
  );
}
