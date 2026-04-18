"use client";

import React from "react";
import { SidebarBrand } from "./sidebar-brand";
import { SidebarNav } from "./sidebar-nav";
import { SidebarUser } from "./sidebar-user";
import { DocStatusWidget } from "./doc-status-widget";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, FilePlus, Files, History, Mail, Edit,
  Rss, PenSquare,
  CalendarDays, Ticket, CalendarCheck, User,
} from "lucide-react";

export const navigation = [
  {
    title: "Dashboard",
    items: [
      { name: "Feed",      href: "/dashboard/feed",      icon: Rss },
      { name: "My Posts",  href: "/dashboard/my-posts",  icon: PenSquare },
      { name: "Overview",  href: "/dashboard/overview",    icon: LayoutDashboard },
    ]
  },
  {
    title: "Resumes",
    items: [
      { name: "Resume Builder",    href: "/dashboard/resume-builder", icon: FilePlus },
      { name: "My Resumes",        href: "/dashboard/resumes",         icon: Files },
      { name: "Resume Versions",   href: "/dashboard/resumes/versions", icon: History },
    ]
  },
  {
    title: "Cover Letters",
    items: [
      { name: "My Cover Letters",       href: "/dashboard/cover-letter/all", icon: Mail },
      { name: "Cover Letter Builder",   href: "/dashboard/cover-letter",     icon: Edit },
    ]
  },
  {
    title: "Events",
    items: [
      { name: "All Events",       href: "/dashboard/events",                  icon: CalendarDays },
      { name: "My Registrations", href: "/dashboard/events/my-registrations", icon: Ticket },
      { name: "My Events (Host)", href: "/dashboard/events/my-events",        icon: CalendarCheck },
    ]
  },
  {
    title: "Account",
    items: [
      { name: "Profile", href: "/dashboard/profile", icon: User },
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

          <DocStatusWidget />

          <SidebarUser />
        </>
      )}
    </div>
  );
}
