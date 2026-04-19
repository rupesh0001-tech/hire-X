"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Loader2, FileText, User, MessageSquare, Building2, AlertCircle } from "lucide-react";
import { jobsApi, Job } from "@/apis/jobs.api";
import { useAppSelector } from "@/store/hooks";

interface ApplyModalProps {
  job: Job;
  onClose: () => void;
  onApplied: () => void;
}

export function ApplyModal({ job, onClose, onApplied }: ApplyModalProps) {
  const { user } = useAppSelector((s) => s.auth);
  const [name, setName] = useState(user ? `${user.firstName} ${user.lastName}` : "");
  const [resumeUrl, setResumeUrl] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !resumeUrl.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await jobsApi.applyForJob(job.id, { name: name.trim(), resumeUrl: resumeUrl.trim(), note: note.trim() || undefined });
      if (res.success) {
        onApplied();
      }
    } catch (e: any) {
      setError(e.response?.data?.message || "Failed to submit application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-lg bg-white dark:bg-[#0f0f13] rounded-2xl border border-gray-200 dark:border-white/10 shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-start justify-between p-5 border-b border-gray-100 dark:border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center overflow-hidden border border-gray-100 dark:border-white/10">
                {job.company.logoUrl ? (
                  <img src={job.company.logoUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Building2 size={18} className="text-purple-400" />
                )}
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">{job.title}</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">{job.company.name}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-all">
              <X size={18} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                <span className="flex items-center gap-1.5"><User size={12} />Full Name <span className="text-red-500">*</span></span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Your full name"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all"
              />
            </div>

            {/* Resume URL */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                <span className="flex items-center gap-1.5"><FileText size={12} />Resume Link <span className="text-red-500">*</span></span>
              </label>
              <input
                type="url"
                value={resumeUrl}
                onChange={(e) => setResumeUrl(e.target.value)}
                required
                placeholder="https://drive.google.com/your-resume or any public link"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all"
              />
              <p className="text-[11px] text-gray-400 mt-1">Link to Google Drive, Notion, or any publicly accessible resume</p>
            </div>

            {/* Note */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                <span className="flex items-center gap-1.5"><MessageSquare size={12} />Cover Note <span className="text-gray-400 font-normal">(optional)</span></span>
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
                placeholder="Why are you a great fit for this role? (Optional but recommended)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !name.trim() || !resumeUrl.trim()}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                {submitting ? "Submitting…" : "Submit Application"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
