"use client";
import React, { useEffect, useState } from "react";
import { eventsApi, EventRegistration } from "@/apis/events.api";
import { toast } from "sonner";
import { Ticket, CalendarDays, MapPin, IndianRupee, TicketCheck, Shield, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";

const ATTENDANCE_BADGE: Record<string, string> = {
  NOT_VERIFIED: "bg-gray-500/15 text-gray-400 border-gray-500/20",
  VERIFIED:     "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  ABSENT:       "bg-red-500/15 text-red-400 border-red-500/20",
};
const REFUND_BADGE: Record<string, string> = {
  NONE:      "",
  PENDING:   "bg-amber-500/15 text-amber-400 border-amber-500/20",
  PROCESSED: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function MyRegistrationsPage() {
  const [regs, setRegs] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [revealed, setRevealed] = useState<string | null>(null);

  useEffect(() => {
    eventsApi.getMyRegistrations()
      .then((r) => { if (r.success) setRegs(r.data); })
      .catch(() => toast.error("Failed to load registrations"))
      .finally(() => setLoading(false));
  }, []);

  const upcoming = regs.filter((r) => new Date(r.event.eventDate) >= new Date());
  const past = regs.filter((r) => new Date(r.event.eventDate) < new Date());

  const renderReg = (reg: EventRegistration) => (
    <div key={reg.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-4">
      {/* Event info */}
      <div className="flex items-start gap-3">
        {reg.event.bannerUrl
          ? <img src={reg.event.bannerUrl} alt="" className="w-14 h-14 rounded-xl object-cover border border-white/10 shrink-0" />
          : <div className="w-14 h-14 rounded-xl bg-purple-500/15 flex items-center justify-center shrink-0"><CalendarDays size={22} className="text-purple-400" /></div>
        }
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white text-sm leading-snug">{reg.event.title}</p>
          <p className="text-xs text-gray-500 mt-0.5">{reg.event.organizerName}</p>
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 text-xs text-gray-500">
            <span className="flex items-center gap-1"><CalendarDays size={11} />{formatDate(reg.event.eventDate)}</span>
            <span className="flex items-center gap-1"><MapPin size={11} />{reg.event.venue}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className={cn("inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border", ATTENDANCE_BADGE[reg.attendanceStatus])}>
            <TicketCheck size={10} />
            {reg.attendanceStatus.replace("_", " ")}
          </span>
          {reg.refundStatus !== "NONE" && (
            <span className={cn("inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border", REFUND_BADGE[reg.refundStatus])}>
              <RefreshCcw size={9} />
              Refund: {reg.refundStatus}
            </span>
          )}
        </div>
      </div>

      {/* Refund notice */}
      {reg.refundStatus === "PENDING" && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
          <span className="text-amber-400 font-semibold">Refund Pending:</span>
          <span className="text-amber-300/80">Your refund is being processed (95% of ₹{(reg.amountPaid / 100).toFixed(0)} = ₹{((reg.amountPaid * 0.95) / 100).toFixed(0)}). Contact admin if delayed.</span>
        </div>
      )}

      {/* Secret code */}
      {reg.attendanceCode && reg.event.status !== "CANCELLED" && (
        <div className="border border-white/5 rounded-xl p-4 bg-white/[0.015]">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-500 flex items-center gap-1.5"><Shield size={12} className="text-purple-400" /> Your Secret Attendance Code</p>
            <button onClick={() => setRevealed(revealed === reg.id ? null : reg.id)}
              className="text-xs text-purple-400 hover:text-purple-300 font-medium transition-colors">
              {revealed === reg.id ? "Hide" : "Reveal"}
            </button>
          </div>
          {revealed === reg.id ? (
            <p className="text-4xl font-black text-white tracking-[0.3em] font-mono text-center py-2">{reg.attendanceCode}</p>
          ) : (
            <p className="text-4xl font-black text-gray-700 tracking-[0.3em] font-mono text-center py-2 select-none">•••••</p>
          )}
          <p className="text-xs text-gray-600 text-center mt-1">Show only at the venue entrance. Never share.</p>
        </div>
      )}

      {/* Amount paid */}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-1 border-t border-white/5">
        <span>Registered {new Date(reg.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
        <span className="flex items-center gap-1 text-white font-semibold">
          <IndianRupee size={12} />
          {reg.amountPaid === 0 ? "Free" : (reg.amountPaid / 100).toFixed(0)}
        </span>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto pb-16 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Ticket size={22} className="text-purple-400" /> My Registrations
        </h1>
        <p className="text-sm text-gray-500 mt-1">Events you've registered for</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : regs.length === 0 ? (
        <div className="text-center py-24">
          <Ticket size={40} className="text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500">No registrations yet. Browse events and join one!</p>
          <a href="/dashboard/events" className="mt-4 inline-block px-5 py-2 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:opacity-90 transition">
            Browse Events →
          </a>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Upcoming</h2>
              {upcoming.map(renderReg)}
            </section>
          )}
          {past.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Past</h2>
              <div className="opacity-70">{past.map(renderReg)}</div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
