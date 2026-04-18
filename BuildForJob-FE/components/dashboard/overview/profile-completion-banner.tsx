"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useAppSelector } from '@/store/hooks';

export function ProfileCompletionBanner() {
  const { user } = useAppSelector((state) => state.auth);

  if (!user) return null;

  const calculateCompletion = () => {
    if (!user) return 0;
    let score = 0;
    
    // Basic Info (30%) - strictly non-social fields
    const basicFields = ['firstName', 'lastName', 'phone', 'location', 'jobTitle', 'bio'];
    const filledBasicCount = basicFields.filter(f => !!(user as any)[f]).length;
    score += (filledBasicCount / basicFields.length) * 30;

    // Sections (70%) - weighted by career importance
    if ((user.experience?.length || 0) > 0) score += 20;
    if ((user.education?.length || 0) > 0) score += 20;
    if ((user.projects?.length || 0) > 0) score += 15;
    
    // Skills (15%) - requires at least 3 for full marks
    const skillCount = user.skills?.length || 0;
    if (skillCount >= 3) score += 15;
    else if (skillCount > 0) score += 5;

    return Math.min(100, Math.round(score));
  };

  const completionPercent = calculateCompletion();

  const isComplete = completionPercent >= 100;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`mb-8 relative overflow-hidden rounded-2xl border p-6 backdrop-blur-sm ${
          isComplete 
          ? "bg-linear-to-r from-green-500/10 via-emerald-500/10 to-green-500/10 border-green-500/30 shadow-lg shadow-green-500/10" 
          : "bg-linear-to-r from-purple-500/10 via-blue-500/10 to-purple-500/10 border-purple-500/20"
        }`}
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              isComplete ? "bg-green-500/20 text-green-500" : "bg-purple-500/20 text-purple-500"
            }`}>
              {isComplete ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-black dark:text-white">
                {isComplete ? "Profile Unlocked & Ready!" : "Complete your profile"}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isComplete 
                  ? "Your profile is 100% complete. You can now use the Magic Builder to generate documents in one go." 
                  : `You've completed ${completionPercent}% of your profile. A complete profile helps you build better resumes.`
                }
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 w-full md:w-auto">
            {!isComplete && (
              <div className="flex-1 md:w-48">
                <div className="h-2 w-full bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${completionPercent}%` }}
                    className="h-full bg-linear-to-r from-purple-500 to-blue-500"
                  />
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className="text-[10px] font-bold text-gray-400 tracking-wider">PROGRESS</span>
                  <span className="text-[10px] font-bold text-purple-500">{completionPercent}%</span>
                </div>
              </div>
            )}
            
            <Link 
              href={isComplete ? "/dashboard/resume-builder?magic=true" : "/dashboard/settings/profile"}
              className={`flex items-center gap-2 px-6 py-3 transition-all rounded-2xl text-sm font-bold shadow-sm whitespace-nowrap ${
                isComplete 
                ? "bg-green-600 text-white hover:bg-green-700 hover:scale-[1.02] active:scale-95 shadow-green-500/20" 
                : "bg-white dark:bg-white/10 hover:bg-purple-500 hover:text-white dark:hover:bg-purple-500"
              }`}
            >
              {isComplete ? (
                <>✨ Magic Build (1-Click)</>
              ) : (
                <>Finish Profile <ArrowRight size={16} /></>
              )}
            </Link>
          </div>
        </div>

        {/* Decorative elements */}
        {isComplete ? (
          <>
            <div className="absolute top-0 right-0 -transtion-y-1/2 translate-x-1/2 w-64 h-64 bg-green-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 transtion-y-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          </>
        ) : (
          <>
            <div className="absolute top-0 right-0 -transtion-y-1/2 translate-x-1/2 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 transtion-y-1/2 -translate-x-1/2 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
