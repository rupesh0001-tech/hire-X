"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, Sun, Moon, Menu, X, User, LogOut, LayoutDashboard, Settings } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Button1 } from "@/components/general/buttons/button1";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";
import { UserDropdown } from "@/components/general/user-dropdown";

export function Navbar({ isScrolled, mobileMenuOpen, setMobileMenuOpen, theme, setTheme }: any) {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <header 
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 border-b ${
        isScrolled 
          ? "bg-white/80 dark:bg-black/60 backdrop-blur-xl border-black/5 dark:border-white/10 py-2.5 shadow-2xl shadow-purple-900/5" 
          : "bg-transparent border-transparent py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="font-bold text-lg tracking-tight">
            {theme === "light" ? <img src="./logo-black.png" width={140} height={140} alt="logo" /> : <img src="./logo-light.png" width={140} height={140} alt="logo" />}
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-8 items-center text-sm font-medium text-gray-600 dark:text-gray-300">
          <a href="#features" className="hover:text-black dark:hover:text-white transition-colors">Features</a>
          <a href="#demo" className="hover:text-black dark:hover:text-white transition-colors">How it works</a>
          <a href="#pricing" className="hover:text-black dark:hover:text-white transition-colors">Pricing</a>
          
          <div className="flex gap-4 items-center ml-4 border-l border-black/10 dark:border-white/10 pl-8">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-gray-600 dark:text-gray-300"
              aria-label="Toggle Dark Mode"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <Link href="/dashboard">
                  <Button variant="ghost" className="font-semibold">Dashboard</Button>
                </Link>
                <UserDropdown />
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Log in</Button>
                </Link>
                <Link href="/register">
                  <Button1 className="py-2.5 h-auto">
                    Start Building Free
                  </Button1>
                </Link>
              </>
            )}
          </div>
        </nav>

        {/* Mobile Toggle */}
        <div className="md:hidden flex items-center gap-4">
          <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-gray-600 dark:text-gray-300"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button 
            className="text-gray-600 dark:text-gray-300"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-white/95 dark:bg-black/95 backdrop-blur-xl border-b border-black/5 cursor-pointer dark:border-white/10 p-6 flex flex-col gap-4 shadow-2xl md:hidden"
          >
            <a href="#features" className="text-lg text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white">Features</a>
            <a href="#demo" className="text-lg text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white">How it works </a>
            <a href="#pricing" className="text-lg text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white">Pricing</a>
            
            <div className="h-px bg-black/10 dark:bg-white/10 my-2" />
            
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-3 px-1 py-2">
                  <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center text-sm font-bold">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-black dark:text-white">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                </div>
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white">Dashboard</Link>
                <Link href="/dashboard/profile" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white">Profile Settings</Link>
                <button onClick={handleLogout} className="text-lg font-medium text-red-500 text-left">Log Out</button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="cursor-pointer text-left text-lg text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white">Log in</Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="cursor-pointer bg-black text-white dark:bg-white dark:text-black px-5 py-3 rounded-xl mt-2 font-medium text-center">
                  Start Building Free
                </Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
