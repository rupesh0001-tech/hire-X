"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { adminAuthApi } from "@/apis/admin.api";
import { Shield, Eye, EyeOff, Loader2, Lock } from "lucide-react";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      const res = await adminAuthApi.login(email, password);
      if (res.success) {
        localStorage.setItem("admin_token", res.data.token);
        localStorage.setItem("admin_user", JSON.stringify(res.data.admin));
        toast.success("Welcome back, Admin!");
        router.push("/admin/dashboard");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08080a] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Grid background */}
      <div
        className="fixed inset-0 z-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#a855f7 0.5px, transparent 0.5px)`,
          backgroundSize: "24px 24px",
        }}
      />
      {/* Glow orbs */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-[300px] h-[300px] bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand */}
        <div className="flex flex-col items-center mb-8 gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-violet-700 flex items-center justify-center shadow-xl shadow-purple-500/30">
            <Shield size={28} className="text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white tracking-tight">Admin Portal</h1>
            <p className="text-sm text-gray-500 mt-1">BuildForJob — Internal Access Only</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-2 mb-6 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <Lock size={14} className="text-amber-400 shrink-0" />
            <p className="text-xs text-amber-300">Restricted access. Authorised personnel only.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="text-sm font-medium text-gray-300 block mb-1.5">
                Admin Email
              </label>
              <input
                id="admin-email"
                type="email"
                autoComplete="email"
                placeholder="admin@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-[#111116] border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder:text-gray-600 text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300 block mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-[#111116] border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder:text-gray-600 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              id="admin-login-btn"
              disabled={loading || !email || !password}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 text-white font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Verifying…
                </>
              ) : (
                <>
                  <Shield size={18} />
                  Sign in as Admin
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-600 mt-6">
          All admin actions are logged and monitored.
        </p>
      </div>
    </div>
  );
}
