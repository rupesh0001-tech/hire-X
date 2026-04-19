"use client";
import React, { useState, useRef, useEffect } from "react";
import * as faceapi from "face-api.js";
import { Upload, CheckCircle2, Loader2, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import api from "@/apis/axiosInstance";

interface ProfilePhotoUploadStepProps {
  onComplete: () => void; // navigate to dashboard
}

export function ProfilePhotoUploadStep({ onComplete }: ProfilePhotoUploadStepProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = "/models";
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
      } catch (err) {
        console.error("Failed to load face models:", err);
      }
    };
    loadModels();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    if (!modelsLoaded) {
      toast.error("Models are still loading, please wait...");
      return;
    }

    setLoading(true);
    try {
      // 1. Extract Face Descriptor from image
      const img = await faceapi.bufferToImage(file);
      const detection = await faceapi
        .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        toast.error("No face detected in the photo. Please use a clear portrait photo.");
        setLoading(false);
        return;
      }

      const descriptor = Array.from(detection.descriptor);

      // 2. Send to backend
      const formData = new FormData();
      formData.append("photo", file);
      formData.append("descriptor", JSON.stringify(descriptor));

      const res = await api.post("/face/verify-photo", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (res.data.success) {
        setSaved(true);
        toast.success("Profile photo verified successfully!");
        setTimeout(onComplete, 1200);
      } else {
        toast.error(res.data.message || "Face verification failed");
        setLoading(false);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to verify profile photo");
      setLoading(false);
    }
  };

  if (saved) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3 text-green-400">
        <CheckCircle2 size={48} />
        <p className="font-semibold text-white">Verified Successfully!</p>
        <p className="text-sm text-gray-400">Redirecting to dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-4">
        <label
          htmlFor="photo-upload"
          className="relative w-32 h-32 rounded-full border-4 border-dashed border-purple-500/40 flex items-center justify-center cursor-pointer hover:border-purple-500 transition-colors bg-purple-500/5 overflow-hidden group"
        >
          {preview ? (
            <img src={preview} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <UserIcon className="text-purple-400" size={48} />
          )}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Upload className="text-white" size={24} />
          </div>
          <input id="photo-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </label>
        
        <div className="text-center">
          <p className="text-sm text-gray-400">Please upload a clear portrait photo.</p>
          <p className="text-xs text-purple-400 mt-1">Must match your face from the previous step.</p>
        </div>
      </div>

      <button
        onClick={handleUpload}
        disabled={!file || loading || !modelsLoaded}
        className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/40 disabled:cursor-not-allowed text-white font-semibold flex items-center justify-center gap-2 transition-all"
      >
        {loading ? (
          <><Loader2 className="animate-spin" size={16} /> Verifying Face...</>
        ) : (
          "Verify & Upload"
        )}
      </button>
    </div>
  );
}
