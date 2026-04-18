"use client";

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import { setEducation, Education as EducationType } from "@/lib/store/features/resume-slice";
import FormInput from "../FormInput";
import { GraduationCap, School, Book, Calendar, Trash2, Plus, BarChart } from "lucide-react";

interface EducationProps {
  setFormTab: (tab: number) => void;
}

const Education = ({ setFormTab }: EducationProps) => {
  const dispatch = useDispatch();
  const { educationData } = useSelector((state: RootState) => state.resume);

  const [formData, setFormData] = useState<EducationType>({
    degree: "",
    institution: "",
    field: "",
    graduation_date: "",
    gpa: "",
    graduationType: "cgpa",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleAdd = () => {
    if (!formData.degree || !formData.institution) return;
    const newEducation = { ...formData, _id: Math.random().toString(36).substr(2, 9) };
    dispatch(setEducation([...educationData, newEducation]));
    setFormData({
      degree: "",
      institution: "",
      field: "",
      graduation_date: "",
      gpa: "",
      graduationType: "cgpa",
    });
  };

  const handleDelete = (id: string) => {
    dispatch(setEducation(educationData.filter((edu) => edu._id !== id)));
  };

  return (
    <div className="flex flex-col animate-in fade-in duration-500">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            name="degree"
            label="Degree"
            icon={<GraduationCap size={16} />}
            value={formData.degree}
            onChange={handleChange}
            placeholder="Bachelor of Science"
          />
          <FormInput
            name="institution"
            label="Institution"
            icon={<School size={16} />}
            value={formData.institution}
            onChange={handleChange}
            placeholder="University of Example"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            name="field"
            label="Field of Study"
            icon={<Book size={16} />}
            value={formData.field}
            onChange={handleChange}
            placeholder="Computer Science"
          />
          <FormInput
            name="graduation_date"
            label="Graduation Date"
            type="month"
            icon={<Calendar size={16} />}
            value={formData.graduation_date}
            onChange={handleChange}
          />
        </div>

        <div className="flex gap-2 p-1 bg-gray-100 dark:bg-white/5 rounded-xl self-start mb-1">
          {["cgpa", "percentage"].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, graduationType: type as any }))}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                formData.graduationType === type
                  ? "bg-white dark:bg-purple-600 text-purple-600 dark:text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <FormInput
          name="gpa"
          label={formData.graduationType === "cgpa" ? "CGPA" : "Percentage (%)"}
          type="text"
          icon={<BarChart size={16} />}
          value={formData.gpa}
          onChange={handleChange}
          placeholder={formData.graduationType === "cgpa" ? "3.8 / 4.0" : "85%"}
        />

        <button
          type="button"
          onClick={handleAdd}
          className="w-full py-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30 rounded-xl flex items-center justify-center gap-2 font-medium hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
        >
          <Plus size={18} />
          Add Education
        </button>
      </div>

      <div className="mt-8 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Education List</h3>
        {educationData.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">No education added yet.</p>
        ) : (
          educationData.map((edu) => (
            <div
              key={edu._id}
              className="p-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl flex justify-between items-start group"
            >
              <div>
                <p className="font-bold text-gray-900 dark:text-white">{edu.degree}</p>
                <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">{edu.institution}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Field: {edu.field} | Graduated: {edu.graduation_date}
                </p>
                {edu.gpa && <p className="text-xs text-gray-500 dark:text-gray-400">GPA: {edu.gpa}</p>}
              </div>
              <button
                onClick={() => handleDelete(edu._id!)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>

      <button
        onClick={() => setFormTab(5)}
        className="w-full py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-semibold hover:scale-[1.02] transition-transform shadow-xl mt-8"
      >
        Proceed to Projects
      </button>
    </div>
  );
};

export default Education;
