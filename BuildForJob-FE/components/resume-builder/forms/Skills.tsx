"use client";

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import { setSkill } from "@/lib/store/features/resume-slice";
import FormInput from "../FormInput";
import { ChartLine, X, Plus } from "lucide-react";

const Skills = () => {
  const dispatch = useDispatch();
  const { skillData } = useSelector((state: RootState) => state.resume);
  const [newSkill, setNewSkill] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    if (skillData.includes(newSkill.trim())) {
      setNewSkill("");
      return;
    }
    dispatch(setSkill([...skillData, newSkill.trim()]));
    setNewSkill("");
  };

  const handleDelete = (skillToDelete: string) => {
    dispatch(setSkill(skillData.filter((skill) => skill !== skillToDelete)));
  };

  return (
    <div className="flex flex-col animate-in fade-in duration-500">
      <div className="mb-6">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Add your key technical and soft skills.
        </p>
      </div>

      <form onSubmit={handleAdd} className="flex gap-3 items-end mb-8">
        <div className="flex-1">
          <FormInput
            name="newSkill"
            label="Skill Name"
            icon={<ChartLine size={16} />}
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            placeholder="e.g. React, TypeScript, Leadership"
          />
        </div>
        <button
          type="submit"
          className="p-3 bg-black dark:bg-white text-white dark:text-black rounded-xl hover:scale-[1.05] transition-transform shadow-lg"
        >
          <Plus size={20} />
        </button>
      </form>

      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Added Skills</h3>
      <div className="flex flex-wrap gap-2">
        {skillData.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">No skills added yet.</p>
        ) : (
          skillData.map((skill, index) => (
            <div
              key={index}
              className="px-4 py-1.5 bg-gray-100 dark:bg-white/10 rounded-full flex items-center gap-2 border border-gray-200 dark:border-white/10 group animate-in zoom-in duration-200"
            >
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{skill}</span>
              <button
                onClick={() => handleDelete(skill)}
                className="text-gray-400 hover:text-red-500 transition-colors"
                title="Remove"
              >
                <X size={14} />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="mt-12 p-6 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-500/20 rounded-2xl flex flex-col items-center text-center gap-4">
        <h4 className="font-bold text-green-800 dark:text-green-400">Resume Complete!</h4>
        <p className="text-sm text-green-700 dark:text-green-500/80">You&apos;ve filled out all sections. You can now preview and download your resume using the buttons above.</p>
      </div>
    </div>
  );
};

export default Skills;
