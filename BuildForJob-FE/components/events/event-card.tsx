"use client";
import React from "react";
import { Event } from "@/apis/events.api";
import { CalendarDays, MapPin, Users, Trophy, IndianRupee, UserCircle, TicketCheck, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/store/hooks";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
function formatPrice(paise: number) {
  return paise === 0 ? "Free" : `₹${(paise / 100).toFixed(0)}`;
}

interface EventCardProps {
  event: Event;
  onRegister: () => void;
  onRefresh: () => void;
  past?: boolean;
}

export function EventCard({ event, onRegister, past }: EventCardProps) {
  const { user } = useAppSelector((s) => s.auth);
  const isOwn = !!(user?.id && event.organizerId === user.id);
  const isFull = event.maxParticipants ? event._count.registrations >= event.maxParticipants : false;
  const isPast = new Date(event.eventDate) < new Date();

  return (
    <div className={cn(
      "rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden hover:border-white/20 transition-all group",
      event.status === "CANCELLED" && "opacity-60"
    )}>
      {/* Banner */}
      {event.bannerUrl ? (
        <img src={event.bannerUrl} alt="" className="w-full h-36 object-cover" />
      ) : (
        <div className="w-full h-24 bg-gradient-to-br from-purple-500/20 to-violet-600/10 flex items-center justify-center">
          <CalendarDays size={32} className="text-purple-400/50" />
        </div>
      )}

      <div className="p-5 space-y-3">
        {/* Status badges */}
        <div className="flex items-center gap-2 flex-wrap">
          {event.status === "CANCELLED" && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-red-500/15 text-red-400 border border-red-500/20 font-semibold">Cancelled</span>
          )}
          {isOwn && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/20 font-semibold">Your Event</span>
          )}
          {event.isRegistered && !isOwn && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 font-semibold flex items-center gap-1">
              <TicketCheck size={10} /> Registered
            </span>
          )}
          {isFull && !event.isRegistered && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-gray-500/15 text-gray-400 border border-gray-500/20 font-semibold">Full</span>
          )}
        </div>

        <h3 className="font-bold text-white text-base leading-snug line-clamp-2">{event.title}</h3>
        <p className="text-xs text-gray-500 line-clamp-2">{event.description}</p>

        <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
          <div className="flex items-center gap-1.5">
            <CalendarDays size={12} className="text-purple-400 shrink-0" />
            <span>{formatDate(event.eventDate)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin size={12} className="text-purple-400 shrink-0" />
            <span className="truncate">{event.venue}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <IndianRupee size={12} className="text-purple-400 shrink-0" />
            <span className="font-semibold text-white">{formatPrice(event.price)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users size={12} className="text-purple-400 shrink-0" />
            <span>
              {event._count.registrations}{event.maxParticipants ? `/${event.maxParticipants}` : ""} registered
            </span>
          </div>
        </div>

        {event.prize && (
          <div className="flex items-center gap-1.5 text-xs text-amber-400">
            <Trophy size={12} /> <span>{event.prize}</span>
          </div>
        )}

        <div className="flex items-center gap-2 pt-1 border-t border-white/5">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {event.organizer.firstName[0]}
          </div>
          <span className="text-xs text-gray-500 flex-1 truncate">{event.organizerName}</span>

          {!isOwn && !past && event.status !== "CANCELLED" && !event.isRegistered && !isFull && (
            <button
              onClick={onRegister}
              className="ml-auto text-xs font-semibold px-3 py-1.5 rounded-lg bg-purple-600 text-white hover:bg-purple-700 active:scale-[0.97] transition-all shadow shadow-purple-500/30"
            >
              Register →
            </button>
          )}
          {event.isRegistered && (
            <span className="ml-auto text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <TicketCheck size={12} /> Registered
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
