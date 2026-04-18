import Link from "next/link";
import React from "react";

export function SidebarUser() {
  return (
    <div className="px-4 mt-auto">
      <Link href="/dashboard/settings/profile" className="flex items-center gap-3 p-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/20 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
         <div className="w-8 h-8 rounded-full bg-linear-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-xs group-hover:scale-105 transition-transform">
           JD
         </div>
         <div className="flex flex-col flex-1 min-w-0">
           <span className="text-sm font-medium text-black dark:text-white truncate">Jane Doe</span>
           <span className="text-xs text-gray-500 truncate">Pro Plan</span>
         </div>
      </Link>
    </div>
  );
}
