"use client";
import React, { useState } from "react";
import { ArrowRight, Loader2, Eye, EyeOff, Building2 } from "lucide-react";
import { Button1 } from "@/components/general/buttons/button1";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { register } from "@/store/slices/authSlice";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface RegisterFormProps {
  onSuccess?: (email: string, isFounder: boolean) => void;
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isFounder, setIsFounder] = useState(false);

  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isLoading } = useAppSelector((state) => state.auth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      toast.error("Disabled temporarily: non-English characters in email credentials");
      return;
    }

    try {
      const resultAction = await dispatch(
        register({ email, password, firstName, lastName, role: isFounder ? "FOUNDER" : "USER" })
      );
      if (register.fulfilled.match(resultAction)) {
        toast.success("Registration successful!");
        if (onSuccess) {
          onSuccess(email, isFounder);
        } else {
          router.push("/dashboard");
        }
      } else {
        toast.error(resultAction.payload as string || "Registration failed");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
        <input
          type="text"
          placeholder="Jane"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#111116] border border-gray-200 dark:border-white/10 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder:text-gray-400"
        />

        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</label>
        <input
          type="text"
          placeholder="Doe"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#111116] border border-gray-200 dark:border-white/10 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder:text-gray-400"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#111116] border border-gray-200 dark:border-white/10 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder:text-gray-400"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Create a strong password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#111116] border border-gray-200 dark:border-white/10 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder:text-gray-400"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {/* Founder checkbox */}
      <label
        className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
          isFounder
            ? "border-purple-500/60 bg-purple-500/10"
            : "border-white/10 bg-white/2 hover:border-white/20"
        }`}
      >
        <div className="relative mt-0.5">
          <input
            type="checkbox"
            checked={isFounder}
            onChange={(e) => setIsFounder(e.target.checked)}
            className="sr-only"
          />
          <div
            className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-all ${
              isFounder ? "bg-purple-600 border-purple-600" : "border-gray-500"
            }`}
          >
            {isFounder && (
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <Building2 size={15} className={isFounder ? "text-purple-400" : "text-gray-500"} />
            <span className={`text-sm font-semibold ${isFounder ? "text-white" : "text-gray-400"}`}>
              I'm the owner of a company
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Register as a founder to post jobs, hire talent, and grow your team.
          </p>
        </div>
      </label>

      <Button1
        type="submit"
        className="w-full py-3 h-12 flex items-center justify-center gap-2 mt-4"
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="animate-spin" size={16} />
        ) : (
          <>Create Account <ArrowRight size={16} /></>
        )}
      </Button1>
    </form>
  );
}
