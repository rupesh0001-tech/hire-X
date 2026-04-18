"use client";

import React, { useState } from "react";
import { Plus, Sparkles, Building2, Briefcase, ChevronRight, History, MoreVertical, Search, Target, ArrowRight, Trash2 } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const sampleVersions = [
  { id: "1", company: "Google", role: "Frontend Engineer", resumeName: "FE Optimized V1", status: "Active" },
  { id: "2", company: "Meta", role: "Software Engineer", resumeName: "React Specialization", status: "Applied" },
  { id: "3", company: "Amazon", role: "SDE-1", resumeName: "Cloud Backend Version", status: "Draft" },
];

function VersionCardMenu({ resumeId }: { resumeId: string }) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="relative">
      <button 
        onClick={(e) => {
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
        className="p-2 text-gray-400 hover:text-black dark:hover:text-white transition-colors"
      >
        <MoreVertical size={16} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={(e) => {
                e.preventDefault();
                setIsOpen(false);
              }} 
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -5 }}
              className="absolute right-0 mt-1 w-44 bg-white dark:bg-[#12121a] border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl z-20 py-1.5 overflow-hidden text-left"
            >
              <Link 
                href={`/dashboard/resume-builder?id=${resumeId}`}
                className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
              >
                <Sparkles size={14} className="text-purple-500" /> Edit Version
              </Link>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  console.log("Delete", resumeId);
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-left"
              >
                <Trash2 size={14} /> Delete Target
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ResumeVersionsPage() {
  const [showCompanyModal, setShowCompanyModal] = useState(false);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-2xl font-bold text-black dark:text-white flex items-center gap-2">
            Tailored Versions <span className="text-xl">🎯</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Organize your resumes by company and role for focused applications.</p>
        </motion.div>
      </div>

      {/* Action Buttons Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-gray-50 dark:bg-white/5 p-3 rounded-2xl border border-gray-200 dark:border-white/10">
        <Link href="/dashboard/resume-builder">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-xl font-semibold text-xs uppercase"
          >
             <Plus size={16} /> New Resume
          </motion.button>
        </Link>
        <Link href="/dashboard/resume-builder?magic=true">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl font-semibold text-xs uppercase shadow-lg shadow-purple-500/20"
          >
             <Sparkles size={16} /> Magic Build
          </motion.button>
        </Link>
        <div className="h-6 w-[1px] bg-gray-200 dark:bg-white/10 hidden md:block" />
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowCompanyModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 rounded-xl font-semibold text-xs uppercase hover:border-purple-500 transition-colors shadow-xs"
        >
           <Building2 size={16} /> Add Target
        </motion.button>
      </div>

      {/* Info Tip */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-3 text-sm font-medium text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-500/5 p-4 rounded-xl border border-amber-200 dark:border-amber-500/10"
      >
        <Target size={18} />
        <span>Tailored resumes increase interview chances by up to 60%.</span>
      </motion.div>

      {/* List Section */}
      <div className="space-y-4">
         <div className="flex items-center justify-between">
           <h2 className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Application Targets</h2>
           <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input type="text" placeholder="Filter..." className="pl-9 pr-4 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-xs font-medium outline-none focus:ring-1 focus:ring-purple-500/50 w-40 md:w-56" />
           </div>
         </div>

         <div className="grid grid-cols-1 gap-3">
           {sampleVersions.map((app, idx) => (
             <motion.div 
               key={app.id}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: idx * 0.1 }}
               className="group bg-white dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10 p-4 shadow-xs hover:border-purple-500/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
             >
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-gray-50 dark:bg-white/10 rounded-xl flex items-center justify-center text-gray-400 group-hover:text-purple-500 transition-colors">
                    <Building2 size={20} />
                 </div>
                 <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-black dark:text-white">{app.company}</h4>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                        app.status === 'Active' ? 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400' : 
                        app.status === 'Applied' ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400' : 'bg-gray-100 dark:bg-gray-500/20 text-gray-500'
                      }`}>{app.status}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                       <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Briefcase size={12} className="text-purple-500" /> {app.role}
                       </span>
                       <span className="text-xs text-gray-400 flex items-center gap-1 italic">
                         <History size={12} /> {app.resumeName}
                       </span>
                    </div>
                 </div>
               </div>
               
               <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1.5 px-4 py-2 bg-gray-50 dark:bg-white/10 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all">
                     View <ChevronRight size={14} />
                  </button>
                  <VersionCardMenu resumeId={app.id} />
               </div>
             </motion.div>
           ))}
         </div>
      </div>

      {/* Creation Modal */}
      <AnimatePresence>
        {showCompanyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
             <motion.div 
               initial={{ scale: 0.95, opacity: 0, y: 10 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.95, opacity: 0, y: 10 }}
               className="bg-white dark:bg-[#0c0c0e] rounded-2xl p-8 max-w-md w-full shadow-2xl border border-gray-200 dark:border-white/10 space-y-6"
             >
                <div>
                  <h3 className="text-xl font-bold text-black dark:text-white">Define New Target</h3>
                  <p className="text-sm text-gray-500 mt-1">Link a resume version to a specific company.</p>
                </div>

                <div className="space-y-4">
                   <div className="space-y-1">
                     <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-1">Organization</label>
                     <input type="text" placeholder="e.g. OpenAI" className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-purple-500 outline-none rounded-xl text-sm font-medium transition-all" />
                   </div>
                   <div className="space-y-1">
                     <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-1">Position / Role</label>
                     <input type="text" placeholder="e.g. Senior Frontend" className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-purple-500 outline-none rounded-xl text-sm font-medium transition-all" />
                   </div>
                   <div className="space-y-1">
                     <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-1">Resume Version</label>
                     <select className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-purple-500 outline-none rounded-xl text-sm font-medium cursor-pointer appearance-none">
                       <option>Master Professional Resume</option>
                       <option>Full Stack Developer V2</option>
                     </select>
                   </div>
                </div>

                <div className="flex gap-3 pt-2">
                   <button onClick={() => setShowCompanyModal(false)} className="flex-1 py-3 bg-gray-50 dark:bg-white/5 rounded-xl font-semibold text-sm hover:bg-gray-100 transition-colors">Cancel</button>
                   <button onClick={() => setShowCompanyModal(false)} className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-semibold text-sm shadow-lg shadow-purple-500/20 hover:bg-purple-700 transition-all">Save Target</button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
 }
