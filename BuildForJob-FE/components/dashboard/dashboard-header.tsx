"use client";
import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Menu, X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/store/hooks";
import { useRouter } from "next/navigation";
import { UserDropdown } from "@/components/general/user-dropdown";
import { CreatePost } from "@/components/feed/create-post";
import { Post } from "@/apis/posts.api";
import { motion, AnimatePresence } from "framer-motion";

interface DashboardHeaderProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function DashboardHeader({ isSidebarOpen, setIsSidebarOpen }: DashboardHeaderProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);

  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handlePostCreated = (_post: Post) => {
    setShowCreatePost(false);
  };

  if (!mounted) {
    return (
      <header className="h-16 flex shrink-0 items-center justify-between border-b border-black/5 dark:border-white/5 px-6 lg:px-8 bg-white/50 dark:bg-black/50 backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 rounded-xl bg-gray-200 dark:bg-white/5 border border-black/5 dark:border-white/10 animate-pulse" />
          <div className="h-5 w-32 bg-gray-200 dark:bg-white/5 rounded-full animate-pulse" />
        </div>
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-white/5 border border-black/5 dark:border-white/10 animate-pulse" />
          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-white/10 border border-gray-300 dark:border-white/20 animate-pulse" />
        </div>
      </header>
    );
  }

  return (
    <>
      <header className="h-16 flex shrink-0 items-center justify-between border-b border-black/5 dark:border-white/5 px-6 lg:px-8 bg-white/90 dark:bg-black/40 backdrop-blur-md z-50">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-all text-gray-700 dark:text-gray-200 cursor-pointer active:scale-95 border border-transparent hover:border-black/5 dark:hover:border-white/10"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
            {isSidebarOpen ? "Dashboard" : "BuildForJob"}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Create Post CTA */}
          <button
            onClick={() => setShowCreatePost(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 text-white text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all shadow-md shadow-purple-500/25"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Create Post</span>
          </button>

          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-all text-gray-600 dark:text-gray-300 cursor-pointer active:scale-95 border border-transparent hover:border-black/5 dark:hover:border-white/10"
            aria-label="Toggle Dark Mode"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <div className="h-8 w-px bg-black/10 dark:bg-white/10 mx-1" />

          <UserDropdown />
        </div>
      </header>

      {/* Full-screen Create Post Modal */}
      <AnimatePresence>
        {showCreatePost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
            onClick={(e) => { if (e.target === e.currentTarget) setShowCreatePost(false); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-2xl relative"
            >
              <button
                onClick={() => setShowCreatePost(false)}
                className="absolute -top-12 right-0 p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all"
              >
                <X size={20} />
              </button>
              <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0d0d10] shadow-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                  <h2 className="font-bold text-gray-900 dark:text-white text-lg">Create a Post</h2>
                  <button
                    onClick={() => setShowCreatePost(false)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
                <CreatePost
                  onPostCreated={handlePostCreated}
                  onCancel={() => setShowCreatePost(false)}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
