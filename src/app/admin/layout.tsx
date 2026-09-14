import Link from "next/link";
import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { 
  LayoutDashboard, 
  FileText, 
  GraduationCap, 
  Megaphone, 
  Building2, 
  LogOut, 
  ShieldAlert,
  UserCheck
} from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== "STAFF") {
    redirect("/overview");
  }

  const navItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Applications Queue", href: "/admin/applications", icon: FileText },
    { label: "Programs", href: "/admin/programs", icon: GraduationCap },
    { label: "Announcements", href: "/admin/announcements", icon: Megaphone },
    { label: "Partner Companies", href: "/admin/companies", icon: Building2 },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Staff Bar */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="flex items-center gap-2 font-bold text-xl tracking-tight text-amber-400">
              <span className="bg-amber-500/20 text-amber-400 p-1.5 rounded-lg border border-amber-500/30">
                FIN
              </span>
              <span>Admissions Admin</span>
            </Link>
            <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <UserCheck className="w-3 h-3" /> Staff Role
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-medium text-slate-200">{session.user.name || "Staff Member"}</span>
              <span className="text-[11px] text-slate-400">{session.user.email}</span>
            </div>
            <form
              action={async () => {
                "useServer";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <button
                type="submit"
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Admin Body with Navigation */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row gap-6">
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 shrink-0">
          <nav className="flex md:flex-col gap-1 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors shrink-0 border border-transparent hover:border-slate-700"
                >
                  <Icon className="w-4 h-4 text-amber-400" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Phase 3 Staff Limitations Notice */}
          <div className="mt-6 p-3.5 rounded-lg bg-amber-950/30 border border-amber-800/40 text-amber-300/90 text-xs leading-relaxed hidden md:block">
            <div className="flex items-center gap-1.5 font-semibold text-amber-400 mb-1">
              <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
              <span>Staff Provisioning Note</span>
            </div>
            In Phase 3, staff users are provisioned via seed script only. In-app staff invitations will be unlocked in Phase 4.
          </div>
        </aside>

        {/* Admin Content Area */}
        <main className="flex-1 min-w-0 bg-slate-900/60 rounded-xl border border-slate-800/80 p-4 sm:p-6 shadow-xl">
          {children}
        </main>
      </div>
    </div>
  );
}
