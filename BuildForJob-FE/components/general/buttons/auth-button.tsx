"use client";
import { cn } from "@/lib/utils";
import React from "react";

interface AuthButtonProps {
  icon: React.ReactNode;
  text: string;
  onClick?: () => void;
  className?: string;
}

export function AuthButton({ icon, text, onClick, className }: AuthButtonProps) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300 w-full cursor-pointer",
        className
      )}
    >
      {icon} {text}
    </button>
  );
}
