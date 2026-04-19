"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, HeartHandshake } from "lucide-react";
import { marketplaceApi, MarketplaceListing } from "@/apis/marketplace.api";

interface ApplyMarketplaceModalProps {
  listing: MarketplaceListing;
  onClose: () => void;
  onApplied: () => void;
}

export function ApplyMarketplaceModal({ listing, onClose, onApplied }: ApplyMarketplaceModalProps) {
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await marketplaceApi.apply(listing.id, note);
      if (res.success) {
        onApplied();
        onClose();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to apply");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white dark:bg-[#13131a] border border-gray-200 dark:border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
        >
          <div className="p-5 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <HeartHandshake className="text-purple-500" /> Show Interest
            </h2>
            <button onClick={onClose} className="p-1.5 bg-gray-200 dark:bg-white/10 rounded-full hover:bg-gray-300 dark:hover:bg-white/20 transition-colors">
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 mb-4">
              <p className="text-sm font-medium text-purple-900 dark:text-purple-300">
                You are connecting with <strong>{listing.creator.firstName} {listing.creator.lastName}</strong> regarding: 
              </p>
              <p className="text-xs text-purple-700 dark:text-purple-400 font-semibold mt-1">"{listing.title}"</p>
            </div>

            {error && <div className="p-3 rounded-xl bg-red-500/10 text-red-500 text-sm font-medium">{error}</div>}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Optional Note / Pitch</label>
              <textarea
                rows={4}
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Hi! I'd love to connect and discuss..."
                className="w-full bg-gray-50 dark:bg-[#0f0f13] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 text-gray-900 dark:text-white resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-3.5 rounded-xl font-bold text-sm transition-colors disabled:opacity-50 mt-2"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : "Confirm Interest"}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
