import React from 'react';
import { FilePlus, Edit, MonitorUp } from 'lucide-react';

const actions = [
  {
    title: "Create Resume",
    desc: "Build a new targeted ATS-friendly resume from scratch.",
    icon: <FilePlus size={20} />,
    color: "purple",
    href: "/dashboard/resumes/builder"
  },
  {
    title: "Write Cover Letter",
    desc: "Generate a custom AI cover letter for your next job.",
    icon: <Edit size={20} />,
    color: "blue",
    href: "/dashboard/cover-letters/builder"
  },
  {
    title: "GitHub Portfolio",
    desc: "Sync repositories into a stunning web portfolio.",
    icon: <MonitorUp size={20} />,
    color: "emerald",
    href: "/dashboard/portfolio/create"
  }
];

export function QuickActions() {
  return (
    <div className="mb-10">
      <h2 className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {actions.map((action) => (
          <button 
            key={action.title}
            className="text-left flex flex-col items-start p-6 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 hover:border-purple-500/50 dark:hover:border-purple-500/50 transition-all group shadow-xs cursor-pointer"
          >
            <div className={`p-3 rounded-xl transition-all group-hover:scale-110
              ${action.color === 'purple' ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400' : ''}
              ${action.color === 'blue' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' : ''}
              ${action.color === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : ''}
              mb-4`}>
              {action.icon}
            </div>
            <h3 className="font-semibold text-black dark:text-white mb-1">{action.title}</h3>
            <p className="text-sm text-gray-500 text-left">{action.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
