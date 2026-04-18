"use client";
import React, { useRef, useEffect, useState, useCallback } from "react";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";
import { Camera, CheckCircle2, Loader2, AlertCircle, ScanFace } from "lucide-react";

interface FaceCaptureProps {
  onDescriptorCaptured: (descriptor: number[]) => void;
  onSkip?: () => void;
  mode?: "register" | "login";
}

type Status = "loading-models" | "ready" | "detecting" | "success" | "error";

export function FaceCapture({ onDescriptorCaptured, onSkip, mode = "register" }: FaceCaptureProps) {
  const webcamRef = useRef<Webcam>(null);
  const [status, setStatus] = useState<Status>("loading-models");
  const [statusMsg, setStatusMsg] = useState("Loading face detection models...");
  const [modelsLoaded, setModelsLoaded] = useState(false);

  // Load face-api models from /public/models
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
        setStatus("ready");
        setStatusMsg("Position your face in the camera and click Capture");
      } catch (err) {
        console.error("Failed to load face models:", err);
        setStatus("error");
        setStatusMsg("Failed to load face detection models.");
      }
    };
    loadModels();
  }, []);

  const capture = useCallback(async () => {
    if (!webcamRef.current || !modelsLoaded) return;

    setStatus("detecting");
    setStatusMsg("Detecting face...");

    const video = webcamRef.current.video;
    if (!video) {
      setStatus("error");
      setStatusMsg("Camera not ready. Please try again.");
      return;
    }

    try {
      const detection = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setStatus("error");
        setStatusMsg("No face detected. Make sure your face is clearly visible.");
        setTimeout(() => { setStatus("ready"); setStatusMsg("Position your face in the camera and click Capture"); }, 2500);
        return;
      }

      const descriptor = Array.from(detection.descriptor);
      setStatus("success");
      setStatusMsg(mode === "register" ? "Face captured! Saving..." : "Face matched!");
      onDescriptorCaptured(descriptor);
    } catch (err) {
      console.error("Face detection error:", err);
      setStatus("error");
      setStatusMsg("Detection failed. Try again.");
      setTimeout(() => { setStatus("ready"); setStatusMsg("Position your face in the camera and click Capture"); }, 2500);
    }
  }, [modelsLoaded, onDescriptorCaptured, mode]);

  const statusColors: Record<Status, string> = {
    "loading-models": "text-gray-400",
    ready: "text-purple-400",
    detecting: "text-yellow-400",
    success: "text-green-400",
    error: "text-red-400",
  };

  const StatusIcon = () => {
    if (status === "loading-models" || status === "detecting") return <Loader2 className="animate-spin" size={16} />;
    if (status === "success") return <CheckCircle2 size={16} />;
    if (status === "error") return <AlertCircle size={16} />;
    return <ScanFace size={16} />;
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Camera preview */}
      <div className="relative w-full rounded-2xl overflow-hidden border-2 border-purple-500/40 bg-black aspect-video">
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          videoConstraints={{ facingMode: "user", width: 480, height: 270 }}
          className="w-full h-full object-cover"
          mirrored
        />
        {/* Overlay scanner frame */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-40 h-48 border-2 border-purple-400/60 rounded-2xl relative">
            {/* Corner accents */}
            <span className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-purple-400 rounded-tl-lg" />
            <span className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-purple-400 rounded-tr-lg" />
            <span className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-purple-400 rounded-bl-lg" />
            <span className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-purple-400 rounded-br-lg" />
          </div>
        </div>
        {/* Success overlay */}
        {status === "success" && (
          <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
            <CheckCircle2 className="text-green-400" size={48} />
          </div>
        )}
      </div>

      {/* Status badge */}
      <div className={`flex items-center gap-2 text-sm font-medium ${statusColors[status]}`}>
        <StatusIcon />
        <span>{statusMsg}</span>
      </div>

      {/* Capture button */}
      <button
        onClick={capture}
        disabled={status === "loading-models" || status === "detecting" || status === "success"}
        className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/40 disabled:cursor-not-allowed text-white font-semibold flex items-center justify-center gap-2 transition-all"
      >
        {status === "detecting" ? (
          <><Loader2 className="animate-spin" size={16} /> Detecting...</>
        ) : status === "success" ? (
          <><CheckCircle2 size={16} /> Captured</>
        ) : (
          <><Camera size={16} /> {mode === "register" ? "Capture My Face" : "Verify Face"}</>
        )}
      </button>

      {/* Skip option for registration */}
      {onSkip && status !== "success" && (
        <button
          onClick={onSkip}
          className="text-sm text-gray-500 hover:text-gray-300 transition-colors underline underline-offset-2"
        >
          Skip for now
        </button>
      )}
    </div>
  );
}
