"use client";
import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Menu, X, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { UserDropdown } from "@/components/general/user-dropdown";

interface DashboardHeaderProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function DashboardHeader({ isSidebarOpen, setIsSidebarOpen }: DashboardHeaderProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    setMounted(true);
  }, []);

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
    <header className="h-16 flex shrink-0 items-center justify-between border-b border-black/5 dark:border-white/5 px-6 lg:px-8 bg-white/90 dark:bg-black/40 backdrop-blur-md z-50">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-all text-gray-700 dark:text-gray-200 cursor-pointer active:scale-95 border border-transparent hover:border-black/5 dark:hover:border-white/10"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        
        <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
           {isSidebarOpen ? "Dashboard Overview" : "BuildForJob App"}
        </div>
      </div>
      
      <div className="flex items-center gap-4">
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
  );
}
