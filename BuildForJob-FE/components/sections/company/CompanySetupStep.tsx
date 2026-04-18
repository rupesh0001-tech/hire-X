"use client";
import React, { useState } from "react";
import { Building2, Globe, FileText, Upload, CheckCircle2, ArrowRight, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import api from "@/apis/axiosInstance";

interface CompanySetupStepProps {
  onComplete: () => void; // go to next step (face or dashboard)
  onSkip: () => void;
}

const INDUSTRIES = [
  "Technology", "Finance", "Healthcare", "Education", "E-commerce",
  "Marketing", "Design", "Consulting", "Manufacturing", "Other"
];

export function CompanySetupStep({ onComplete, onSkip }: CompanySetupStepProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [industry, setIndustry] = useState("");
  const [logo, setLogo] = useState<File | null>(null);
  const [document, setDocument] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogo(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDocument(file);
    toast.info(`Document selected: ${file.name}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) { toast.error("Company name is required"); return; }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      if (description) formData.append("description", description);
      if (website) formData.append("website", website);
      if (industry) formData.append("industry", industry);
      if (logo) formData.append("logo", logo);
      if (document) formData.append("document", document);

      const res = await api.post("/company", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        setDone(true);
        toast.success("Company profile created!");
        setTimeout(onComplete, 1000);
      } else {
        toast.error(res.data.message || "Failed to create company");
        setLoading(false);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create company");
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-3 text-green-400">
        <CheckCircle2 size={48} />
        <p className="font-semibold text-white text-lg">Company profile created!</p>
        <p className="text-sm text-gray-400">Setting up face login...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Logo upload */}
      <div className="flex items-center gap-4">
        <label
          htmlFor="logo-upload"
          className="relative w-16 h-16 rounded-xl border-2 border-dashed border-purple-500/40 flex items-center justify-center cursor-pointer hover:border-purple-500 transition-colors bg-purple-500/5 overflow-hidden flex-shrink-0"
        >
          {logoPreview ? (
            <img src={logoPreview} alt="Logo" className="w-full h-full object-cover rounded-xl" />
          ) : (
            <Building2 className="text-purple-400" size={24} />
          )}
          <input id="logo-upload" type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
        </label>
        <div className="flex-1">
          <p className="text-sm font-medium text-white">Company Logo</p>
          <p className="text-xs text-gray-500">Click the icon to upload (PNG, JPG, WebP)</p>
        </div>
      </div>

      {/* Company name */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-300">Company Name *</label>
        <input
          type="text"
          placeholder="Acme Inc."
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#111116] border border-gray-200 dark:border-white/10 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder:text-gray-400"
        />
      </div>

      {/* Industry */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-300">Industry</label>
        <select
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-[#111116] border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
        >
          <option value="">Select industry...</option>
          {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
        </select>
      </div>

      {/* Website */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-300 flex items-center gap-1.5"><Globe size={14} /> Website</label>
        <input
          type="url"
          placeholder="https://yourcompany.com"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#111116] border border-gray-200 dark:border-white/10 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder:text-gray-400"
        />
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-300">About the Company</label>
        <textarea
          placeholder="What does your company do?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#111116] border border-gray-200 dark:border-white/10 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder:text-gray-400 resize-none"
        />
      </div>

      {/* Owner Document */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-300 flex items-center gap-1.5"><FileText size={14} /> Owner Documentation</label>
        <label
          htmlFor="doc-upload"
          className="flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed border-white/20 hover:border-purple-500/50 cursor-pointer transition-colors bg-white/2 group"
        >
          <Upload size={16} className="text-gray-400 group-hover:text-purple-400 transition-colors" />
          <span className="text-sm text-gray-400 group-hover:text-gray-300">
            {document ? document.name : "Upload registration doc, ID, or certificate (PDF/Image)"}
          </span>
          {document && (
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); setDocument(null); }}
              className="ml-auto text-gray-500 hover:text-red-400"
            >
              <X size={14} />
            </button>
          )}
        </label>
        <input id="doc-upload" type="file" accept="image/*,application/pdf" className="hidden" onChange={handleDocChange} />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold flex items-center justify-center gap-2 transition-all"
        >
          {loading ? <Loader2 className="animate-spin" size={16} /> : <><ArrowRight size={16} /> Save & Continue</>}
        </button>
        <button
          type="button"
          onClick={onSkip}
          className="px-4 py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:border-white/30 transition-all text-sm"
        >
          Skip
        </button>
      </div>
    </form>
  );
}
