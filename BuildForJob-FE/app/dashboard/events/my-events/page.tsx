"use client";
import React, { useEffect, useState, useCallback } from "react";
import { eventsApi, Event, HostRegistration, EventStats } from "@/apis/events.api";
import { toast } from "sonner";
import {
  CalendarCheck, CalendarDays, Users, IndianRupee, Trophy,
  CheckCircle, XCircle, Clock, ScanLine, ChevronDown, ChevronUp,
  Loader2, AlertTriangle, X
} from "lucide-react";
import { cn } from "@/lib/utils";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
function formatRupees(paise: number) { return `₹${(paise / 100).toFixed(0)}`; }

// ── Attendance code verifier ──────────────────────────────────────────────────
function AttendanceVerifier({ eventId }: { eventId: string }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ name: string; already?: boolean } | null>(null);

  const verify = async () => {
    if (code.length < 5) { toast.error("Enter a 5-character code"); return; }
    setLoading(true);
    setResult(null);
    try {
      const r = await eventsApi.verifyAttendance(eventId, code);
      if (r.success) {
        setResult({ name: r.data.participantName, already: (r as any).alreadyVerified });
        toast.success(r.message);
        setCode("");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Invalid code");
    } finally { setLoading(false); }
  };

  return (
    <div className="rounded-xl border border-purple-300 dark:border-purple-500/20 bg-purple-50 dark:bg-purple-500/[0.06] p-4 space-y-3">
      <p className="text-sm font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-2"><ScanLine size={15} /> Verify Attendee at Venue</p>
      <div className="flex gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 5))}
          placeholder="Enter 5-digit code"
          maxLength={5}
          className="flex-1 px-4 py-2.5 bg-white dark:bg-[#111116] border border-gray-200 dark:border-white/10 rounded-xl text-lg font-mono font-bold text-gray-900 dark:text-white tracking-widest uppercase placeholder:text-gray-400 dark:placeholder:text-gray-700 placeholder:text-sm placeholder:font-normal placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition"
        />
        <button onClick={verify} disabled={loading || code.length < 5}
          className="px-4 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-2">
          {loading ? <Loader2 size={15} className="animate-spin" /> : "Verify"}
        </button>
      </div>
      {result && (
        <div className={cn("flex items-center gap-2 p-3 rounded-xl text-sm font-semibold",
          result.already ? "bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-300" : "bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300")}>
          <CheckCircle size={15} />
          {result.already ? `Already verified: ${result.name}` : `✓ Verified! Welcome, ${result.name}`}
        </div>
      )}
    </div>
  );
}

// ── Single hosted event card ───────────────────────────────────────────────────
function HostedEventCard({ event, onRefresh }: { event: Event; onRefresh: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [regs, setRegs] = useState<{ registrations: HostRegistration[]; stats: EventStats } | null>(null);
  const [loadingRegs, setLoadingRegs] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const loadRegs = useCallback(async () => {
    if (regs) return;
    setLoadingRegs(true);
    try {
      const r = await eventsApi.getRegistrations(event.id);
      if (r.success) setRegs(r.data);
    } finally { setLoadingRegs(false); }
  }, [event.id, regs]);

  const toggle = () => {
    setExpanded(!expanded);
    if (!expanded) loadRegs();
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await eventsApi.cancelEvent(event.id);
      toast.success("Event cancelled. Refunds will be processed.");
      setConfirmCancel(false);
      onRefresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to cancel");
    } finally { setCancelling(false); }
  };

  const isPast = new Date(event.eventDate) < new Date();
  const stats = regs?.stats;

  return (
    <div className={cn("rounded-2xl border overflow-hidden transition-all",
      event.status === "CANCELLED" ? "border-red-200 dark:border-red-500/20 bg-red-50/30 dark:bg-red-500/[0.03]" : "border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.02] hover:border-purple-300 dark:hover:border-white/20")}>
      {/* Header */}
      <div className="p-5">
        <div className="flex items-start gap-4">
          {event.bannerUrl
            ? <img src={event.bannerUrl} alt="" className="w-16 h-16 rounded-xl object-cover border border-white/10 shrink-0" />
            : <div className="w-16 h-16 rounded-xl bg-purple-500/15 flex items-center justify-center shrink-0"><CalendarDays size={24} className="text-purple-400" /></div>
          }
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="font-bold text-gray-900 dark:text-white">{event.title}</h3>
              <span className={cn("text-xs px-2 py-0.5 rounded-full font-semibold border",
                event.status === "ACTIVE" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" :
                event.status === "CANCELLED" ? "bg-red-500/15 text-red-400 border-red-500/20" :
                "bg-gray-500/15 text-gray-400 border-gray-500/20")}>
                {event.status}
              </span>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
              <span className="flex items-center gap-1"><CalendarDays size={11} />{formatDate(event.eventDate)}</span>
              <span>📍 {event.venue}</span>
              <span className="flex items-center gap-1"><Users size={11} />{event._count.registrations} registered</span>
              <span className="flex items-center gap-1 text-white font-semibold">
                <IndianRupee size={11} />{event.price === 0 ? "Free" : (event.price / 100).toFixed(0)} entry
              </span>
            </div>
          </div>
          <button onClick={toggle} className="p-2 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white transition-colors shrink-0">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {/* Quick stats when collapsed */}
        {!expanded && regs && (
          <div className="flex gap-4 mt-3 pt-3 border-t border-white/5">
            <span className="text-xs text-emerald-400 flex items-center gap-1"><CheckCircle size={11} />{stats?.verified} attended</span>
            <span className="text-xs text-gray-400 flex items-center gap-1"><Clock size={11} />{stats?.notVerified} pending</span>
            <span className="text-xs text-purple-400 font-semibold flex items-center gap-1 ml-auto"><IndianRupee size={11} />{formatRupees(stats?.totalRevenue ?? 0)} earned</span>
          </div>
        )}
      </div>

      {/* Expanded panel */}
      {expanded && (
        <div className="border-t border-gray-100 dark:border-white/5 p-5 space-y-5">
          {/* Attendance verifier (only for active, non-past events) */}
          {event.status === "ACTIVE" && !isPast && (
            <AttendanceVerifier eventId={event.id} />
          )}

          {loadingRegs ? (
            <div className="flex justify-center py-6"><div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" /></div>
          ) : stats ? (
            <>
              {/* Analytics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Registered", value: stats.total, color: "purple", icon: Users },
                  { label: "Attended", value: stats.verified, color: "emerald", icon: CheckCircle },
                  { label: "Absent", value: stats.absent, color: "red", icon: XCircle },
                  { label: "Pending", value: stats.notVerified, color: "amber", icon: Clock },
                ].map(({ label, value, color, icon: Icon }) => (
                  <div key={label} className={`rounded-xl border p-3 bg-${color}-500/5 border-${color}-500/20`}>
                    <p className="text-xs text-gray-500 mb-1">{label}</p>
                    <p className={`text-2xl font-bold text-${color}-400`}>{value}</p>
                  </div>
                ))}
              </div>

              {/* Revenue */}
              <div className="rounded-xl border border-gray-200 dark:border-white/10 p-4 bg-gray-50 dark:bg-white/[0.02] space-y-2">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Revenue Summary</p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Earned (attended users)</span>
                  <span className="text-emerald-400 font-bold">{formatRupees(stats.totalRevenue)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Expected (all registered)</span>
                  <span className="text-purple-400 font-semibold">{formatRupees(stats.pendingRevenue)}</span>
                </div>
                <p className="text-xs text-gray-600 pt-1">Admin settles payments to your account after event verification.</p>
              </div>

              {/* Registrant list */}
              {regs.registrations.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Registrant List</p>
                   <div className="rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02]">
                          <th className="text-left px-4 py-2.5 text-xs text-gray-500 font-medium">Name</th>
                          <th className="text-left px-4 py-2.5 text-xs text-gray-500 font-medium hidden md:table-cell">Email</th>
                          <th className="text-left px-4 py-2.5 text-xs text-gray-500 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {regs.registrations.map((r) => (
                          <tr key={r.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                            <td className="px-4 py-3 text-white text-sm font-medium">{r.participantName}</td>
                            <td className="px-4 py-3 text-gray-500 text-xs hidden md:table-cell">{r.participantEmail}</td>
                            <td className="px-4 py-3">
                              <span className={cn("text-xs px-2 py-0.5 rounded-full font-semibold border",
                                r.attendanceStatus === "VERIFIED" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" :
                                r.attendanceStatus === "ABSENT" ? "bg-red-500/15 text-red-400 border-red-500/20" :
                                "bg-gray-500/15 text-gray-400 border-gray-500/20")}>
                                {r.attendanceStatus.replace("_", " ")}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          ) : null}

          {/* Cancel */}
          {event.status === "ACTIVE" && (
            <div className="pt-2">
              {!confirmCancel ? (
                <button onClick={() => setConfirmCancel(true)}
                  className="flex items-center gap-2 text-xs text-red-400 hover:text-red-300 font-medium transition-colors">
                  <XCircle size={13} /> Cancel this event
                </button>
              ) : (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                  <AlertTriangle size={15} className="text-red-400 shrink-0" />
                  <p className="text-xs text-red-300 flex-1">All registered users will be refunded. You will NOT get your ₹100 listing fee back.</p>
                  <button onClick={() => setConfirmCancel(false)} className="p-1 text-gray-500 hover:text-white"><X size={14} /></button>
                  <button onClick={handleCancel} disabled={cancelling}
                    className="px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/30 text-xs font-semibold text-red-400 hover:bg-red-500/30 transition-colors flex items-center gap-1">
                    {cancelling ? <Loader2 size={12} className="animate-spin" /> : null}Confirm Cancel
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function MyEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    eventsApi.getMyEvents()
      .then((r) => { if (r.success) setEvents(r.data); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="max-w-3xl mx-auto pb-16 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <CalendarCheck size={22} className="text-purple-500" /> My Events
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Events you're hosting — manage, verify attendance, view analytics</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : events.length === 0 ? (
        <div className="text-center py-24">
          <CalendarCheck size={40} className="text-gray-300 dark:text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-500">You haven't hosted any events yet.</p>
          <a href="/dashboard/events" className="mt-4 inline-block px-5 py-2 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:opacity-90 transition">
            Host an Event →
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((e) => <HostedEventCard key={e.id} event={e} onRefresh={load} />)}
        </div>
      )}
    </div>
  );
}
