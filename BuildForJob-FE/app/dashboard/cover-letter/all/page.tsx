"use client";

import React from "react";
import { Plus, Mail, Download, Eye, MoreVertical, Calendar, FileText, Search, Sparkles, Building2, Trash2 } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const sampleCoverLetters = [
  { id: "1", name: "Cover Letter - J.P. Morgan", recipient: "Hiring Manager", company: "J.P. Morgan", updatedAt: "1 hour ago" },
  { id: "2", name: "Standard Professional CL", recipient: "HR Team", company: "Generic Tech", updatedAt: "Yesterday" },
  { id: "3", name: "UX Design Application", recipient: "Design Lead", company: "Adobe", updatedAt: "Last week" },
];

function CoverLetterCardMenu({ clId }: { clId: string }) {
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
              className="absolute right-0 mt-1 w-44 bg-white dark:bg-[#12121a] border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl z-20 py-1.5 overflow-hidden"
            >
              <Link 
                href={`/dashboard/cover-letter?id=${clId}`}
                className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
              >
                <Sparkles size={14} className="text-purple-500" /> Edit Letter
              </Link>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  console.log("Delete", clId);
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-left"
              >
                <Trash2 size={14} /> Delete
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AllCoverLettersPage() {
  const [showModal, setShowModal] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [company, setCompany] = React.useState("");

  const handleStart = () => {
    setShowModal(true);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-2xl font-bold text-black dark:text-white flex items-center gap-2">
            My Cover Letters <span className="text-xl">✉️</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Review and manage your personalized cover letters.</p>
        </motion.div>
        
        <button onClick={handleStart}>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold text-xs uppercase shadow-lg shadow-purple-500/20"
          >
             <Plus size={18} /> New Letter
          </motion.button>
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Total Letters", value: "12", icon: Mail, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10" },
          { label: "Drafts", value: "3", icon: FileText, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-500/10" },
          { label: "Sent / Applied", value: "9", icon: Sparkles, color: "text-green-500", bg: "bg-green-50 dark:bg-green-500/10" },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-white/5 p-5 rounded-2xl border border-gray-200 dark:border-white/10 flex items-center gap-4 shadow-xs">
             <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={20} />
             </div>
             <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                <p className="text-xl font-bold text-black dark:text-white">{stat.value}</p>
             </div>
          </div>
        ))}
      </div>

      {/* List Section */}
      <div className="space-y-4">
         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
           <h2 className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Document Library</h2>
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input type="text" placeholder="Filter..." className="pl-9 pr-4 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-xs font-medium outline-none focus:ring-1 focus:ring-purple-500/50 w-full sm:w-64" />
           </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {sampleCoverLetters.map((cl, idx) => (
             <motion.div 
               key={cl.id}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: idx * 0.1 }}
               className="group bg-white dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10 p-6 shadow-xs hover:border-purple-500/50 transition-all flex flex-col justify-between min-h-[220px]"
             >
               <div className="space-y-4">
                 <div className="flex items-start justify-between">
                   <div className="p-3 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl">
                     <Mail size={20} />
                   </div>
                   <CoverLetterCardMenu clId={cl.id} />
                 </div>
                 
                 <div className="space-y-1">
                   <h4 className="font-semibold text-black dark:text-white line-clamp-1">{cl.name}</h4>
                   <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Building2 size={12} className="text-purple-500" /> {cl.company}
                   </p>
                 </div>
               </div>

               <div className="mt-6 flex flex-col gap-3 pt-4 border-t border-gray-100 dark:border-white/5">
                 <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    <span className="flex items-center gap-1"><Calendar size={12} /> {cl.updatedAt}</span>
                    <span className="text-green-500">SAVED</span>
                 </div>
                 <div className="flex gap-2">
                   <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-gray-50 dark:bg-white/10 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-black hover:text-white transition-all">
                     View
                   </button>
                   <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-purple-50 dark:bg-purple-500/10 rounded-lg text-xs font-semibold text-purple-600 dark:text-purple-400 hover:bg-purple-600 hover:text-white transition-all">
                     PDF
                   </button>
                 </div>
               </div>
             </motion.div>
           ))}
           
           {/* Add New Mock Card */}
           <button onClick={handleStart} className="group text-left">
             <div className="h-full min-h-[220px] rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/10 flex flex-col items-center justify-center gap-3 text-gray-400 group-hover:text-purple-500 group-hover:border-purple-500/50 transition-all bg-gray-50/50 dark:bg-white/5">
                <Plus size={24} />
                <span className="font-semibold uppercase tracking-wider text-xs">New Letter</span>
             </div>
           </button>
         </div>
      </div>

      {/* New Letter Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-white dark:bg-[#0c0c0e] rounded-2xl p-8 max-w-md w-full shadow-2xl border border-gray-200 dark:border-white/10 space-y-6"
            >
              <div>
                <h3 className="text-xl font-bold text-black dark:text-white">Project Details</h3>
                <p className="text-sm text-gray-500 mt-1">Set a name for your new cover letter project.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-1">Letter Title *</label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Senior Backend Engineer Application" 
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-purple-500 outline-none rounded-xl text-sm font-medium transition-all" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-1">Recipient Company (Optional)</label>
                  <input 
                    type="text" 
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Google" 
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-purple-500 outline-none rounded-xl text-sm font-medium transition-all" 
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setShowModal(false)} 
                  className="flex-1 py-3 bg-gray-50 dark:bg-white/5 rounded-xl font-semibold text-sm hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <Link 
                  href={`/dashboard/cover-letter?title=${encodeURIComponent(title)}${company ? `&company=${encodeURIComponent(company)}` : ""}`}
                  className={`flex-1 overflow-hidden rounded-xl ${!title ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  <button 
                    className="w-full py-3 bg-purple-600 text-white font-semibold text-sm shadow-lg shadow-purple-500/20 hover:bg-purple-700 transition-all"
                  >
                    Continue
                  </button>
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
