"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useDocStatus } from "@/lib/hooks/useDocStatus";
import { FileX, FileClock, X, ArrowRight, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export function DocVerificationBanner() {
  const { docStatus, isFounder, loading } = useDocStatus();
  const [dismissed, setDismissed] = useState(false);

  if (!isFounder || loading || dismissed) return null;
  // Only show if NOT verified
  if (!docStatus.status || docStatus.status === "VERIFIED") return null;

  const isPending = docStatus.status === "PENDING";
  const isRejected = docStatus.status === "REJECTED";

  return (
    <div
      className={cn(
        "relative rounded-2xl border p-5 mb-6 overflow-hidden",
        isPending
          ? "bg-amber-500/8 border-amber-500/20"
          : "bg-red-500/8 border-red-500/20"
      )}
    >
      {/* Dismissible */}
      <button
        onClick={() => setDismissed(true)}
        className={cn(
          "absolute top-3 right-3 p-1.5 rounded-lg transition-colors",
          isPending
            ? "text-amber-500/50 hover:text-amber-400 hover:bg-amber-500/10"
            : "text-red-500/50 hover:text-red-400 hover:bg-red-500/10"
        )}
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>

      <div className="flex items-start gap-4 pr-8">
        {/* Icon */}
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
            isPending ? "bg-amber-500/15" : "bg-red-500/15"
          )}
        >
          {isPending ? (
            <FileClock size={20} className="text-amber-400" />
          ) : (
            <FileX size={20} className="text-red-400" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p
            className={cn(
              "text-sm font-bold mb-1",
              isPending ? "text-amber-300" : "text-red-300"
            )}
          >
            {isPending
              ? "Your documents are under review"
              : "Your documents were rejected"}
          </p>
          <p
            className={cn(
              "text-xs leading-relaxed mb-3",
              isPending ? "text-amber-400/70" : "text-red-400/70"
            )}
          >
            {isPending
              ? "Until verified, you cannot promote posts, receive the Founder badge, or interact with other founders' content."
              : "Your document submission was declined. Please review the reason and reupload."}
          </p>

          {/* Rejection reason */}
          {isRejected && docStatus.rejectionReason && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 mb-3 text-xs text-red-300/80">
              <AlertTriangle size={12} className="text-red-400 mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold text-red-400">Reason: </span>
                {docStatus.rejectionReason}
              </div>
            </div>
          )}

          {/* Restrictions list */}
          {isPending && (
            <div className="grid grid-cols-2 gap-1.5 mb-3">
              {[
                "Cannot promote posts",
                "No Founder badge",
                "No founder interactions",
                "Cannot view founder posts",
              ].map((r) => (
                <div key={r} className="flex items-center gap-1.5 text-xs text-amber-400/60">
                  <span className="w-1 h-1 rounded-full bg-amber-500/50 shrink-0" />
                  {r}
                </div>
              ))}
            </div>
          )}

          <Link
            href="/dashboard/settings/profile#company"
            className={cn(
              "inline-flex items-center gap-2 text-xs font-semibold transition-colors",
              isPending
                ? "text-amber-400 hover:text-amber-300"
                : "text-red-400 hover:text-red-300"
            )}
          >
            {isPending ? "View your document status" : "Reupload your document"}
            <ArrowRight size={12} />
          </Link>
        </div>
      </div>

      {/* Animated glow bottom border */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 h-px",
          isPending
            ? "bg-gradient-to-r from-transparent via-amber-500/40 to-transparent"
            : "bg-gradient-to-r from-transparent via-red-500/40 to-transparent"
        )}
      />
    </div>
  );
}
