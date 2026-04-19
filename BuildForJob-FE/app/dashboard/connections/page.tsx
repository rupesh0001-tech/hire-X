"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, UserPlus, MessageSquare, Briefcase, Building, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock Data for Suggestions (4 users)
const SUGGESTIONS = [
  { 
    id: "user-101", 
    name: "Alex Rivera", 
    role: "USER", 
    mainSkill: "Fullstack Engineer", 
    avatarUrl: "https://i.pravatar.cc/150?u=101", 
    isFounder: false 
  },
  { 
    id: "user-102", 
    name: "Sarah Chen", 
    role: "FOUNDER", 
    mainSkill: "CEO @ TechNova", 
    avatarUrl: "https://i.pravatar.cc/150?u=102", 
    isFounder: true 
  },
  { 
    id: "user-103", 
    name: "Michael Chang", 
    role: "USER", 
    mainSkill: "UI/UX Designer", 
    avatarUrl: "https://i.pravatar.cc/150?u=103", 
    isFounder: false 
  },
  { 
    id: "user-104", 
    name: "Elena Rodriguez", 
    role: "FOUNDER", 
    mainSkill: "Investor & Mentor", 
    avatarUrl: "https://i.pravatar.cc/150?u=104", 
    isFounder: true 
  },
];

// Mock Data for My Connections
const MY_CONNECTIONS = [
  { 
    id: "user-201", 
    name: "David Kim", 
    role: "USER", 
    mainSkill: "Product Manager", 
    avatarUrl: "https://i.pravatar.cc/150?u=201", 
    isFounder: false 
  },
  { 
    id: "user-202", 
    name: "Priya Patel", 
    role: "USER", 
    mainSkill: "Backend Developer", 
    avatarUrl: "https://i.pravatar.cc/150?u=202", 
    isFounder: false 
  },
  { 
    id: "user-203", 
    name: "James Wilson", 
    role: "FOUNDER", 
    mainSkill: "Founder @ Innovate AI", 
    avatarUrl: "https://i.pravatar.cc/150?u=203", 
    isFounder: true 
  },
];

export default function ConnectionsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [realUsers, setRealUsers] = useState<any[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  React.useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const response = await fetch(`${apiUrl}/user/all`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) {
          setRealUsers(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch users", err);
      } finally {
        setIsLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  React.useEffect(() => {
    const handleSearch = async () => {
      if (!searchQuery.trim()) {
        setSearchResult(null);
        return;
      }
      setIsSearching(true);
      try {
        const token = localStorage.getItem('token');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const response = await fetch(`${apiUrl}/user/search/${searchQuery.trim()}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (data.success && data.data) {
          setSearchResult(data.data);
        } else {
          setSearchResult(null);
        }
      } catch (err) {
        setSearchResult(null);
      } finally {
        setIsSearching(false);
      }
    };
    
    const timeout = setTimeout(handleSearch, 800);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Top Header & Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-[#121215] p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Connections</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Grow and manage your professional network</p>
        </div>
        
        <div className="relative w-full md:w-[400px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-white/10 rounded-xl leading-5 bg-gray-50 dark:bg-[#1a1a1f] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition-all"
            placeholder="find people/invester/founder/mentor"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Global Search Results */}
      {searchQuery.trim() && (
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Search className="h-5 w-5 text-purple-500" />
              Search Results
            </h2>
          </div>
          
          <div className="bg-white dark:bg-[#121215] border border-gray-100 dark:border-white/5 rounded-2xl p-6 shadow-sm">
            {isSearching ? (
              <p className="text-gray-500 text-sm">Searching for DevClash ID...</p>
            ) : searchResult ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Link href={`/dashboard/profile/${searchResult.id}`}>
                    <img 
                      src={searchResult.avatarUrl || "https://i.pravatar.cc/150?u=new"} 
                      alt={searchResult.firstName} 
                      className="h-16 w-16 rounded-full object-cover hover:opacity-80 transition-opacity"
                    />
                  </Link>
                  <div>
                    <Link href={`/dashboard/profile/${searchResult.id}`}>
                      <h3 className="font-medium text-lg text-gray-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 flex items-center gap-2">
                        {searchResult.firstName} {searchResult.lastName}
                        {searchResult.role === 'FOUNDER' && <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300">Founder</span>}
                      </h3>
                    </Link>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {searchResult.jobTitle || searchResult.email}
                    </p>
                  </div>
                </div>
                
                <button className="w-full sm:w-auto flex items-center justify-center gap-2 py-2 px-5 rounded-xl border border-gray-200 dark:border-white/10 hover:border-purple-500 hover:text-purple-600 dark:hover:border-purple-400 dark:hover:text-purple-400 text-gray-700 dark:text-gray-300 text-sm font-medium transition-colors group">
                  <UserPlus className="h-4 w-4 text-gray-400 group-hover:text-purple-500 transition-colors" />
                  Connect
                </button>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No user found with the given DevClash ID.</p>
            )}
          </div>
        </section>
      )}

      {/* Suggested Connections */}
      {!searchQuery.trim() && (
        <>
          <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-purple-500" />
            Suggested Connections
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoadingUsers ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-48 bg-gray-100 dark:bg-white/5 animate-pulse rounded-2xl" />
            ))
          ) : realUsers.length > 0 ? (
            realUsers.map((user) => (
              <div key={user.id} className="bg-white dark:bg-[#121215] border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all hover:-translate-y-1 group">
                <div className="h-16 bg-gradient-to-r from-purple-500/20 to-blue-500/20 w-full" />
                
                <div className="px-5 pb-5 -mt-8 flex flex-col items-center text-center">
                  <Link href={`/dashboard/profile/${user.id}`} className="relative inline-block hover:opacity-80 transition-opacity">
                    <img 
                      src={user.avatarUrl || `https://i.pravatar.cc/150?u=${user.id}`} 
                      alt={user.firstName} 
                      className="h-16 w-16 rounded-full border-4 border-white dark:border-[#121215] object-cover bg-white dark:bg-[#121215]"
                    />
                    {user.role === 'FOUNDER' && (
                      <div className="absolute -bottom-1 -right-1 bg-purple-600 text-white p-1 rounded-full border-2 border-white dark:border-[#121215]" title="Founder">
                        <Building className="h-3 w-3" />
                      </div>
                    )}
                  </Link>
                  
                  <div className="mt-3">
                    <Link href={`/dashboard/profile/${user.id}`}>
                      <h3 className="font-semibold text-gray-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                        {user.firstName} {user.lastName}
                      </h3>
                    </Link>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 h-10 line-clamp-2">
                      {user.jobTitle || (user.role === 'FOUNDER' ? "Founder" : "User")}
                    </p>
                  </div>

                  <div className="w-full mt-4 space-y-2">
                    <button className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-colors">
                      <UserPlus className="h-4 w-4" />
                      Connect
                    </button>
                    <button className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 text-sm font-medium transition-colors">
                      <MessageSquare className="h-4 w-4" />
                      {user.role === 'FOUNDER' ? "Request Message" : "Message"}
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-10 text-center text-gray-500">
              No users found.
            </div>
          )}
        </div>
      </section>

      {/* My Connections system not yet implemented - showing placeholder */}
      {!searchQuery.trim() && (
        <section className="space-y-4 pt-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-purple-500" />
              My Connections
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">0 Connections</span>
          </div>
          
          <div className="bg-white dark:bg-[#121215] border border-gray-100 dark:border-white/5 rounded-2xl p-10 text-center shadow-sm">
            <p className="text-gray-500 text-sm italic">You haven't connected with anyone yet. Start by sending a connection request!</p>
          </div>
        </section>
      )}
        </>
      )}

    </div>
  );
}
