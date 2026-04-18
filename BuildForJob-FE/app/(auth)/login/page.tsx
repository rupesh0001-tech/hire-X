"use client";
import React, { useState } from "react";
import Link from "next/link";
import { AuthBackground } from "@/components/sections/general/auth-background";
import { AuthBrand } from "@/components/sections/general/auth-brand";
import { OAuthButtons } from "@/components/sections/general/oauth-buttons";
import { LoginForm } from "@/components/sections/login/login-form";
import { FaceLoginModal } from "@/components/sections/face/FaceLoginModal";
import { ScanFace } from "lucide-react";

export default function LoginPage() {
  const [showFaceModal, setShowFaceModal] = useState(false);
  const [faceEmail, setFaceEmail] = useState("");
  const [emailInput, setEmailInput] = useState("");

  const handleFaceLoginClick = () => {
    if (!emailInput.trim()) {
      alert("Please enter your email first to use face login.");
      return;
    }
    setFaceEmail(emailInput.trim());
    setShowFaceModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#08080a] flex items-center justify-center p-6 relative overflow-hidden">
      <AuthBackground />

      <div className="w-full max-w-md relative z-10">
        <AuthBrand />

        <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
          <h1 className="text-2xl font-bold text-black dark:text-white mb-2 text-center">Welcome back</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm text-center mb-8">
            Sign in with your password, or use your face.
          </p>

          {/* Email input shared between both auth methods */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#111116] border border-gray-200 dark:border-white/10 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder:text-gray-400"
            />
          </div>

          {/* Face Login Button */}
          <button
            onClick={handleFaceLoginClick}
            className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl border-2 border-purple-500/50 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 font-semibold transition-all mb-4 group"
          >
            <ScanFace size={20} className="group-hover:scale-110 transition-transform" />
            Sign in with Face
          </button>

          {/* Divider */}
          <div className="my-4 flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200 dark:bg-white/10" />
            <span className="text-xs text-gray-400 font-medium tracking-wider uppercase">Or use password</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-white/10" />
          </div>

          {/* Password login — pass prefilled email */}
          <LoginForm prefillEmail={emailInput} />

          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200 dark:bg-white/10" />
            <span className="text-xs text-gray-400 font-medium tracking-wider uppercase">Or continue with</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-white/10" />
          </div>

          <OAuthButtons />
        </div>

        <p className="text-center text-sm text-gray-500 mt-8">
          Don't have an account?{" "}
          <Link href="/register" className="font-semibold text-black dark:text-white hover:text-purple-500 dark:hover:text-purple-400 transition-colors">
            Sign up for free
          </Link>
        </p>
      </div>

      {/* Face Login Modal */}
      {showFaceModal && (
        <FaceLoginModal
          email={faceEmail}
          onClose={() => setShowFaceModal(false)}
        />
      )}
    </div>
  );
}