"use client";
import React, { useEffect, useState } from "react";
import { adminDataApi, Company } from "@/apis/admin.api";
import { toast } from "sonner";
import {
  FileCheck,
  FileX,
  FileClock,
  Building2,
  Mail,
  MapPin,
  ExternalLink,
  X,
  ChevronRight,
  Globe,
  Loader2,
  Eye,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

type FilterStatus = "ALL" | "PENDING" | "VERIFIED" | "REJECTED";

const STATUS_CONFIG = {
  PENDING: {
    label: "Pending",
    badge: "bg-amber-500/15 text-amber-400 border-amber-500/20",
    icon: FileClock,
    glow: "shadow-amber-500/10",
  },
  VERIFIED: {
    label: "Verified",
    badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    icon: FileCheck,
    glow: "shadow-emerald-500/10",
  },
  REJECTED: {
    label: "Rejected",
    badge: "bg-red-500/15 text-red-400 border-red-500/20",
    icon: FileX,
    glow: "shadow-red-500/10",
  },
};

function RejectModal({
  companyName,
  onConfirm,
  onClose,
}: {
  companyName: string;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");
  const PRESETS = [
    "Document is blurry or unreadable",
    "Incorrect document type submitted",
    "Business registration number missing",
    "Document appears to be expired",
    "Information doesn't match company profile",
    "Document is a photocopy — original required",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#111116] border border-white/10 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <FileX size={16} className="text-red-400" />
            Reject Document
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        <p className="text-sm text-gray-400 mb-4">
          Provide a reason for rejecting <span className="text-white font-medium">{companyName}</span>'s document. The founder will see this.
        </p>

        <div className="space-y-2 mb-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Quick Presets</p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => setReason(p)}
                className={cn(
                  "text-xs px-3 py-1.5 rounded-lg border transition-colors",
                  reason === p
                    ? "bg-red-500/20 border-red-500/40 text-red-300"
                    : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white"
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <textarea
          placeholder="Or write a custom reason…"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500/40 resize-none transition mb-4"
        />

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm text-gray-400 hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={!reason.trim()}
            onClick={() => onConfirm(reason.trim())}
            className="flex-1 py-2.5 rounded-xl bg-red-500/20 border border-red-500/30 text-sm text-red-400 font-semibold hover:bg-red-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Confirm Rejection
          </button>
        </div>
      </div>
    </div>
  );
}

function DocCard({
  company,
  onVerify,
  onReject,
}: {
  company: Company;
  onVerify: (id: string) => void;
  onReject: (id: string, name: string) => void;
}) {
  const cfg = STATUS_CONFIG[company.docVerificationStatus];
  const StatusIcon = cfg.icon;
  const [actioning, setActioning] = useState<"verify" | "reject" | null>(null);

  return (
    <div className={cn("rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden hover:border-white/20 transition-all shadow-lg", cfg.glow)}>
      {/* Header stripe */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          {company.user?.avatarUrl ? (
            <img src={company.user.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
              {company.user?.firstName?.[0]}{company.user?.lastName?.[0]}
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-white">
              {company.user?.firstName} {company.user?.lastName}
            </p>
            <p className="text-xs text-gray-500">{company.user?.email}</p>
          </div>
        </div>
        <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border", cfg.badge)}>
          <StatusIcon size={11} />
          {cfg.label}
        </span>
      </div>

      {/* Company details */}
      <div className="px-5 py-4 space-y-3">
        <div className="flex items-center gap-2">
          {company.logoUrl ? (
            <img src={company.logoUrl} alt="" className="w-8 h-8 rounded-lg object-cover border border-white/10" />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Building2 size={14} className="text-purple-400" />
            </div>
          )}
          <div>
            <p className="text-sm font-bold text-white">{company.name}</p>
            {company.industry && <p className="text-xs text-gray-500">{company.industry}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
          {company.user?.location && (
            <div className="flex items-center gap-1.5">
              <MapPin size={11} />
              {company.user.location}
            </div>
          )}
          {company.website && (
            <div className="flex items-center gap-1.5">
              <Globe size={11} />
              <a href={company.website} target="_blank" rel="noopener noreferrer"
                className="hover:text-purple-400 transition-colors truncate" onClick={(e) => e.stopPropagation()}>
                {company.website.replace(/^https?:\/\//, "")}
              </a>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Mail size={11} />
            <span className="truncate">{company.user?.email}</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-600">
            Submitted {new Date(company.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </div>
        </div>

        {/* Rejection reason if any */}
        {company.docRejectionReason && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs">
            <FileX size={12} className="text-red-400 mt-0.5 shrink-0" />
            <div>
              <span className="font-semibold text-red-400">Previous rejection: </span>
              <span className="text-red-300/80">{company.docRejectionReason}</span>
            </div>
          </div>
        )}

        {/* Document preview link */}
        {company.docUrl ? (
          <a
            href={company.docUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-gray-300 hover:text-white hover:border-white/20 transition-colors"
          >
            <Eye size={15} className="text-purple-400" />
            View Uploaded Document
            <ExternalLink size={12} className="ml-auto text-gray-500" />
          </a>
        ) : (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/5 bg-white/[0.01] text-xs text-gray-600">
            <FileClock size={13} />
            No document uploaded yet
          </div>
        )}
      </div>

      {/* Actions */}
      {company.docVerificationStatus !== "VERIFIED" && (
        <div className="px-5 pb-4 flex gap-3">
          <button
            disabled={actioning !== null || company.docVerificationStatus === "VERIFIED"}
            onClick={() => {
              setActioning("verify");
              onVerify(company.id);
            }}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-sm font-semibold hover:bg-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {actioning === "verify" ? <Loader2 size={14} className="animate-spin" /> : <FileCheck size={14} />}
            Verify
          </button>
          <button
            disabled={actioning !== null}
            onClick={() => {
              setActioning("reject");
              onReject(company.id, company.name);
            }}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/15 border border-red-500/25 text-red-400 text-sm font-semibold hover:bg-red-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {actioning === "reject" ? <Loader2 size={14} className="animate-spin" /> : <FileX size={14} />}
            Reject
          </button>
        </div>
      )}

      {company.docVerificationStatus === "VERIFIED" && (
        <div className="px-5 pb-4">
          <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold">
            <FileCheck size={14} />
            Document Verified — Founder permissions granted
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDocsPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>("PENDING");
  const [search, setSearch] = useState("");
  const [rejectTarget, setRejectTarget] = useState<{ id: string; name: string } | null>(null);

  const load = () => {
    setLoading(true);
    adminDataApi
      .getAllDocs()
      .then((r) => { if (r.success) setCompanies(r.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleVerify = async (id: string) => {
    try {
      await adminDataApi.verifyDoc(id);
      toast.success("Document verified!");
      load();
    } catch {
      toast.error("Failed to verify document.");
    }
  };

  const handleReject = (id: string, name: string) => {
    setRejectTarget({ id, name });
  };

  const handleRejectConfirm = async (reason: string) => {
    if (!rejectTarget) return;
    try {
      await adminDataApi.rejectDoc(rejectTarget.id, reason);
      toast.success("Document rejected — reason saved.");
      setRejectTarget(null);
      load();
    } catch {
      toast.error("Failed to reject document.");
    }
  };

  const counts = {
    ALL: companies.length,
    PENDING: companies.filter((c) => c.docVerificationStatus === "PENDING").length,
    VERIFIED: companies.filter((c) => c.docVerificationStatus === "VERIFIED").length,
    REJECTED: companies.filter((c) => c.docVerificationStatus === "REJECTED").length,
  };

  const filtered = companies.filter((c) => {
    const matchFilter = filter === "ALL" || c.docVerificationStatus === filter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      c.name.toLowerCase().includes(q) ||
      (c.user?.email ?? "").toLowerCase().includes(q) ||
      (`${c.user?.firstName} ${c.user?.lastName}`).toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  const FILTER_TABS: { key: FilterStatus; label: string; color: string }[] = [
    { key: "ALL", label: "All", color: "gray" },
    { key: "PENDING", label: "Pending", color: "amber" },
    { key: "VERIFIED", label: "Verified", color: "emerald" },
    { key: "REJECTED", label: "Rejected", color: "red" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <FileCheck size={22} className="text-purple-400" />
          Document Verification
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Review and verify founder ownership documents. Verification unlocks posting and founder tag permissions.
        </p>
      </div>

      {/* Permission info */}
      <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-sm">
        <p className="font-semibold text-purple-300 mb-2">Unverified founders are restricted from:</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            "Promoting / sponsored posts",
            "Receiving the Founder badge",
            "Interacting with other founders",
            "Viewing other founders' posts",
          ].map((r) => (
            <div key={r} className="flex items-start gap-1.5 text-xs text-purple-300/70">
              <ChevronRight size={11} className="text-purple-500 mt-0.5 shrink-0" />
              {r}
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Status tabs */}
        <div className="flex gap-2 flex-wrap">
          {FILTER_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors",
                filter === t.key
                  ? "bg-purple-500/20 border-purple-500/30 text-purple-300"
                  : "bg-white/5 border-white/10 text-gray-500 hover:text-gray-300 hover:bg-white/10"
              )}
            >
              {t.label}
              <span className={cn(
                "inline-flex items-center justify-center w-4 h-4 rounded-full text-xs",
                filter === t.key ? "bg-purple-500/30 text-purple-300" : "bg-white/10 text-gray-500"
              )}>
                {counts[t.key]}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative sm:ml-auto">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search founder or company…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition w-56"
          />
        </div>
      </div>

      {/* Cards grid */}
      {loading ? (
        <div className="flex justify-center py-24">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 text-gray-500">
          No documents match this filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <DocCard
              key={c.id}
              company={c}
              onVerify={handleVerify}
              onReject={handleReject}
            />
          ))}
        </div>
      )}

      {/* Reject modal */}
      {rejectTarget && (
        <RejectModal
          companyName={rejectTarget.name}
          onConfirm={handleRejectConfirm}
          onClose={() => setRejectTarget(null)}
        />
      )}
    </div>
  );
}
