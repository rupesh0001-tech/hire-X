"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";

export function SidebarBrand() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex h-16 shrink-0 items-center px-6 border-b border-black/5 dark:border-white/5">
      <Link href="/" className="flex items-center gap-2 group">
        <span className="font-bold text-lg tracking-tight">
          {mounted ? (
            resolvedTheme === "light"
              ? <img src="./logo-black.png" width={140} height={140} alt="logo" />
              : <img src="./logo-light.png" width={140} height={140} alt="logo" />
          ) : (
            // Stable placeholder height while mounting to prevent layout shift
            <div className="w-[140px] h-[32px] rounded-md bg-gray-100 dark:bg-white/5 animate-pulse" />
          )}
        </span>
      </Link>
    </div>
  );
}
