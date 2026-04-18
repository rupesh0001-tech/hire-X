"use client";
import React from "react";
import CoverLetterForm from "@/components/cover-letter/CoverLetterForm";
import CoverLetterPreview from "@/components/cover-letter/CoverLetterPreview";
import CoverLetterThemeSelector from "@/components/cover-letter/CoverLetterThemeSelector";
import { Download, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { 
  updatePersonalInfo, 
  updateBody, 
  updateMode,
  updateSignOff,
  updateSalutation
} from "@/lib/store/features/cover-letter-slice";
import { toast } from "sonner";

const CoverLetterPage = () => {
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const magic = searchParams.get("magic");

  useEffect(() => {
    if (magic === "true" && user) {
      dispatch(updateMode("structured"));
      dispatch(updatePersonalInfo({
        fullName: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: user.phone || "",
        address: user.location || "",
        linkedin: user.socialLinks?.linkedin || "",
        github: user.socialLinks?.github || "",
      }));
      
      const intro = `I am writing to express my enthusiastic interest in joining your team. As a ${user.jobTitle || "professional"} with a strong background in ${user.skills?.[0]?.name || "relevant skills"}, I am confident that my experience aligns well with the goals of your organization.`;
      
      const body1 = user.experience?.[0] 
        ? `In my most recent role as a ${user.experience[0].position} at ${user.experience[0].company}, I was responsible for ${user.experience[0].description?.substring(0, 150)}... This experience allowed me to hone my skills and deliver impactful solutions.`
        : `Throughout my career and academic journey, I have developed a deep understanding of ${user.skills?.slice(0, 3).map((s: any) => s.name).join(", ") || "core industry principles"}. I take pride in my ability to solve complex problems and contribute to team success.`;
  
      const body2 = user.projects?.[0]
        ? `Through key projects like ${user.projects[0].name}, where I used ${user.projects[0].techStack}, I have demonstrated my technical proficiency and ability to manage end-to-end deliverables effectively.`
        : `I am highly motivated to bring my expertise and dedication to your company. I value continuous learning and strive to stay updated with the latest industry trends and best practices.`;
  
      const body3 = "I am particularly drawn to your organization's reputation for innovation and excellence. I am eager to contribute to your ongoing success and am excited about the possibility of bringing my unique perspective to your team.";
  
      const conclusion = "Thank you for considering my application. I look forward to the possibility of discussing how my background and skills can benefit your team in more detail during an interview.";
  
      dispatch(updateBody({ intro, body1, body2, body3, conclusion }));
      dispatch(updateSignOff("Sincerely,"));
      dispatch(updateSalutation("Dear Hiring Manager,"));
      
      toast.success("Cover letter magically generated from your profile!");
    }
  }, [magic, user, dispatch]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-8xl mx-auto space-y-6 pb-20 p-4 md:p-6">
      {/* Top Header */}
      <div className="flex justify-between items-center gap-4">
        <Link 
          href="/dashboard"
          className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors group"
        >
          <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-white/5 group-hover:bg-gray-200 dark:group-hover:bg-white/10 transition-colors">
            <ChevronLeft size={16} />
          </div>
          Back to Dashboard
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm hover:scale-[1.05] transition-transform shadow-xl"
          >
            <Download size={18} />
            <span className="hidden sm:inline">Download PDF</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start justify-center h-full w-full">
        {/* Form Section */}
        <div className="w-full lg:w-[420px] shrink-0 h-full overflow-y-auto custom-scrollbar">
          <CoverLetterForm />
        </div>

        {/* Preview Section */}
        <div className="w-fit bg-gray-50/50 dark:bg-black/20 rounded-3xl border border-gray-200 dark:border-white/10 h-full p-0 overflow-hidden flex flex-col">
          <div className="h-full overflow-y-auto custom-scrollbar p-2 md:p-4 shadow-2xl">
            <CoverLetterPreview />
          </div>
        </div>
      </div>

    </div>
  );
};

export default CoverLetterPage;
