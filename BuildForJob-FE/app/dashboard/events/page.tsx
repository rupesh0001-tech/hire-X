"use client";
import React, { useEffect, useState } from "react";
import { eventsApi, Event } from "@/apis/events.api";
import { useAppSelector } from "@/store/hooks";
import { CalendarDays, MapPin, Users, Trophy, Search, Plus, Clock, X, TicketCheck } from "lucide-react";
import { toast } from "sonner";
import { CreateEventModal } from "@/components/events/create-event-modal";
import { EventCard } from "@/components/events/event-card";
import { RegisterEventModal } from "@/components/events/register-event-modal";

export default function EventsPage() {
  const { user } = useAppSelector((s) => s.auth);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [registerTarget, setRegisterTarget] = useState<Event | null>(null);

  const load = () => {
    setLoading(true);
    eventsApi.getAll()
      .then((r) => { if (r.success) setEvents(r.data); })
      .catch(() => toast.error("Failed to load events"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = events.filter((e) => {
    const q = search.toLowerCase();
    return !q || e.title.toLowerCase().includes(q) || e.venue.toLowerCase().includes(q) || e.organizerName.toLowerCase().includes(q);
  });

  const upcoming = filtered.filter((e) => new Date(e.eventDate) >= new Date());
  const past = filtered.filter((e) => new Date(e.eventDate) < new Date());

  return (
    <div className="max-w-5xl mx-auto pb-16 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CalendarDays size={22} className="text-purple-500" /> Events
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Discover and join events by the community</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 text-white text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-purple-500/25"
        >
          <Plus size={16} /> Host an Event
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
        <input
          type="text"
          placeholder="Search events, venues, organizers…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Clock size={14} className="text-purple-500 dark:text-purple-400" /> Upcoming
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcoming.map((e) => (
                  <EventCard key={e.id} event={e} onRegister={() => setRegisterTarget(e)} onRefresh={load} />
                ))}
              </div>
            </section>
          )}

          {past.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <TicketCheck size={14} className="text-gray-400 dark:text-gray-500" /> Past Events
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-70">
                {past.map((e) => (
                  <EventCard key={e.id} event={e} onRegister={() => {}} onRefresh={load} past />
                ))}
              </div>
            </section>
          )}

          {filtered.length === 0 && (
            <div className="text-center py-24">
              <CalendarDays size={40} className="text-gray-300 dark:text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-500">No events found. Be the first to host one!</p>
              <button onClick={() => setShowCreate(true)}
                className="mt-4 px-5 py-2 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:opacity-90 transition">
                Host an Event
              </button>
            </div>
          )}
        </>
      )}

      {showCreate && (
        <CreateEventModal onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); load(); }} />
      )}

      {registerTarget && (
        <RegisterEventModal event={registerTarget} onClose={() => setRegisterTarget(null)} onSuccess={() => { setRegisterTarget(null); load(); }} />
      )}
    </div>
  );
}
