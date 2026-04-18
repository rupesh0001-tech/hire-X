import React from 'react';
import { Sparkles } from 'lucide-react';
import { Button1 } from "@/components/general/buttons/button1";

const stats = [
  { name: "AI Rewrites", current: 12, total: 50, color: "bg-purple-500" },
  { name: "ATS Scans", current: 4, total: 10, color: "bg-blue-500" },
  { name: "Portfolios Rendered", current: 1, total: 3, color: "bg-emerald-500" },
];

export function StatsTracker() {
  return (
    <div className="lg:col-span-1 rounded-2xl border border-gray-200 dark:border-white/10 bg-linear-to-b from-purple-50/50 to-white dark:from-purple-900/10 dark:to-transparent p-6 shadow-xs flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-medium mb-6">
          <span className="animate-pulse"><Sparkles size={18} /></span> Pro Limits Tracker
        </div>
        
        <div className="space-y-6">
          {stats.map((stat) => (
            <div key={stat.name}>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-300">{stat.name}</span>
                <span className="font-medium text-black dark:text-white">{stat.current} / {stat.total}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
                <div 
                  className={`h-full ${stat.color} rounded-full transition-all duration-1000`} 
                  style={{ width: `${(stat.current / stat.total) * 100}%` }} 
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <Button1 className="w-full mt-8 shadow-lg shadow-black/10 dark:shadow-white/5 py-3">
        Upgrade Plan
      </Button1>
    </div>
  );
}
