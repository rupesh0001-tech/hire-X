"use client";
import React from "react";
import Link from "next/link";
import { useDocStatus } from "@/lib/hooks/useDocStatus";
import { FileCheck, FileClock, FileX, ChevronRight, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_CONFIG = {
  PENDING: {
    icon: FileClock,
    label: "Pending Review",
    sublabel: "Awaiting admin verification",
    // Light: amber text on subtle amber bg; Dark: same as before
    badge: "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/20",
    bar: "bg-amber-500",
    barWidth: "w-1/3",
    pulse: true,
  },
  REJECTED: {
    icon: FileX,
    label: "Rejected",
    sublabel: "Action required — reupload",
    badge: "bg-red-50 text-red-700 border-red-300 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/20",
    bar: "bg-red-500",
    barWidth: "w-1/3",
    pulse: false,
  },
};

export function DocStatusWidget() {
  const { docStatus, isFounder } = useDocStatus();

  // Only show for founders, and hide entirely when VERIFIED (100% complete)
  if (!isFounder || !docStatus.status) return null;
  if (docStatus.status === "VERIFIED") return null;

  const cfg = STATUS_CONFIG[docStatus.status as keyof typeof STATUS_CONFIG];
  if (!cfg) return null;
  const Icon = cfg.icon;

  return (
    <div className={cn(
      "mx-4 mb-3 rounded-xl border p-3 transition-all",
      cfg.badge
    )}>
      <div className="flex items-center gap-2 mb-2">
        <div className="shrink-0 relative">
          <Icon size={14} />
          {cfg.pulse && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400 animate-ping opacity-75" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold leading-tight truncate">{cfg.label}</p>
          {docStatus.companyName && (
            <p className="text-xs opacity-70 truncate">{docStatus.companyName}</p>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-black/10 dark:bg-black/20 rounded-full overflow-hidden mb-2">
        <div className={cn("h-full rounded-full transition-all", cfg.bar, cfg.barWidth)} />
      </div>

      <p className="text-xs opacity-70 mb-2">{cfg.sublabel}</p>

      {/* Rejection reason */}
      {docStatus.status === "REJECTED" && docStatus.rejectionReason && (
        <div className="text-xs opacity-80 bg-black/10 dark:bg-black/20 rounded-lg p-2 mb-2 leading-relaxed">
          <span className="font-semibold">Reason: </span>
          {docStatus.rejectionReason}
        </div>
      )}

      {/* CTA */}
      <Link
        href="/dashboard/settings/profile#company"
        className="flex items-center justify-between w-full text-xs font-semibold opacity-80 hover:opacity-100 transition-opacity"
      >
        {docStatus.status === "REJECTED" ? "Reupload Document" : "View Details"}
        <ChevronRight size={12} />
      </Link>
    </div>
  );
}
