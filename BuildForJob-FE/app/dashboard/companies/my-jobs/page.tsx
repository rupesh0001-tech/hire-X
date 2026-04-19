"use client";
import React, { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Plus, Briefcase, Users, ChevronDown, ChevronUp, Check, X, MapPin, DollarSign, Clock, ListChecks, Building2, AlertTriangle } from "lucide-react";
import { jobsApi, Job, JobApplication } from "@/apis/jobs.api";
import { useAppSelector } from "@/store/hooks";
import { CreateJobModal } from "@/components/jobs/create-job-modal";
import { formatDistanceToNow } from "date-fns";

const STATUS_COLORS = {
  PENDING:  "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/20",
  ACCEPTED: "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 border-green-300 dark:border-green-500/20",
  REJECTED: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border-red-300 dark:border-red-500/20",
};

const JOB_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: "Full Time", PART_TIME: "Part Time", CONTRACT: "Contract",
  INTERNSHIP: "Internship", REMOTE: "Remote",
};

type JobWithApps = Job & { applications: JobApplication[] };

export default function MyJobsPage() {
  const { user } = useAppSelector((s) => s.auth);
  const isFounder = user?.role === "FOUNDER";
  const isVerified = user?.company?.docVerificationStatus === "VERIFIED";

  const [jobs, setJobs] = useState<JobWithApps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [updatingAppId, setUpdatingAppId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await jobsApi.getMyJobs();
      if (res.success) setJobs(res.data as JobWithApps[]);
    } catch (e: any) {
      setError(e.response?.data?.message || "Failed to load jobs");
    } finally {
      setLoading(false);
    }
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

  const handleUpdateStatus = async (jobId: string, appId: string, status: "ACCEPTED" | "REJECTED") => {
    setUpdatingAppId(appId);
    try {
      const res = await jobsApi.updateApplicationStatus(jobId, appId, status);
      if (res.success) {
        setJobs((prev) =>
          prev.map((j) =>
            j.id === jobId
              ? {
                  ...j,
                  applications: j.applications.map((a) =>
                    a.id === appId ? { ...a, status } : a
                  ),
                }
              : j
          )
        );
      }
    } catch { }
    finally { setUpdatingAppId(null); }
  };

  const handleJobCreated = (newJob: Job) => {
    setJobs((prev) => [{ ...newJob, applications: [] }, ...prev]);
    setShowCreateModal(false);
  };

  return (
    <div className="max-w-5xl mx-auto pb-16 animation-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Jobs</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your job postings and review applications</p>
        </div>
        {isVerified ? (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold transition-colors"
          >
            <Plus size={16} /> Post a Job
          </button>
        ) : (
          <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/20 px-3 py-2 rounded-xl font-medium">
            Verify your docs to post jobs
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
          <Loader2 size={28} className="animate-spin text-purple-500" />
          <p className="text-sm">Loading your jobs…</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
          <p className="text-sm text-red-500">{error}</p>
          <button onClick={load} className="px-4 py-2 rounded-xl text-sm font-medium bg-purple-600 text-white">Try again</button>
        </div>
      ) : jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-2">
            <ListChecks size={28} className="text-purple-400" />
          </div>
          <p className="text-base font-semibold text-gray-700 dark:text-gray-300">No jobs posted yet</p>
          <p className="text-sm text-gray-400">{isVerified ? 'Click "Post a Job" to create your first listing' : "Get your documents verified to start posting jobs"}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => {
            const isExpanded = expandedJobId === job.id;
            const pendingCount = job.applications.filter((a) => a.status === "PENDING").length;

            return (
              <div key={job.id} className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] shadow-md shadow-gray-200/60 dark:shadow-black/30 overflow-hidden">
                {/* Job header */}
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0 overflow-hidden border border-gray-100 dark:border-white/10">
                        {job.company.logoUrl ? (
                          <img src={job.company.logoUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Building2 size={20} className="text-purple-400" />
                        )}
                      </div>
                      <div>
                        <h2 className="text-base font-semibold text-gray-900 dark:text-white">{job.title}</h2>
                        <div className="flex flex-wrap gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                          <span>{JOB_TYPE_LABELS[job.type]}</span>
                          {job.location && <span><MapPin size={10} className="inline mr-0.5" />{job.location}</span>}
                          {job.salary && <span><DollarSign size={10} className="inline mr-0.5" />{job.salary}</span>}
                          {job.experience && <span><Clock size={10} className="inline mr-0.5" />{job.experience}</span>}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                        job.status === "OPEN"
                          ? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 border-green-300 dark:border-green-500/20"
                          : "text-gray-500 bg-gray-100 dark:bg-white/5 border-gray-200"
                      }`}>
                        {job.status}
                      </span>
                      <button
                        onClick={() => setExpandedJobId(isExpanded ? null : job.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border border-gray-200 dark:border-white/10 hover:border-purple-400 text-gray-600 dark:text-gray-400 transition-all"
                      >
                        <Users size={14} />
                        {job.applications.length}
                        {pendingCount > 0 && <span className="ml-1 px-1.5 py-0.5 rounded-full bg-purple-600 text-white text-[10px] font-bold">{pendingCount}</span>}
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Applications panel */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-gray-100 dark:border-white/5 px-5 py-4">
                        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                          Applications ({job.applications.length})
                        </h3>
                        {job.applications.length === 0 ? (
                          <p className="text-sm text-gray-400 py-4 text-center">No applications yet</p>
                        ) : (
                          <div className="space-y-3">
                            {job.applications.map((app) => (
                              <div key={app.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10">
                                {/* Applicant avatar */}
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-xs shrink-0 overflow-hidden">
                                  {app.applicant?.avatarUrl ? (
                                    <img src={app.applicant.avatarUrl} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    `${app.applicant?.firstName?.[0]}${app.applicant?.lastName?.[0]}`
                                  )}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                    {app.applicant?.firstName} {app.applicant?.lastName}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    {app.applicant?.jobTitle ?? "Applicant"} · Applied {formatDistanceToNow(new Date(app.createdAt), { addSuffix: true })}
                                  </p>
                                  {app.note && (
                                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">{app.note}</p>
                                  )}
                                  <a
                                    href={app.resumeUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-purple-600 dark:text-purple-400 hover:underline font-medium mt-1 inline-block"
                                  >
                                    View Resume →
                                  </a>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  {app.status === "PENDING" ? (
                                    <>
                                      <button
                                        onClick={() => handleUpdateStatus(job.id, app.id, "ACCEPTED")}
                                        disabled={updatingAppId === app.id}
                                        title="Accept"
                                        className="p-2 rounded-xl bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20 border border-green-300/50 dark:border-green-500/20 transition-all disabled:opacity-50"
                                      >
                                        {updatingAppId === app.id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                                      </button>
                                      <button
                                        onClick={() => handleUpdateStatus(job.id, app.id, "REJECTED")}
                                        disabled={updatingAppId === app.id}
                                        title="Reject"
                                        className="p-2 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 border border-red-300/50 dark:border-red-500/20 transition-all disabled:opacity-50"
                                      >
                                        <X size={14} />
                                      </button>
                                    </>
                                  ) : (
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_COLORS[app.status]}`}>
                                      {app.status}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}

      {showCreateModal && (
        <CreateJobModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handleJobCreated}
        />
      )}
    </div>
  );
}
