import React from 'react';
import { Activity } from 'lucide-react';

export function ActivityFeed() {
  return (
    <div className="lg:col-span-2 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-6 shadow-xs flex flex-col justify-center min-h-[250px] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.05),transparent_50%)] pointer-events-none" />
        <div className="text-center z-10 flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border border-black/5 dark:border-white/10 bg-gray-50 dark:bg-black/20 flex items-center justify-center mb-4 text-purple-500">
            <Activity size={24} />
          </div>
          <h3 className="text-lg font-medium text-black dark:text-white mb-2">No recent generation activity.</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">Start building a resume or generating a cover letter to see your statistics dashboard populate here.</p>
        </div>
    </div>
  );
}
