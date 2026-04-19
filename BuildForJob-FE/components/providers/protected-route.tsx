"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { fetchProfile } from "@/store/slices/authSlice";
import { Loader2 } from "lucide-react";
import React from "react";
import { MessagingProvider } from "@/providers/messaging-provider";
import { MessagesWidget } from "../general/messages/messages-widget";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, token } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [mounted, setMounted] = React.useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      if (!isLoading && !isAuthenticated && !token) {
        router.push("/login");
      } else if (token && !isAuthenticated && !isLoading) {
        dispatch(fetchProfile());
      }
    }
  }, [isAuthenticated, isLoading, token, router, mounted, dispatch]);

  // Don't render anything that depends on client-only state during SSR
  if (!mounted) {
    return null;
  }

  if (isLoading || (!isAuthenticated && token)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#08080a]">
        <Loader2 className="animate-spin text-purple-500" size={32} />
      </div>
    );
  }

  if (!isAuthenticated && !token) {
    return null;
  }

  return (
    <MessagingProvider>
      {children}
      <MessagesWidget />
    </MessagingProvider>
  );
}
