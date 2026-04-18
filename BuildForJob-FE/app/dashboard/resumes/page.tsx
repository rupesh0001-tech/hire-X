"use client";

import React from "react";
import { Plus, Sparkles, FileText, Download, Eye, MoreVertical, Trash2, Calendar, FilePlus } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button1 } from "@/components/general/buttons/button1";

const sampleResumes = [
  { id: "1", name: "Full Stack Developer", updatedAt: "2 hours ago", template: "Classic Professional" },
  { id: "2", name: "Software Engineer - Google", updatedAt: "Yesterday", template: "Modern Sleek" },
  { id: "3", name: "React Developer Resume", updatedAt: "3 days ago", template: "Creative Grid" },
];

function ResumeCardMenu({ resumeId }: { resumeId: string }) {
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
                href={`/dashboard/resume-builder?id=${resumeId}`}
                className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
              >
                <Sparkles size={14} className="text-purple-500" /> Edit Project
              </Link>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  console.log("Delete", resumeId);
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

export default function ResumesPage() {
  const [showModal, setShowModal] = React.useState(false);
  const [isMagic, setIsMagic] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [company, setCompany] = React.useState("");

  const handleStart = (magic: boolean) => {
    setIsMagic(magic);
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
            My Resumes <span className="text-xl">📄</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage, edit, and create new versions of your professional resume.</p>
        </motion.div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div 
          whileHover={{ y: -2 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-gray-200 dark:border-white/10 shadow-sm flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="w-12 h-12 bg-purple-50 dark:bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400">
               <FilePlus size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-black dark:text-white">Manual Builder</h3>
              <p className="text-sm text-gray-500 mt-1">Start with a blank canvas and build your resume from scratch.</p>
            </div>
          </div>
          <button onClick={() => handleStart(false)} className="mt-8">
            <Button1 className="w-full py-3 rounded-xl flex items-center justify-center gap-2 font-semibold">
               Create New Resume <Plus size={16} />
            </Button1>
          </button>
        </motion.div>

        <motion.div 
          whileHover={{ y: -2 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-purple-600 rounded-2xl p-6 text-white shadow-lg shadow-purple-500/20 relative overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl -mr-16 -mt-16" />
          <div className="relative space-y-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
               <Sparkles size={24} className="text-yellow-300" />
            </div>
            <div>
              <h3 className="text-lg font-semibold tracking-tight">Profile-to-Resume</h3>
              <p className="text-sm text-purple-100/80 mt-1 font-medium italic leading-relaxed">Instantly create a professional resume based on your profile data.</p>
            </div>
          </div>
          <button onClick={() => handleStart(true)} className="mt-8 relative z-10">
            <button className="w-full py-3 bg-white text-purple-600 rounded-xl font-semibold hover:bg-gray-50 active:scale-95 transition-all shadow-sm flex items-center justify-center gap-2">
               Create via Profile <Plus size={16} />
            </button>
          </button>
        </motion.div>
      </div>

      {/* Past Resumes Section */}
      <div className="space-y-4">
         <h2 className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Recent Creations</h2>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {sampleResumes.map((resume, idx) => (
             <motion.div 
               key={resume.id}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: idx * 0.1 }}
               className="group bg-white dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10 p-5 shadow-xs hover:border-purple-500/50 transition-all"
             >
               <div className="flex items-start justify-between mb-4">
                 <div className="p-3 bg-gray-50 dark:bg-white/10 rounded-xl group-hover:text-purple-500 transition-colors">
                   <FileText size={20} />
                 </div>
                 <ResumeCardMenu resumeId={resume.id} />
               </div>
               
               <div className="space-y-1">
                 <h4 className="font-semibold text-black dark:text-white line-clamp-1">{resume.name}</h4>
                 <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar size={12} />
                    <span>Edited {resume.updatedAt}</span>
                 </div>
               </div>

               <div className="mt-6 flex gap-2 pt-4 border-t border-gray-100 dark:border-white/5">
                 <button className="flex-1 flex items-center justify-center gap-2 p-2 bg-gray-50 dark:bg-white/10 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/20 transition-all">
                   <Eye size={14} /> View
                 </button>
                 <button className="flex-1 flex items-center justify-center gap-2 p-2 bg-purple-50 dark:bg-purple-500/10 rounded-lg text-xs font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-500 hover:text-white transition-all">
                   <Download size={14} /> PDF
                 </button>
               </div>
             </motion.div>
           ))}

           {/* Add New Mock Card */}
           <button onClick={() => handleStart(false)} className="group text-left">
             <div className="h-full min-h-[220px] rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/10 flex flex-col items-center justify-center gap-3 text-gray-400 group-hover:text-purple-500 group-hover:border-purple-500/50 transition-all bg-gray-50/50 dark:bg-white/5">
                <Plus size={24} />
                <span className="font-semibold uppercase tracking-wider text-xs">New Resume</span>
             </div>
           </button>
         </div>
      </div>

      {/* New Resume Modal */}
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
                <p className="text-sm text-gray-500 mt-1">Set a name for your new resume project.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-1">Resume Title *</label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Senior Backend Engineer" 
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-purple-500 outline-none rounded-xl text-sm font-medium transition-all" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-1">Company Name (Optional)</label>
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
                  href={`/dashboard/resume-builder?title=${encodeURIComponent(title)}${company ? `&company=${encodeURIComponent(company)}` : ""}${isMagic ? "&magic=true" : ""}`}
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
