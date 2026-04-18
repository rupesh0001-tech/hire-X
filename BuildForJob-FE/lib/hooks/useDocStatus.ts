"use client";
import { useEffect, useState } from "react";
import { useAppSelector } from "@/store/hooks";
import api from "@/apis/axiosInstance";

export type DocVerificationStatus = "PENDING" | "VERIFIED" | "REJECTED" | null;

export interface CompanyDocStatus {
  status: DocVerificationStatus;
  rejectionReason: string | null;
  companyName: string | null;
  docUrl: string | null;
}

export function useDocStatus() {
  const { user, isAuthenticated } = useAppSelector((s) => s.auth);
  const [docStatus, setDocStatus] = useState<CompanyDocStatus>({
    status: null,
    rejectionReason: null,
    companyName: null,
    docUrl: null,
  });
  const [loading, setLoading] = useState(false);

  const isFounder = user?.role === "FOUNDER";

  useEffect(() => {
    if (!isAuthenticated || !isFounder) return;
    setLoading(true);
    api
      .get("/company/me")
      .then((r) => {
        const data = r.data?.data;
        if (data) {
          setDocStatus({
            status: data.docVerificationStatus ?? "PENDING",
            rejectionReason: data.docRejectionReason ?? null,
            companyName: data.name ?? null,
            docUrl: data.docUrl ?? null,
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated, isFounder]);

  return { docStatus, isFounder, loading };
}
