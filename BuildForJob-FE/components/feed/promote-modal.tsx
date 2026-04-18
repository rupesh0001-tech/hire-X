"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Zap, TrendingUp, Star, CheckCircle2, Loader2, Crown, Sparkles,
} from "lucide-react";
import { postsApi, Post } from "@/apis/posts.api";

interface PromoteModalProps {
  post: Post;
  onClose: () => void;
  onPromoted: (postId: string) => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function PromoteModal({ post, onClose, onPromoted }: PromoteModalProps) {
  const [step, setStep] = useState<"info" | "paying" | "success">("info");
  const [error, setError] = useState<string | null>(null);

  const loadRazorpayScript = (): Promise<boolean> =>
    new Promise((resolve) => {
      if (window.Razorpay) { resolve(true); return; }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handlePay = async () => {
    setStep("paying");
    setError(null);
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error("Razorpay SDK failed to load. Check your connection.");

      const orderRes = await postsApi.createPromotionOrder(post.id);
      if (!orderRes.success) throw new Error("Could not create payment order");

      const { orderId, amount, currency, keyId } = orderRes.data;

      await new Promise<void>((resolve, reject) => {
        const rzp = new window.Razorpay({
          key: keyId,
          amount,
          currency,
          order_id: orderId,
          name: "BuiltForJob",
          description: "Smart Post Promotion — 7 Days",
          image: "https://api.dicebear.com/8.x/initials/svg?seed=BFJ&backgroundColor=6366f1&fontColor=ffffff",
          handler: async (response: any) => {
            try {
              const verifyRes = await postsApi.verifyPromotion({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                postId: post.id,
              });
              if (verifyRes.success) {
                setStep("success");
                onPromoted(post.id);
                resolve();
              } else {
                reject(new Error("Payment verification failed"));
              }
            } catch (e: any) {
              reject(e);
            }
          },
          prefill: {},
          theme: { color: "#7C3AED" },
          modal: {
            ondismiss: () => {
              setStep("info");
              reject(new Error("Payment cancelled"));
            },
          },
        });
        rzp.open();
      });
    } catch (e: any) {
      if (e.message !== "Payment cancelled") {
        setError(e.message || "Something went wrong");
      }
      if (step !== "success") setStep("info");
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={step === "paying" ? undefined : onClose}
        />

        {/* Modal */}
        <motion.div
          className="relative w-full max-w-md"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          {step === "success" ? (
            /* ── Success State ─────────────────────── */
            <div className="rounded-2xl bg-white dark:bg-[#111] border border-green-500/30 p-8 text-center shadow-2xl shadow-green-500/10">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/30">
                <CheckCircle2 size={36} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                🎉 Post Promoted!
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                Your post is now <span className="text-purple-500 font-semibold">Sponsored</span> and will appear at the top of the feed for the next <span className="font-semibold">7 days</span>.
              </p>
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 text-white font-semibold hover:opacity-90 transition-opacity"
              >
                Awesome, thanks!
              </button>
            </div>
          ) : (
            /* ── Info / Payment State ──────────────── */
            <div className="rounded-2xl bg-white dark:bg-[#111] border border-white/10 shadow-2xl shadow-purple-900/20 overflow-hidden">
              {/* Header */}
              <div className="relative bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 p-6 pb-8">
                <button
                  onClick={onClose}
                  disabled={step === "paying"}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
                >
                  <X size={15} />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Zap size={22} className="text-yellow-300" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Smart Promotion</h2>
                    <p className="text-purple-200 text-xs">Supercharge your reach</p>
                  </div>
                </div>

                {/* Floating badge */}
                <div className="absolute -bottom-4 right-6 flex items-center gap-1 bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                  <Crown size={11} />
                  Sponsored
                </div>
              </div>

              <div className="p-6 pt-8">
                {/* Post preview */}
                <div className="mb-5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-3">
                  <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide font-semibold">Your post</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                    {post.content || (post.imageUrl ? "📷 Image post" : "Post")}
                  </p>
                </div>

                {/* Benefits */}
                <div className="space-y-3 mb-6">
                  {[
                    { icon: TrendingUp, text: "Pinned to the top of the Feed", color: "text-purple-500" },
                    { icon: Star, text: "Tagged as Sponsored — more trust", color: "text-amber-500" },
                    { icon: Sparkles, text: "Active for 7 full days", color: "text-blue-500" },
                  ].map(({ icon: Icon, text, color }) => (
                    <div key={text} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center ${color}`}>
                        <Icon size={15} />
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{text}</span>
                    </div>
                  ))}
                </div>

                {/* Price */}
                <div className="rounded-2xl bg-gradient-to-r from-purple-500/10 to-violet-500/10 border border-purple-500/20 p-4 mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">One-time payment</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">₹1,000</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-purple-500 font-semibold">7 Days</p>
                    <p className="text-xs text-gray-400">≈ ₹143/day</p>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <p className="text-xs text-red-500 mb-3 bg-red-50 dark:bg-red-500/10 rounded-xl px-3 py-2">
                    {error}
                  </p>
                )}

                {/* CTA */}
                <button
                  onClick={handlePay}
                  disabled={step === "paying"}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 text-white font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-purple-500/25 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {step === "paying" ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Opening Payment…
                    </>
                  ) : (
                    <>
                      <Zap size={16} className="text-yellow-300" />
                      Pay ₹1,000 & Promote
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-gray-400 mt-3 flex items-center justify-center gap-1">
                  🔒 Secured by Razorpay · Test mode
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
