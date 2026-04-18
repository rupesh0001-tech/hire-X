"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import React from "react";

interface SidebarNavProps {
  navigation: {
    title: string;
    items: { name: string; href: string; icon: LucideIcon }[];
  }[];
  onClose?: () => void;
}

export function SidebarNav({ navigation, onClose }: SidebarNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    const routesThatCloseSidebar = [
      "/dashboard/resume-builder",
      "/dashboard/cover-letter"
    ];

    if (routesThatCloseSidebar.includes(href)) {
      if (onClose) {
        onClose();
      }
    }
  };

  return (
    <nav className="flex-1 space-y-8 px-4 py-6 overflow-y-auto scrollbar-hide">
      {navigation.map((group) => (
        <div key={group.title}>
          <h3 className="px-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
            {group.title}
          </h3>
          <div className="space-y-1">
            {group.items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={(e) => handleLinkClick(e, item.href)}
                  className={cn(
                    "flex items-center gap-3 px-2 py-2 text-sm font-medium rounded-lg transition-all group",
                    isActive
                      ? "bg-purple-500/10 text-purple-700 dark:text-purple-300"
                      : "text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-white"
                  )}
                >
                  <item.icon
                    size={18}
                    className={cn(
                      "transition-colors",
                      isActive ? "text-purple-600 dark:text-purple-400" : "text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
