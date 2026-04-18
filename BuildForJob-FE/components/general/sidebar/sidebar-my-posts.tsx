"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, FileText, Image as ImageIcon, Loader2, Zap } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { postsApi, Post } from "@/apis/posts.api";
import { PromoteModal } from "@/components/feed/promote-modal";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export function SidebarMyPosts() {
  const { user } = useAppSelector((s) => s.auth);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [promotingPost, setPromotingPost] = useState<Post | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    postsApi
      .getMyPosts(user.id)
      .then((res) => {
        if (res.success) setPosts(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.id]);

  const handlePromoted = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, isSponsored: true } : p))
    );
  };

  return (
    <>
      <div className="px-4 mt-4 border-t border-gray-100 dark:border-white/5 pt-4">
        {/* Section header */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center justify-between w-full px-2 mb-2 group"
        >
          <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            My Posts
          </h3>
          {expanded ? (
            <ChevronUp size={13} className="text-gray-400" />
          ) : (
            <ChevronDown size={13} className="text-gray-400" />
          )}
        </button>

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              key="my-posts"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 size={16} className="animate-spin text-purple-400" />
                </div>
              ) : posts.length === 0 ? (
                <p className="text-xs text-gray-400 px-2 py-2">No posts yet.</p>
              ) : (
                <div className="space-y-1 max-h-60 overflow-y-auto scrollbar-hide pr-1">
                  {posts.map((post) => (
                    <div
                      key={post.id}
                      className="group flex items-start gap-2 px-2 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    >
                      {/* Type icon */}
                      <div className="mt-0.5 shrink-0 text-gray-400">
                        {post.type === "IMAGE" ? (
                          <ImageIcon size={13} />
                        ) : (
                          <FileText size={13} />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-2 leading-relaxed">
                          {post.content || "📷 Image post"}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-gray-400">
                            {post._count?.likes ?? 0} ❤️ · {post._count?.comments ?? 0} 💬
                          </span>
                          {post.isSponsored && (
                            <span className="text-[10px] font-semibold text-purple-500 flex items-center gap-0.5">
                              <Zap size={9} className="text-yellow-500" />
                              Sponsored
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Promote btn */}
                      {!post.isSponsored && (
                        <button
                          onClick={() => setPromotingPost(post)}
                          title="Smart Promote"
                          className="opacity-0 group-hover:opacity-100 flex items-center gap-1 px-1.5 py-1 rounded-lg text-[10px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 hover:bg-purple-100 dark:hover:bg-purple-500/20 transition-all shrink-0"
                        >
                          <Zap size={10} className="text-yellow-500" />
                          Promote
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* View all link */}
              <Link
                href="/dashboard/my-posts"
                className="block mt-2 px-2 py-1.5 text-xs text-center text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors"
              >
                View all my posts →
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Promote Modal */}
      {promotingPost && (
        <PromoteModal
          post={promotingPost}
          onClose={() => setPromotingPost(null)}
          onPromoted={(postId) => {
            handlePromoted(postId);
            setPromotingPost(null);
          }}
        />
      )}
    </>
  );
}
