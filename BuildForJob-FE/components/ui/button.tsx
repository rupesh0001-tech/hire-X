import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
}

export function Button({ variant = "primary", className, children, ...props }: ButtonProps) {
  const baseStyles = "px-6 py-3 rounded-full font-semibold text-base transition-all flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-black text-white dark:bg-white dark:text-black hover:scale-[1.02]",
    secondary: "bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/20 text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/20 font-medium",
    outline: "border border-black dark:border-white text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5",
    ghost: "text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white font-medium px-4 py-2"
  };

  return (
    <button className={cn(baseStyles, variants[variant], className)} {...props}>
      {children}
    </button>
  );
}
