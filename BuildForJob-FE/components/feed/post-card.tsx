"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart, MessageCircle, Trash2, Send,
  ChevronDown, ChevronUp, Crown, Loader2, Zap,
} from "lucide-react";
import Link from "next/link";
import { useAppSelector } from "@/store/hooks";
import { postsApi, Post, Comment } from "@/apis/posts.api";
import { PromoteModal } from "@/components/feed/promote-modal";
import { formatDistanceToNow } from "date-fns";

interface PostCardProps {
  post: Post;
  onDelete: (postId: string) => void;
  onLikeToggle: (postId: string, liked: boolean, count: number) => void;
  onCommentAdded: (postId: string, comment: Comment) => void;
  onCommentDeleted: (postId: string, commentId: string) => void;
}

function Avatar({ author }: { author: Post["author"] }) {
  const initials = `${author.firstName[0]}${author.lastName[0]}`.toUpperCase();
  return (
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-md shadow-purple-500/20 overflow-hidden">
      {author.avatarUrl ? (
        <img src={author.avatarUrl} alt={initials} className="w-full h-full object-cover" />
      ) : (
        initials
      )}
    </div>
  );
}

export function PostCard({
  post,
  onDelete,
  onLikeToggle,
  onCommentAdded,
  onCommentDeleted,
}: PostCardProps) {
  const { user } = useAppSelector((s) => s.auth);
  const isOwner = user?.id === post.authorId;

  // Local optimistic state
  const [liked, setLiked] = useState(post.isLikedByMe);
  const [likeCount, setLikeCount] = useState(post._count.likes);
  const [liking, setLiking] = useState(false);

  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [addingComment, setAddingComment] = useState(false);
  const [deletingPost, setDeletingPost] = useState(false);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [isSponsored, setIsSponsored] = useState(post.isSponsored);

  const handleLike = async () => {
    if (liking) return;
    setLiking(true);
    const newLiked = !liked;
    const newCount = newLiked ? likeCount + 1 : likeCount - 1;
    setLiked(newLiked);
    setLikeCount(newCount);
    try {
      const res = await postsApi.toggleLike(post.id);
      setLiked(res.liked);
      setLikeCount(res.likeCount);
      onLikeToggle(post.id, res.liked, res.likeCount);
    } catch {
      // revert
      setLiked(!newLiked);
      setLikeCount(likeCount);
    } finally {
      setLiking(false);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || addingComment) return;
    setAddingComment(true);
    try {
      const res = await postsApi.addComment(post.id, commentText.trim());
      if (res.success) {
        onCommentAdded(post.id, res.data);
        setCommentText("");
      }
    } catch {
    } finally {
      setAddingComment(false);
    }
  };

  const handleDeletePost = async () => {
    if (deletingPost) return;
    setDeletingPost(true);
    try {
      await postsApi.deletePost(post.id);
      onDelete(post.id);
    } catch {
      setDeletingPost(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await postsApi.deleteComment(post.id, commentId);
      onCommentDeleted(post.id, commentId);
    } catch {}
  };

  const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });

  return (
    <>
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-start justify-between p-5 pb-3">
        <Link href={`/dashboard/profile/${post.author.id}`} className="flex items-center gap-3 group">
          <Avatar author={post.author} />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                {post.author.firstName} {post.author.lastName}
              </span>
              {post.author.role === "FOUNDER" && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  <Crown size={9} />
                  Founder
                </span>
              )}
              {isSponsored && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                  <Zap size={9} className="text-yellow-400" />
                  Sponsored
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {post.author.jobTitle ?? post.author.company?.name ?? "Member"} · {timeAgo}
            </p>
          </div>
        </Link>

        {isOwner && (
          <div className="flex items-center gap-1">
            {!isSponsored && (
              <button
                onClick={() => setShowPromoteModal(true)}
                title="Smart Promote"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 transition-all"
              >
                <Zap size={12} className="text-yellow-500" />
                Promote
              </button>
            )}
            <button
              onClick={handleDeletePost}
              disabled={deletingPost}
              className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
            >
              {deletingPost ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-5 pb-3">
        {post.content && (
          <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
            {post.content}
          </p>
        )}
        {post.imageUrl && (
          <div className="mt-3 rounded-xl overflow-hidden border border-gray-100 dark:border-white/10 max-h-96">
            <img
              src={post.imageUrl}
              alt="Post image"
              className="w-full object-cover max-h-96"
            />
          </div>
        )}
      </div>

      {/* Stats row */}
      {(likeCount > 0 || (post.comments ?? []).length > 0) && (
        <div className="px-5 pb-2 flex items-center gap-3 text-xs text-gray-400">
          {likeCount > 0 && <span>{likeCount} {likeCount === 1 ? "like" : "likes"}</span>}
          {(post.comments ?? []).length > 0 && (
            <button
              onClick={() => setShowComments((v) => !v)}
              className="hover:text-purple-500 transition-colors"
            >
              {(post.comments ?? []).length} {(post.comments ?? []).length === 1 ? "comment" : "comments"}
            </button>
          )}
        </div>
      )}

      {/* Divider */}
      <div className="mx-5 h-px bg-gray-100 dark:bg-white/5" />

      {/* Action buttons */}
      <div className="flex items-center px-3 py-1">
        <button
          onClick={handleLike}
          disabled={liking}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium flex-1 justify-center transition-all ${
            liked
              ? "text-pink-500 bg-pink-50 dark:bg-pink-500/10"
              : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5"
          }`}
        >
          <Heart size={16} className={liked ? "fill-current" : ""} />
          Like
        </button>

        <button
          onClick={() => setShowComments((v) => !v)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium flex-1 justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
        >
          <MessageCircle size={16} />
          Comment
        </button>
      </div>

      {/* Comments section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mx-5 mb-4 mt-1 space-y-3">
              {/* Existing comments */}
              {(post.comments ?? []).map((c) => (
                <div key={c.id} className="flex items-start gap-2.5 group">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-[9px] shrink-0 overflow-hidden">
                    {c.author.avatarUrl ? (
                      <img src={c.author.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      `${c.author.firstName[0]}${c.author.lastName[0]}`
                    )}
                  </div>
                  <div className="flex-1 bg-gray-50 dark:bg-white/5 rounded-xl px-3 py-2">
                    <div className="flex items-center justify-between">
                      <Link
                        href={`/dashboard/profile/${c.author.id}`}
                        className="text-xs font-semibold text-gray-800 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                      >
                        {c.author.firstName} {c.author.lastName}
                        {c.author.role === "FOUNDER" && (
                          <span className="ml-1 text-amber-500">👑</span>
                        )}
                      </Link>
                      {user?.id === c.authorId && (
                        <button
                          onClick={() => handleDeleteComment(c.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-gray-400 hover:text-red-500 transition-all"
                        >
                          <Trash2 size={11} />
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5 leading-relaxed">
                      {c.content}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}

              {/* Add comment input */}
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-[9px] shrink-0">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
                <div className="flex-1 flex items-center gap-2 bg-gray-50 dark:bg-white/5 rounded-xl px-3 py-2 border border-gray-200 dark:border-white/10 focus-within:border-purple-400 dark:focus-within:border-purple-500 transition-colors">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                    placeholder="Write a comment…"
                    className="flex-1 bg-transparent text-xs text-gray-800 dark:text-gray-200 placeholder:text-gray-400 outline-none"
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={!commentText.trim() || addingComment}
                    className="text-purple-500 disabled:opacity-30 hover:text-purple-700 transition-colors"
                  >
                    {addingComment ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Send size={14} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>

    {/* Promote Modal */}
    {showPromoteModal && (
      <PromoteModal
        post={post}
        onClose={() => setShowPromoteModal(false)}
        onPromoted={() => {
          setIsSponsored(true);
          setShowPromoteModal(false);
        }}
      />
    )}
    </>
  );
}
