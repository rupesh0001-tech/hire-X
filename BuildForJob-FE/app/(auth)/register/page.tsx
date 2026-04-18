"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthBackground } from "@/components/sections/general/auth-background";
import { AuthBrand } from "@/components/sections/general/auth-brand";
import { OAuthButtons } from "@/components/sections/general/oauth-buttons";
import { RegisterForm } from "@/components/sections/register/register-form";
import { FaceRegisterStep } from "@/components/sections/face/FaceRegisterStep";
import { CompanySetupStep } from "@/components/sections/company/CompanySetupStep";
import { ScanFace, Building2, UserCheck } from "lucide-react";

type Step = "form" | "company" | "face";

// Step indicator
function StepBadge({ step, current }: { step: Step; current: Step }) {
  const steps: Step[] = ["form", "company", "face"];
  const labels: Record<Step, string> = { form: "Account", company: "Company", face: "Face ID" };
  const icons: Record<Step, React.ReactNode> = {
    form: <UserCheck size={12} />,
    company: <Building2 size={12} />,
    face: <ScanFace size={12} />,
  };

  const idx = steps.indexOf(step);
  const curIdx = steps.indexOf(current);
  const done = idx < curIdx;
  const active = step === current;

  return (
    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all
      ${active ? "bg-purple-600 text-white" : done ? "bg-purple-900/50 text-purple-300" : "bg-white/5 text-gray-500"}`}>
      {icons[step]}
      {labels[step]}
    </div>
  );
}

export default function RegisterPage() {
  const [step, setStep] = useState<Step>("form");
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [isFounder, setIsFounder] = useState(false);
  const router = useRouter();

  const handleRegisterSuccess = (email: string, founder: boolean) => {
    setRegisteredEmail(email);
    setIsFounder(founder);
    if (founder) {
      setStep("company");
    } else {
      setStep("face");
    }
  };

  const handleCompanyComplete = () => setStep("face");
  const handleFaceComplete = () => router.push("/dashboard");

  const stepTitles: Record<Step, string> = {
    form: "Create an account",
    company: "Set up your company",
    face: "Setup Face Login",
  };
  const stepSubtitles: Record<Step, string> = {
    form: "Start building your next-gen career profile today.",
    company: "Tell us about your company so candidates can find you.",
    face: "Add your face so you can log in instantly — no password needed.",
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#08080a] flex items-center justify-center p-6 relative overflow-hidden">
      <AuthBackground />

      <div className="w-full max-w-md relative z-10">
        <AuthBrand />

        {/* Step indicators — only shown for founders */}
        {isFounder && step !== "form" && (
          <div className="flex items-center justify-center gap-2 mb-5">
            <StepBadge step="form" current={step} />
            <div className="w-4 h-px bg-white/10" />
            <StepBadge step="company" current={step} />
            <div className="w-4 h-px bg-white/10" />
            <StepBadge step="face" current={step} />
          </div>
        )}

        <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            {step === "company" && <Building2 className="text-purple-400" size={22} />}
            {step === "face" && <ScanFace className="text-purple-400" size={22} />}
            <h1 className="text-2xl font-bold text-black dark:text-white">{stepTitles[step]}</h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">{stepSubtitles[step]}</p>

          {step === "form" && (
            <>
              <OAuthButtons />
              <div className="my-6 flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200 dark:bg-white/10" />
                <span className="text-xs text-gray-400 font-medium tracking-wider uppercase">Or register with email</span>
                <div className="flex-1 h-px bg-gray-200 dark:bg-white/10" />
              </div>
              <RegisterForm onSuccess={handleRegisterSuccess} />
            </>
          )}

          {step === "company" && (
            <CompanySetupStep
              onComplete={handleCompanyComplete}
              onSkip={handleCompanyComplete}
            />
          )}

          {step === "face" && (
            <FaceRegisterStep email={registeredEmail} onComplete={handleFaceComplete} />
          )}
        </div>

        {step === "form" && (
          <p className="text-center text-sm text-gray-500 mt-8 mb-8">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-black dark:text-white hover:text-purple-500 dark:hover:text-purple-400 transition-colors">
              Sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}