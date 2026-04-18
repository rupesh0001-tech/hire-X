"use client";
import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ImagePlus, X, Send, Loader2 } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { postsApi, Post } from "@/apis/posts.api";

interface CreatePostProps {
  onPostCreated: (post: Post) => void;
  /** compact mode hides the avatar row and reduces padding — used in sidebar */
  compact?: boolean;
  onCancel?: () => void;
}

export function CreatePost({ onPostCreated, compact, onCancel }: CreatePostProps) {
  const { user } = useAppSelector((s) => s.auth);
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const initials = `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!content.trim() && !imageFile) return;
    setIsLoading(true);
    setError(null);
    try {
      const fd = new FormData();
      if (content.trim()) fd.append("content", content.trim());
      if (imageFile) fd.append("image", imageFile);

      const res = await postsApi.createPost(fd);
      if (res.success) {
        onPostCreated(res.data);
        setContent("");
        removeImage();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create post");
    } finally {
      setIsLoading(false);
    }
  };

  const canSubmit = (content.trim().length > 0 || !!imageFile) && !isLoading;

  if (compact) {
    // ── Compact mode (sidebar) ─────────────────────────────────────────
    return (
      <div className="bg-white dark:bg-white/[0.03] p-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`What's on your mind?`}
          rows={3}
          className="w-full bg-transparent text-xs text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600 resize-none outline-none leading-relaxed"
        />

        {/* Image preview */}
        <AnimatePresence>
          {imagePreview && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative mt-2 rounded-lg overflow-hidden border border-gray-200 dark:border-white/10 max-h-32"
            >
              <img src={imagePreview} alt="Preview" className="w-full object-cover max-h-32" />
              <button
                onClick={removeImage}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
              >
                <X size={11} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {error && <p className="mt-1 text-[10px] text-red-500">{error}</p>}

        <div className="flex items-center justify-between mt-2 border-t border-gray-100 dark:border-white/5 pt-2">
          <div className="flex items-center gap-1">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageSelect}
              id="sidebar-post-image-upload"
            />
            <label
              htmlFor="sidebar-post-image-upload"
              className="p-1.5 rounded-lg text-gray-400 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-all cursor-pointer"
            >
              <ImagePlus size={13} />
            </label>
            {onCancel && (
              <button
                onClick={onCancel}
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-600 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-purple-700 active:scale-95 transition-all"
          >
            {isLoading ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
            {isLoading ? "Posting…" : "Post"}
          </button>
        </div>
      </div>
    );
  }

  // ── Full mode (feed page) ──────────────────────────────────────────────
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-5 shadow-sm">
      {/* Author row */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-lg shadow-purple-500/20">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt={initials} className="w-full h-full rounded-full object-cover" />
          ) : (
            initials || "U"
          )}
        </div>

        <div className="flex-1">
          {/* Textarea */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`What's on your mind, ${user?.firstName ?? "there"}?`}
            rows={3}
            className="w-full bg-transparent text-sm text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600 resize-none outline-none leading-relaxed"
          />

          {/* Image preview */}
          <AnimatePresence>
            {imagePreview && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative mt-3 rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 max-h-64"
              >
                <img src={imagePreview} alt="Preview" className="w-full object-cover max-h-64" />
                <button
                  onClick={removeImage}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                >
                  <X size={14} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error */}
          {error && (
            <p className="mt-2 text-xs text-red-500">{error}</p>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="my-4 h-px bg-gray-100 dark:bg-white/5" />

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageSelect}
            id="post-image-upload"
          />
          <label
            htmlFor="post-image-upload"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-purple-50 dark:hover:bg-purple-500/10 hover:text-purple-600 dark:hover:text-purple-400 transition-all cursor-pointer"
          >
            <ImagePlus size={16} />
            <span className="hidden sm:inline">Photo</span>
          </label>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold bg-purple-600 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-purple-700 active:scale-95 transition-all shadow-sm shadow-purple-500/30"
        >
          {isLoading ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Send size={15} />
          )}
          {isLoading ? "Posting…" : "Post"}
        </button>
      </div>
    </div>
  );
}
