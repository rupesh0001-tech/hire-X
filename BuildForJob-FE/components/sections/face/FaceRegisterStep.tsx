"use client";
import React, { useState } from "react";
import { FaceCapture } from "./FaceCapture";
import { CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/apis/axiosInstance";

interface FaceRegisterStepProps {
  email: string;
  onComplete: () => void; // navigate to dashboard
}

export function FaceRegisterStep({ email, onComplete }: FaceRegisterStepProps) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleDescriptor = async (descriptor: number[]) => {
    setSaving(true);
    try {
      const res = await api.post("/face/register", { email, descriptor });
      if (res.data.success) {
        setSaved(true);
        toast.success("Face registered! Taking you to your dashboard...");
        setTimeout(onComplete, 1200);
      } else {
        toast.error(res.data.message || "Failed to save face");
        setSaving(false);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to register face");
      setSaving(false);
    }
  };

  const handleSkip = () => {
    toast.info("Skipped face setup. You can add it later in settings.");
    onComplete();
  };

  if (saving && !saved) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-400">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500" />
        <p>Saving your face...</p>
      </div>
    );
  }

  if (saved) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3 text-green-400">
        <CheckCircle2 size={48} />
        <p className="font-semibold text-white">Face registered successfully!</p>
        <p className="text-sm text-gray-400">Redirecting to dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <FaceCapture
        onDescriptorCaptured={handleDescriptor}
        onSkip={handleSkip}
        mode="register"
      />
    </div>
  );
}
