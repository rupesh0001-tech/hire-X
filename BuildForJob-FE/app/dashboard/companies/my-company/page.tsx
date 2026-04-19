"use client";
import React, { useCallback, useEffect, useState, useRef } from "react";
import { Loader2, Building2, Globe, Briefcase, FileCheck, FileClock, FileX, Edit, Save, X, Upload, AlertTriangle } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { companiesApi } from "@/apis/jobs.api";
import api from "@/apis/axiosInstance";

const DOC_STATUS = {
  PENDING:  { icon: FileClock,   label: "Pending Review",     color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/20" },
  VERIFIED: { icon: FileCheck,   label: "Verified ✓",          color: "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 border-green-300 dark:border-green-500/20" },
  REJECTED: { icon: FileX,       label: "Rejected — Reupload", color: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border-red-300 dark:border-red-500/20" },
};

export default function MyCompanyPage() {
  const { user } = useAppSelector((s) => s.auth);
  const isFounder = user?.role === "FOUNDER";

  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const logoRef = useRef<HTMLInputElement>(null);
  const docRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: "", description: "", website: "", industry: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await companiesApi.getMyCompany();
      if (res.success && res.data) {
        setCompany(res.data);
        setForm({
          name: res.data.name ?? "",
          description: res.data.description ?? "",
          website: res.data.website ?? "",
          industry: res.data.industry ?? "",
        });
      }
    } catch { }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (!isFounder) {
    return (
      <div className="max-w-2xl mx-auto py-24 text-center">
        <AlertTriangle size={40} className="mx-auto text-amber-500 mb-4" />
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Founders Only</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">This section is only available to company founders.</p>
      </div>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => v && fd.append(k, v));
      if (logoRef.current?.files?.[0]) fd.append("logo", logoRef.current.files[0]);
      if (docRef.current?.files?.[0])  fd.append("document", docRef.current.files[0]);

      const res = await api.post("/company", fd, { headers: { "Content-Type": "multipart/form-data" } });
      if (res.data.success) {
        setCompany(res.data.data);
        setEditing(false);
      }
    } catch (e: any) {
      setSaveError(e.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
        <Loader2 size={28} className="animate-spin text-purple-500" />
        <p className="text-sm">Loading company…</p>
      </div>
    );
  }

  const docStatus = company?.docVerificationStatus ?? "PENDING";
  const DocStatusCfg = DOC_STATUS[docStatus as keyof typeof DOC_STATUS];
  const DocIcon = DocStatusCfg.icon;

  return (
    <div className="max-w-3xl mx-auto pb-16 animation-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Company</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {company ? "Manage your company profile" : "Set up your company profile to start posting jobs"}
          </p>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold transition-colors"
          >
            <Edit size={14} />
            {company ? "Edit" : "Set Up"}
          </button>
        )}
      </div>

      {/* Doc verification status banner */}
      {company && (
        <div className={`flex items-center gap-3 p-4 rounded-2xl border mb-6 ${DocStatusCfg.color}`}>
          <DocIcon size={18} />
          <div className="flex-1">
            <p className="text-sm font-semibold">{DocStatusCfg.label}</p>
            {docStatus === "PENDING" && <p className="text-xs opacity-80 mt-0.5">Admin is reviewing your documents. You&apos;ll be able to post jobs once verified.</p>}
            {docStatus === "VERIFIED" && <p className="text-xs opacity-80 mt-0.5">You can now post jobs and they will appear publicly.</p>}
            {docStatus === "REJECTED" && company.docRejectionReason && (
              <p className="text-xs opacity-80 mt-0.5">Reason: {company.docRejectionReason}</p>
            )}
          </div>
          {docStatus === "REJECTED" && !editing && (
            <button onClick={() => setEditing(true)} className="text-xs font-semibold underline shrink-0">
              Reupload Doc
            </button>
          )}
        </div>
      )}

      {editing ? (
        /* Edit Form */
        <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] shadow-md dark:shadow-black/20 p-6 space-y-5">
          {saveError && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm">
              {saveError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "Company Name *", key: "name", placeholder: "Acme Inc." },
              { label: "Industry", key: "industry", placeholder: "e.g. Technology, Finance…" },
              { label: "Website", key: "website", placeholder: "https://yourcompany.com" },
            ].map(({ label, key, placeholder }) => (
              <div key={key} className={key === "name" ? "sm:col-span-2" : ""}>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
                <input
                  type="text"
                  value={(form as any)[key]}
                  onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all"
                />
              </div>
            ))}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                rows={4}
                placeholder="What does your company do?"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all resize-none"
              />
            </div>
          </div>

          {/* File uploads */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Company Logo</label>
              <label className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-dashed border-gray-300 dark:border-white/20 hover:border-purple-400 cursor-pointer transition-all text-sm text-gray-500 dark:text-gray-400">
                <Upload size={14} /> {logoRef.current?.files?.[0]?.name ?? (company?.logoUrl ? "Replace logo" : "Upload logo")}
                <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={() => setForm((p) => ({ ...p }))} />
              </label>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Owner Document <span className="text-gray-400 font-normal">(ID / Registration cert)</span>
              </label>
              <label className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-dashed border-gray-300 dark:border-white/20 hover:border-purple-400 cursor-pointer transition-all text-sm text-gray-500 dark:text-gray-400">
                <Upload size={14} /> {docRef.current?.files?.[0]?.name ?? (company?.docUrl ? "Replace document" : "Upload document")}
                <input ref={docRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={() => setForm((p) => ({ ...p }))} />
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => { setEditing(false); setSaveError(null); }}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
            >
              <X size={14} /> Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !form.name.trim()}
              className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {saving ? "Saving…" : "Save Company"}
            </button>
          </div>
        </div>
      ) : company ? (
        /* View mode */
        <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] shadow-md dark:shadow-black/20 overflow-hidden">
          {/* Banner / Logo area */}
          <div className="h-24 bg-gradient-to-r from-purple-600 to-blue-500" />
          <div className="px-6 pb-6">
            <div className="-mt-8 mb-4 w-16 h-16 rounded-2xl overflow-hidden border-4 border-white dark:border-[#0f0f13] bg-white dark:bg-[#0f0f13] shadow-md">
              {company.logoUrl ? (
                <img src={company.logoUrl} alt={company.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-purple-500/10 flex items-center justify-center">
                  <Building2 size={24} className="text-purple-400" />
                </div>
              )}
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{company.name}</h2>
            {company.industry && <p className="text-sm text-purple-600 dark:text-purple-400 font-medium mt-0.5">{company.industry}</p>}
            {company.description && <p className="text-sm text-gray-600 dark:text-gray-300 mt-3 leading-relaxed">{company.description}</p>}
            {company.website && (
              <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 mt-3 text-sm text-purple-600 dark:text-purple-400 hover:underline font-medium">
                <Globe size={14} /> {company.website}
              </a>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/10 p-12 text-center">
          <Building2 size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-base font-semibold text-gray-700 dark:text-gray-300">No company profile yet</p>
          <p className="text-sm text-gray-400 mt-1">Click "Set Up" to create your company profile and start hiring</p>
        </div>
      )}
    </div>
  );
}
