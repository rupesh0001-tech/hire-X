"use client";
import React, { useEffect, useState, useCallback } from "react";
import { OverviewHeader } from "@/components/dashboard/overview/overview-header";
import { QuickActions } from "@/components/dashboard/overview/quick-actions";
import { ActivityFeed } from "@/components/dashboard/overview/activity-feed";
import { StatsTracker } from "@/components/dashboard/overview/stats-tracker";
import { ProfileCompletionBanner } from "@/components/dashboard/overview/profile-completion-banner";
import { useAppSelector } from "@/store/hooks";
import { postsApi } from "@/apis/posts.api";
import { eventsApi } from "@/apis/events.api";
import {
  PenSquare, Heart, MessageCircle, CalendarDays, Ticket, CalendarCheck,
  TrendingUp, Users,
} from "lucide-react";

function StatCard({
  label, value, icon: Icon, color, sub,
}: {
  label: string; value: string | number; icon: any; color: string; sub?: string;
}) {
  return (
    <div className={`flex items-center gap-4 rounded-2xl border p-5 transition-all hover:shadow-md ${color}`}>
      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${color.includes("purple") ? "bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300" : color.includes("pink") ? "bg-pink-100 dark:bg-pink-500/20 text-pink-700 dark:text-pink-300" : color.includes("blue") ? "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300" : color.includes("emerald") ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300" : color.includes("violet") ? "bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300" : "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300"}`}>
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</p>
        {sub && <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function DashboardOverviewPage() {
  const { user } = useAppSelector((state) => state.auth);

  const [myPosts, setMyPosts] = useState<any[]>([]);
  const [myRegistrations, setMyRegistrations] = useState<any[]>([]);
  const [myHostedEvents, setMyHostedEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const [postsRes, regsRes, eventsRes] = await Promise.allSettled([
        postsApi.getMyPosts(user.id),
        eventsApi.getMyRegistrations(),
        eventsApi.getMyEvents(),
      ]);

      if (postsRes.status === "fulfilled" && postsRes.value.success) setMyPosts(postsRes.value.data ?? []);
      if (regsRes.status === "fulfilled" && regsRes.value.success) setMyRegistrations(regsRes.value.data ?? []);
      if (eventsRes.status === "fulfilled" && eventsRes.value.success) setMyHostedEvents(eventsRes.value.data ?? []);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  const totalLikes = myPosts.reduce((s: number, p: any) => s + (p._count?.likes ?? 0), 0);
  const totalComments = myPosts.reduce((s: number, p: any) => s + (p._count?.comments ?? 0), 0);
  const upcomingRegs = myRegistrations.filter((r: any) => new Date(r.event.eventDate) >= new Date());
  const activeEvents = myHostedEvents.filter((e: any) => e.status === "ACTIVE");

  const statCards = [
    { label: "My Posts",              value: myPosts.length,         icon: PenSquare,    color: "border-purple-200 dark:border-purple-500/20 hover:border-purple-300 dark:hover:border-purple-500/40 purple" },
    { label: "Total Likes",           value: totalLikes,             icon: Heart,        color: "border-pink-200 dark:border-pink-500/20 hover:border-pink-300 dark:hover:border-pink-500/40 pink" },
    { label: "Total Comments",        value: totalComments,          icon: MessageCircle, color: "border-blue-200 dark:border-blue-500/20 hover:border-blue-300 dark:hover:border-blue-500/40 blue" },
    { label: "Events Registered",     value: myRegistrations.length, icon: Ticket,       color: "border-violet-200 dark:border-violet-500/20 hover:border-violet-300 dark:hover:border-violet-500/40 violet" },
    { label: "Upcoming Registrations",value: upcomingRegs.length,    icon: CalendarDays, color: "border-emerald-200 dark:border-emerald-500/20 hover:border-emerald-300 dark:hover:border-emerald-500/40 emerald" },
    { label: "Events Hosted",         value: myHostedEvents.length,  icon: CalendarCheck, color: "border-amber-200 dark:border-amber-500/20 hover:border-amber-300 dark:hover:border-amber-500/40 amber" },
  ];

  return (
    <div className="max-w-6xl mx-auto animation-fade-in pb-12">
      <ProfileCompletionBanner />
      <OverviewHeader name={user?.firstName || "there"} />

      {/* Stats Grid */}
      <div className="mb-10">
        <h2 className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">
          Your Activity at a Glance
        </h2>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-24 rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {statCards.map((s) => (
              <StatCard key={s.label} label={s.label} value={s.value} icon={s.icon} color={s.color} />
            ))}
          </div>
        )}
      </div>

      <QuickActions />

      <h2 className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">Recent Activity &amp; Stats</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ActivityFeed />
        <StatsTracker />
      </div>
    </div>
  );
}
