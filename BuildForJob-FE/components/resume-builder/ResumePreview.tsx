"use client";

import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import ModernTemplate from "./templates/ModernTemplate";
import MinimalTemplate from "./templates/MinimalTemplate";
import MinimalImageTemplate from "./templates/MinimalImageTemplate";
import ClassicTemplate from "./templates/ClassicTemplate";
import ProfessionalTemplate from "./templates/ProfessionalTemplate";
import ImpactTemplate from "./templates/ImpactTemplate";

const ResumePreview = () => {
  const {
    personalInfoData,
    professionalSummaryData,
    experienceData,
    educationData,
    projectData,
    skillData,
    template,
    accentColor,
    sectionVisibility,
  } = useSelector((state: RootState) => state.resume);

  const data = {
    personal_info: personalInfoData,
    professional_summary: professionalSummaryData,
    experience: experienceData,
    education: educationData,
    project: projectData,
    skills: skillData,
    sectionVisibility: sectionVisibility,
  };

  const renderTemplate = () => {
    switch (template) {
      case "modern":
        return <ModernTemplate data={data as any} accentColor={accentColor} />;
      case "minimal":
        return <MinimalTemplate data={data as any} accentColor={accentColor} />;
      case "minimal-image":
        return <MinimalImageTemplate data={data as any} accentColor={accentColor} />;
      case "professional":
        return <ProfessionalTemplate data={data as any} accentColor={accentColor} />;
      case "impact":
        return <ImpactTemplate data={data as any} accentColor={accentColor} />;
      default:
        return <ClassicTemplate data={data as any} accentColor={accentColor} />;
    }
  };

  return (
    <div className="resume-preview-container bg-white border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden shadow-2xl">
      <div className="mobile-scale-wrapper">
        <div id="resume-preview" className="print:shadow-none print:border-none w-full min-h-[1123px]">
          {renderTemplate()}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        /* --- A4 PAGE SETTINGS --- */
        @page {
          size: A4;
          margin: 0;
        }

        /* A4 dimensions for preview (desktop) */
        .resume-preview-container {
          width: 210mm;
          min-height: 297mm;
          padding: 0;
          margin: 0 auto;
          background: white;
        }

        #resume-preview {
          width: 210mm;
          min-height: 297mm;
          overflow: hidden;
          margin: 0;
          padding: 0;
        }

        @media screen and (max-width: 1200px) {
          .resume-preview-container {
            width: 100% !important;
            min-height: auto !important;
            height: auto !important;
            overflow: visible !important;
          }
          .mobile-scale-wrapper {
            transform: scale(0.65);
            transform-origin: top center;
            width: 210mm;
            margin: 0 auto;
          }
        }

        @media screen and (max-width: 768px) {
          .mobile-scale-wrapper {
            transform: scale(0.45);
          }
        }

        @media print {
          html, body {
            margin: 0;
            padding: 0;
            width: 210mm;
            height: 297mm;
          }
          body * {
            visibility: hidden;
          }
          #resume-preview,
          #resume-preview * {
            visibility: visible;
          }
          #resume-preview {
            position: absolute;
            top: 0;
            left: 0;
            width: 210mm !important;
            height: 297mm !important;
          }
        }
      `}} />
    </div>
  );
};

export default ResumePreview;
