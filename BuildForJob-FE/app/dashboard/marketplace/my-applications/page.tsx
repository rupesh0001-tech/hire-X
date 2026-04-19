"use client";
import React, { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, ClipboardList, Clock, CheckCircle2, XCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { marketplaceApi, MarketplaceApplication } from "@/apis/marketplace.api";

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState<MarketplaceApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await marketplaceApi.getMyApplications();
      if (res.success) setApplications(res.data);
    } catch (e: any) {
      setError(e.response?.data?.message || "Failed to load apps");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return <div className="flex justify-center py-32"><Loader2 className="animate-spin text-purple-500" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto pb-24 animation-fade-in">
      <div className="mb-8 pt-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <ClipboardList className="text-purple-500" /> My Applications
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Track the status of the marketplace listings you've been interested in.
        </p>
      </div>

      {error ? (
        <div className="text-center py-24 text-red-500 text-sm">{error}</div>
      ) : applications.length === 0 ? (
        <div className="text-center py-32 text-gray-500 dark:text-gray-400 text-sm bg-white dark:bg-white/[0.03] rounded-3xl border border-gray-200 dark:border-white/10">
          You haven't shown interest in any marketplace listings yet.
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app, i) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-5 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#13131a] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">{app.listing?.title}</h2>
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-500 dark:text-gray-400">
                  <img src={app.listing?.creator.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${app.listing?.creator.firstName}`} className="w-5 h-5 rounded-full" alt="" />
                  <span>Posted by <span className="font-semibold text-gray-900 dark:text-gray-300">{app.listing?.creator.firstName} {app.listing?.creator.lastName}</span></span>
                </div>
                {app.note && (
                  <p className="mt-3 text-xs text-gray-600 dark:text-gray-400 italic">" {app.note} "</p>
                )}
              </div>
              
              <div className="shrink-0 flex md:flex-col items-center md:items-end justify-between gap-2 border-t md:border-t-0 border-gray-100 dark:border-white/5 pt-4 md:pt-0 mt-2 md:mt-0">
                <span className="text-[11px] text-gray-400 font-medium">Applied {formatDistanceToNow(new Date(app.createdAt), { addSuffix: true })}</span>
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide
                  ${app.status === 'ACCEPTED' ? 'bg-green-500/10 text-green-500' : 
                    app.status === 'REJECTED' ? 'bg-red-500/10 text-red-500' : 
                    'bg-amber-500/10 text-amber-500'}
                `}>
                  {app.status === 'ACCEPTED' && <CheckCircle2 size={14} />}
                  {app.status === 'REJECTED' && <XCircle size={14} />}
                  {app.status === 'PENDING' && <Clock size={14} />}
                  {app.status}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
