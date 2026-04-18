"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Github, X, Check, ArrowRight, Save, Info, RefreshCw, 
  AlertTriangle, User as UserIcon, Code 
} from 'lucide-react';
import { Button1 } from '@/components/general/buttons/button1';

interface GithubData {
  profile: {
    name: string;
    bio: string;
    avatar: string;
    location: string;
    html_url: string;
    company: string;
    blog: string;
  };
  skills: string[];
  projects: any[];
}

interface GithubSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  githubData: GithubData;
  currentData: any;
  onSync: (mergedData: any) => void;
}

export function GithubSyncModal({ isOpen, onClose, githubData, currentData, onSync }: GithubSyncModalProps) {
  const [selectedFields, setSelectedFields] = useState<Record<string, 'current' | 'github'>>({
    name: 'github',
    bio: 'github',
    location: 'github',
    website: 'github'
  });

  const [selectedProjects, setSelectedProjects] = useState<string[]>(
    githubData?.projects ? githubData.projects.map((p: any) => p.name) : []
  );

  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    Array.from(new Set(githubData?.skills || []))
  );

  if (!isOpen) return null;

  const handleMerge = () => {
    const nameParts = (githubData.profile.name || "").split(" ");
    const githubFirstName = nameParts[0] || "";
    const githubLastName = nameParts.slice(1).join(" ") || "";

    const mergedData = { ...currentData };

    // 1. Personal Info & Connection Merge
    mergedData.socialLinks = { 
      ...(mergedData.socialLinks || {}), 
      github: githubData.profile.html_url 
    };

    if (selectedFields.name === 'github') {
      mergedData.firstName = githubFirstName;
      mergedData.lastName = githubLastName;
    }
    if (selectedFields.bio === 'github') mergedData.bio = githubData.profile.bio;
    if (selectedFields.location === 'github') mergedData.location = githubData.profile.location;
    if (selectedFields.website === 'github') mergedData.socialLinks.website = githubData.profile.blog;

    // 2. Projects Merge (Replace Synced ones)
    const newProjects = githubData.projects
      .filter((p) => selectedProjects.includes(p.name))
      .map(p => ({
        name: p.name,
        description: p.description || "",
        techStack: p.tech || "",
        url: p.github_url || p.url || "",
        isGithubSynced: true
      }));
    
    // Remove existing synced projects first to avoid duplicates/stale data
    const nonSyncedProjects = (mergedData.projects || []).filter((p: any) => !p.isGithubSynced);
    mergedData.projects = [...nonSyncedProjects, ...newProjects];

    // 3. Skills Merge (Replace Synced ones - uniqueness already handled in selection)
    // Filter out existing synced skills
    const nonSyncedSkills = (mergedData.skills || []).filter((s: any) => !s.isGithubSynced);
    
    const newSkills = selectedSkills.map(s => ({ 
      name: s,
      isGithubSynced: true
    }));

    mergedData.skills = [...nonSyncedSkills, ...newSkills];

    onSync(mergedData);
    onClose();
  };

  const nameParts = (githubData.profile.name || "").split(" ");
  const githubFirstName = nameParts[0] || "";
  const githubLastName = nameParts.slice(1).join(" ") || "";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white dark:bg-[#0c0c0e] w-full max-w-4xl max-h-[90vh] rounded-[32px] border border-gray-200 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-linear-to-r from-purple-500/5 to-transparent">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-black dark:bg-white/10 flex items-center justify-center text-white">
                <Github size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-black dark:text-white">Sync GitHub Profile</h3>
                <p className="text-sm text-gray-500">Review and merge your GitHub data into your profile</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors">
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
            
            {/* 1. Personal Info Section */}
            <section className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <UserIcon size={16} />
                </div>
                <h4 className="font-bold text-black dark:text-white uppercase tracking-wider text-xs">Personal Info Conflicts</h4>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {[
                  { id: 'name', label: 'Display Name', current: `${currentData.firstName} ${currentData.lastName}`, github: `${githubFirstName} ${githubLastName}` },
                  { id: 'bio', label: 'Bio / Summary', current: currentData.bio, github: githubData.profile.bio },
                  { id: 'location', label: 'Location', current: currentData.location, github: githubData.profile.location },
                  { id: 'website', label: 'Website / Portfolio', current: currentData.socialLinks.website, github: githubData.profile.blog }
                ].map(field => (
                  <div key={field.id} className="group relative bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden transition-all hover:border-purple-500/30">
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Current Option */}
                      <button 
                        onClick={() => setSelectedFields(prev => ({ ...prev, [field.id]: 'current' }))}
                        className={`p-4 rounded-xl border-2 transition-all text-left relative ${
                          selectedFields[field.id] === 'current' 
                          ? 'border-purple-500 bg-purple-500/5' 
                          : 'border-transparent bg-white dark:bg-black/20 hover:border-gray-300 dark:hover:border-white/10'
                        }`}
                      >
                        <span className="text-[10px] font-bold text-gray-400 uppercase flex mb-1">CURRENT PROFILE</span>
                        <p className="text-sm font-medium text-black dark:text-white line-clamp-2">{field.current || "Not set"}</p>
                        {selectedFields[field.id] === 'current' && <div className="absolute top-2 right-2 text-purple-500"><Check size={16} /></div>}
                      </button>

                      {/* GitHub Option */}
                      <button 
                        onClick={() => setSelectedFields(prev => ({ ...prev, [field.id]: 'github' }))}
                        className={`p-4 rounded-xl border-2 transition-all text-left relative ${
                          selectedFields[field.id] === 'github' 
                          ? 'border-blue-500 bg-blue-500/5' 
                          : 'border-transparent bg-white dark:bg-black/20 hover:border-gray-300 dark:hover:border-white/10'
                        }`}
                      >
                        <span className="text-[10px] font-bold text-blue-500 uppercase flex items-center gap-1 mb-1">
                          <Github size={10} /> GITHUB INFO
                        </span>
                        <p className="text-sm font-medium text-black dark:text-white line-clamp-2">{field.github || "Not set"}</p>
                        {selectedFields[field.id] === 'github' && <div className="absolute top-2 right-2 text-blue-500"><Check size={16} /></div>}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 2. Projects Section */}
            <section className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
                    <Code size={16} />
                  </div>
                  <h4 className="font-bold text-black dark:text-white uppercase tracking-wider text-xs">Import Projects ({githubData.projects.length})</h4>
                </div>
                <button 
                  onClick={() => setSelectedProjects(selectedProjects.length === githubData.projects.length ? [] : githubData.projects.map((p: any) => p.name))}
                  className="text-[10px] font-bold text-purple-500 hover:underline"
                >
                  {selectedProjects.length === githubData.projects.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {githubData.projects.map((proj) => (
                  <button
                    key={proj.name}
                    onClick={() => {
                      if (selectedProjects.includes(proj.name)) {
                        setSelectedProjects(selectedProjects.filter(name => name !== proj.name));
                      } else {
                        setSelectedProjects([...selectedProjects, proj.name]);
                      }
                    }}
                    className={`p-4 rounded-2xl border transition-all text-left group flex items-start gap-4 ${
                      selectedProjects.includes(proj.name)
                      ? 'bg-purple-500/5 border-purple-500'
                      : 'bg-white dark:bg-white/5 border-gray-100 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/10'
                    }`}
                  >
                    <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      selectedProjects.includes(proj.name) ? 'bg-purple-500 border-purple-500 text-white' : 'border-gray-300 dark:border-white/20'
                    }`}>
                      {selectedProjects.includes(proj.name) && <Check size={12} />}
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-black dark:text-white group-hover:text-purple-500 transition-colors uppercase tracking-tight">{proj.name}</h5>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-1">{proj.description}</p>
                      {proj.tech && (
                        <span className="inline-block mt-2 px-2 py-0.5 rounded-md bg-gray-100 dark:bg-white/5 text-[10px] font-medium text-gray-500">
                          {proj.tech}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* 3. Skills Section */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500">
                  <RefreshCw size={16} />
                </div>
                <h4 className="font-bold text-black dark:text-white uppercase tracking-wider text-xs">Top GitHub Skills</h4>
              </div>

              <div className="flex flex-wrap gap-2">
                {[...new Set(githubData.skills)].map(skill => (
                  <button
                    key={skill}
                    onClick={() => {
                      if (selectedSkills.includes(skill)) {
                        setSelectedSkills(selectedSkills.filter(s => s !== skill));
                      } else {
                        setSelectedSkills([...selectedSkills, skill]);
                      }
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${
                      selectedSkills.includes(skill)
                      ? 'bg-green-500/10 border-green-500 text-green-600'
                      : 'bg-white dark:bg-white/5 border-gray-100 dark:border-white/5 text-gray-400'
                    }`}
                  >
                    {skill}
                    {selectedSkills.includes(skill) && <Check size={12} />}
                  </button>
                ))}
              </div>
            </section>

          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-500 font-medium">
              <AlertTriangle size={14} />
              <span>Personal info logic: Choose one. Collections: Merged/Added.</span>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={onClose}
                className="px-6 py-3 rounded-2xl text-sm font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <Button1 
                onClick={handleMerge}
                className="px-8 py-3 rounded-2xl flex items-center gap-2 shadow-xl shadow-purple-500/20"
              >
                Sync with Profile <ArrowRight size={16} />
              </Button1>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
