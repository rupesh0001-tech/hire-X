"use client";

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import { setProject, Project as ProjectType } from "@/lib/store/features/resume-slice";
import FormInput from "../FormInput";
import FormTextArea from "../FormTextArea";
import { FileSignature, Layers, Trash2, Plus, Code } from "lucide-react";

interface ProjectProps {
  setFormTab: (tab: number) => void;
}

const Project = ({ setFormTab }: ProjectProps) => {
  const dispatch = useDispatch();
  const { projectData } = useSelector((state: RootState) => state.resume);

  const [formData, setFormData] = useState<ProjectType>({
    name: "",
    techStack: "",
    description: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleAdd = () => {
    if (!formData.name) return;
    const newProject = { ...formData, _id: Math.random().toString(36).substr(2, 9) };
    dispatch(setProject([...projectData, newProject]));
    setFormData({
      name: "",
      techStack: "",
      description: "",
    });
  };

  const handleDelete = (id: string) => {
    dispatch(setProject(projectData.filter((p) => p._id !== id)));
  };

  return (
    <div className="flex flex-col animate-in fade-in duration-500">
      <div className="space-y-6">
        <FormInput
          name="name"
          label="Project Name"
          icon={<FileSignature size={16} />}
          value={formData.name}
          onChange={handleChange as any}
          placeholder="E-commerce Platform"
        />

        <FormInput
          name="techStack"
          label="Tech Stack"
          icon={<Code size={16} />}
          value={formData.techStack}
          onChange={handleChange as any}
          placeholder="React, Node.js, MongoDB"
        />

        <FormTextArea
          name="description"
          label="Description"
          value={formData.description}
          onChange={handleChange as any}
          placeholder="Key features, technologies used, and your role..."
        />

        <button
          type="button"
          onClick={handleAdd}
          className="w-full py-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30 rounded-xl flex items-center justify-center gap-2 font-medium hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
        >
          <Plus size={18} />
          Add Project
        </button>
      </div>

      <div className="mt-8 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Project List</h3>
        {projectData.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">No projects added yet.</p>
        ) : (
          projectData.map((p) => (
            <div
              key={p._id}
              className="p-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl flex justify-between items-start group"
            >
              <div>
                <p className="font-bold text-gray-900 dark:text-white">{p.name}</p>
                <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">{p.techStack}</p>
                {p.description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">{p.description}</p>}
              </div>
              <button
                onClick={() => handleDelete(p._id!)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>

      <button
        onClick={() => setFormTab(6)}
        className="w-full py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-semibold hover:scale-[1.02] transition-transform shadow-xl mt-8"
      >
        Proceed to Skills
      </button>
    </div>
  );
};

export default Project;
