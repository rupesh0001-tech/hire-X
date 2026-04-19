"use client";
import React, { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Plus, Target, HeartHandshake, Banknote, Filter, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { marketplaceApi, MarketplaceListing } from "@/apis/marketplace.api";
import { ApplyMarketplaceModal } from "@/components/marketplace/apply-modal";
import { CreateListingModal } from "@/components/marketplace/create-listing-modal";
import { useAppSelector } from "@/store/hooks";

export default function MarketplaceBrowsePage() {
  const { user } = useAppSelector((s) => s.auth);
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [applyingTo, setApplyingTo] = useState<MarketplaceListing | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [filterType, setFilterType] = useState<'ALL' | 'FUND_REQUEST' | 'FUND_OFFER'>('ALL');

  const loadListings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await marketplaceApi.getAllListings();
      if (res.success) setListings(res.data);
    } catch (e: any) {
      setError(e.response?.data?.message || "Failed to load listings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadListings(); }, [loadListings]);

  const filtered = listings.filter(l => filterType === 'ALL' || l.type === filterType);

  return (
    <div className="max-w-5xl mx-auto pb-24 animation-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pt-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Banknote className="text-purple-500" /> Startup Marketplace
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Connect opportunities. Ask for funds or offer to invest.
          </p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-all"
        >
          <Plus size={16} /> Create Listing
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-32"><Loader2 className="animate-spin text-purple-500" /></div>
      ) : error ? (
        <div className="text-center py-32 text-red-500 text-sm">{error}</div>
      ) : (
        <>
          <div className="flex gap-2 mb-6">
            <button onClick={() => setFilterType('ALL')} className={`px-4 py-1.5 rounded-full text-xs font-medium border ${filterType === 'ALL' ? 'bg-purple-500 text-white border-purple-500' : 'bg-transparent text-gray-600 dark:text-gray-300 border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5'}`}>All</button>
            <button onClick={() => setFilterType('FUND_REQUEST')} className={`px-4 py-1.5 rounded-full text-xs font-medium border ${filterType === 'FUND_REQUEST' ? 'bg-purple-500 text-white border-purple-500' : 'bg-transparent text-gray-600 dark:text-gray-300 border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5'}`}>Founders Asking for Funds</button>
            <button onClick={() => setFilterType('FUND_OFFER')} className={`px-4 py-1.5 rounded-full text-xs font-medium border ${filterType === 'FUND_OFFER' ? 'bg-purple-500 text-white border-purple-500' : 'bg-transparent text-gray-600 dark:text-gray-300 border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5'}`}>Users Offering Funds</button>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-24 text-sm text-gray-500 dark:text-gray-400">No active listings found in this category.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filtered.map((l, i) => (
                <motion.div
                  key={l.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img src={l.creator.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${l.creator.firstName}`} className="w-10 h-10 rounded-full" alt="avatar" />
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{l.creator.firstName} {l.creator.lastName}</h3>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          {l.creator.role === 'FOUNDER' ? '👑 Founder' : '👤 User'}
                          <span className="opacity-50">•</span>
                          {formatDistanceToNow(new Date(l.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    {/* Badge */}
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${l.type === 'FUND_REQUEST' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20' : 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20'}`}>
                      {l.type === 'FUND_REQUEST' ? 'Raising Funds' : 'Offering Funds'}
                    </span>
                  </div>

                  <div className="mt-5 flex-1">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">{l.title}</h2>
                    {l.concernsCount > 0 && (
                      <div className="mt-2 bg-red-500/10 border border-red-500/20 rounded-lg p-2 flex items-start gap-2">
                         <span className="text-lg">⚠️</span>
                         <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                           Caution: marked as concerned ({l.concernsCount} user reports). Verify thoroughly before applying.
                         </p>
                      </div>
                    )}
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{l.description}</p>
                    
                    <div className="mt-4 bg-gray-50 dark:bg-white/5 rounded-xl p-4 border border-gray-100 dark:border-white/5 space-y-3">
                      <div className="flex items-start gap-2.5">
                        <Banknote className="w-4 h-4 text-purple-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-[10px] uppercase font-bold text-gray-400">Amount Goal / Offer</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{l.amountText}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <Target className="w-4 h-4 text-pink-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-[10px] uppercase font-bold text-gray-400">Promises / Expectations</p>
                          <p className="text-xs text-gray-700 dark:text-gray-300 mt-0.5">{l.promisesOrExpectations}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-5 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                    <span className="text-xs text-gray-500">{l._count?.applications || 0} interested</span>
                    <button
                      disabled={l.creatorId === user?.id || (l.applications && l.applications.length > 0)}
                      onClick={() => setApplyingTo(l)}
                      className={`px-5 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-colors ${
                        l.creatorId === user?.id 
                        ? 'bg-gray-100 dark:bg-white/5 text-gray-400 cursor-not-allowed' 
                        : (l.applications && l.applications.length > 0)
                        ? 'bg-purple-100 dark:bg-purple-500/10 text-purple-500 border border-purple-500/20 cursor-not-allowed'
                        : 'bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200'
                      }`}
                    >
                      {l.creatorId === user?.id ? 'Your Listing' : (l.applications && l.applications.length > 0) ? 'Applied' : <><HeartHandshake size={15}/> I am interested</>}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      {applyingTo && (
        <ApplyMarketplaceModal listing={applyingTo} onClose={() => setApplyingTo(null)} onApplied={loadListings} />
      )}
      
      {isCreating && (
        <CreateListingModal onClose={() => setIsCreating(false)} onCreated={loadListings} />
      )}
    </div>
  );
}
