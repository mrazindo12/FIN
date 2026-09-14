"use client";

import React, { useEffect, useState } from "react";
import { Megaphone, BellOff, Pin, Calendar, User, RefreshCw, Loader2 } from "lucide-react";

interface AnnouncementItem {
  id: string;
  title: string;
  body: string;
  pinned: boolean;
  publishedAt: string;
  author?: {
    fullName: string;
  } | null;
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnnouncements = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/announcements");
      if (!res.ok) {
        throw new Error("Failed to load announcements feed");
      }
      const data = await res.json();
      setAnnouncements(data.announcements || []);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-fin-gold/15 text-fin-navy flex items-center justify-center font-bold">
            <Megaphone className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-heading font-bold text-fin-navy">
              Announcements & Bulletins
            </h1>
            <p className="text-xs text-slate-500">
              Official cohort updates, deadline notices, and placement news
            </p>
          </div>
        </div>

        <button
          onClick={fetchAnnouncements}
          className="text-xs text-slate-400 hover:text-fin-navy flex items-center gap-1"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-fin-navy animate-spin mb-3" />
          <p className="text-xs text-slate-500 font-medium">Loading official announcements...</p>
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
          {error}
        </div>
      ) : announcements.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
            <BellOff className="w-6 h-6" />
          </div>
          <h2 className="text-sm font-heading font-bold text-slate-800">
            No announcements posted yet
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
            Check back for official updates on internship admissions, mentorship masterclasses, and corporate partner announcements.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((ann) => (
            <div
              key={ann.id}
              className={`rounded-2xl p-5 border shadow-sm transition-all space-y-3 ${
                ann.pinned
                  ? "bg-gradient-to-r from-amber-50/80 to-amber-100/30 border-amber-300/80"
                  : "bg-white border-slate-200"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  {ann.pinned && (
                    <div className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-md">
                      <Pin className="w-3 h-3 fill-amber-800" /> Pinned Announcement
                    </div>
                  )}
                  <h3 className="text-sm font-heading font-bold text-slate-900 leading-snug">
                    {ann.title}
                  </h3>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                {ann.body}
              </p>

              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>{ann.author?.fullName || "Admissions Team"}</span>
                </span>

                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{new Date(ann.publishedAt).toLocaleDateString()}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
