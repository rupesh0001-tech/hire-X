import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const adminApi = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

adminApi.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("admin_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Types ─────────────────────────────────────────────────────────────────

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export type DocStatus = "PENDING" | "VERIFIED" | "REJECTED";

export interface Company {
  id: string;
  name: string;
  industry: string | null;
  website: string | null;
  logoUrl: string | null;
  docUrl: string | null;
  docVerificationStatus: DocStatus;
  docRejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl: string | null;
    jobTitle: string | null;
    location: string | null;
    role: string;
    createdAt: string;
  };
}

export interface UserRow {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "USER" | "FOUNDER";
  isVerified: boolean;
  jobTitle: string | null;
  location: string | null;
  avatarUrl: string | null;
  createdAt: string;
  company: Company | null;
  _count: { posts: number };
}

export interface AdminStats {
  totalUsers: number;
  totalFounders: number;
  totalPosts: number;
  pendingDocs: number;
  verifiedDocs: number;
  rejectedDocs: number;
  totalEvents: number;
  pendingRefunds: number;
}

export interface AdminEvent {
  id: string;
  title: string;
  status: 'ACTIVE' | 'CANCELLED' | 'COMPLETED';
  eventDate: string;
  venue: string;
  price: number;
  isListed: boolean;
  createdAt: string;
  organizer: { id: string; firstName: string; lastName: string; email: string };
  _count: { registrations: number };
}

// ── API calls ──────────────────────────────────────────────────────────────

export const api = {
  login: (email: string, password: string) =>
    adminApi.post("/admin/login", { email, password }).then((r) => r.data as {
      success: boolean;
      message: string;
      data: { token: string; admin: AdminUser };
    }),

  getStats: () =>
    adminApi.get("/admin/stats").then((r) => r.data as { success: boolean; data: AdminStats }),

  getAllUsers: () =>
    adminApi.get("/admin/users").then((r) => r.data as { success: boolean; data: UserRow[] }),

  getAllDocs: () =>
    adminApi.get("/admin/docs").then((r) => r.data as { success: boolean; data: Company[] }),

  verifyDoc: (companyId: string) =>
    adminApi.patch(`/admin/docs/${companyId}/verify`).then((r) => r.data),

  rejectDoc: (companyId: string, reason: string) =>
    adminApi.patch(`/admin/docs/${companyId}/reject`, { reason }).then((r) => r.data),

  getAllEvents: () =>
    adminApi.get('/admin/events').then((r) => r.data as { success: boolean; data: AdminEvent[] }),

  cancelEvent: (id: string) =>
    adminApi.post(`/admin/events/${id}/cancel`).then((r) => r.data),

  getEventRegistrations: (id: string) =>
    adminApi.get(`/admin/events/${id}/registrations`).then((r) => r.data),
};

export default adminApi;
