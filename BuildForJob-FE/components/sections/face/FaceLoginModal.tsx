"use client";
import React, { useState } from "react";
import { X } from "lucide-react";
import { FaceCapture } from "./FaceCapture";
import { useAppDispatch } from "@/store/hooks";
import { faceLogin } from "@/store/slices/authSlice";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface FaceLoginModalProps {
  email: string;
  onClose: () => void;
}

export function FaceLoginModal({ email, onClose }: FaceLoginModalProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [processing, setProcessing] = useState(false);

  const handleDescriptor = async (descriptor: number[]) => {
    setProcessing(true);
    try {
      const result = await dispatch(faceLogin({ email, descriptor }));
      if (faceLogin.fulfilled.match(result)) {
        toast.success("Face login successful!");
        router.push("/dashboard");
      } else {
        toast.error(result.payload as string || "Face did not match. Try again.");
        setProcessing(false);
      }
    } catch {
      toast.error("An error occurred during face login.");
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white dark:bg-[#111116] border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-2xl relative">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-black dark:text-white mb-1">Face Login</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
          Logging in as <span className="text-purple-400 font-medium">{email}</span>. Look at the camera and click verify.
        </p>

        {!processing ? (
          <FaceCapture
            onDescriptorCaptured={handleDescriptor}
            onSkip={onClose}
            mode="login"
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-400">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500" />
            <p>Verifying your face...</p>
          </div>
        )}
      </div>
    </div>
  );
}
