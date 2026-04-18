"use client";

import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import { setProfessionalSummary } from "@/lib/store/features/resume-slice";
import FormTextArea from "../FormTextArea";
import { Sparkles } from "lucide-react";

interface ProfessionalSummaryProps {
  setFormTab: (tab: number) => void;
}

const ProfessionalSummary = ({ setFormTab }: ProfessionalSummaryProps) => {
  const dispatch = useDispatch();
  const { professionalSummaryData } = useSelector((state: RootState) => state.resume);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    dispatch(setProfessionalSummary(e.target.value));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormTab(3);
  };

  return (
    <div className="flex flex-col animate-in fade-in duration-500">
      <div className="mb-6">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Summarize your professional highlights in 2-3 sentences.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <FormTextArea
          name="professionalSummary"
          label="Summary"
          value={professionalSummaryData}
          onChange={handleChange}
          placeholder="Experienced developer with a passion for building scalable web applications..."
        />

        <button
          type="button"
          disabled
          className="w-full py-3 px-4 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30 rounded-xl flex items-center justify-center gap-2 font-medium opacity-50 cursor-not-allowed"
        >
          <Sparkles size={18} />
          Enhance with AI (Coming Soon)
        </button>

        <button
          type="submit"
          className="w-full py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-semibold hover:scale-[1.02] transition-transform shadow-xl"
        >
          Proceed to Experience
        </button>
      </form>
    </div>
  );
};

export default ProfessionalSummary;
