"use client";
import React, { useState } from "react";
import { Event, eventsApi } from "@/apis/events.api";
import { useAppSelector } from "@/store/hooks";
import { toast } from "sonner";
import { X, Loader2, IndianRupee, User, Mail, Phone, Shield, TicketCheck } from "lucide-react";

declare global { interface Window { Razorpay: any; } }

interface Props {
  event: Event;
  onClose: () => void;
  onSuccess: () => void;
}

const INPUT_CLS = "w-full px-4 py-3 bg-[#111116] border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition";

export function RegisterEventModal({ event, onClose, onSuccess }: Props) {
  const { user } = useAppSelector((s) => s.auth);
  const [loading, setLoading] = useState(false);
  const [attendanceCode, setAttendanceCode] = useState<string | null>(null);

  const [form, setForm] = useState({
    participantName: user ? `${user.firstName} ${user.lastName}` : "",
    participantEmail: user?.email ?? "",
    participantPhone: (user as any)?.phone ?? "",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const isFree = event.price === 0;

  const loadRazorpayScript = (): Promise<boolean> =>
    new Promise((resolve) => {
      if (window.Razorpay) { resolve(true); return; }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handleRegister = async () => {
    if (!form.participantName || !form.participantEmail || !form.participantPhone) {
      toast.error("Please fill all fields including phone number");
      return;
    }
    setLoading(true);
    try {
      const orderRes = await eventsApi.createRegistrationOrder(event.id);
      if (!orderRes.success) throw new Error("Failed to create order");

      // free event — code comes back directly
      if ((orderRes.data as any).free) {
        setAttendanceCode((orderRes.data as any).attendanceCode);
        toast.success("Registered! Here's your attendance code.");
        return;
      }

      const loaded = await loadRazorpayScript();
      if (!loaded) { toast.error("Razorpay SDK failed to load. Check your connection."); setLoading(false); return; }

      const { orderId, amount, currency, keyId } = orderRes.data;
      const rzp = new window.Razorpay({
        key: keyId,
        amount,
        currency,
        order_id: orderId,
        name: event.title,
        description: `Registration fee — ${event.organizerName}`,
        theme: { color: "#7c3aed" },
        prefill: { name: form.participantName, email: form.participantEmail, contact: form.participantPhone },
        handler: async (resp: any) => {
          try {
            const verifyRes = await eventsApi.verifyRegistration(event.id, {
              razorpay_order_id: resp.razorpay_order_id,
              razorpay_payment_id: resp.razorpay_payment_id,
              razorpay_signature: resp.razorpay_signature,
              ...form,
            });
            if (verifyRes.success) {
              setAttendanceCode(verifyRes.data.attendanceCode);
              toast.success("Registration confirmed!");
            }
          } catch { toast.error("Payment verified but registration failed. Contact support."); }
          finally { setLoading(false); }
        },
        modal: { ondismiss: () => setLoading(false) },
      });
      rzp.open();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Registration failed");
      setLoading(false);
    }
  };

  // Show code after successful registration
  if (attendanceCode) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <div className="w-full max-w-sm bg-[#0d0d12] border border-white/10 rounded-2xl p-8 shadow-2xl text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center mx-auto mb-5">
            <TicketCheck size={28} className="text-emerald-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">You're registered! 🎉</h3>
          <p className="text-sm text-gray-400 mb-6">Show this secret code at the venue. Keep it private — don't share with anyone.</p>

          <div className="bg-gradient-to-br from-purple-500/20 to-violet-600/10 border border-purple-500/20 rounded-2xl p-6 mb-6">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Your Attendance Code</p>
            <p className="text-5xl font-black text-white tracking-[0.3em] font-mono">{attendanceCode}</p>
          </div>

          <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-left mb-5">
            <Shield size={14} className="text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-300">This code is encrypted and never visible to the host or admin. Present it only at the venue.</p>
          </div>

          <button onClick={() => { onSuccess(); }}
            className="w-full py-3 rounded-xl bg-purple-600 text-white font-semibold text-sm hover:opacity-90 transition">
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#0d0d12] border border-white/10 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div>
            <h2 className="text-base font-bold text-white">Register for Event</h2>
            <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[260px]">{event.title}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5"><User size={13} className="inline mr-1" />Full Name *</label>
            <input placeholder="Your name" value={form.participantName} onChange={set("participantName")} className={INPUT_CLS} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5"><Mail size={13} className="inline mr-1" />Email *</label>
            <input type="email" placeholder="your@email.com" value={form.participantEmail} onChange={set("participantEmail")} className={INPUT_CLS} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5"><Phone size={13} className="inline mr-1" />Phone Number *</label>
            <input type="tel" placeholder="+91 XXXXXXXXXX" value={form.participantPhone} onChange={set("participantPhone")} className={INPUT_CLS} />
          </div>

          {/* Price + refund policy */}
          <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-sm space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Entry Fee</span>
              <span className="text-white font-bold text-lg flex items-center gap-1">
                {isFree ? "Free" : <><IndianRupee size={14} />{(event.price / 100).toFixed(0)}</>}
              </span>
            </div>
            {!isFree && (
              <p className="text-xs text-purple-300/60 pt-1">
                If you can't attend, you'll receive a refund minus 5% processing fee.
                If the event is cancelled by the host or admin, you'll receive a full refund.
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/10 text-sm text-gray-400 hover:bg-white/5 transition-colors">
            Cancel
          </button>
          <button onClick={handleRegister} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-purple-500/20">
            {loading ? <><Loader2 size={15} className="animate-spin" /> Processing…</> : isFree ? "Register (Free)" : `Pay ₹${(event.price / 100).toFixed(0)} & Register →`}
          </button>
        </div>
      </div>
    </div>
  );
}
