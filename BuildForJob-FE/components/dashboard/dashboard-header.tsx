"use client";
import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Menu, X, Plus, Search, Building, User, ArrowRight, Loader2 } from "lucide-react";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState<{ users: any[], companies: any[] }>({ users: [], companies: [] });
  const [isSearching, setIsSearching] = useState(false);

  const { user } = useAppSelector((state) => state.auth);
  const router = useRouter();

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(async () => {
      const trimmedQuery = searchQuery.trim();
      // Trigger search if 2+ chars OR 1+ char if starting with #
      if (trimmedQuery.length < 2 && !trimmedQuery.startsWith('#')) {
        setSearchResults({ users: [], companies: [] });
        return;
      }
      setIsSearching(true);
      try {
        const token = localStorage.getItem('token');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const res = await fetch(`${apiUrl}/user/search?q=${encodeURIComponent(trimmedQuery)}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setSearchResults(data.data);
        }
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

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

        {/* Universal Search Bar */}
        <div className="hidden md:flex flex-1 max-w-lg mx-8 relative group">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            {isSearching ? <Loader2 size={16} className="text-purple-500 animate-spin" /> : <Search size={16} className={cn("transition-colors", isSearchFocused ? "text-purple-500" : "text-gray-400")} />}
          </div>
          <input
            type="text"
            placeholder="Search users, companies, roles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-purple-500/50 focus:bg-white dark:focus:bg-black rounded-xl py-2 pl-10 pr-4 text-sm transition-all outline-none"
          />

          <AnimatePresence>
            {isSearchFocused && (searchQuery.length >= 2 || isSearching) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#111116] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[400px] overflow-y-auto z-50 p-2"
              >
                {/* Users Section */}
                {searchResults.users.length > 0 && (
                  <div className="mb-2">
                    <p className="px-3 py-1.5 text-[10px] uppercase font-bold text-gray-400 tracking-wider">Users</p>
                    {searchResults.users.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => router.push(`/dashboard/profile/${u.id}`)}
                        className="w-full flex items-center gap-3 p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors group text-left"
                      >
                        <div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center overflow-hidden shrink-0">
                          {u.avatarUrl ? <img src={u.avatarUrl} className="w-full h-full object-cover" /> : <User size={18} className="text-purple-600 dark:text-purple-400" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {u.firstName} {u.lastName}
                          </p>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                            {u.jobTitle || u.role} {u.shortId && `• #${u.shortId}`}
                          </p>
                        </div>
                        <ArrowRight size={14} className="text-gray-300 dark:text-gray-700 opacity-0 group-hover:opacity-100 transition-all mr-2" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Companies Section */}
                {searchResults.companies.length > 0 && (
                  <div>
                    <p className="px-3 py-1.5 text-[10px] uppercase font-bold text-gray-400 tracking-wider">Companies</p>
                    {searchResults.companies.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => router.push(`/dashboard/companies/${c.id}`)}
                        className="w-full flex items-center gap-3 p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors group text-left"
                      >
                        <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center overflow-hidden shrink-0">
                          {c.logoUrl ? <img src={c.logoUrl} className="w-full h-full object-cover" /> : <Building size={18} className="text-blue-600 dark:text-blue-400" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{c.name}</p>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{c.industry || "Company"}</p>
                        </div>
                        <ArrowRight size={14} className="text-gray-300 dark:text-gray-700 opacity-0 group-hover:opacity-100 transition-all mr-2" />
                      </button>
                    ))}
                  </div>
                )}

                {!isSearching && searchResults.users.length === 0 && searchResults.companies.length === 0 && searchQuery.length >= 2 && (
                  <div className="p-8 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">No matches found for "{searchQuery}"</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
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
