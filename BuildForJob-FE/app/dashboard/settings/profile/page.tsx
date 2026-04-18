"use client";
import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchProfile, updateProfile } from "@/store/slices/authSlice";
import { 
  Mail, User as UserIcon, Phone, MapPin, Briefcase, FileText, 
  Camera, Save, Loader2, Plus, Trash2, GraduationCap, 
  Code, Globe, Linkedin, Github, Twitter, RefreshCw, Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button1 } from "@/components/general/buttons/button1";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { fetchGitHubData, extractUsername } from "@/lib/github/github-api";
import { GithubSyncModal } from "@/components/profile/GithubSyncModal";

type TabType = "personal" | "experience" | "education" | "projects" | "skills";

export default function ProfileSettingsPage() {
  const dispatch = useAppDispatch();
  const { user, isLoading } = useAppSelector((state) => state.auth);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = (searchParams.get("tab") as TabType) || "personal";

  const setActiveTab = (tab: TabType) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`?${params.toString()}`);
  };

  const [isSaving, setIsSaving] = useState(false);
  const [isFetchingGithub, setIsFetchingGithub] = useState(false);
  const [githubSyncData, setGithubSyncData] = useState<any>(null);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [hasSynced, setHasSynced] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
    jobTitle: "",
    bio: "",
    skills: [] as { name: string, isGithubSynced?: boolean }[],
    experience: [] as any[],
    education: [] as any[],
    projects: [] as any[],
    socialLinks: {
      github: "",
      linkedin: "",
      twitter: "",
      website: ""
    },
  });

  const isAlreadySynced = hasSynced || (formData.projects?.some((p: any) => p.isGithubSynced) || formData.skills?.some((s: any) => s.isGithubSynced));

  const handleGithubSync = async () => {
    const githubUrl = formData.socialLinks.github;
    const username = extractUsername(githubUrl);

    if (!username) {
      toast.error("Please provide a valid GitHub profile URL first");
      return;
    }

    setIsFetchingGithub(true);
    try {
      const data = await fetchGitHubData(username);
      setGithubSyncData(data);
      setShowSyncModal(true);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch GitHub data");
    } finally {
      setIsFetchingGithub(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm("Are you sure? This will disconnect GitHub and REMOVE all projects and skills synced from it.")) return;
    
    try {
      setIsSaving(true);
      const updatedData = {
        ...formData,
        socialLinks: { ...formData.socialLinks, github: "" },
        skills: (formData.skills || []).filter((s: any) => !s.isGithubSynced),
        projects: (formData.projects || []).filter((p: any) => !p.isGithubSynced)
      };
      
      await dispatch(updateProfile(updatedData)).unwrap();
      setFormData(updatedData as any);
      setHasSynced(false);
      toast.success("GitHub disconnected and synced data removed.");
    } catch (error: any) {
      toast.error(error || "Failed to disconnect");
    } finally {
      setIsSaving(false);
    }
  };

  const onGithubDataMerged = async (mergedData: any) => {
    try {
      setIsSaving(true);
      await dispatch(updateProfile(mergedData)).unwrap();
      setFormData(mergedData);
      setHasSynced(true);
      toast.success("GitHub data merged into profile!");
    } catch (error: any) {
      toast.error(error || "Failed to save synced data");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (user && !isSaving) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        location: user.location || "",
        jobTitle: user.jobTitle || "",
        bio: user.bio || "",
        skills: user.skills || [],
        experience: user.experience || [],
        education: user.education || [],
        projects: user.projects || [],
        socialLinks: user.socialLinks || { github: "", linkedin: "", twitter: "", website: "" },
      });
    }
  }, [user, isSaving]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...((prev as any)[parent]), [child]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const calculateCompletion = () => {
    if (!user) return 0;
    let score = 0;
    const basicFields = ['firstName', 'lastName', 'phone', 'location', 'jobTitle', 'bio'];
    const filledBasicCount = basicFields.filter(f => !!(formData as any)[f]).length;
    score += (filledBasicCount / basicFields.length) * 30;
    if (formData.experience.length > 0) score += 20;
    if (formData.education.length > 0) score += 20;
    if (formData.projects.length > 0) score += 15;
    const skillCount = formData.skills.length;
    if (skillCount >= 3) score += 15;
    else if (skillCount > 0) score += 5;
    return Math.min(100, Math.round(score));
  };

  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setIsSaving(true);
    try {
      await dispatch(updateProfile(formData)).unwrap();
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const addItem = (section: keyof typeof formData, defaultItem: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: [...(prev[section] as any[]), defaultItem]
    }));
  };

  const removeItem = (section: keyof typeof formData, index: number) => {
    setFormData(prev => ({
      ...prev,
      [section]: (prev[section] as any[]).filter((_, i) => i !== index)
    }));
  };

  const updateListItem = (section: keyof typeof formData, index: number, field: string, value: any) => {
    setFormData(prev => {
      const newList = [...(prev[section] as any[])];
      newList[index] = { ...newList[index], [field]: value };
      return { ...prev, [section]: newList };
    });
  };

  if (isLoading && !user) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-purple-500" size={32} />
      </div>
    );
  }

  const completionPercent = calculateCompletion();

  const TabButton = ({ id, label, icon: Icon }: { id: TabType, label: string, icon: any }) => (
    <button
      type="button"
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
        activeTab === id 
          ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20" 
          : "text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5"
      }`}
    >
      <Icon size={16} />
      {label}
    </button>
  );

  return (
    <div className="max-w-4xl mx-auto pb-20 space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-black dark:text-white tracking-tight">Profile Builder</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Enhance your profile to generate professional resumes instantly.</p>
        </div>
        <div className="flex items-center gap-4 bg-white dark:bg-[#111116] border border-gray-200 dark:border-white/10 px-5 py-3 rounded-2xl shadow-sm">
          <div className="relative w-14 h-14 flex items-center justify-center">
             <svg className="w-full h-full -rotate-90" viewBox="0 0 44 44">
                <circle cx="22" cy="22" r="18" fill="none" stroke="currentColor" strokeWidth="3.5" className="text-gray-100 dark:text-white/5" />
                <motion.circle 
                  cx="22" cy="22" r="18" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" className="text-purple-500/30 blur-[2px]"
                  initial={{ strokeDasharray: "0 113.1" }} animate={{ strokeDasharray: `${(completionPercent / 100) * 113.1} 113.1` }} transition={{ duration: 1.2, ease: "circOut" }}
                />
                <motion.circle 
                  cx="22" cy="22" r="18" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" className="text-purple-500"
                  initial={{ strokeDasharray: "0 113.1" }} animate={{ strokeDasharray: `${(completionPercent / 100) * 113.1} 113.1` }} transition={{ duration: 1, ease: "circOut" }}
                />
             </svg>
             <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] font-bold text-black dark:text-white">{completionPercent}%</span>
             </div>
          </div>
        </div>
      </header>

      <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 scrollbar-none">
        <TabButton id="personal" label="Personal" icon={UserIcon} />
        <TabButton id="experience" label="Experience" icon={Briefcase} />
        <TabButton id="education" label="Education" icon={GraduationCap} />
        <TabButton id="projects" label="Projects" icon={Code} />
        <TabButton id="skills" label="Skills" icon={Plus} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-[#111116] rounded-3xl border border-gray-200 dark:border-white/10 p-8 text-center shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-purple-500 to-blue-600" />
            <div className="relative w-32 h-32 mx-auto mb-6">
              <div className="w-full h-full rounded-full bg-linear-to-br from-purple-500 via-purple-600 to-blue-600 flex items-center justify-center text-white text-4xl font-extrabold shadow-2xl ring-4 ring-white dark:ring-white/5 transition-transform duration-500 group-hover:scale-105">
                {user?.firstName?.[0]?.toUpperCase()}{user?.lastName?.[0]?.toUpperCase()}
              </div>
              <button type="button" className="absolute bottom-1 right-1 p-2.5 rounded-full bg-white dark:bg-[#1a1a22] border border-gray-200 dark:border-white/10 text-purple-500 shadow-xl hover:bg-purple-500 hover:text-white transition-all duration-300 transform hover:scale-110 active:scale-95">
                <Camera size={18} />
              </button>
            </div>
            <h2 className="text-xl font-bold text-black dark:text-white tracking-tight">{formData.firstName} {formData.lastName}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{formData.jobTitle || "Your Career Start"}</p>
          </div>

          <div className="bg-white dark:bg-[#111116] rounded-3xl border border-gray-200 dark:border-white/10 p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2">Social Profiles</h3>
            <div className="space-y-3">
              {[
                { name: 'socialLinks.linkedin', icon: Linkedin, label: 'LinkedIn', placeholder: 'linkedin.com/in/...' },
                { name: 'socialLinks.github', icon: Github, label: 'GitHub', placeholder: 'github.com/...' },
                { name: 'socialLinks.twitter', icon: Twitter, label: 'Twitter', placeholder: 'twitter.com/...' },
                { name: 'socialLinks.website', icon: Globe, label: 'Portfolio', placeholder: 'yourwebsite.com' },
              ].map(s => (
                <div key={s.name} className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-transparent hover:border-purple-500/30 transition-all group">
                  <s.icon size={18} className="text-gray-400 group-hover:text-purple-500" />
                  <input 
                    type="text" 
                    name={s.name} 
                    value={(formData as any).socialLinks[s.name.split('.')[1]]} 
                    onChange={handleChange}
                    placeholder={s.placeholder}
                    className="bg-transparent border-none outline-none text-xs w-full text-black dark:text-white"
                  />
                </div>
              ))}
              <div className="pt-4 px-2">
                <div className="flex items-center gap-2">
                  {!isAlreadySynced && (
                    <button 
                      type="button"
                      onClick={handleGithubSync}
                      disabled={isFetchingGithub || !formData.socialLinks.github}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-black dark:bg-white/10 hover:bg-gray-800 dark:hover:bg-white/20 text-white text-xs font-bold transition-all disabled:opacity-50 group shadow-lg"
                    >
                      {isFetchingGithub ? (
                        <RefreshCw size={16} className="animate-spin" />
                      ) : (
                        <Github size={16} className="transition-transform group-hover:scale-110" />
                      )}
                      {isFetchingGithub ? "Fetching..." : "Sync with GitHub"}
                    </button>
                  )}
                  {formData.socialLinks.github && (
                    <button
                      type="button"
                      onClick={handleDisconnect}
                      disabled={isSaving}
                      className={`p-3 rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-lg ${!isAlreadySynced ? "" : "w-full flex items-center justify-center gap-2"}`}
                      title={isAlreadySynced ? "Connected (Click to Disconnect)" : "Disconnect & Remove Synced Data"}
                    >
                      <Trash2 size={16} />
                      {isAlreadySynced && <span className="text-xs font-bold">Connected (Disconnect)</span>}
                    </button>
                  )}
                </div>
                <p className="text-[9px] text-gray-400 text-center mt-2 group-hover:text-purple-500 transition-colors">
                  {isAlreadySynced ? "GitHub data is currently linked to your profile." : "Import projects and skills from your profile"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-[#111116] rounded-3xl border border-gray-200 dark:border-white/10 p-8 shadow-sm space-y-8 relative overflow-hidden">
            <AnimatePresence mode="wait">
              {activeTab === "personal" && (
                <motion.div 
                  key="personal" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[11px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 flex items-center gap-2 px-1">
                        <UserIcon size={12} className="text-purple-500" /> First Name
                      </label>
                      <input 
                        type="text" name="firstName" value={formData.firstName} onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#1a1a22] border border-gray-200 dark:border-white/10 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all font-medium"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 flex items-center gap-2 px-1">
                        <UserIcon size={12} className="text-purple-500" /> Last Name
                      </label>
                      <input 
                        type="text" name="lastName" value={formData.lastName} onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#1a1a22] border border-gray-200 dark:border-white/10 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 flex items-center gap-2 px-1">
                      <Mail size={12} className="text-purple-500" /> Email Address
                    </label>
                    <input type="email" value={formData.email} disabled className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/5 text-gray-500 cursor-not-allowed" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[11px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 flex items-center gap-2 px-1">
                        <Phone size={12} className="text-purple-500" /> Phone Number
                      </label>
                      <input 
                        type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="+1 (555) 000-0000"
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#1a1a22] border border-gray-200 dark:border-white/10 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all font-medium"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 flex items-center gap-2 px-1">
                        <MapPin size={12} className="text-purple-500" /> Location
                      </label>
                      <input 
                        type="text" name="location" value={formData.location} onChange={handleChange} placeholder="City, Country"
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#1a1a22] border border-gray-200 dark:border-white/10 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px) uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 flex items-center gap-2 px-1">
                      <Briefcase size={12} className="text-purple-500" /> Job Title
                    </label>
                    <input 
                      type="text" name="jobTitle" value={formData.jobTitle} onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#1a1a22] border border-gray-200 dark:border-white/10 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 flex items-center gap-2 px-1">
                      <FileText size={12} className="text-purple-500" /> Bio / Professional Summary
                    </label>
                    <textarea 
                      name="bio" value={formData.bio} onChange={handleChange} rows={4} placeholder="Describe yourself..."
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#1a1a22] border border-gray-200 dark:border-white/10 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all font-medium resize-none min-h-[120px]"
                    />
                  </div>
                </motion.div>
              )}

              {activeTab === "experience" && (
                <motion.div key="experience" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  {formData.experience.map((exp, index) => (
                    <div key={index} className="p-6 rounded-3xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 relative group">
                      <button type="button" onClick={() => removeItem("experience", index)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-2 bg-white dark:bg-white/5 rounded-xl shadow-sm"><Trash2 size={16} /></button>
                      <div className="grid grid-cols-2 gap-4">
                        <input type="text" placeholder="Company" value={exp.company} onChange={e => updateListItem("experience", index, "company", e.target.value)} className="col-span-2 px-4 py-2 bg-white dark:bg-[#1a1a22] border dark:border-white/10 rounded-xl" />
                        <input type="text" placeholder="Position" value={exp.position} onChange={e => updateListItem("experience", index, "position", e.target.value)} className="col-span-2 px-4 py-2 bg-white dark:bg-[#1a1a22] border dark:border-white/10 rounded-xl" />
                        <input type="date" value={exp.startDate} onChange={e => updateListItem("experience", index, "startDate", e.target.value)} className="px-4 py-2 bg-white dark:bg-[#1a1a22] border dark:border-white/10 rounded-xl" />
                        <input type="date" value={exp.endDate} disabled={exp.isCurrent} onChange={e => updateListItem("experience", index, "endDate", e.target.value)} className={`px-4 py-2 bg-white dark:bg-[#1a1a22] border dark:border-white/10 rounded-xl ${exp.isCurrent ? 'opacity-30' : ''}`} />
                        <label className="col-span-2 flex items-center gap-2 text-xs font-bold text-gray-500 px-1 cursor-pointer">
                          <input type="checkbox" checked={exp.isCurrent} onChange={e => updateListItem("experience", index, "isCurrent", e.target.checked)} className="rounded border-gray-300 dark:border-white/10 text-purple-600 focus:ring-purple-500" />
                          Currently Working Here
                        </label>
                        <textarea placeholder="Description" value={exp.description} onChange={e => updateListItem("experience", index, "description", e.target.value)} className="col-span-2 px-4 py-2 bg-white dark:bg-[#1a1a22] border dark:border-white/10 rounded-xl min-h-[100px]" />
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={() => addItem("experience", { company: "", position: "", startDate: "", endDate: "", description: "", isCurrent: false })} className="w-full p-4 rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/10 text-gray-500 hover:text-purple-500 hover:border-purple-500/50 transition-all font-bold flex items-center justify-center gap-2"><Plus size={18} /> Add Experience</button>
                </motion.div>
              )}

              {activeTab === "education" && (
                <motion.div key="education" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  {formData.education.map((edu, index) => (
                    <div key={index} className="p-6 rounded-3xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 relative group">
                      <button type="button" onClick={() => removeItem("education", index)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-2 bg-white dark:bg-white/5 rounded-xl shadow-sm"><Trash2 size={16} /></button>
                      <div className="grid grid-cols-2 gap-4">
                        <input type="text" placeholder="Institution" value={edu.institution} onChange={e => updateListItem("education", index, "institution", e.target.value)} className="col-span-2 px-4 py-2 bg-white dark:bg-[#1a1a22] border dark:border-white/10 rounded-xl" />
                        <input type="text" placeholder="Degree" value={edu.degree} onChange={e => updateListItem("education", index, "degree", e.target.value)} className="px-4 py-2 bg-white dark:bg-[#1a1a22] border dark:border-white/10 rounded-xl" />
                        <input type="text" placeholder="Field of Study" value={edu.field} onChange={e => updateListItem("education", index, "field", e.target.value)} className="px-4 py-2 bg-white dark:bg-[#1a1a22] border dark:border-white/10 rounded-xl" />
                        <input type="date" value={edu.graduationDate} onChange={e => updateListItem("education", index, "graduationDate", e.target.value)} className="px-4 py-2 bg-white dark:bg-[#1a1a22] border dark:border-white/10 rounded-xl" />
                        <input type="text" placeholder="GPA / Percentage" value={edu.gpa} onChange={e => updateListItem("education", index, "gpa", e.target.value)} className="px-4 py-2 bg-white dark:bg-[#1a1a22] border dark:border-white/10 rounded-xl" />
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={() => addItem("education", { institution: "", degree: "", field: "", graduationDate: "", gpa: "", graduationType: "cgpa" })} className="w-full p-4 rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/10 text-gray-500 hover:text-purple-500 hover:border-purple-500/50 transition-all font-bold flex items-center justify-center gap-2"><Plus size={18} /> Add Education</button>
                </motion.div>
              )}

              {activeTab === "projects" && (
                <motion.div key="projects" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  {formData.projects.map((proj, index) => (
                    <div key={index} className="p-6 rounded-3xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 relative group">
                      <button type="button" onClick={() => removeItem("projects", index)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-2 bg-white dark:bg-white/5 rounded-xl shadow-sm"><Trash2 size={16} /></button>
                      <div className="grid grid-cols-1 gap-4">
                        <input type="text" placeholder="Project Name" value={proj.name} onChange={e => updateListItem("projects", index, "name", e.target.value)} className="px-4 py-2 bg-white dark:bg-[#1a1a22] border dark:border-white/10 rounded-xl" />
                        <input type="text" placeholder="Tech Stack (e.g. Next.js, Prisma, Tailwind)" value={proj.techStack} onChange={e => updateListItem("projects", index, "techStack", e.target.value)} className="px-4 py-2 bg-white dark:bg-[#1a1a22] border dark:border-white/10 rounded-xl" />
                        <textarea placeholder="Description" value={proj.description} onChange={e => updateListItem("projects", index, "description", e.target.value)} className="px-4 py-2 bg-white dark:bg-[#1a1a22] border dark:border-white/10 rounded-xl min-h-[100px]" />
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={() => addItem("projects", { name: "", techStack: "", description: "" })} className="w-full p-4 rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/10 text-gray-500 hover:text-purple-500 hover:border-purple-500/50 transition-all font-bold flex items-center justify-center gap-2"><Plus size={18} /> Add Project</button>
                </motion.div>
              )}

              {activeTab === "skills" && (
                <motion.div key="skills" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill, index) => (
                      <div key={index} className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 text-purple-500 rounded-full border border-purple-500/30 group">
                        <span className="text-sm font-bold">{skill.name}</span>
                        <button type="button" onClick={() => removeItem("skills", index)} className="hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Add a skill (e.g. React.js)" 
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const val = (e.target as HTMLInputElement).value.trim();
                          if (val) {
                            addItem("skills", { name: val });
                            (e.target as HTMLInputElement).value = "";
                          }
                        }
                      }}
                      className="flex-1 px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#1a1a22] border dark:border-white/10 focus:ring-2 focus:ring-purple-500/30 outline-none" 
                    />
                    <button type="button" onClick={(e) => {
                      const input = (e.currentTarget.previousSibling as HTMLInputElement);
                      if (input.value.trim()) {
                        addItem("skills", { name: input.value.trim() });
                        input.value = "";
                      }
                    }} className="px-6 rounded-xl bg-purple-500 text-white font-bold hover:bg-purple-600 transition-all">Add</button>
                  </div>
                  <p className="text-[10px] text-gray-400 text-center uppercase tracking-widest">Press Enter to add multiple skills</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="pt-8 border-t dark:border-white/5 flex justify-between items-center">
              <div className="text-gray-400 text-xs italic">
                {activeTab !== 'personal' && "Don't forget to save your changes!"}
              </div>
              <Button1 type="button" onClick={handleSubmit} className="px-10 py-4 flex items-center gap-2 shadow-2xl shadow-purple-500/20" disabled={isSaving}>
                {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                {isSaving ? "Saving..." : "Save Profile"}
              </Button1>
            </div>
          </div>
        </div>
      </div>

      {githubSyncData && (
        <GithubSyncModal 
          key={githubSyncData.profile.html_url}
          isOpen={showSyncModal}
          onClose={() => setShowSyncModal(false)}
          githubData={githubSyncData}
          currentData={formData}
          onSync={onGithubDataMerged}
        />
      )}
    </div>
  );
}
