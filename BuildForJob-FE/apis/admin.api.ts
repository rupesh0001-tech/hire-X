import axios from 'axios';

const adminApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  headers: { 'Content-Type': 'application/json' },
});

// Attach admin token
adminApi.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Types ─────────────────────────────────────────────────────────────────────
export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface Company {
  id: string;
  name: string;
  industry: string | null;
  website: string | null;
  logoUrl: string | null;
  docUrl: string | null;
  docVerificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  docRejectionReason: string | null;
  createdAt: string;
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
  role: 'USER' | 'FOUNDER';
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
}

// ── API Functions ─────────────────────────────────────────────────────────────
export const adminAuthApi = {
  login: async (email: string, password: string) => {
    const r = await adminApi.post('/admin/login', { email, password });
    return r.data as { success: boolean; message: string; data: { token: string; admin: AdminUser } };
  },
};

export const adminDataApi = {
  getStats: async () => {
    const r = await adminApi.get('/admin/stats');
    return r.data as { success: boolean; data: AdminStats };
  },
  getAllUsers: async () => {
    const r = await adminApi.get('/admin/users');
    return r.data as { success: boolean; data: UserRow[] };
  },
  getAllDocs: async () => {
    const r = await adminApi.get('/admin/docs');
    return r.data as { success: boolean; data: Company[] };
  },
  verifyDoc: async (companyId: string) => {
    const r = await adminApi.patch(`/admin/docs/${companyId}/verify`);
    return r.data as { success: boolean; message: string };
  },
  rejectDoc: async (companyId: string, reason: string) => {
    const r = await adminApi.patch(`/admin/docs/${companyId}/reject`, { reason });
    return r.data as { success: boolean; message: string };
  },
};

export default adminApi;
