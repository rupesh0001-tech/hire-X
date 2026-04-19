"use client";
import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, MapPin, Briefcase, Globe, Crown, ShieldCheck,
  Heart, MessageCircle, Calendar, Building2, Code2,
  GraduationCap, FolderGit2, Ticket, CalendarDays, CalendarCheck,
  PenSquare, Edit3, ExternalLink, Users, IndianRupee,
} from "lucide-react";
import Link from "next/link";
import { useAppSelector } from "@/store/hooks";
import { postsApi, Post, Comment } from "@/apis/posts.api";
import { eventsApi } from "@/apis/events.api";
import { PostCard } from "@/components/feed/post-card";
import { formatDistanceToNow } from "date-fns";

type TabKey = "posts" | "about" | "events-joined" | "events-hosted";

function Section({
  icon, title, children, extra,
}: { icon: React.ReactNode; title: string; children: React.ReactNode; extra?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-purple-500">{icon}</span>
          <h3 className="text-sm font-bold text-gray-800 dark:text-white">{title}</h3>
        </div>
        {extra}
      </div>
      {children}
    </div>
  );
}

export default function MyProfilePage() {
  const { user } = useAppSelector((state) => state.auth);
  const [posts, setPosts]       = useState<Post[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [hostedEvents, setHostedEvents]   = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState<TabKey>("posts");

  const load = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const [postsRes, regsRes, hostedRes] = await Promise.allSettled([
        postsApi.getMyPosts(user.id),
        eventsApi.getMyRegistrations(),
        eventsApi.getMyEvents(),
      ]);
      if (postsRes.status === "fulfilled" && postsRes.value.success)
        setPosts((postsRes.value.data ?? []).map((p: any) => ({
          ...p,
          comments: p.comments ?? [],
          _count: p._count ?? { likes: 0, comments: 0 },
          isLikedByMe: p.isLikedByMe ?? false,
          isSponsored: p.isSponsored ?? false,
        })));
      if (regsRes.status === "fulfilled" && regsRes.value.success)
        setRegistrations(regsRes.value.data ?? []);
      if (hostedRes.status === "fulfilled" && hostedRes.value.success)
        setHostedEvents(hostedRes.value.data ?? []);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  /* optimistic handlers */
  const handleDelete       = (id: string)                           => setPosts(p => p.filter(x => x.id !== id));
  const handleLikeToggle   = (id: string, liked: boolean, n: number) =>
    setPosts(p => p.map(x => x.id === id ? { ...x, isLikedByMe: liked, _count: { ...x._count, likes: n } } : x));
  const handleCommentAdded = (id: string, c: Comment) =>
    setPosts(p => p.map(x => x.id === id ? { ...x, comments: [...(x.comments ?? []), c], _count: { ...x._count, comments: (x._count?.comments ?? 0) + 1 } } : x));
  const handleCommentDeleted = (id: string, cid: string) =>
    setPosts(p => p.map(x => x.id === id ? { ...x, comments: (x.comments ?? []).filter(c => c.id !== cid), _count: { ...x._count, comments: Math.max(0, (x._count?.comments ?? 1) - 1) } } : x));

  if (!user) return (
    <div className="flex items-center justify-center py-40">
      <Loader2 size={28} className="animate-spin text-purple-500" />
    </div>
  );

  const initials = `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase();
  const totalLikes = posts.reduce((s, p) => s + (p._count?.likes ?? 0), 0);
  const upcomingRegistrations = registrations.filter(r => new Date(r.event.eventDate) >= new Date());

  const tabs: { key: TabKey; label: string; count?: number }[] = [
    { key: "posts",         label: `Posts (${posts.length})` },
    { key: "about",         label: "About" },
    { key: "events-joined", label: `Events Joined (${registrations.length})` },
    { key: "events-hosted", label: `Events Hosted (${hostedEvents.length})` },
  ];

  return (
    <div className="max-w-2xl mx-auto pb-20">
      {/* ── Hero card ─────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="px-6 py-6 ring-1 ring-gray-200 dark:ring-white/10 bg-white dark:bg-white/[0.03] rounded-2xl shadow-sm">
          {/* Avatar row */}
          <div className="flex items-start justify-between mb-4">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-3xl shadow-xl shadow-purple-500/20 overflow-hidden border-4 border-white dark:border-[#111116]">
              {(user as any).avatarUrl
                ? <img src={(user as any).avatarUrl} alt={initials} className="w-full h-full object-cover" />
                : initials}
            </div>

            <div className="flex flex-col items-end gap-3">
              <Link
                href="/dashboard/settings/profile"
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 text-gray-800 dark:text-white border border-gray-200 dark:border-white/10 rounded-xl transition-all shadow-sm"
              >
                <Edit3 size={14} /> Edit Profile
              </Link>
              <div className="flex items-center gap-2">
                {user.isVerified && (
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400 border border-green-200 dark:border-green-500/20">
                    <ShieldCheck size={12} /> Verified
                  </span>
                )}
                {(user as any).role === "FOUNDER" && (
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
                    <Crown size={12} /> Founder
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Name + meta */}
          <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            {user.firstName} {user.lastName}
            {(user as any).shortId && (
              <span className="text-[10px] font-mono text-gray-400 bg-gray-100 dark:bg-white/5 px-1.5 py-0.5 rounded border border-gray-200 dark:border-white/5 select-all">
                #{ (user as any).shortId }
              </span>
            )}
          </h1>
          {(user as any).jobTitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{(user as any).jobTitle}</p>
          )}

          <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-400">
            {(user as any).location && (
              <span className="flex items-center gap-1"><MapPin size={12} /> {(user as any).location}</span>
            )}
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              Joined {user.createdAt ? formatDistanceToNow(new Date(user.createdAt), { addSuffix: true }) : "recently"}
            </span>
          </div>

          {(user as any).bio && (
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{(user as any).bio}</p>
          )}

          {/* Stats */}
          <div className="flex items-center gap-6 mt-5 pt-4 border-t border-gray-100 dark:border-white/5">
            {[
              { label: "Posts",           value: posts.length },
              { label: "Likes",           value: totalLikes },
              { label: "Events Joined",   value: registrations.length },
              { label: "Events Hosted",   value: hostedEvents.length },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{value}</p>
                <p className="text-xs text-gray-400">{label}</p>
              </div>
            ))}
            {(user.skills?.length ?? 0) > 0 && (
              <div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{user.skills!.length}</p>
                <p className="text-xs text-gray-400">Skills</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── Tabs ──────────────────────────────────── */}
      <div className="flex gap-1 bg-gray-100 dark:bg-white/5 rounded-xl p-1 mb-5 overflow-x-auto scrollbar-none">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap px-2 ${
              tab === t.key
                ? "bg-white dark:bg-white/10 text-purple-600 dark:text-purple-400 shadow-sm"
                : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Loading  ─────────────────────────────── */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-purple-500" />
        </div>
      )}

      {/* ── Posts tab ─────────────────────────────── */}
      {!loading && tab === "posts" && (
        posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <PenSquare size={32} className="text-gray-300 dark:text-gray-600" />
            <p className="text-sm text-gray-500">No posts yet.</p>
            <Link href="/dashboard/my-posts" className="text-sm text-purple-500 hover:underline">Create your first post →</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onDelete={handleDelete}
                onLikeToggle={handleLikeToggle}
                onCommentAdded={handleCommentAdded}
                onCommentDeleted={handleCommentDeleted}
              />
            ))}
          </div>
        )
      )}

      {/* ── About tab ─────────────────────────────── */}
      {!loading && tab === "about" && (
        <div className="space-y-4">
          {/* Skills */}
          {(user.skills?.length ?? 0) > 0 && (
            <Section icon={<Code2 size={16} />} title="Skills"
              extra={<Link href="/dashboard/settings/profile?tab=skills" className="text-xs text-purple-500 hover:underline flex items-center gap-1"><Edit3 size={10} /> Edit</Link>}
            >
              <div className="flex flex-wrap gap-2">
                {user.skills!.map((s: any) => (
                  <span key={s.id} className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                    {s.name}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {/* Experience */}
          {(user.experience?.length ?? 0) > 0 && (
            <Section icon={<Briefcase size={16} />} title="Experience"
              extra={<Link href="/dashboard/settings/profile?tab=experience" className="text-xs text-purple-500 hover:underline flex items-center gap-1"><Edit3 size={10} /> Edit</Link>}
            >
              <div className="space-y-3">
                {user.experience!.map((e: any) => (
                  <div key={e.id} className="border-l-2 border-purple-500/30 pl-4">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{e.position}</p>
                    <p className="text-xs text-gray-500">{e.company} · {e.startDate} – {e.isCurrent ? "Present" : (e.endDate ?? "")}</p>
                    {e.description && <p className="text-xs text-gray-500 mt-1">{e.description}</p>}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Education */}
          {(user.education?.length ?? 0) > 0 && (
            <Section icon={<GraduationCap size={16} />} title="Education"
              extra={<Link href="/dashboard/settings/profile?tab=education" className="text-xs text-purple-500 hover:underline flex items-center gap-1"><Edit3 size={10} /> Edit</Link>}
            >
              <div className="space-y-3">
                {user.education!.map((e: any) => (
                  <div key={e.id} className="border-l-2 border-violet-500/30 pl-4">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{e.degree} in {e.field}</p>
                    <p className="text-xs text-gray-500">{e.institution} · {e.graduationDate}</p>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Projects */}
          {(user.projects?.length ?? 0) > 0 && (
            <Section icon={<FolderGit2 size={16} />} title="Projects"
              extra={<Link href="/dashboard/settings/profile?tab=projects" className="text-xs text-purple-500 hover:underline flex items-center gap-1"><Edit3 size={10} /> Edit</Link>}
            >
              <div className="space-y-3">
                {user.projects!.map((p: any) => (
                  <div key={p.id} className="rounded-xl bg-gray-50 dark:bg-white/5 p-3">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{p.name}</p>
                    {p.techStack && <p className="text-xs text-purple-500 mt-0.5">{p.techStack}</p>}
                    {p.description && <p className="text-xs text-gray-500 mt-1">{p.description}</p>}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {!(user.skills?.length) && !(user.experience?.length) && !(user.education?.length) && !(user.projects?.length) && (
            <div className="flex flex-col items-center py-16 gap-3 text-center text-gray-400">
              <span className="text-4xl">🌱</span>
              <p className="text-sm">Your profile is empty. Fill it in to unlock more features!</p>
              <Link href="/dashboard/settings/profile" className="text-sm text-purple-500 hover:underline">Complete your profile →</Link>
            </div>
          )}
        </div>
      )}

      {/* ── Events Joined tab ─────────────────────── */}
      {!loading && tab === "events-joined" && (
        registrations.length === 0 ? (
          <div className="flex flex-col items-center py-20 gap-3 text-center">
            <Ticket size={32} className="text-gray-300 dark:text-gray-600" />
            <p className="text-sm text-gray-500">You haven't registered for any events yet.</p>
            <Link href="/dashboard/events" className="text-sm text-purple-500 hover:underline">Browse Events →</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {registrations.map((reg: any) => {
              const isPast = new Date(reg.event.eventDate) < new Date();
              return (
                <div key={reg.id} className={`rounded-2xl border p-4 ${isPast ? "border-gray-200 dark:border-white/5 opacity-70" : "border-purple-200 dark:border-purple-500/20 bg-purple-50/30 dark:bg-purple-500/[0.04]"}`}>
                  <div className="flex items-start gap-3">
                    {reg.event.bannerUrl
                      ? <img src={reg.event.bannerUrl} alt="" className="w-12 h-12 rounded-xl object-cover border border-gray-200 dark:border-white/10 shrink-0" />
                      : <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-500/15 flex items-center justify-center shrink-0"><CalendarDays size={18} className="text-purple-500 dark:text-purple-400" /></div>
                    }
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm leading-snug">{reg.event.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{reg.event.organizerName}</p>
                      <div className="flex flex-wrap gap-x-3 mt-1.5 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><CalendarDays size={10} /> {new Date(reg.event.eventDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                        <span className="flex items-center gap-1"><MapPin size={10} /> {reg.event.venue}</span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                      reg.attendanceStatus === "VERIFIED"
                        ? "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/20"
                        : isPast
                        ? "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-500/15 dark:text-gray-400 dark:border-gray-500/20"
                        : "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/15 dark:text-purple-400 dark:border-purple-500/20"
                    }`}>
                      {reg.attendanceStatus === "VERIFIED" ? "Attended" : isPast ? "Past" : "Upcoming"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* ── Events Hosted tab ─────────────────────── */}
      {!loading && tab === "events-hosted" && (
        hostedEvents.length === 0 ? (
          <div className="flex flex-col items-center py-20 gap-3 text-center">
            <CalendarCheck size={32} className="text-gray-300 dark:text-gray-600" />
            <p className="text-sm text-gray-500">You haven't hosted any events yet.</p>
            <Link href="/dashboard/events" className="text-sm text-purple-500 hover:underline">Host an Event →</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {hostedEvents.map((event: any) => {
              const isPast = new Date(event.eventDate) < new Date();
              return (
                <div key={event.id} className={`rounded-2xl border p-4 ${event.status === "CANCELLED" ? "border-red-200 dark:border-red-500/20 opacity-60" : isPast ? "border-gray-200 dark:border-white/10 opacity-80" : "border-emerald-200 dark:border-emerald-500/20 bg-emerald-50/30 dark:bg-emerald-500/[0.04]"}`}>
                  <div className="flex items-start gap-3">
                    {event.bannerUrl
                      ? <img src={event.bannerUrl} alt="" className="w-12 h-12 rounded-xl object-cover border border-gray-200 dark:border-white/10 shrink-0" />
                      : <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-500/15 flex items-center justify-center shrink-0"><CalendarCheck size={18} className="text-emerald-600 dark:text-emerald-400" /></div>
                    }
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm leading-snug">{event.title}</p>
                      <div className="flex flex-wrap gap-x-3 mt-1.5 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><CalendarDays size={10} /> {new Date(event.eventDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                        <span className="flex items-center gap-1"><Users size={10} /> {event._count?.registrations ?? 0} registered</span>
                        <span className="flex items-center gap-1"><IndianRupee size={10} /> {event.price === 0 ? "Free" : (event.price / 100).toFixed(0)} entry</span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                      event.status === "CANCELLED"
                        ? "bg-red-100 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/20"
                        : isPast
                        ? "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-500/15 dark:text-gray-400 dark:border-gray-500/20"
                        : "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/20"
                    }`}>
                      {event.status === "CANCELLED" ? "Cancelled" : isPast ? "Past" : "Active"}
                    </span>
                  </div>
                  <Link href="/dashboard/events/my-events" className="mt-3 flex items-center gap-1 text-xs text-purple-500 hover:underline">
                    Manage Event <ExternalLink size={10} />
                  </Link>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}
