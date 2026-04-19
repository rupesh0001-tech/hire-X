"use client";
import React, { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Building2, ExternalLink, Briefcase } from "lucide-react";
import Link from "next/link";
import { companiesApi, PublicCompany } from "@/apis/jobs.api";

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<PublicCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await companiesApi.getAllCompanies();
      if (res.success) setCompanies(res.data);
    } catch (e: any) {
      setError(e.response?.data?.message || "Failed to load companies");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = companies.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.industry ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto pb-16 animation-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Companies</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Explore verified companies hiring on the platform
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by company name or industry…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all"
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
          <Loader2 size={28} className="animate-spin text-purple-500" />
          <p className="text-sm">Loading companies…</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
          <p className="text-sm text-red-500">{error}</p>
          <button onClick={load} className="px-4 py-2 rounded-xl text-sm font-medium bg-purple-600 text-white hover:bg-purple-700 transition-colors">Try again</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-2">
            <Building2 size={28} className="text-purple-400" />
          </div>
          <p className="text-base font-semibold text-gray-700 dark:text-gray-300">No companies found</p>
          <p className="text-sm text-gray-400">Verified companies will appear here once approved</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((company, i) => (
            <Link key={company.id} href={`/dashboard/jobs/companies/${company.id}`}>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] shadow-md shadow-gray-200/60 dark:shadow-black/30 hover:shadow-xl hover:shadow-purple-200/30 dark:hover:shadow-purple-900/20 hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer h-full"
              >
              <div className="p-5">
                {/* Logo + name */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0 overflow-hidden border border-gray-100 dark:border-white/10">
                    {company.logoUrl ? (
                      <img src={company.logoUrl} alt={company.name} className="w-full h-full object-cover" />
                    ) : (
                      <Building2 size={22} className="text-purple-400" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-gray-900 dark:text-white">{company.name}</h2>
                    {company.industry && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">{company.industry}</p>
                    )}
                  </div>
                </div>

                {/* Description */}
                {company.description && (
                  <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed mb-3">
                    {company.description}
                  </p>
                )}

                {/* Stats */}
                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <Briefcase size={11} />
                    {company._count?.jobs ?? 0} open job{(company._count?.jobs ?? 0) !== 1 ? "s" : ""}
                  </span>
                  {/* Owner info — no email, just name */}
                  <span className="ml-auto">
                    by {company.user.firstName} {company.user.lastName}
                  </span>
                </div>

                {/* Website link */}
                {company.website && (
                  <div
                    onClick={(e) => { e.stopPropagation(); window.open(company.website, "_blank"); }}
                    className="mt-3 flex items-center gap-1.5 text-xs text-purple-600 dark:text-purple-400 hover:underline font-medium"
                  >
                    <ExternalLink size={11} />
                    {company.website.replace(/^https?:\/\//, "")}
                  </div>
                )}
              </div>
              </motion.div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
