"use client";
import React, { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Files, CheckCircle, XCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { marketplaceApi, MarketplaceListing } from "@/apis/marketplace.api";

export default function MyListingsPage() {
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await marketplaceApi.getMyListings();
      if (res.success) setListings(res.data);
    } catch (e: any) {
      setError(e.response?.data?.message || "Failed to load listings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (listingId: string, appId: string, status: 'ACCEPTED' | 'REJECTED') => {
    try {
      const res = await marketplaceApi.updateApplicationStatus(listingId, appId, status);
      if (res.success) {
        // Update local state directly to be fast
        setListings(prev => prev.map(l => {
          if (l.id !== listingId) return l;
          return {
            ...l,
            applications: l.applications?.map(a => a.id === appId ? { ...a, status } : a)
          };
        }));
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Error updating application");
    }
  };

  const handleWithdraw = async (listingId: string, appId: string) => {
    if (!confirm("Are you sure you want to withdraw and terminate this contract?")) return;
    try {
      const res = await marketplaceApi.withdrawApplication(listingId, appId);
      if (res.success) {
        setListings(prev => prev.map(l => (l.id === listingId ? { ...l, applications: l.applications?.map(a => a.id === appId ? { ...a, status: 'WITHDRAWN' } : a) } : l)));
      }
    } catch(err:any) { alert(err.response?.data?.message || "Error"); }
  };

  const handleReport = async (listingId: string, appId: string) => {
    if (!confirm("Are you sure you want to report this user? This will terminate the contract and flag the listing.")) return;
    try {
      const res = await marketplaceApi.reportApplication(listingId, appId);
      if (res.success) {
        setListings(prev => prev.map(l => (l.id === listingId ? { ...l, applications: l.applications?.map(a => a.id === appId ? { ...a, status: 'TERMINATED' } : a) } : l)));
      }
    } catch(err:any) { alert(err.response?.data?.message || "Error"); }
  };

  const isReportable = (updatedAt: string) => {
    const days = (new Date().getTime() - new Date(updatedAt).getTime()) / (1000 * 3600 * 24);
    return days <= 15;
  };

  if (loading) {
    return <div className="flex justify-center py-32"><Loader2 className="animate-spin text-purple-500" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto pb-24 animation-fade-in">
      <div className="mb-8 pt-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Files className="text-purple-500" /> My Marketplace Listings
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage the active listings you have posted and review incoming connections.
        </p>
      </div>

      {error ? (
        <div className="text-center py-24 text-red-500 text-sm">{error}</div>
      ) : listings.length === 0 ? (
        <div className="text-center py-32 text-gray-500 dark:text-gray-400 text-sm bg-white dark:bg-white/[0.03] rounded-3xl border border-gray-200 dark:border-white/10">
          You haven't posted any marketplace listings yet.
        </div>
      ) : (
        <div className="space-y-6">
          {listings.map((listing, i) => (
            <motion.div
              key={listing.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#13131a] shadow-sm overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02]">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">{listing.title}</h2>
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${listing.status === 'OPEN' ? 'bg-green-500/10 text-green-600' : 'bg-gray-500/10 text-gray-500'}`}>
                    {listing.status}
                  </span>
                </div>
                <div className="text-xs text-gray-500 grid gap-1.5">
                  <p><strong>Goal:</strong> {listing.amountText}</p>
                  <p className="line-clamp-1"><strong>Offers/Expectations:</strong> {listing.promisesOrExpectations}</p>
                </div>
              </div>

              {/* Applications section mapping */}
              <div className="p-6">
                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-200 mb-4 uppercase tracking-wider">
                  Interest Received ({listing.applications?.length || 0})
                </h3>
                
                {!listing.applications?.length ? (
                  <p className="text-xs text-gray-400 italic">No one has shown interest yet.</p>
                ) : (
                  <div className="space-y-3">
                    {listing.applications.map((app: any) => (
                      <div key={app.id} className="p-4 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-[#0f0f13] flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="flex gap-3">
                          <img src={app.applicant.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${app.applicant.firstName}`} className="w-10 h-10 rounded-full" alt="Applicant" />
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {app.applicant.firstName} {app.applicant.lastName}
                            </p>
                            <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                              {app.applicant.jobTitle}
                            </p>
                            {app.note && <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 italic bg-gray-200/50 dark:bg-white/5 p-2 rounded-lg border-l-2 border-purple-500">"{app.note}"</p>}
                          </div>
                        </div>

                        {app.status === 'PENDING' ? (
                          <div className="flex gap-2 shrink-0">
                            <button onClick={() => updateStatus(listing.id, app.id, 'ACCEPTED')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-500/10 text-green-600 hover:bg-green-500/20 transition-colors">
                              <CheckCircle size={14} /> Accept
                            </button>
                            <button onClick={() => updateStatus(listing.id, app.id, 'REJECTED')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-colors">
                              <XCircle size={14} /> Reject
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-end gap-2 shrink-0">
                            <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase ${
                              app.status === 'ACCEPTED' ? 'bg-green-500/10 text-green-500' : 
                              app.status === 'WITHDRAWN' ? 'bg-gray-500/10 text-gray-500' :
                              app.status === 'TERMINATED' ? 'bg-red-900/10 text-red-700' :
                              'bg-red-500/10 text-red-500'}`
                            }>
                              {app.status}
                            </span>
                            
                            {app.status === 'ACCEPTED' && (
                              <div className="flex gap-2 mt-1">
                                <button onClick={() => handleWithdraw(listing.id, app.id)} className="text-[10px] uppercase font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 px-2 py-1 rounded">
                                  Withdraw
                                </button>
                                {isReportable(app.updatedAt) && (
                                  <button onClick={() => handleReport(listing.id, app.id)} className="text-[10px] uppercase font-bold text-red-500 hover:text-red-700 transition-colors bg-red-500/5 border border-red-500/20 px-2 py-1 rounded">
                                    Report Middleman
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
