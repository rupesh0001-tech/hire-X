"use client";
import React, { useEffect, useState } from "react";
import { adminDataApi, UserRow } from "@/apis/admin.api";
import {
  Users,
  Search,
  Building2,
  FileCheck,
  FileClock,
  FileX,
  Mail,
  MapPin,
  Briefcase,
  Newspaper,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

const DOC_STATUS_BADGE = {
  PENDING: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  VERIFIED: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  REJECTED: "bg-red-500/15 text-red-400 border-red-500/20",
};
const DOC_ICON = {
  PENDING: FileClock,
  VERIFIED: FileCheck,
  REJECTED: FileX,
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | "USER" | "FOUNDER">("ALL");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    adminDataApi
      .getAllUsers()
      .then((r) => { if (r.success) setUsers(r.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      u.email.toLowerCase().includes(q) ||
      u.firstName.toLowerCase().includes(q) ||
      u.lastName.toLowerCase().includes(q) ||
      (u.company?.name ?? "").toLowerCase().includes(q);
    const matchRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Users size={22} className="text-purple-400" />
            All Users
          </h1>
          <p className="text-sm text-gray-500 mt-1">{users.length} total registered accounts</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search by name, email or company…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as any)}
          className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition appearance-none pr-8 cursor-pointer"
        >
          <option value="ALL">All Roles</option>
          <option value="USER">Users Only</option>
          <option value="FOUNDER">Founders Only</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-500">No users match your filters.</div>
      ) : (
        <div className="rounded-2xl border border-white/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">User</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Role</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Posts</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Doc Status</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Joined</th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => {
                const status = user.company?.docVerificationStatus;
                const DocIcon = status ? DOC_ICON[status] : null;
                const isExpanded = expanded === user.id;

                return (
                  <React.Fragment key={user.id}>
                    <tr
                      className={cn(
                        "border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer",
                        isExpanded && "bg-white/[0.03]"
                      )}
                      onClick={() => setExpanded(isExpanded ? null : user.id)}
                    >
                      {/* User info */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                              {user.firstName[0]}{user.lastName[0]}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-white text-sm">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role badge */}
                      <td className="px-5 py-4 hidden md:table-cell">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border",
                          user.role === "FOUNDER"
                            ? "bg-violet-500/15 text-violet-400 border-violet-500/20"
                            : "bg-gray-500/15 text-gray-400 border-gray-500/20"
                        )}>
                          {user.role === "FOUNDER" ? <Building2 size={10} /> : <Users size={10} />}
                          {user.role}
                        </span>
                      </td>

                      {/* Post count */}
                      <td className="px-5 py-4 hidden lg:table-cell">
                        <div className="flex items-center gap-1.5 text-gray-400">
                          <Newspaper size={13} />
                          <span>{user._count.posts}</span>
                        </div>
                      </td>

                      {/* Doc verification status */}
                      <td className="px-5 py-4 hidden lg:table-cell">
                        {status && DocIcon ? (
                          <span className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border",
                            DOC_STATUS_BADGE[status]
                          )}>
                            <DocIcon size={10} />
                            {status}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-600">—</span>
                        )}
                      </td>

                      {/* Joined */}
                      <td className="px-5 py-4 text-xs text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      {/* Expand toggle */}
                      <td className="px-3 py-4">
                        <ChevronDown
                          size={15}
                          className={cn(
                            "text-gray-600 transition-transform",
                            isExpanded && "rotate-180"
                          )}
                        />
                      </td>
                    </tr>

                    {/* Expanded details row */}
                    {isExpanded && (
                      <tr className="border-b border-white/5 bg-white/[0.015]">
                        <td colSpan={6} className="px-5 py-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                            {user.jobTitle && (
                              <div className="flex items-center gap-2 text-gray-400">
                                <Briefcase size={13} className="text-gray-600" />
                                {user.jobTitle}
                              </div>
                            )}
                            {user.location && (
                              <div className="flex items-center gap-2 text-gray-400">
                                <MapPin size={13} className="text-gray-600" />
                                {user.location}
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-gray-400">
                              <Mail size={13} className="text-gray-600" />
                              {user.email}
                            </div>
                            {user.company && (
                              <div className="flex items-center gap-2 text-gray-400 sm:col-span-2 lg:col-span-1">
                                <Building2 size={13} className="text-gray-600" />
                                <span className="font-medium text-purple-400">{user.company.name}</span>
                                {user.company.industry && <span>· {user.company.industry}</span>}
                              </div>
                            )}
                            {user.company?.docRejectionReason && (
                              <div className="sm:col-span-2 lg:col-span-3 flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                                <FileX size={13} className="text-red-400 mt-0.5 shrink-0" />
                                <div>
                                  <p className="font-semibold text-red-400 mb-0.5">Rejection Reason</p>
                                  <p className="text-red-300/80">{user.company.docRejectionReason}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
