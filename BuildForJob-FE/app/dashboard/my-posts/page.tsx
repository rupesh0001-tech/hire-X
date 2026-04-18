"use client";
import React, { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Loader2, PenSquare, Grid2X2, List, BarChart2,
  Heart, MessageCircle, Zap, ImageIcon, FileText,
  RefreshCw, Plus, X
} from "lucide-react";
import { postsApi, Post, Comment } from "@/apis/posts.api";
import { PostCard } from "@/components/feed/post-card";
import { CreatePost } from "@/components/feed/create-post";
import { useAppSelector } from "@/store/hooks";

// ── stat card ────────────────────────────────────────────────────────────────
function StatCard({
  label, value, icon: Icon, color,
}: { label: string; value: number; icon: any; color: string }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-5">
      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${color}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="text-xs text-gray-400">{label}</p>
      </div>
    </div>
  );
}

// ── view toggle ───────────────────────────────────────────────────────────────
type ViewMode = "list" | "grid";

export default function MyPostsPage() {
  const { user } = useAppSelector((s) => s.auth);

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<ViewMode>("list");
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState<"all" | "text" | "image" | "sponsored">("all");

  const loadMyPosts = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await postsApi.getMyPosts(user.id);
      if (res.success) {
        // Normalize
        setPosts(
          res.data.map((p) => ({
            ...p,
            comments: p.comments ?? [],
            _count: p._count ?? { likes: 0, comments: 0 },
            isLikedByMe: p.isLikedByMe ?? false,
            isSponsored: p.isSponsored ?? false,
          }))
        );
      }
    } catch (e: any) {
      setError(e.response?.data?.message || "Failed to load posts");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { loadMyPosts(); }, [loadMyPosts]);

  // ── optimistic handlers ───────────────────────────────────────────────────
  const handlePostCreated = (post: Post) => {
    const normalized: Post = {
      ...post,
      comments: post.comments ?? [],
      _count: post._count ?? { likes: 0, comments: 0 },
      isLikedByMe: false,
      isSponsored: false,
    };
    setPosts((prev) => [normalized, ...prev]);
    setShowCreate(false);
  };

  const handleDelete = (postId: string) =>
    setPosts((prev) => prev.filter((p) => p.id !== postId));

  const handleLikeToggle = (postId: string, liked: boolean, count: number) =>
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, isLikedByMe: liked, _count: { ...p._count, likes: count } }
          : p
      )
    );

  const handleCommentAdded = (postId: string, comment: Comment) =>
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              comments: [...(p.comments ?? []), comment],
              _count: { ...p._count, comments: (p._count?.comments ?? 0) + 1 },
            }
          : p
      )
    );

  const handleCommentDeleted = (postId: string, commentId: string) =>
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              comments: (p.comments ?? []).filter((c) => c.id !== commentId),
              _count: { ...p._count, comments: Math.max(0, (p._count?.comments ?? 1) - 1) },
            }
          : p
      )
    );

  // ── derived stats ─────────────────────────────────────────────────────────
  const totalLikes = posts.reduce((s, p) => s + (p._count?.likes ?? 0), 0);
  const totalComments = posts.reduce((s, p) => s + (p._count?.comments ?? 0), 0);
  const sponsoredCount = posts.filter((p) => p.isSponsored).length;

  // ── filtered list ─────────────────────────────────────────────────────────
  const filtered = posts.filter((p) => {
    if (filter === "text") return p.type === "TEXT";
    if (filter === "image") return p.type === "IMAGE";
    if (filter === "sponsored") return p.isSponsored;
    return true;
  });

  // ── grid card (compact) ───────────────────────────────────────────────────
  const GridCard = ({ post }: { post: Post }) => (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] overflow-hidden group"
    >
      {post.imageUrl ? (
        <div className="relative h-44 bg-gray-100 dark:bg-white/5 overflow-hidden">
          <img
            src={post.imageUrl}
            alt="Post"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {post.isSponsored && (
            <span className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-600/90 text-white backdrop-blur-sm">
              <Zap size={9} className="text-yellow-300" /> Sponsored
            </span>
          )}
        </div>
      ) : (
        <div className="h-24 bg-gradient-to-br from-purple-500/10 to-violet-500/10 flex items-center justify-center">
          <FileText size={28} className="text-purple-400/50" />
        </div>
      )}
      <div className="p-4">
        <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 leading-relaxed mb-3">
          {post.content || "📷 Image post"}
        </p>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Heart size={12} className="text-pink-400" /> {post._count?.likes ?? 0}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle size={12} className="text-blue-400" /> {post._count?.comments ?? 0}
          </span>
          <span className="ml-auto text-[10px]">
            {post.type === "IMAGE" ? (
              <ImageIcon size={12} className="inline mr-1 text-indigo-400" />
            ) : (
              <FileText size={12} className="inline mr-1 text-gray-400" />
            )}
            {post.type}
          </span>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="max-w-3xl mx-auto pb-16">

      {/* ── Page Header ───────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-violet-500/20 flex items-center justify-center">
            <PenSquare size={22} className="text-purple-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Posts</h1>
            <p className="text-sm text-gray-400">
              {posts.length} post{posts.length !== 1 ? "s" : ""} · all your content in one place
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Refresh */}
          <button
            onClick={loadMyPosts}
            disabled={loading}
            className="p-2.5 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 border border-gray-200 dark:border-white/10 transition-all"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
          {/* Create */}
          <button
            onClick={() => setShowCreate((v) => !v)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 text-white text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all shadow-md shadow-purple-500/25"
          >
            {showCreate ? <X size={15} /> : <Plus size={15} />}
            {showCreate ? "Cancel" : "New Post"}
          </button>
        </div>
      </div>

      {/* ── Create Post (inline) ───────────────────────────────────── */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            key="create-box"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6"
          >
            <CreatePost onPostCreated={handlePostCreated} onCancel={() => setShowCreate(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Stats Row ─────────────────────────────────────────────── */}
      {!loading && posts.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard label="Total Posts"    value={posts.length}    icon={PenSquare}      color="bg-purple-500/10 text-purple-500" />
          <StatCard label="Total Likes"    value={totalLikes}      icon={Heart}          color="bg-pink-500/10 text-pink-500" />
          <StatCard label="Total Comments" value={totalComments}   icon={MessageCircle}  color="bg-blue-500/10 text-blue-500" />
          <StatCard label="Sponsored"      value={sponsoredCount}  icon={Zap}            color="bg-amber-500/10 text-amber-500" />
        </div>
      )}

      {/* ── Filters + View Toggle ─────────────────────────────────── */}
      {!loading && posts.length > 0 && (
        <div className="flex items-center justify-between mb-5">
          {/* Filter chips */}
          <div className="flex items-center gap-2 flex-wrap">
            {(["all", "text", "image", "sponsored"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                  filter === f
                    ? "bg-purple-600 text-white shadow-sm shadow-purple-500/20"
                    : "bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10"
                }`}
              >
                {f === "sponsored" ? "⚡ Sponsored" : f === "image" ? "🖼️ Image" : f === "text" ? "📄 Text" : "All"}
              </button>
            ))}
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-white/5 rounded-xl p-1">
            <button
              onClick={() => setView("list")}
              className={`p-1.5 rounded-lg transition-all ${view === "list" ? "bg-white dark:bg-white/10 shadow-sm text-purple-600 dark:text-purple-400" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"}`}
            >
              <List size={15} />
            </button>
            <button
              onClick={() => setView("grid")}
              className={`p-1.5 rounded-lg transition-all ${view === "grid" ? "bg-white dark:bg-white/10 shadow-sm text-purple-600 dark:text-purple-400" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"}`}
            >
              <Grid2X2 size={15} />
            </button>
          </div>
        </div>
      )}

      {/* ── Content ───────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-3 text-gray-400">
          <Loader2 size={28} className="animate-spin text-purple-500" />
          <p className="text-sm">Loading your posts…</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-32 gap-3 text-center">
          <p className="text-sm text-red-500">{error}</p>
          <button
            onClick={loadMyPosts}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-purple-600 text-white hover:bg-purple-700 transition-colors"
          >
            Try again
          </button>
        </div>
      ) : posts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-32 gap-4 text-center"
        >
          <div className="w-20 h-20 rounded-3xl bg-purple-500/10 flex items-center justify-center text-5xl mb-2">
            ✍️
          </div>
          <p className="text-xl font-bold text-gray-800 dark:text-white">Nothing here yet</p>
          <p className="text-sm text-gray-400 max-w-xs">
            Share your thoughts, showcase your work, or post a project update. Your audience is waiting!
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="mt-2 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 text-white text-sm font-semibold hover:opacity-90 transition-all shadow-md shadow-purple-500/20"
          >
            <Plus size={16} /> Create your first post
          </button>
        </motion.div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <p className="text-sm text-gray-500">No posts match this filter.</p>
          <button onClick={() => setFilter("all")} className="text-sm text-purple-500 hover:underline">
            Clear filter
          </button>
        </div>
      ) : view === "list" ? (
        /* ── List View ─────────────────────────────────────────── */
        <AnimatePresence initial={false}>
          <div className="space-y-4">
            {filtered.map((post) => (
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
        </AnimatePresence>
      ) : (
        /* ── Grid View ─────────────────────────────────────────── */
        <AnimatePresence initial={false}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map((post) => (
              <GridCard key={post.id} post={post} />
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}
