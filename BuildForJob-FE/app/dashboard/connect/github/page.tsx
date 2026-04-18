"use client";
import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateProfile, fetchProfile } from "@/store/slices/authSlice";
import { 
  Github, 
  RefreshCw, 
  Trash2, 
  ExternalLink,
  ChevronRight,
  Shield,
  Loader2,
  Check,
  MapPin,
  Link as LinkIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { fetchGitHubData, extractUsername } from "@/lib/github/github-api";
import { GithubSyncModal } from "@/components/profile/GithubSyncModal";

export default function GitHubConnectPage() {
  const dispatch = useAppDispatch();
  const { user, isLoading } = useAppSelector((state) => state.auth);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [githubData, setGithubData] = useState<any>(null);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [hasSynced, setHasSynced] = useState(false);

  // Helper to safely parse social links if they come as string
  const getSocialLinks = () => {
    if (!user?.socialLinks) return { github: "", website: "", twitter: "", linkedin: "" };
    if (typeof user.socialLinks === 'string') {
      try { return JSON.parse(user.socialLinks); } catch { return {}; }
    }
    return user.socialLinks as any;
  };

  const socialLinks = getSocialLinks();
  const isConnected = !!socialLinks?.github;
  
  // Robust check for synced items
  const hasSyncedProjects = (user?.projects || []).some((p: any) => p.isGithubSynced);
  const hasSyncedSkills = (user?.skills || []).some((s: any) => s.isGithubSynced);
  const isAlreadySynced = hasSynced || hasSyncedProjects || hasSyncedSkills;

  const handleFetch = async () => {
    const targetUrl = isConnected ? socialLinks.github : url;
    const username = extractUsername(targetUrl);
    if (!username) {
      toast.error("Please enter a valid GitHub profile URL.");
      return;
    }

    setLoading(true);
    setGithubData(null);
    try {
      const data = await fetchGitHubData(username);
      setGithubData(data);
      setShowSyncModal(true);
    } catch (error: any) {
      toast.error(error.message || "Something went wrong while fetching data.");
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm("Are you sure? This will disconnect GitHub and REMOVE all projects and skills synced from it.")) return;
    
    try {
      setLoading(true);
      const updatedData = {
        ...user,
        socialLinks: { ...socialLinks, github: "" },
        skills: (user?.skills || []).filter((s: any) => !s.isGithubSynced),
        projects: (user?.projects || []).filter((p: any) => !p.isGithubSynced)
      };
      await dispatch(updateProfile(updatedData)).unwrap();
      toast.success("Disconnected from GitHub and synced data removed.");
      setUrl("");
      setGithubData(null);
      setHasSynced(false);
    } catch (error: any) {
      toast.error(error || "Failed to disconnect");
    } finally {
      setLoading(false);
    }
  };

  const onGithubDataMerged = async (mergedData: any) => {
    try {
      await dispatch(updateProfile(mergedData)).unwrap();
      setHasSynced(true);
      setShowSyncModal(false);
      toast.success("Profile synchronized and saved successfully!");
    } catch (error: any) {
      toast.error(error || "Failed to sync profile");
    }
  };

  if (isLoading && !user) {
    return (
      <div className="flex items-center justify-center h-full py-32 bg-white dark:bg-[#0c0c0e]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-purple-500" size={40} />
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest animate-pulse">Initializing Connection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header>
        <h1 className="text-3xl font-extrabold text-black dark:text-white tracking-tight flex items-center gap-3">
          <Github className="text-purple-500" size={32} />
          GitHub Integration
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium"> Connect your account to automatically import your projects and top skills.</p>
      </header>

      {isConnected ? (
        <div className="bg-white dark:bg-[#111116] rounded-[2.5rem] border border-gray-200 dark:border-white/10 p-1 shadow-2xl overflow-hidden group">
          <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 blur-[120px] -mr-40 -mt-40 transition-all duration-700 group-hover:bg-purple-500/15" />
          
          <div className="relative p-8 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-3xl bg-linear-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white shadow-2xl shadow-purple-500/30 transform transition-transform duration-500 group-hover:scale-105 group-hover:rotate-3 overflow-hidden">
                  <Github size={48} className="relative z-10" />
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-green-500 border-4 border-white dark:border-[#111116] flex items-center justify-center text-white shadow-lg">
                  <Check size={16} strokeWidth={3} />
                </div>
              </div>
              
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-3xl font-black dark:text-white tracking-tight">
                    @{extractUsername(socialLinks.github)}
                  </h3>
                </div>
                <div className="flex flex-wrap items-center gap-4 mt-2">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
                    <Check size={14} className="text-green-500" /> Account Verified
                  </span>
                  {user?.location && (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
                      <MapPin size={14} className="text-purple-500" /> {user.location}
                    </span>
                  )}
                  <a 
                    href={socialLinks.github} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center gap-1.5 text-xs font-bold text-purple-500 hover:text-purple-400 transition-colors"
                  >
                    <ExternalLink size={14} /> View Profile
                  </a>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {!isAlreadySynced && (
                <button
                  onClick={handleFetch}
                  disabled={loading}
                  className="flex items-center justify-center gap-3 px-8 py-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-black text-sm hover:scale-[1.03] active:scale-95 transition-all shadow-2xl shadow-purple-500/20"
                >
                  {loading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <RefreshCw size={18} />
                  )}
                  {loading ? "FETCHING..." : "SYNC NOW"}
                </button>
              )}
              <button
                onClick={handleDisconnect}
                disabled={loading}
                className="p-4 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-lg transform hover:rotate-6"
                title="Disconnect GitHub"
              >
                <Trash2 size={24} />
              </button>
            </div>
          </div>
          
          <div className="bg-gray-50/50 dark:bg-white/5 px-8 py-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
              <span className="flex items-center gap-1.5 text-green-500/80"><Shield size={12} /> SECURE SYNC</span>
              <span className="flex items-center gap-1.5">
                <RefreshCw size={12} className={isLoading ? "animate-spin" : ""} /> 
                {isAlreadySynced ? "SYNCHRONIZED" : "READY TO SYNC"}
              </span>
            </div>
            <div className="h-1.5 w-32 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }} 
                 animate={{ width: isAlreadySynced ? "100%" : "30%" }} 
                 className={`h-full ${isAlreadySynced ? "bg-green-500" : "bg-purple-500"}`} 
               />
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#111116] rounded-[2.5rem] border border-gray-200 dark:border-white/10 p-10 text-center shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-linear-to-b from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="max-w-md mx-auto space-y-8 relative">
            <div className="relative">
              <div className="w-28 h-28 bg-gray-50 dark:bg-white/5 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-inner transition-transform duration-700 group-hover:rotate-12">
                <Github className="text-gray-300 dark:text-gray-600" size={56} />
              </div>
              <div className="absolute top-0 right-1/4 w-8 h-8 rounded-full bg-purple-500/20 blur-xl animate-pulse" />
            </div>
            
            <div>
              <h2 className="text-3xl font-black dark:text-white tracking-tight">Link your GitHub</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Connect your professional profile to import your best projects and top technical skills instantly.</p>
            </div>
            
            <div className="space-y-4">
              <div className="relative group/input">
                <Github className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/input:text-purple-500 transition-colors" size={22} />
                <input 
                  type="text"
                  placeholder="github.com/your-username"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full pl-14 pr-6 py-5 rounded-[1.5rem] bg-gray-50 dark:bg-[#1a1a22] border border-gray-200 dark:border-white/10 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all font-bold text-lg"
                />
              </div>
              <button
                onClick={handleFetch}
                disabled={loading || !url}
                className="w-full py-5 bg-black dark:bg-white text-white dark:text-black rounded-[1.5rem] font-black text-sm hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-2xl shadow-black/20 dark:shadow-white/5 flex items-center justify-center gap-3 overflow-hidden group/btn relative"
              >
                <div className="absolute inset-0 bg-linear-to-r from-purple-500 to-blue-600 opacity-0 group-hover/btn:opacity-10 transition-opacity" />
                {loading ? <Loader2 size={20} className="animate-spin" /> : <ChevronRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />}
                CONNECT & FETCH DATA
              </button>
            </div>

            <div className="pt-6 flex items-center justify-center gap-8 text-[10px] uppercase tracking-[0.2em] font-black text-gray-400">
              <span className="flex items-center gap-2"><Shield size={14} className="text-purple-500" /> Secure</span>
              <span className="flex items-center gap-2"><RefreshCw size={14} className="text-blue-500" /> Auto Sync</span>
              <span className="flex items-center gap-2"><Check size={14} className="text-green-500" /> 1-Click Merge</span>
            </div>
          </div>
        </div>
      )}

      {githubData && (
        <GithubSyncModal 
          isOpen={showSyncModal}
          onClose={() => setShowSyncModal(false)}
          githubData={githubData}
          currentData={user}
          onSync={onGithubDataMerged}
          key={githubData.profile.html_url}
        />
      )}
    </div>
  );
}
