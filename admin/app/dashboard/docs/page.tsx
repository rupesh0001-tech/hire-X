"use client";
import React, { useEffect, useState, useCallback } from "react";
import { api, Company, DocStatus } from "@/lib/api";
import { toast } from "sonner";
import {
  FileCheck, FileX, FileClock, Building2, Globe,
  ExternalLink, Eye, Search, X, Loader2, ChevronRight, AlertTriangle,
} from "lucide-react";

function cn(...cls: (string | boolean | undefined)[]) { return cls.filter(Boolean).join(" "); }

// ── Status config ──────────────────────────────────────────────────────────
const STATUS: Record<DocStatus, { label: string; badge: string; Icon: React.ElementType }> = {
  PENDING:  { label: "Pending",  badge: "bg-amber-500/15  text-amber-400  border-amber-500/20",        Icon: FileClock  },
  VERIFIED: { label: "Verified", badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",     Icon: FileCheck  },
  REJECTED: { label: "Rejected", badge: "bg-red-500/15    text-red-400    border-red-500/20",           Icon: FileX      },
};

// ── Reject modal ───────────────────────────────────────────────────────────
const PRESETS = [
  "Document is blurry or unreadable",
  "Incorrect document type submitted",
  "Business registration number missing",
  "Document appears to be expired",
  "Information doesn't match company profile",
  "Photocopy not accepted — original required",
];

function RejectModal({ name, onConfirm, onClose }: { name: string; onConfirm: (r: string) => void; onClose: () => void }) {
  const [reason, setReason] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#111116] border border-white/10 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <FileX size={15} className="text-red-400" /> Reject Document
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white transition-colors"><X size={15} /></button>
        </div>
        <p className="text-xs text-gray-400 mb-4">
          Reason for rejecting <span className="text-white font-medium">{name}</span>'s document. The founder will see this.
        </p>
        <div className="mb-4 space-y-2">
          <p className="text-xs text-gray-600 uppercase tracking-widest">Quick presets</p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button key={p} onClick={() => setReason(p)}
                className={cn("text-xs px-3 py-1.5 rounded-lg border transition-colors",
                  reason === p ? "bg-red-500/20 border-red-500/40 text-red-300" : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10")}>
                {p}
              </button>
            ))}
          </div>
        </div>
        <textarea placeholder="Or type a custom reason…" rows={3} value={reason} onChange={(e) => setReason(e.target.value)}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500/40 resize-none transition mb-4" />
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm text-gray-400 hover:bg-white/5 transition-colors">Cancel</button>
          <button disabled={!reason.trim()} onClick={() => onConfirm(reason.trim())}
            className="flex-1 py-2.5 rounded-xl bg-red-500/20 border border-red-500/30 text-sm text-red-400 font-semibold hover:bg-red-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            Confirm Rejection
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Doc card ───────────────────────────────────────────────────────────────
function DocCard({ company, onVerify, onReject }: { company: Company; onVerify: (id: string) => void; onReject: (id: string, name: string) => void }) {
  const cfg = STATUS[company.docVerificationStatus];
  const [acting, setActing] = useState<"v" | "r" | null>(null);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden hover:border-white/20 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          {company.user?.avatarUrl
            ? <img src={company.user.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
            : <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                {company.user?.firstName?.[0]}{company.user?.lastName?.[0]}
              </div>
          }
          <div>
            <p className="text-sm font-semibold text-white">{company.user?.firstName} {company.user?.lastName}</p>
            <p className="text-xs text-gray-500">{company.user?.email}</p>
          </div>
        </div>
        <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border", cfg.badge)}>
          <cfg.Icon size={11} />{cfg.label}
        </span>
      </div>

      {/* Company info */}
      <div className="px-5 py-4 space-y-3">
        <div className="flex items-center gap-2.5">
          {company.logoUrl
            ? <img src={company.logoUrl} alt="" className="w-8 h-8 rounded-lg object-cover border border-white/10" />
            : <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center"><Building2 size={14} className="text-purple-400" /></div>
          }
          <div>
            <p className="text-sm font-bold text-white">{company.name}</p>
            {company.industry && <p className="text-xs text-gray-500">{company.industry}</p>}
          </div>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-gray-500">
          {company.user?.location && <span>📍 {company.user.location}</span>}
          {company.website && (
            <a href={company.website} target="_blank" rel="noreferrer"
              className="flex items-center gap-1 hover:text-purple-400 transition-colors" onClick={(e) => e.stopPropagation()}>
              <Globe size={11} />{company.website.replace(/^https?:\/\//, "")}
            </a>
          )}
          <span className="text-gray-700">
            {new Date(company.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </span>
        </div>

        {/* Rejection reason */}
        {company.docRejectionReason && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs">
            <AlertTriangle size={11} className="text-red-400 mt-0.5 shrink-0" />
            <div><span className="font-semibold text-red-400">Previous rejection: </span><span className="text-red-300/80">{company.docRejectionReason}</span></div>
          </div>
        )}

        {/* Document preview */}
        {company.docUrl ? (
          <a href={company.docUrl} target="_blank" rel="noreferrer"
            className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-gray-300 hover:text-white hover:border-white/20 transition-colors">
            <Eye size={14} className="text-purple-400" />
            View Uploaded Document
            <ExternalLink size={11} className="ml-auto text-gray-600" />
          </a>
        ) : (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/5 text-xs text-gray-700">
            <FileClock size={12} />No document uploaded yet
          </div>
        )}
      </div>

      {/* Actions */}
      {company.docVerificationStatus !== "VERIFIED" ? (
        <div className="px-5 pb-4 flex gap-3">
          <button disabled={!!acting} onClick={() => { setActing("v"); onVerify(company.id); }}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-sm font-semibold hover:bg-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {acting === "v" ? <Loader2 size={14} className="animate-spin" /> : <FileCheck size={14} />} Verify
          </button>
          <button disabled={!!acting} onClick={() => { setActing("r"); onReject(company.id, company.name); }}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/15 border border-red-500/25 text-red-400 text-sm font-semibold hover:bg-red-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {acting === "r" ? <Loader2 size={14} className="animate-spin" /> : <FileX size={14} />} Reject
          </button>
        </div>
      ) : (
        <div className="px-5 pb-4">
          <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold">
            <FileCheck size={14} /> Verified — Founder permissions active
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
type Filter = "ALL" | DocStatus;

export default function DocsPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState<Filter>("PENDING");
  const [search, setSearch]       = useState("");
  const [rejectTarget, setRejectTarget] = useState<{ id: string; name: string } | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    api.getAllDocs()
      .then((r) => { if (r.success) setCompanies(r.data); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleVerify = async (id: string) => {
    try { await api.verifyDoc(id); toast.success("Document verified!"); load(); }
    catch { toast.error("Failed to verify."); }
  };

  const handleRejectConfirm = async (reason: string) => {
    if (!rejectTarget) return;
    try { await api.rejectDoc(rejectTarget.id, reason); toast.success("Document rejected — reason saved."); setRejectTarget(null); load(); }
    catch { toast.error("Failed to reject."); }
  };

  const counts: Record<Filter, number> = {
    ALL:      companies.length,
    PENDING:  companies.filter((c) => c.docVerificationStatus === "PENDING").length,
    VERIFIED: companies.filter((c) => c.docVerificationStatus === "VERIFIED").length,
    REJECTED: companies.filter((c) => c.docVerificationStatus === "REJECTED").length,
  };

  const filtered = companies.filter((c) => {
    const q = search.toLowerCase();
    return (filter === "ALL" || c.docVerificationStatus === filter) &&
      (!q || c.name.toLowerCase().includes(q) || (c.user?.email ?? "").toLowerCase().includes(q) ||
        `${c.user?.firstName} ${c.user?.lastName}`.toLowerCase().includes(q));
  });

  const TABS: { key: Filter; label: string }[] = [
    { key: "ALL",      label: "All"      },
    { key: "PENDING",  label: "Pending"  },
    { key: "VERIFIED", label: "Verified" },
    { key: "REJECTED", label: "Rejected" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <FileCheck size={20} className="text-purple-400" /> Document Verification
        </h1>
        <p className="text-sm text-gray-500 mt-1">Approve or reject founder ownership documents. Verification unlocks posting and founder tag.</p>
      </div>

      {/* Permission info */}
      <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-sm">
        <p className="font-semibold text-purple-300 mb-2">Until verified, founders <span className="underline">cannot</span>:</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {["Promote / sponsor posts", "Get the Founder badge", "Interact with other founders", "See other founders' posts"].map((r) => (
            <div key={r} className="flex items-start gap-1.5 text-xs text-purple-300/70">
              <ChevronRight size={11} className="text-purple-500 mt-0.5 shrink-0" />{r}
            </div>
          ))}
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex gap-2">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setFilter(t.key)}
              className={cn("flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors",
                filter === t.key
                  ? "bg-purple-500/20 border-purple-500/30 text-purple-300"
                  : "bg-white/5 border-white/10 text-gray-500 hover:text-gray-300 hover:bg-white/10")}>
              {t.label}
              <span className={cn("w-5 h-5 flex items-center justify-center rounded-full text-xs",
                filter === t.key ? "bg-purple-500/30 text-purple-300" : "bg-white/10 text-gray-600")}>
                {counts[t.key]}
              </span>
            </button>
          ))}
        </div>
        <div className="relative ml-auto">
          <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input type="text" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition w-52" />
        </div>
      </div>

      {/* Cards */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-gray-600 py-20">No documents match this filter.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <DocCard key={c.id} company={c} onVerify={handleVerify} onReject={(id, name) => setRejectTarget({ id, name })} />
          ))}
        </div>
      )}

      {rejectTarget && (
        <RejectModal name={rejectTarget.name} onConfirm={handleRejectConfirm} onClose={() => setRejectTarget(null)} />
      )}
    </div>
  );
}
