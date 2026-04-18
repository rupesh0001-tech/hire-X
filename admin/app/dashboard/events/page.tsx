"use client";
import React, { useEffect, useState, useCallback } from "react";
import { api, AdminEvent } from "@/lib/api";
import { toast } from "sonner";
import {
  CalendarDays, Users, IndianRupee, MapPin,
  X, Loader2, AlertTriangle, ChevronDown, ChevronUp, Search,
} from "lucide-react";

function cn(...cls: (string | boolean | undefined)[]) { return cls.filter(Boolean).join(" "); }
function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
function formatRupees(paise: number) { return paise === 0 ? "Free" : `₹${(paise / 100).toFixed(0)}`; }

function EventRow({ event, onRefresh }: { event: AdminEvent; onRefresh: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [regs, setRegs] = useState<any[] | null>(null);
  const [loadingRegs, setLoadingRegs] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [confirm, setConfirm] = useState(false);

  const loadRegs = async () => {
    if (regs) return;
    setLoadingRegs(true);
    try {
      const r = await api.getEventRegistrations(event.id);
      if ((r as any).success) setRegs((r as any).data);
    } finally { setLoadingRegs(false); }
  };

  const toggle = () => { setExpanded(!expanded); if (!expanded) loadRegs(); };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await api.cancelEvent(event.id);
      toast.success("Event cancelled and refunds queued");
      setConfirm(false);
      onRefresh();
    } catch { toast.error("Failed to cancel event"); }
    finally { setCancelling(false); }
  };

  return (
    <React.Fragment>
      <tr
        onClick={toggle}
        className={cn("border-b border-white/5 hover:bg-white/[0.025] transition-colors cursor-pointer", expanded && "bg-white/[0.03]")}
      >
        <td className="px-5 py-4">
          <p className="text-sm font-semibold text-white">{event.title}</p>
          <p className="text-xs text-gray-500">{event.organizer.firstName} {event.organizer.lastName} · {event.organizer.email}</p>
        </td>
        <td className="px-5 py-4 hidden md:table-cell text-xs text-gray-400">
          <div className="flex items-center gap-1"><CalendarDays size={12} />{formatDate(event.eventDate)}</div>
          <div className="flex items-center gap-1 mt-1"><MapPin size={12} />{event.venue}</div>
        </td>
        <td className="px-5 py-4">
          <span className={cn("text-xs px-2.5 py-1 rounded-full font-semibold border",
            event.status === "ACTIVE" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" :
            event.status === "CANCELLED" ? "bg-red-500/15 text-red-400 border-red-500/20" :
            "bg-gray-500/15 text-gray-400 border-gray-500/20")}>
            {event.status}
          </span>
        </td>
        <td className="px-5 py-4 hidden lg:table-cell">
          <div className="flex items-center gap-1 text-xs text-gray-400"><Users size={12} />{event._count.registrations}</div>
        </td>
        <td className="px-5 py-4 hidden lg:table-cell text-sm font-semibold text-white">
          {formatRupees(event.price)}
        </td>
        <td className="px-3 py-4"><ChevronDown size={14} className={cn("text-gray-600 transition-transform", expanded && "rotate-180")} /></td>
      </tr>

      {expanded && (
        <tr className="border-b border-white/5 bg-white/[0.01]">
          <td colSpan={6} className="px-5 py-5 space-y-4">
            {loadingRegs ? (
              <div className="flex justify-center py-4"><div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" /></div>
            ) : regs ? (
              <>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{regs.length} Registrations</p>
                {regs.length > 0 && (
                  <table className="w-full text-sm rounded-xl overflow-hidden border border-white/10">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/[0.02]">
                        <th className="text-left px-4 py-2 text-xs text-gray-500">Name</th>
                        <th className="text-left px-4 py-2 text-xs text-gray-500 hidden md:table-cell">Email</th>
                        <th className="text-left px-4 py-2 text-xs text-gray-500">Attendance</th>
                        <th className="text-left px-4 py-2 text-xs text-gray-500">Refund</th>
                      </tr>
                    </thead>
                    <tbody>
                      {regs.map((r: any) => (
                        <tr key={r.id} className="border-b border-white/5 last:border-0">
                          <td className="px-4 py-2.5 text-white text-xs font-medium">{r.participantName}</td>
                          <td className="px-4 py-2.5 text-gray-500 text-xs hidden md:table-cell">{r.participantEmail}</td>
                          <td className="px-4 py-2.5">
                            <span className={cn("text-xs px-2 py-0.5 rounded-full border font-semibold",
                              r.attendanceStatus === "VERIFIED" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" :
                              "bg-gray-500/15 text-gray-400 border-gray-500/20")}>
                              {r.attendanceStatus.replace("_", " ")}
                            </span>
                          </td>
                          <td className="px-4 py-2.5">
                            {r.refundStatus !== "NONE" && (
                              <span className="text-xs text-amber-400">{r.refundStatus}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </>
            ) : null}

            {/* Cancel action */}
            {event.status === "ACTIVE" && (
              <div>
                {!confirm ? (
                  <button onClick={() => setConfirm(true)} className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 font-medium transition-colors">
                    <X size={13} /> Cancel Event & Refund All
                  </button>
                ) : (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                    <AlertTriangle size={14} className="text-red-400 shrink-0" />
                    <p className="text-xs text-red-300 flex-1">This will cancel the event and queue full refunds for all {event._count.registrations} registrants.</p>
                    <button onClick={() => setConfirm(false)} className="p-1 text-gray-500 hover:text-white"><X size={13} /></button>
                    <button onClick={handleCancel} disabled={cancelling}
                      className="px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/30 text-xs font-semibold text-red-400 hover:bg-red-500/30 transition-colors flex items-center gap-1">
                      {cancelling && <Loader2 size={12} className="animate-spin" />}Confirm
                    </button>
                  </div>
                )}
              </div>
            )}
          </td>
        </tr>
      )}
    </React.Fragment>
  );
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "CANCELLED">("ALL");

  const load = useCallback(() => {
    setLoading(true);
    api.getAllEvents()
      .then((r) => { if (r.success) setEvents(r.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = events.filter((e) => {
    const q = search.toLowerCase();
    const matchQ = !q || e.title.toLowerCase().includes(q) || `${e.organizer.firstName} ${e.organizer.lastName}`.toLowerCase().includes(q);
    return matchQ && (statusFilter === "ALL" || e.status === statusFilter);
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <CalendarDays size={20} className="text-purple-400" /> Events
        </h1>
        <p className="text-sm text-gray-500 mt-1">{events.length} total events on the platform</p>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input type="text" placeholder="Search events or organizers…" value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/40 appearance-none cursor-pointer">
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-gray-600 py-16">No events found.</p>
      ) : (
        <div className="rounded-2xl border border-white/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Event</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Date / Venue</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Registered</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Price</th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => <EventRow key={e.id} event={e} onRefresh={load} />)}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
