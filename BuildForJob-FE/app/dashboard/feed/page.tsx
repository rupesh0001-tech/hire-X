"use client";
import React, { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { postsApi, Post, Comment } from "@/apis/posts.api";
import { CreatePost } from "@/components/feed/create-post";
import { PostCard } from "@/components/feed/post-card";

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFeed = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await postsApi.getFeed();
      if (res.success) setPosts(res.data);
    } catch (e: any) {
      setError(e.response?.data?.message || "Failed to load feed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadFeed(); }, [loadFeed]);

  // ── optimistic handlers ──────────────────────────────────────
  const handlePostCreated = (post: Post) => {
    // Normalize: ensure comments/counts are always defined
    const normalizedPost: Post = {
      ...post,
      comments: post.comments ?? [],
      _count: post._count ?? { likes: 0, comments: 0 },
      isLikedByMe: post.isLikedByMe ?? false,
    };
    setPosts((prev) => [normalizedPost, ...prev]);
  };

  const handleDelete = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const handleLikeToggle = (postId: string, liked: boolean, count: number) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, isLikedByMe: liked, _count: { ...p._count, likes: count } }
          : p
      )
    );
  };

  const handleCommentAdded = (postId: string, comment: Comment) => {
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
  };

  const handleCommentDeleted = (postId: string, commentId: string) => {
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
  };

  return (
    <div className="max-w-2xl mx-auto pb-16 animation-fade-in">
      {/* Create post */}
      <div className="mb-6">
        <CreatePost onPostCreated={handlePostCreated} />
      </div>

      {/* Feed */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
          <Loader2 size={28} className="animate-spin text-purple-500" />
          <p className="text-sm">Loading feed…</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
          <p className="text-sm text-red-500">{error}</p>
          <button
            onClick={() => loadFeed()}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-purple-600 text-white hover:bg-purple-700 transition-colors"
          >
            Try again
          </button>
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-2">
            <span className="text-3xl">📭</span>
          </div>
          <p className="text-base font-semibold text-gray-700 dark:text-gray-300">No posts yet</p>
          <p className="text-sm text-gray-400">Be the first to share something with the community!</p>
        </div>
      ) : (
        <AnimatePresence initial={false}>
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
        </AnimatePresence>
      )}
    </div>
  );
}
