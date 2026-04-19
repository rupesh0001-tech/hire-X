"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Target, Banknote } from "lucide-react";
import { marketplaceApi } from "@/apis/marketplace.api";
import { useAppSelector } from "@/store/hooks";

interface CreateListingModalProps {
  onClose: () => void;
  onCreated: () => void;
}

export function CreateListingModal({ onClose, onCreated }: CreateListingModalProps) {
  const { user } = useAppSelector(s => s.auth);
  const isFounder = user?.role === "FOUNDER";
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    amountText: "",
    promisesOrExpectations: "",
  });

  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) {
      setError("You must agree to the terms and policies to publish a listing.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await marketplaceApi.createListing(form);
      if (res.success) {
        onCreated();
        onClose();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create listing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-[#13131a] border border-gray-200 dark:border-white/10 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl"
        >
          <div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50 dark:bg-white/[0.02]">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {isFounder ? "Ask for Funds" : "Offer Investment"}
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                {isFounder ? "Publish your startup pitch to potential investors." : "Share your investment thesis & what startups you want."}
              </p>
            </div>
            <button onClick={onClose} className="p-2 bg-gray-200 dark:bg-white/10 rounded-full hover:bg-gray-300 dark:hover:bg-white/20 transition-colors">
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && <div className="p-3 rounded-xl bg-red-500/10 text-red-500 text-sm font-medium border border-red-500/20">{error}</div>}

            {isFounder ? (
              // FOUNDER FORM - Asking for funds
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Startup Pitch / Headline</label>
                  <input
                    required
                    value={form.title}
                    onChange={e => setForm({...form, title: e.target.value})}
                    placeholder="e.g. Raising Seed Round for AI SaaS Tool"
                    className="w-full bg-gray-50 dark:bg-[#0f0f13] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-1.5">
                    <Banknote size={14}/> Funds Needed (Aim)
                  </label>
                  <input
                    required
                    value={form.amountText}
                    onChange={e => setForm({...form, amountText: e.target.value})}
                    placeholder="e.g. ₹50L or ₹1Cr+"
                    className="w-full bg-gray-50 dark:bg-[#0f0f13] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Product Description & Traction</label>
                  <textarea
                    required
                    rows={3}
                    value={form.description}
                    onChange={e => setForm({...form, description: e.target.value})}
                    placeholder="Describe your product, current MRR, target audience, and vision..."
                    className="w-full bg-gray-50 dark:bg-[#0f0f13] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 text-gray-900 dark:text-white resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-1.5">
                    <Target size={14}/> What you are Offering (Equity, Safe Notes...)
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={form.promisesOrExpectations}
                    onChange={e => setForm({...form, promisesOrExpectations: e.target.value})}
                    placeholder="e.g. Offering 10% equity at ₹5Cr Post-Money Valuation..."
                    className="w-full bg-gray-50 dark:bg-[#0f0f13] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 text-gray-900 dark:text-white resize-none"
                  />
                </div>
              </div>
            ) : (
              // REGULAR USER (INVESTOR) FORM - Offering funds
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Investment Thesis / Headline</label>
                  <input
                    required
                    value={form.title}
                    onChange={e => setForm({...form, title: e.target.value})}
                    placeholder="e.g. Looking to invest in early-stage fintech / AI"
                    className="w-full bg-gray-50 dark:bg-[#0f0f13] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-1.5">
                    <Banknote size={14}/> Typical Cheque Size / Budget
                  </label>
                  <input
                    required
                    value={form.amountText}
                    onChange={e => setForm({...form, amountText: e.target.value})}
                    placeholder="e.g. ₹10L - ₹50L per startup"
                    className="w-full bg-gray-50 dark:bg-[#0f0f13] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Sectors / Startups Wanted</label>
                  <textarea
                    required
                    rows={3}
                    value={form.description}
                    onChange={e => setForm({...form, description: e.target.value})}
                    placeholder="Describe exactly what type of startups you want to back..."
                    className="w-full bg-gray-50 dark:bg-[#0f0f13] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 text-gray-900 dark:text-white resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-1.5">
                    <Target size={14}/> Expected Returns / Equity
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={form.promisesOrExpectations}
                    onChange={e => setForm({...form, promisesOrExpectations: e.target.value})}
                    placeholder="e.g. Taking 5-8% equity, expecting minimum ₹1L MRR..."
                    className="w-full bg-gray-50 dark:bg-[#0f0f13] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 text-gray-900 dark:text-white resize-none"
                  />
                </div>
              </div>
            )}

            <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4">
              <label className="flex gap-3 items-start cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded text-purple-600 bg-gray-100 dark:bg-[#0f0f13] border-gray-300 dark:border-white/20 focus:ring-purple-500 dark:focus:ring-purple-500 dark:ring-offset-gray-900"
                />
                <div className="space-y-2">
                  <span className="text-sm font-semibold text-red-900 dark:text-red-400 block line-clamp-1">
                    Marketplace Legal Agreement
                  </span>
                  <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1.5 list-disc pl-4">
                    <li>I will not involve any middleware or engage in bad practices (this will result in an immediate permanent ban).</li>
                    <li>The listing information meets website policy protocols. Fake listings will lead to an immediate ban.</li>
                    <li>I certify that all provided information is 100% genuine. Uploading misleading data will permanently restrict your profile reach.</li>
                  </ul>
                </div>
              </label>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || !agreedToTerms}
                className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-3.5 rounded-xl font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : (isFounder ? "Publish Startup Pitch" : "Publish Investment Thesis")}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
