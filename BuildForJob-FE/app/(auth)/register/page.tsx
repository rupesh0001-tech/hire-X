"use client";
import React, { useState } from "react";
import Link from "next/link";
import { AuthBackground } from "@/components/sections/general/auth-background";
import { AuthBrand } from "@/components/sections/general/auth-brand";
import { OAuthButtons } from "@/components/sections/general/oauth-buttons";
import { RegisterForm } from "@/components/sections/register/register-form";
import { FaceRegisterStep } from "@/components/sections/face/FaceRegisterStep";
import { useRouter } from "next/navigation";
import { ScanFace } from "lucide-react";

export default function RegisterPage() {
  const [step, setStep] = useState<"form" | "face">("form");
  const [registeredEmail, setRegisteredEmail] = useState("");
  const router = useRouter();

  // Called by RegisterForm once registration succeeds
  const handleRegisterSuccess = (email: string) => {
    setRegisteredEmail(email);
    setStep("face");
  };

  const handleFaceComplete = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#08080a] flex items-center justify-center p-6 relative overflow-hidden">
      <AuthBackground />
      <div className="w-full max-w-md relative z-10">
        <AuthBrand />

        <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
          {step === "form" ? (
            <>
              <h1 className="text-2xl font-bold text-black dark:text-white mb-2 text-center">Create an account</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm text-center mb-8">
                Start building your next-gen career profile today.
              </p>
              <OAuthButtons />
              <div className="my-6 flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200 dark:bg-white/10" />
                <span className="text-xs text-gray-400 font-medium tracking-wider uppercase">Or register with email</span>
                <div className="flex-1 h-px bg-gray-200 dark:bg-white/10" />
              </div>
              {/* Pass callback so RegisterForm tells us email on success */}
              <RegisterForm onSuccess={handleRegisterSuccess} />
            </>
          ) : (
            <>
              {/* Step 2 — Face Setup */}
              <div className="flex items-center gap-2 mb-1">
                <ScanFace className="text-purple-400" size={22} />
                <h1 className="text-2xl font-bold text-black dark:text-white">Setup Face Login</h1>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                Add your face so you can log in instantly next time — no password needed.
              </p>
              <FaceRegisterStep email={registeredEmail} onComplete={handleFaceComplete} />
            </>
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