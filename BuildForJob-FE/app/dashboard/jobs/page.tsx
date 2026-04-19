"use client";
import React, { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Briefcase, MapPin, Clock, DollarSign, Search, Filter, ArrowRight, Building2 } from "lucide-react";
import Link from "next/link";
import { jobsApi, Job } from "@/apis/jobs.api";
import { useAppSelector } from "@/store/hooks";
import { ApplyModal } from "@/components/jobs/apply-modal";
import { formatDistanceToNow } from "date-fns";

const JOB_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: "Full Time",
  PART_TIME: "Part Time",
  CONTRACT: "Contract",
  INTERNSHIP: "Internship",
  REMOTE: "Remote",
};

const JOB_TYPE_COLORS: Record<string, string> = {
  FULL_TIME: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  PART_TIME: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
  CONTRACT: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  INTERNSHIP: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  REMOTE: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
};

export default function AllJobsPage() {
  const { user } = useAppSelector((s) => s.auth);
  const isFounder = user?.role === "FOUNDER";

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [applyingJob, setApplyingJob] = useState<Job | null>(null);

  const loadJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await jobsApi.getAllJobs();
      if (res.success) setJobs(res.data);
    } catch (e: any) {
      setError(e.response?.data?.message || "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadJobs(); }, [loadJobs]);

  const filtered = jobs.filter((j) => {
    const matchSearch =
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.company.name.toLowerCase().includes(search.toLowerCase()) ||
      (j.location ?? "").toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "ALL" || j.type === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div className="max-w-5xl mx-auto pb-16 animation-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">All Jobs</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Discover opportunities from verified companies
        </p>
      </div>

      {/* Search + Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search jobs, companies, locations…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["ALL", "FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP", "REMOTE"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                typeFilter === t
                  ? "bg-purple-600 text-white border-purple-600"
                  : "border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-purple-400"
              }`}
            >
              {t === "ALL" ? "All Types" : JOB_TYPE_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
          <Loader2 size={28} className="animate-spin text-purple-500" />
          <p className="text-sm">Loading jobs…</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
          <p className="text-sm text-red-500">{error}</p>
          <button onClick={loadJobs} className="px-4 py-2 rounded-xl text-sm font-medium bg-purple-600 text-white hover:bg-purple-700 transition-colors">
            Try again
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-2">
            <Briefcase size={28} />
          </div>
          <p className="text-base font-semibold text-gray-700 dark:text-gray-300">No jobs found</p>
          <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
        </div>
      ) : (
        <AnimatePresence initial={false}>
          <div className="space-y-4">
            {filtered.map((job, i) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] shadow-md shadow-gray-200/60 dark:shadow-black/30 hover:shadow-xl hover:shadow-purple-200/30 dark:hover:shadow-purple-900/20 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Company logo */}
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0 overflow-hidden border border-gray-100 dark:border-white/10">
                      {job.company.logoUrl ? (
                        <img src={job.company.logoUrl} alt={job.company.name} className="w-full h-full object-cover" />
                      ) : (
                        <Building2 size={22} className="text-purple-400" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h2 className="text-base font-semibold text-gray-900 dark:text-white">{job.title}</h2>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{job.company.name}</p>
                        </div>
                        <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold border ${JOB_TYPE_COLORS[job.type]}`}>
                          {JOB_TYPE_LABELS[job.type]}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-500 dark:text-gray-400">
                        {job.location && (
                          <span className="flex items-center gap-1"><MapPin size={12} />{job.location}</span>
                        )}
                        {job.salary && (
                          <span className="flex items-center gap-1"><DollarSign size={12} />{job.salary}</span>
                        )}
                        {job.experience && (
                          <span className="flex items-center gap-1"><Clock size={12} />{job.experience}</span>
                        )}
                        <span className="flex items-center gap-1 ml-auto text-gray-400">
                          {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                        </span>
                      </div>

                      {/* Skill tags */}
                      {job.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {job.skills.slice(0, 6).map((s) => (
                            <span key={s} className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/10">
                              {s}
                            </span>
                          ))}
                          {job.skills.length > 6 && (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 dark:bg-white/5 text-gray-500">
                              +{job.skills.length - 6} more
                            </span>
                          )}
                        </div>
                      )}

                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-3 line-clamp-2 leading-relaxed">
                        {job.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
                    <span className="text-xs text-gray-400">
                      {job._count?.applications ?? 0} applicant{(job._count?.applications ?? 0) !== 1 ? "s" : ""}
                    </span>
                    {isFounder ? (
                      <span className="text-xs text-gray-400 italic">Founders cannot apply</span>
                    ) : (
                      <button
                        onClick={() => setApplyingJob(job)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-purple-600 hover:bg-purple-700 text-white transition-colors"
                      >
                        Apply Now <ArrowRight size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* Apply modal */}
      {applyingJob && (
        <ApplyModal
          job={applyingJob}
          onClose={() => setApplyingJob(null)}
          onApplied={() => {
            setApplyingJob(null);
            loadJobs();
          }}
        />
      )}
    </div>
  );
}
