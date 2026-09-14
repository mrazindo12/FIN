"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { Bell, LogOut, User as UserIcon, CheckCircle2, Sparkles } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { SuperAiDrawer } from "@/components/ai/SuperAiDrawer";

export function AppHeader() {
  const { data: session } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close popovers on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
      if (
        notifRef.current &&
        !notifRef.current.contains(event.target as Node)
      ) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const userName = session?.user?.name || "Student";
  const userEmail = session?.user?.email || "";
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "AM";

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 z-40 flex items-center justify-center px-4">
        <div className="w-full max-w-lg flex items-center justify-between">
          {/* Brand Logo */}
          <Link
            href="/overview"
            className="flex items-center gap-2 transition-opacity hover:opacity-90"
          >
            <Logo size={32} />
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Super AI Drawer Button */}
            <button
              onClick={() => {
                setAiDrawerOpen(true);
                setNotifOpen(false);
                setDropdownOpen(false);
              }}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-amber-600 bg-amber-50/80 hover:bg-amber-100 border border-amber-200/80 transition-all shadow-sm"
              title="Super AI Assistant"
              aria-label="Super AI Assistant"
            >
              <Sparkles className="w-4 h-4" />
            </button>

            {/* Notifications Popover */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => {
                  setNotifOpen(!notifOpen);
                  setDropdownOpen(false);
                }}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-600 hover:text-fin-navy hover:bg-slate-100 transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 px-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                    <span className="text-xs font-heading font-bold uppercase tracking-wider text-slate-500">
                      Notifications
                    </span>
                    <span className="text-[11px] text-slate-400">0 unread</span>
                  </div>
                  <div className="py-4 text-center">
                    <p className="text-sm text-slate-500 font-medium">
                      No new notifications
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      You are completely up to date.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* User Avatar Menu */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => {
                  setDropdownOpen(!dropdownOpen);
                  setNotifOpen(false);
                }}
                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-slate-100 border border-slate-200 transition-all"
                aria-label="User menu"
              >
                <div className="w-8 h-8 rounded-full bg-fin-gold text-fin-navy font-heading font-bold text-xs flex items-center justify-center shadow-sm">
                  {initials}
                </div>
                <span className="text-xs font-semibold text-slate-700 max-w-[90px] truncate hidden sm:inline-block">
                  {userName.split(" ")[0]}
                </span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-2.5 border-b border-slate-100 mb-1">
                    <p className="text-sm font-bold text-fin-navy truncate">
                      {userName}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{userEmail}</p>
                  </div>

                  <Link
                    href="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-fin-navy transition-colors"
                  >
                    <UserIcon className="w-4 h-4 text-slate-500" />
                    <span>Profile & Account</span>
                  </Link>

                  <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors mt-1"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <SuperAiDrawer
        isOpen={aiDrawerOpen}
        onClose={() => setAiDrawerOpen(false)}
      />
    </>
  );
}
