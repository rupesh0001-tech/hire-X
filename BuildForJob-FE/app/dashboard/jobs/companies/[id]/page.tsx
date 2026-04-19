"use client";
import React, { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Building2, Globe, MapPin, Clock, DollarSign, ArrowLeft, Briefcase, ArrowRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { companiesApi, PublicCompany, Job } from "@/apis/jobs.api";
import { useAppSelector } from "@/store/hooks";
import { ApplyModal } from "@/components/jobs/apply-modal";

const JOB_TYPE_COLORS: Record<string, string> = {
  FULL_TIME: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  PART_TIME: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
  CONTRACT: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  INTERNSHIP: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  REMOTE: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
};

const JOB_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: "Full Time", PART_TIME: "Part Time", CONTRACT: "Contract",
  INTERNSHIP: "Internship", REMOTE: "Remote",
};

export default function CompanyDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAppSelector((s) => s.auth);
  const isFounder = user?.role === "FOUNDER";

  const [company, setCompany] = useState<PublicCompany | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applyingJob, setApplyingJob] = useState<Job | null>(null);

  const load = useCallback(async () => {
    if (!id || typeof id !== "string") return;
    setLoading(true);
    setError(null);
    try {
      const res = await companiesApi.getCompany(id);
      if (res.success) setCompany(res.data);
    } catch (e: any) {
      setError(e.response?.data?.message || "Failed to load company details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3 text-gray-400">
        <Loader2 size={28} className="animate-spin text-purple-500" />
        <p className="text-sm">Loading company profile…</p>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3 text-center">
        <p className="text-sm text-red-500">{error || "Company not found"}</p>
        <button onClick={() => router.back()} className="px-4 py-2 rounded-xl text-sm font-medium bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 transition-colors">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-16 animation-fade-in">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Companies
      </button>

      {/* Hero card */}
      <div className="rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] shadow-md dark:shadow-black/20 overflow-hidden mb-8">
        <div className="h-32 bg-gradient-to-r from-purple-600/90 to-blue-500/90" />
        <div className="px-6 sm:px-8 pb-8">
          <div className="-mt-12 flex items-end gap-5">
            <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-white dark:border-[#0f0f13] bg-white dark:bg-[#0f0f13] shadow-md shrink-0">
              {company.logoUrl ? (
                <img src={company.logoUrl} alt={company.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-purple-500/10 flex items-center justify-center">
                  <Building2 size={36} className="text-purple-400" />
                </div>
              )}
            </div>
            <div className="pb-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{company.name}</h1>
              {company.industry && <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mt-0.5">{company.industry}</p>}
            </div>
          </div>

          {company.description && (
            <p className="mt-6 text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
              {company.description}
            </p>
          )}

          <div className="mt-6 flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-white/5 pt-6">
            <div className="flex items-center gap-2">
              <img src={company.user.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${company.user.firstName}`} alt="" className="w-6 h-6 rounded-full" />
              <span>Founded by {company.user.firstName} {company.user.lastName}</span>
            </div>
            {company.website && (
              <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 hover:underline font-medium">
                <Globe size={14} /> Website
              </a>
            )}
            <div className="flex items-center gap-1.5 ml-auto text-gray-400">
              Joined {formatDistanceToNow(new Date(company.createdAt), { addSuffix: true })}
            </div>
          </div>
        </div>
      </div>

      {/* Jobs */}
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Briefcase size={20} className="text-purple-500" /> Open Positions
      </h2>

      {(!company.jobs || company.jobs.length === 0) ? (
        <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.02] py-12 text-center text-gray-500 dark:text-gray-400 text-sm">
          No open positions at the moment.
        </div>
      ) : (
        <div className="space-y-4">
          {company.jobs.map((job: any) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] shadow-sm hover:shadow-md transition-all p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">{job.title}</h3>
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <span className={`px-2 py-0.5 rounded-md font-medium border ${JOB_TYPE_COLORS[job.type]}`}>
                      {JOB_TYPE_LABELS[job.type]}
                    </span>
                    {job.location && <span className="flex items-center gap-1"><MapPin size={12}/>{job.location}</span>}
                    {job.salary && <span className="flex items-center gap-1"><DollarSign size={12}/>{job.salary}</span>}
                    {job.experience && <span className="flex items-center gap-1"><Clock size={12}/>{job.experience}</span>}
                  </div>
                  <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                    {job.description}
                  </p>
                  {job.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {job.skills.map((s: string) => (
                        <span key={s} className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/10">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                {isFounder ? (
                  <span className="text-xs text-gray-400 italic whitespace-nowrap mt-1">Founders cannot apply</span>
                ) : (
                  <button
                    onClick={() => setApplyingJob({ ...job, company })}
                    className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-purple-600 hover:bg-purple-700 text-white transition-colors"
                  >
                    Apply Now <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Apply Modal */}
      {applyingJob && (
        <ApplyModal
          job={applyingJob as any}
          onClose={() => setApplyingJob(null)}
          onApplied={() => { setApplyingJob(null); /* We don't need to reload single company on applied */ }}
        />
      )}
    </div>
  );
}
