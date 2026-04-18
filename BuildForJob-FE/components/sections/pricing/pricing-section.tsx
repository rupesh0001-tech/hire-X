"use client";
import React, { useState } from "react";
import { Check } from "lucide-react";

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <section id="pricing" className="py-24 max-w-7xl mx-auto px-6 border-t border-black/5 dark:border-white/5 mt-12">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-bold mb-6 text-black dark:text-white">Simple, transparent pricing.</h2>
        <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto mb-8">Start for free. Upgrade when you need more power to land your dream job faster.</p>
        
        <div className="inline-flex items-center gap-2 p-1 bg-gray-100 dark:bg-white/5 rounded-full border border-black/5 dark:border-white/10">
          <button 
            onClick={() => setIsAnnual(false)}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${!isAnnual ? 'bg-white dark:bg-black text-black dark:text-white shadow-xs' : 'text-gray-500 hover:text-black dark:hover:text-white'}`}
          >
            Monthly
          </button>
          <button 
            onClick={() => setIsAnnual(true)}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${isAnnual ? 'bg-white dark:bg-black text-black dark:text-white shadow-xs' : 'text-gray-500 hover:text-black dark:hover:text-white'}`}
          >
            Annually <span className="text-[10px] bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Save 20%</span>
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
        <div className="p-8 rounded-3xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 flex flex-col">
          <h3 className="text-xl font-bold text-black dark:text-white mb-2">Starter</h3>
          <p className="text-gray-500 text-sm mb-6">Perfect to test the waters</p>
          <div className="mb-6">
            <span className="text-4xl font-extrabold text-black dark:text-white">$0</span>
            <span className="text-gray-500"> / forever</span>
          </div>
          <button className="w-full py-3 px-6 rounded-full bg-gray-100 dark:bg-white/10 text-black dark:text-white font-semibold hover:bg-gray-200 dark:hover:bg-white/20 transition-colors mb-8">
            Start Building
          </button>
          <ul className="space-y-4 mb-8 flex-1">
            {["1 Resume Template", "Basic PDF Export", "Grammar Check", "Community Support"].map((f, i) => (
              <li key={i} className="flex flex-start gap-3 text-sm text-gray-600 dark:text-gray-300">
                <Check className="text-gray-400 shrink-0 mt-0.5" size={16} /> {f}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="p-8 rounded-3xl bg-black dark:bg-[#111116] border border-black dark:border-purple-500/30 shadow-2xl shadow-purple-900/20 flex flex-col relative transform md:-translate-y-4">
          <div className="absolute top-0 inset-x-0 h-1 bg-linear-to-r from-purple-500 to-emerald-500 rounded-t-3xl" />
          <div className="absolute top-0 right-8 transform -translate-y-1/2">
            <span className="bg-linear-to-r from-purple-500 to-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">MOST POPULAR</span>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Pro</h3>
          <p className="text-gray-400 text-sm mb-6">Everything you need to get hired</p>
          <div className="mb-6">
            <span className="text-4xl font-extrabold text-white">${isAnnual ? '12' : '15'}</span>
            <span className="text-gray-400"> / mo</span>
          </div>
          <button className="w-full py-3 px-6 rounded-full bg-white text-black font-semibold hover:bg-gray-100 transition-colors mb-8 shadow-[0_0_20px_rgba(255,255,255,0.3)]">
            Upgrade to Pro
          </button>
          <ul className="space-y-4 mb-4 flex-1">
            {["Unlimited AI Rewrites", "All Premium Templates", "ATS Score Analysis", "Cover Letter Generator", "GitHub Portfolio Sync", "Priority Support"].map((f, i) => (
              <li key={i} className="flex flex-start gap-3 text-sm text-gray-300">
                <Check className="text-emerald-400 shrink-0 mt-0.5" size={16} /> {f}
              </li>
            ))}
          </ul>
        </div>

        <div className="p-8 rounded-3xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 flex flex-col">
          <h3 className="text-xl font-bold text-black dark:text-white mb-2">Lifetime</h3>
          <p className="text-gray-500 text-sm mb-6">Pay once, use forever</p>
          <div className="mb-6">
            <span className="text-4xl font-extrabold text-black dark:text-white">$199</span>
            <span className="text-gray-500"> / one-time</span>
          </div>
          <button className="w-full py-3 px-6 rounded-full bg-gray-100 dark:bg-white/10 text-black dark:text-white font-semibold hover:bg-gray-200 dark:hover:bg-white/20 transition-colors mb-8">
            Get Lifetime Access
          </button>
          <ul className="space-y-4 mb-8 flex-1">
            {["Everything in Pro", "Future Updates Included", "Early Access to features", "1-on-1 Profile Review"].map((f, i) => (
              <li key={i} className="flex flex-start gap-3 text-sm text-gray-600 dark:text-gray-300">
                <Check className="text-gray-400 shrink-0 mt-0.5" size={16} /> {f}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
