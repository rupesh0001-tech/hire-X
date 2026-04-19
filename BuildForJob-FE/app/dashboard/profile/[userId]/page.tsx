"use client";
import React, { useEffect, useState } from "react";
import { use } from "react";
import { motion } from "framer-motion";
import {
  Loader2, MapPin, Briefcase, Globe, Crown, ShieldCheck,
  Heart, MessageCircle, Calendar, Building2, Code2,
  GraduationCap, FolderGit2, ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { authApi } from "@/apis/auth.api";
import { postsApi, Post, Comment } from "@/apis/posts.api";
import { PostCard } from "@/components/feed/post-card";
import { formatDistanceToNow } from "date-fns";

export default function PublicProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params);
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"posts" | "about">("posts");

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    authApi
      .getUserProfile(userId)
      .then((res) => {
        if (res.success) {
          const { posts: rawPosts, ...user } = res.data;
          setProfile(user);
          setPosts(
            (rawPosts ?? []).map((p: any) => ({
              ...p,
              comments: p.comments ?? [],
              _count: p._count ?? { likes: 0, comments: 0 },
              isLikedByMe: p.isLikedByMe ?? false,
              isSponsored: p.isSponsored ?? false,
            }))
          );
        }
      })
      .catch(() => setError("Could not load this profile."))
      .finally(() => setLoading(false));
  }, [userId]);

  /* ── optimistic post handlers ── */
  const handleDelete = (id: string) => setPosts(p => p.filter(x => x.id !== id));
  const handleLikeToggle = (id: string, liked: boolean, n: number) =>
    setPosts(p => p.map(x => x.id === id ? { ...x, isLikedByMe: liked, _count: { ...x._count, likes: n } } : x));
  const handleCommentAdded = (id: string, c: Comment) =>
    setPosts(p => p.map(x => x.id === id ? { ...x, comments: [...(x.comments ?? []), c], _count: { ...x._count, comments: (x._count?.comments ?? 0) + 1 } } : x));
  const handleCommentDeleted = (id: string, cid: string) =>
    setPosts(p => p.map(x => x.id === id ? { ...x, comments: (x.comments ?? []).filter(c => c.id !== cid), _count: { ...x._count, comments: Math.max(0, (x._count?.comments ?? 1) - 1) } } : x));

  /* ── loading ── */
  if (loading) return (
    <div className="flex items-center justify-center py-40 gap-3 flex-col text-gray-400">
      <Loader2 size={28} className="animate-spin text-purple-500" />
      <p className="text-sm">Loading profile…</p>
    </div>
  );

  if (error || !profile) return (
    <div className="flex flex-col items-center justify-center py-40 gap-4">
      <p className="text-sm text-red-500">{error ?? "Profile not found."}</p>
      <Link href="/dashboard/feed" className="text-sm text-purple-500 hover:underline flex items-center gap-1">
        <ArrowLeft size={14} /> Back to Feed
      </Link>
    </div>
  );

  const initials = `${profile.firstName?.[0] ?? ""}${profile.lastName?.[0] ?? ""}`.toUpperCase();
  const totalLikes = posts.reduce((s, p) => s + (p._count?.likes ?? 0), 0);

  return (
    <div className="max-w-2xl mx-auto pb-20">

      {/* Back */}
      <Link
        href="/dashboard/feed"
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-purple-500 transition-colors mb-6"
      >
        <ArrowLeft size={15} /> Back to Feed
      </Link>

      {/* ── Hero card ─────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] overflow-hidden mb-4 shadow-sm"
      >
        {/* Banner */}
        <div className="h-24 bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600" />

        <div className="px-6 pb-6">
          {/* Avatar row */}
          <div className="flex items-end justify-between -mt-10 mb-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-2xl shadow-xl shadow-purple-500/20 overflow-hidden border-4 border-white dark:border-[#08080a]">
              {profile.avatarUrl
                ? <img src={profile.avatarUrl} alt={initials} className="w-full h-full object-cover" />
                : initials}
            </div>

            <div className="flex items-center gap-2 mb-1">
              {profile.isVerified && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400">
                  <ShieldCheck size={12} /> Verified
                </span>
              )}
              {profile.role === "FOUNDER" && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
                  <Crown size={12} /> Founder
                </span>
              )}
            </div>
          </div>

          {/* Name + meta */}
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            {profile.firstName} {profile.lastName}
          </h1>
          {profile.jobTitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{profile.jobTitle}</p>
          )}

          <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-400">
            {profile.location && (
              <span className="flex items-center gap-1"><MapPin size={12} /> {profile.location}</span>
            )}
            {profile.company?.name && (
              <span className="flex items-center gap-1"><Building2 size={12} /> {profile.company.name}</span>
            )}
            {profile.company?.website && (
              <a href={profile.company.website} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-purple-500 transition-colors">
                <Globe size={12} /> {profile.company.website.replace(/https?:\/\//, "")}
              </a>
            )}
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              Joined {formatDistanceToNow(new Date(profile.createdAt), { addSuffix: true })}
            </span>
          </div>

          {profile.bio && (
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {profile.bio}
            </p>
          )}

          {/* Stats */}
          <div className="flex items-center gap-6 mt-5 pt-4 border-t border-gray-100 dark:border-white/5">
            {[
              { label: "Posts", value: posts.length },
              { label: "Likes", value: totalLikes },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{value}</p>
                <p className="text-xs text-gray-400">{label}</p>
              </div>
            ))}
            {profile.skills?.length > 0 && (
              <div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{profile.skills.length}</p>
                <p className="text-xs text-gray-400">Skills</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── Tabs ──────────────────────────────────── */}
      <div className="flex gap-1 bg-gray-100 dark:bg-white/5 rounded-xl p-1 mb-5">
        {(["posts", "about"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${tab === t
                ? "bg-white dark:bg-white/10 text-purple-600 dark:text-purple-400 shadow-sm"
                : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              }`}
          >
            {t === "posts" ? `Posts (${posts.length})` : "About"}
          </button>
        ))}
      </div>

      {/* ── Posts tab ─────────────────────────────── */}
      {tab === "posts" && (
        posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <span className="text-4xl">📭</span>
            <p className="text-sm text-gray-500">No posts yet.</p>
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
      {tab === "about" && (
        <div className="space-y-4">

          {/* Company */}
          {profile.company && (
            <Section icon={<Building2 size={16} />} title={profile.company.name}>
              {profile.company.industry && <p className="text-xs text-purple-500 mb-1">{profile.company.industry}</p>}
              {profile.company.description && <p className="text-sm text-gray-600 dark:text-gray-400">{profile.company.description}</p>}
            </Section>
          )}

          {/* Skills */}
          {profile.skills?.length > 0 && (
            <Section icon={<Code2 size={16} />} title="Skills">
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((s: any) => (
                  <span key={s.id} className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                    {s.name}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {/* Experience */}
          {profile.experience?.length > 0 && (
            <Section icon={<Briefcase size={16} />} title="Experience">
              <div className="space-y-3">
                {profile.experience.map((e: any) => (
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
          {profile.education?.length > 0 && (
            <Section icon={<GraduationCap size={16} />} title="Education">
              <div className="space-y-3">
                {profile.education.map((e: any) => (
                  <div key={e.id} className="border-l-2 border-violet-500/30 pl-4">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{e.degree} in {e.field}</p>
                    <p className="text-xs text-gray-500">{e.institution} · {e.graduationDate}</p>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Projects */}
          {profile.projects?.length > 0 && (
            <Section icon={<FolderGit2 size={16} />} title="Projects">
              <div className="space-y-3">
                {profile.projects.map((p: any) => (
                  <div key={p.id} className="rounded-xl bg-gray-50 dark:bg-white/5 p-3">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{p.name}</p>
                    {p.techStack && <p className="text-xs text-purple-500 mt-0.5">{p.techStack}</p>}
                    {p.description && <p className="text-xs text-gray-500 mt-1">{p.description}</p>}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Nothing */}
          {!profile.company && !profile.skills?.length && !profile.experience?.length && !profile.education?.length && !profile.projects?.length && (
            <div className="flex flex-col items-center py-16 gap-3 text-center text-gray-400">
              <span className="text-4xl">🌱</span>
              <p className="text-sm">This user hasn't filled in their profile yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-purple-500">{icon}</span>
        <h3 className="text-sm font-bold text-gray-800 dark:text-white">{title}</h3>
      </div>
      {children}
    </div>
  );
}
