import Link from "next/link";
import React from "react";
import { useAppSelector } from "@/store/hooks";

export function SidebarUser() {
  const { user } = useAppSelector((state) => state.auth);

  if (!user) return null;

  return (
    <div className="px-4 mt-auto">
      <Link href="/dashboard/settings/profile" className="flex items-center gap-3 p-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/20 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
        <div className="w-8 h-8 rounded-full bg-linear-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-xs group-hover:scale-105 transition-transform overflow-hidden shrink-0">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() || 'U'
          )}
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-sm font-medium text-black dark:text-white truncate">
            {user.firstName} {user.lastName}
          </span>
          <span className="text-xs text-gray-500 truncate">
            {user.role === 'FOUNDER' ? 'Founder' : 'Professional'}
          </span>
        </div>
      </Link>
    </div>
  );
}
