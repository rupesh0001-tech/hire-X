"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Shield, Eye, EyeOff, Loader2, Lock } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@gmail.com");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.login(email.trim(), password);
      if (res.success) {
        localStorage.setItem("admin_token", res.data.token);
        localStorage.setItem("admin_user", JSON.stringify(res.data.admin));
        toast.success(`Welcome, ${res.data.admin.firstName}!`);
        router.push("/dashboard");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Login failed. Check credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-[#08080a]">
      {/* Dot grid */}
      <div
        className="fixed inset-0 opacity-[0.04] pointer-events-none"
        style={{ backgroundImage: `radial-gradient(#a855f7 0.5px, transparent 0.5px)`, backgroundSize: "24px 24px" }}
      />
      {/* Glow orbs */}
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-700/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/3 w-[300px] h-[300px] bg-violet-600/8 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand */}
        <div className="flex flex-col items-center mb-10 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-violet-700 flex items-center justify-center shadow-2xl shadow-purple-500/40 ring-1 ring-white/10">
            <Shield size={32} className="text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white tracking-tight">Admin Portal</h1>
            <p className="text-sm text-gray-500 mt-1">BuildForJob · Restricted Access</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-xl ring-1 ring-white/5">
          {/* Warning */}
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-6">
            <Lock size={14} className="text-amber-400 shrink-0" />
            <p className="text-xs text-amber-300">Authorised personnel only. All actions are logged.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Admin Email</label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@gmail.com"
                className="w-full px-4 py-3 rounded-xl bg-[#111116] border border-white/10 text-white text-sm placeholder:text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition"
              />
            </div>
            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPass ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-[#111116] border border-white/10 text-white text-sm placeholder:text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              id="login-submit"
              disabled={loading || !email || !password}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 text-white font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-purple-500/25 disabled:opacity-40 disabled:cursor-not-allowed mt-2"
            >
              {loading ? <><Loader2 size={17} className="animate-spin" />Authenticating…</> : <><Shield size={17} />Sign In as Admin</>}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-700 mt-6">
          Seed credentials: admin@gmail.com / Test@123
        </p>
      </div>
    </div>
  );
}
