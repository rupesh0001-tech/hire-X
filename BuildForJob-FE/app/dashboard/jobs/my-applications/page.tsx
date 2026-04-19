"use client";
import React, { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, ClipboardList, Building2, CheckCircle2, XCircle, Clock } from "lucide-react";
import { jobsApi, JobApplication } from "@/apis/jobs.api";
import { formatDistanceToNow } from "date-fns";

const STATUS_CONFIG = {
  PENDING:  { label: "Pending",  icon: Clock,          color: "text-amber-600 dark:text-amber-400  bg-amber-50   dark:bg-amber-500/10  border-amber-300  dark:border-amber-500/20" },
  ACCEPTED: { label: "Accepted", icon: CheckCircle2,   color: "text-green-600 dark:text-green-400  bg-green-50   dark:bg-green-500/10  border-green-300  dark:border-green-500/20" },
  REJECTED: { label: "Rejected", icon: XCircle,        color: "text-red-600   dark:text-red-400    bg-red-50     dark:bg-red-500/10    border-red-300    dark:border-red-500/20" },
};

const JOB_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: "Full Time", PART_TIME: "Part Time", CONTRACT: "Contract",
  INTERNSHIP: "Internship", REMOTE: "Remote",
};

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "ACCEPTED" | "REJECTED">("ALL");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await jobsApi.getMyApplications();
      if (res.success) setApplications(res.data);
    } catch (e: any) {
      setError(e.response?.data?.message || "Failed to load applications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = filter === "ALL" ? applications : applications.filter((a) => a.status === filter);

  return (
    <div className="max-w-4xl mx-auto pb-16 animation-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Applications</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Track the status of your job applications
        </p>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(["ALL", "PENDING", "ACCEPTED", "REJECTED"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              filter === s
                ? "bg-purple-600 text-white border-purple-600"
                : "border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-purple-400"
            }`}
          >
            {s === "ALL" ? `All (${applications.length})` : `${s.charAt(0) + s.slice(1).toLowerCase()} (${applications.filter((a) => a.status === s).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
          <Loader2 size={28} className="animate-spin text-purple-500" />
          <p className="text-sm">Loading applications…</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
          <p className="text-sm text-red-500">{error}</p>
          <button onClick={load} className="px-4 py-2 rounded-xl text-sm font-medium bg-purple-600 text-white hover:bg-purple-700 transition-colors">Try again</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-2">
            <ClipboardList size={28} className="text-purple-400" />
          </div>
          <p className="text-base font-semibold text-gray-700 dark:text-gray-300">No applications yet</p>
          <p className="text-sm text-gray-400">Apply for jobs from the Jobs section</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((app, i) => {
            const cfg = STATUS_CONFIG[app.status];
            const Icon = cfg.icon;
            return (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] shadow-md shadow-gray-200/60 dark:shadow-black/30 hover:shadow-lg transition-all duration-300 overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Company logo */}
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0 overflow-hidden border border-gray-100 dark:border-white/10">
                      {app.job?.company?.logoUrl ? (
                        <img src={app.job.company.logoUrl} alt={app.job.company.name} className="w-full h-full object-cover" />
                      ) : (
                        <Building2 size={22} className="text-purple-400" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h2 className="text-base font-semibold text-gray-900 dark:text-white">{app.job?.title}</h2>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{app.job?.company?.name} · {JOB_TYPE_LABELS[app.job?.type]}</p>
                        </div>
                        <span className={`flex items-center gap-1.5 shrink-0 px-3 py-1 rounded-full text-xs font-semibold border ${cfg.color}`}>
                          <Icon size={12} />
                          {cfg.label}
                        </span>
                      </div>

                      <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                        Applied {formatDistanceToNow(new Date(app.createdAt), { addSuffix: true })}
                        {app.job?.location && ` · ${app.job.location}`}
                      </div>

                      {/* Status message */}
                      {app.status === "ACCEPTED" && (
                        <div className="mt-3 p-3 rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-sm text-green-700 dark:text-green-400 font-medium">
                          🎉 Congratulations! Your application has been accepted. The founder will reach out to you shortly.
                        </div>
                      )}
                      {app.status === "REJECTED" && (
                        <div className="mt-3 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-sm text-red-700 dark:text-red-400">
                          Your application was not selected this time. Keep applying — the right opportunity is out there!
                        </div>
                      )}

                      {/* Resume link */}
                      <div className="flex items-center gap-3 mt-3">
                        <a
                          href={app.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-purple-600 dark:text-purple-400 hover:underline font-medium"
                        >
                          View submitted resume →
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
