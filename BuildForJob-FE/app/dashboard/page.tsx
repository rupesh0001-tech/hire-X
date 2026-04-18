"use client";
import React from 'react';
import { OverviewHeader } from "@/components/dashboard/overview/overview-header";
import { QuickActions } from "@/components/dashboard/overview/quick-actions";
import { ActivityFeed } from "@/components/dashboard/overview/activity-feed";
import { StatsTracker } from "@/components/dashboard/overview/stats-tracker";
import { useAppSelector } from "@/store/hooks";

import { ProfileCompletionBanner } from "@/components/dashboard/overview/profile-completion-banner";
import { MagicBuilder } from "@/components/dashboard/overview/magic-builder";

export default function DashboardOverviewPage() {
  const { user } = useAppSelector((state) => state.auth);

  const calculateCompletion = () => {
    if (!user) return 0;
    let score = 0;
    const basicFields = ['firstName', 'lastName', 'phone', 'location', 'jobTitle', 'bio'];
    const filledBasicCount = basicFields.filter(f => !!(user as any)[f]).length;
    score += (filledBasicCount / basicFields.length) * 30;
    if ((user.experience?.length || 0) > 0) score += 20;
    if ((user.education?.length || 0) > 0) score += 20;
    if ((user.projects?.length || 0) > 0) score += 15;
    const skillCount = user.skills?.length || 0;
    if (skillCount >= 3) score += 15;
    else if (skillCount > 0) score += 5;
    return Math.min(100, Math.round(score));
  };

  const completionPercent = calculateCompletion();
  
  return (
    <div className="max-w-6xl mx-auto animation-fade-in pb-12">
      <ProfileCompletionBanner />
      {/* {completionPercent >= 100 && <MagicBuilder />} */}
      <OverviewHeader name={user?.firstName || "there"} />
      <QuickActions />

      <h2 className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">Recent Activity & Stats</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <ActivityFeed />
         <StatsTracker />
      </div>
    </div>
  );
}
