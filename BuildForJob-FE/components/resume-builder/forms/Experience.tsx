"use client";

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import { setExperience, Experience as ExperienceType } from "@/lib/store/features/resume-slice";
import FormInput from "../FormInput";
import { Briefcase, Building, Calendar, Trash2, Plus } from "lucide-react";

interface ExperienceProps {
  setFormTab: (tab: number) => void;
}

const Experience = ({ setFormTab }: ExperienceProps) => {
  const dispatch = useDispatch();
  const { experienceData } = useSelector((state: RootState) => state.resume);

  const [formData, setFormData] = useState<ExperienceType>({
    position: "",
    company: "",
    startDate: "",
    endDate: "",
    description: "",
    is_current: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAdd = () => {
    if (!formData.position || !formData.company) return;
    const newExperience = { ...formData, _id: Math.random().toString(36).substr(2, 9) };
    dispatch(setExperience([...experienceData, newExperience]));
    setFormData({
      position: "",
      company: "",
      startDate: "",
      endDate: "",
      description: "",
      is_current: false,
    });
  };

  const handleDelete = (id: string) => {
    dispatch(setExperience(experienceData.filter((exp) => exp._id !== id)));
  };

  return (
    <div className="flex flex-col animate-in fade-in duration-500">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            name="position"
            label="Position"
            icon={<Briefcase size={16} />}
            value={formData.position}
            onChange={handleChange}
            placeholder="Senior Developer"
          />
          <FormInput
            name="company"
            label="Company"
            icon={<Building size={16} />}
            value={formData.company}
            onChange={handleChange}
            placeholder="Google"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            name="startDate"
            label="Start Date"
            type="month"
            icon={<Calendar size={16} />}
            value={formData.startDate}
            onChange={handleChange}
          />
          <div className="flex flex-col gap-2">
            <FormInput
              name="endDate"
              label="End Date"
              type="month"
              icon={<Calendar size={16} />}
              value={formData.endDate}
              onChange={handleChange}
              disabled={formData.is_current}
            />
            <div className="mt-1">
              <FormInput
                name="is_current"
                label="I currently work here (Present)"
                type="checkbox"
                checked={formData.is_current}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <FormInput
          name="description"
          label="Description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe your responsibilities and achievements..."
        />

        <button
          type="button"
          onClick={handleAdd}
          className="w-full py-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30 rounded-xl flex items-center justify-center gap-2 font-medium hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
        >
          <Plus size={18} />
          Add Experience
        </button>
      </div>

      <div className="mt-8 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Experience List</h3>
        {experienceData.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">No experience added yet.</p>
        ) : (
          experienceData.map((exp) => (
            <div
              key={exp._id}
              className="p-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl flex justify-between items-start group"
            >
              <div>
                <p className="font-bold text-gray-900 dark:text-white">{exp.position}</p>
                <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">{exp.company}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {exp.startDate} - {exp.is_current ? "Present" : exp.endDate}
                </p>
              </div>
              <button
                onClick={() => handleDelete(exp._id!)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>

      <button
        onClick={() => setFormTab(4)}
        className="w-full py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-semibold hover:scale-[1.02] transition-transform shadow-xl mt-8"
      >
        Proceed to Education
      </button>
    </div>
  );
};

export default Experience;
