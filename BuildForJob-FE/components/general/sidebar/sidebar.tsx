"use client";

import React from "react";
import { SidebarBrand } from "./sidebar-brand";
import { SidebarNav } from "./sidebar-nav";
import { SidebarUser } from "./sidebar-user";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, FileCheck, FilePlus, Wand2, 
  Files, History, Mail, Edit, MonitorUp, Globe, 
  TrendingUp, Link as LinkIcon, Briefcase, User, Rss
} from "lucide-react";

export const navigation = [
  {
    title: "Dashboard",
    items: [
      { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
      { name: "Feed", href: "/dashboard/feed", icon: Rss },
    ]
  },
  {
    title: "Resumes",
    items: [
      { name: "ATS Checker", href: "/dashboard/resumes/ats", icon: FileCheck },
      { name: "Resume Builder", href: "/dashboard/resume-builder", icon: FilePlus },
      { name: "Resume Enhancer", href: "/dashboard/resumes/enhancer", icon: Wand2 },
      { name: "My Resumes", href: "/dashboard/resumes", icon: Files },
      { name: "Resume Versions", href: "/dashboard/resumes/versions", icon: History },
    ]
  },
  {
    title: "Cover Letters",
    items: [
      { name: "My Cover Letters", href: "/dashboard/cover-letter/all", icon: Mail },
      { name: "Cover Letter Builder", href: "/dashboard/cover-letter", icon: Edit },
    ]
  },
  {
    title: "Portfolio",
    items: [
      { name: "My Portfolios", href: "/dashboard/portfolio", icon: Globe },
      { name: "Create Portfolio", href: "/dashboard/portfolio/create", icon: MonitorUp },
    ]
  },
  {
    title: "LinkedIn Tools",
    items: [
      { name: "Profile Enhancer", href: "/dashboard/linkedin/enhancer", icon: TrendingUp },
    ]
  },
  {
    title: "Connect Profiles",
    items: [
      { name: "Connect GitHub", href: "/dashboard/connect/github", icon: LinkIcon },
      { name: "Connect LinkedIn", href: "/dashboard/connect/linkedin", icon: Briefcase },
    ]
  },
  {
    title: "Settings",
    items: [
      { name: "Profile", href: "/dashboard/settings/profile", icon: User },
    ]
  }
];

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
  isOverlay?: boolean;
}

export function Sidebar({ isOpen, onClose, isOverlay }: SidebarProps) {
  return (
    <div className={cn(
      "flex h-full flex-col bg-white dark:bg-[#08080a] pb-4 shrink-0 transition-all duration-300 ease-in-out border-r border-black/5 dark:border-white/5 shadow-2xl",
      isOverlay ? "fixed top-0 left-0 z-50" : "relative z-30",
      isOpen 
        ? "w-64 opacity-100 translate-x-0" 
        : "w-0 opacity-0 -translate-x-full overflow-hidden border-none pointer-events-none"
    )}>
      {isOpen && (
        <>
          <SidebarBrand />
          <SidebarNav navigation={navigation} onClose={onClose} />
          <SidebarUser />
        </>
      )}
    </div>
  );
}
