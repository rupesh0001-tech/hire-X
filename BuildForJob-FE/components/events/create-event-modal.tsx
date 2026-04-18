"use client";
import React, { useState, useRef } from "react";
import { eventsApi } from "@/apis/events.api";
import { toast } from "sonner";
import { X, Upload, Calendar, MapPin, IndianRupee, Users, Trophy, Phone, User, Loader2, Shield } from "lucide-react";
import { useAppSelector } from "@/store/hooks";

declare global { interface Window { Razorpay: any; } }

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

const INPUT_CLS = "w-full px-4 py-3 bg-[#111116] border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition";
const LABEL_CLS = "block text-sm font-medium text-gray-300 mb-1.5";

export function CreateEventModal({ onClose, onCreated }: Props) {
  const { user } = useAppSelector((s) => s.auth);
  const [step, setStep] = useState<"form" | "pay">("form");
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    venue: "",
    prize: "",
    maxParticipants: "",
    eventDate: "",
    contactInfo: "",
    organizerName: user ? `${user.firstName} ${user.lastName}` : "",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleBanner = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setBanner(f);
    setBannerPreview(URL.createObjectURL(f));
  };

  const loadRazorpayScript = (): Promise<boolean> =>
    new Promise((resolve) => {
      if (window.Razorpay) { resolve(true); return; }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handlePay = async () => {
    // Validate required fields
    if (!form.title || !form.description || !form.venue || !form.eventDate || !form.contactInfo || !form.organizerName) {
      toast.error("Please fill all required fields");
      return;
    }
    setLoading(true);
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) { toast.error("Razorpay SDK failed to load. Check your connection."); setLoading(false); return; }

      const orderRes = await eventsApi.createListingOrder();
      if (!orderRes.success) throw new Error("Failed to create order");

      const { orderId, amount, currency, keyId } = orderRes.data;

      const rzp = new window.Razorpay({
        key: keyId,
        amount,
        currency,
        order_id: orderId,
        name: "BuildForJob Events",
        description: "Event Listing Fee (₹100)",
        theme: { color: "#7c3aed" },
        handler: async (response: any) => {
          await submitEvent(response.razorpay_order_id, response.razorpay_payment_id, response.razorpay_signature);
        },
        modal: { ondismiss: () => setLoading(false) },
      });
      rzp.open();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to initiate payment");
      setLoading(false);
    }
  };

  const submitEvent = async (order_id: string, payment_id: string, signature: string) => {
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append("razorpay_order_id", order_id);
      fd.append("razorpay_payment_id", payment_id);
      fd.append("razorpay_signature", signature);
      if (banner) fd.append("banner", banner);

      const res = await eventsApi.createEvent(fd);
      if (res.success) {
        toast.success("🎉 Event listed successfully!");
        onCreated();
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-[#0d0d12] border border-white/10 rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 shrink-0">
          <div>
            <h2 className="text-base font-bold text-white">Host an Event</h2>
            <p className="text-xs text-gray-500 mt-0.5">Fill the details — a one-time ₹100 listing fee applies</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {/* Banner upload */}
          <div>
            <label className={LABEL_CLS}>Event Banner <span className="text-gray-600 font-normal">(optional)</span></label>
            {bannerPreview ? (
              <div className="relative">
                <img src={bannerPreview} alt="" className="w-full h-40 object-cover rounded-xl border border-white/10" />
                <button onClick={() => { setBanner(null); setBannerPreview(null); }}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white hover:bg-black/80 transition">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button onClick={() => fileRef.current?.click()}
                className="flex flex-col items-center justify-center w-full h-28 rounded-xl border border-dashed border-white/15 bg-white/[0.02] hover:bg-white/[0.05] transition-colors text-gray-500 hover:text-gray-300 gap-2 text-sm">
                <Upload size={20} />
                Click to upload banner image
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleBanner} />
          </div>

          {/* Title */}
          <div>
            <label className={LABEL_CLS}>Event Title *</label>
            <input placeholder="e.g. TechHack 2025 — 48hr Hackathon" value={form.title} onChange={set("title")} className={INPUT_CLS} />
          </div>

          {/* Description */}
          <div>
            <label className={LABEL_CLS}>Description *</label>
            <textarea placeholder="Tell people what this event is about…" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={4}
              className={`${INPUT_CLS} resize-none`} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Date */}
            <div>
              <label className={LABEL_CLS}><Calendar size={13} className="inline mr-1" />Date & Time *</label>
              <input type="datetime-local" value={form.eventDate} onChange={set("eventDate")} className={INPUT_CLS} />
            </div>
            {/* Venue */}
            <div>
              <label className={LABEL_CLS}><MapPin size={13} className="inline mr-1" />Venue *</label>
              <input placeholder="Location or 'Virtual'" value={form.venue} onChange={set("venue")} className={INPUT_CLS} />
            </div>
            {/* Price */}
            <div>
              <label className={LABEL_CLS}><IndianRupee size={13} className="inline mr-1" />Entry Price (₹, 0 = free)</label>
              <input type="number" min="0" placeholder="0" value={form.price} onChange={set("price")} className={INPUT_CLS} />
            </div>
            {/* Max participants */}
            <div>
              <label className={LABEL_CLS}><Users size={13} className="inline mr-1" />Max Participants</label>
              <input type="number" min="1" placeholder="Unlimited" value={form.maxParticipants} onChange={set("maxParticipants")} className={INPUT_CLS} />
            </div>
          </div>

          {/* Prize / Award */}
          <div>
            <label className={LABEL_CLS}><Trophy size={13} className="inline mr-1" />Prize / Award</label>
            <input placeholder="e.g. ₹50,000 + internship offer (optional)" value={form.prize} onChange={set("prize")} className={INPUT_CLS} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Organizer name */}
            <div>
              <label className={LABEL_CLS}><User size={13} className="inline mr-1" />Organizer Name *</label>
              <input placeholder="Your name or organization" value={form.organizerName} onChange={set("organizerName")} className={INPUT_CLS} />
            </div>
            {/* Contact */}
            <div>
              <label className={LABEL_CLS}><Phone size={13} className="inline mr-1" />Contact Info *</label>
              <input placeholder="email or phone" value={form.contactInfo} onChange={set("contactInfo")} className={INPUT_CLS} />
            </div>
          </div>

          {/* Fee notice */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm">
            <Shield size={16} className="text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-300">One-time Listing Fee: ₹100</p>
              <p className="text-xs text-amber-400/70 mt-0.5">Paid via Razorpay. This is non-refundable even if you cancel the event. Your event will be listed immediately after payment.</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-white/5 shrink-0">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/10 text-sm text-gray-400 hover:bg-white/5 transition-colors">
            Cancel
          </button>
          <button onClick={handlePay} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-500/20">
            {loading ? <><Loader2 size={16} className="animate-spin" />Processing…</> : "Pay ₹100 & List Event →"}
          </button>
        </div>
      </div>
    </div>
  );
}
