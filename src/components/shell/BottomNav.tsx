"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Megaphone,
  Briefcase,
  FileText,
  User,
} from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();

  const navTabs = [
    {
      name: "Overview",
      href: "/overview",
      icon: LayoutGrid,
      match: (path: string) => path === "/overview" || path === "/",
    },
    {
      name: "Announcements",
      href: "/announcements",
      icon: Megaphone,
      match: (path: string) => path.startsWith("/announcements"),
    },
    {
      name: "Programs",
      href: "/programs",
      icon: Briefcase,
      match: (path: string) => path.startsWith("/programs"),
    },
    {
      name: "Apply",
      href: "/apply",
      icon: FileText,
      match: (path: string) => path.startsWith("/apply"),
    },
    {
      name: "Profile",
      href: "/profile",
      icon: User,
      match: (path: string) => path.startsWith("/profile"),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 flex items-center justify-center px-2 pb-[env(safe-area-inset-bottom,0px)]">
      <div className="w-full max-w-lg flex items-stretch justify-around h-full">
        {navTabs.map((tab) => {
          const isActive = tab.match(pathname);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`flex-1 relative flex flex-col items-center justify-center gap-1 transition-all select-none ${
                isActive
                  ? "text-fin-navy font-bold"
                  : "text-slate-400 hover:text-slate-600 font-medium"
              }`}
            >
              {/* Active top bar indicator */}
              {isActive && (
                <span className="absolute top-0 w-8 h-1 bg-fin-gold rounded-full" />
              )}

              <Icon
                className={`w-5 h-5 transition-transform ${
                  isActive ? "scale-110 text-fin-navy stroke-[2.4]" : "stroke-[1.8]"
                }`}
              />
              <span className="text-[10px] tracking-tight truncate">
                {tab.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
