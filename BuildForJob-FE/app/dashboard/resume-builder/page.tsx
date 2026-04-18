"use client";
import React from "react";
import ResumeForm from "@/components/resume-builder/ResumeForm";
import ResumePreview from "@/components/resume-builder/ResumePreview";
import { ArrowLeft, Download } from "lucide-react";
import Link from "next/link";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateResume } from "@/lib/store/features/resume-slice";
import { toast } from "sonner";

export default function ResumeBuilderPage() {
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const magic = searchParams.get("magic");

  useEffect(() => {
    if (magic === "true" && user) {
      const resumeData = {
        personalInfoData: {
          full_name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          phone: user.phone || "",
          location: user.location || "",
          linkedin: user.socialLinks?.linkedin || "",
          website: user.socialLinks?.website || "",
          profession: user.jobTitle || "",
          image: user.avatarUrl || "",
        },
        professionalSummaryData: user.bio || `Ambitious ${user.jobTitle || "professional"} with a background in ${user.skills?.[0]?.name || "technology"}. Proven track record of delivering high-quality results.`,
        experienceData: (user.experience || []).map((exp: any) => ({
          company: exp.company,
          position: exp.position,
          startDate: exp.startDate,
          endDate: exp.endDate || "",
          description: exp.description || "",
          is_current: exp.isCurrent,
        })),
        educationData: (user.education || []).map((edu: any) => ({
          institution: edu.institution,
          degree: edu.degree,
          field: edu.field,
          graduation_date: edu.graduationDate,
          gpa: edu.gpa || "",
          graduationType: (edu.graduationType as any) || "cgpa",
        })),
        projectData: (user.projects || []).map((p: any) => ({
          name: p.name,
          techStack: p.techStack || "",
          description: p.description || "",
        })),
        skillData: (user.skills || []).map((s: any) => s.name),
      };

      dispatch(updateResume(resumeData as any));
      toast.success("Resume magically generated from your profile!");
    }
  }, [magic, user, dispatch]);

  const handleDownload = async () => {
    const element = document.getElementById("resume-preview");
    if (!element) return;

    try {
      const dataUrl = await toPng(element, {
        quality: 1,
        pixelRatio: 2,
      });
      
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (pdf.internal.pageSize.getHeight());

      pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("resume.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  return (
    <div className="max-w-8xl mx-auto space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex justify-between items-center gap-4">
        <Link 
          href="/dashboard"
          className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors group"
        >
          <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-white/5 group-hover:bg-gray-200 dark:group-hover:bg-white/10 transition-colors">
            <ArrowLeft size={16} />
          </div>
          Back to Dashboard
        </Link>

        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm hover:scale-[1.05] transition-transform shadow-xl"
        >
          <Download size={18} />
          Download PDF
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start justify-center h-full w-full">
        {/* Form Section */}
        <div className="w-full lg:w-[420px] shrink-0 h-full overflow-y-auto custom-scrollbar">
          <ResumeForm />
        </div>

        {/* Preview Section */}
        <div className="w-fit bg-gray-50/50 dark:bg-black/20 rounded-3xl border border-gray-200 dark:border-white/10 h-full p-0 overflow-hidden flex flex-col">
          <div className="h-full overflow-y-auto custom-scrollbar p-2 md:p-4 shadow-2xl">
             <ResumePreview />
          </div>
        </div>
      </div>
    </div>
  );
}
