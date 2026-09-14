import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Briefcase,
  ArrowRight,
  ShieldCheck,
  Building,
  CheckCircle,
} from "lucide-react";
import { StatusBadge } from "@/components/status/StatusBadge";
import { ApplicationActivityChart } from "@/components/dashboard/ApplicationActivityChart";
import { CompetencyRadarChart } from "@/components/dashboard/CompetencyRadarChart";
import { LearningIntensityChart } from "@/components/dashboard/LearningIntensityChart";

export default async function OverviewPage() {
  const session = await auth();

  // Fetch user profile and submitted applications
  const user = session?.user?.email
    ? await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
          profile: true,
          applications: {
            where: {
              status: {
                not: "PENDING_PAYMENT",
              },
            },
            orderBy: { createdAt: "desc" },
            take: 3,
          },
        },
      })
    : null;

  const firstName = user?.fullName ? user.fullName.split(" ")[0] : "Student";
  const activeApplications = user?.applications || [];
  const activeCount = activeApplications.length;

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Personalized Welcome Banner */}
      <div className="bg-gradient-to-br from-fin-navy to-fin-navy-light text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-fin-gold/15 pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-fin-gold text-[11px] font-semibold tracking-wider uppercase mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified Career Portal
          </div>

          <h1 className="text-2xl font-heading font-bold tracking-tight">
            Hi, {firstName}! 👋
          </h1>
          <p className="text-slate-200 text-xs sm:text-sm mt-1 leading-relaxed max-w-sm">
            Welcome to your Fortune Intern Network dashboard. Track your placement milestones and interview pipeline stages.
          </p>
        </div>
      </div>

      {/* Real Application Activity Bar Chart */}
      <ApplicationActivityChart />

      {/* Dynamic Placement Pipeline Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-fin-gold/15 text-fin-navy flex items-center justify-center font-bold">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-heading font-bold text-slate-800">
                Application Pipeline
              </h2>
              <p className="text-[11px] text-slate-400">Current cohort status</p>
            </div>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md">
            Live Queue
          </span>
        </div>

        {activeCount > 0 ? (
          /* Active Application Summary */
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-700 shrink-0" />
                <span className="text-xs font-heading font-bold text-blue-900">
                  {activeCount} Active {activeCount === 1 ? "Application" : "Applications"} in Pipeline
                </span>
              </div>
              <Link
                href="/programs"
                className="text-[11px] font-bold text-blue-700 hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {activeApplications.map((app) => (
                <div key={app.id} className="py-2.5 flex items-center justify-between gap-2 text-xs">
                  <div className="truncate">
                    <p className="font-semibold text-slate-800 truncate">
                      {app.companyNameSnapshot}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      ID: #{app.id.slice(-6).toUpperCase()}
                    </p>
                  </div>
                  <StatusBadge status={app.status} size="sm" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Honest Empty State */
          <div className="py-6 px-4 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200">
            <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700">
              No active applications yet
            </p>
            <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
              When you submit applications, your interview pipeline and milestones will track here.
            </p>
            <Link
              href="/apply"
              className="inline-flex items-center gap-1.5 mt-4 text-xs font-bold text-fin-navy hover:text-fin-navy-light underline"
            >
              <span>Apply for placement</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>

      {/* Live Academy Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CompetencyRadarChart />
        <LearningIntensityChart />
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/apply"
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-fin-navy/30 transition-all flex flex-col justify-between group"
        >
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-3">
            <Building className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-heading font-bold text-slate-800 group-hover:text-fin-navy">
              Apply
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Submit new application</p>
          </div>
        </Link>

        <Link
          href="/programs"
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-fin-navy/30 transition-all flex flex-col justify-between group"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-heading font-bold text-slate-800 group-hover:text-fin-navy">
              Tracking Desk
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">View pipeline stages</p>
          </div>
        </Link>
      </div>

      {/* Academic Snapshot Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
        <h3 className="text-xs font-heading font-bold uppercase tracking-wider text-slate-400 mb-3">
          Verified Student Record
        </h3>
        <div className="space-y-2.5 text-xs">
          <div className="flex justify-between py-1.5 border-b border-slate-100">
            <span className="text-slate-500">Institution</span>
            <span className="font-semibold text-slate-800 truncate max-w-[200px]">
              {user?.profile?.institution || "Not specified"}
            </span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-slate-100">
            <span className="text-slate-500">Program</span>
            <span className="font-semibold text-slate-800 truncate max-w-[200px]">
              {user?.profile?.programOfStudy || "Not specified"}
            </span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-slate-100">
            <span className="text-slate-500">Year of Study</span>
            <span className="font-semibold text-slate-800">
              {user?.profile?.yearOfStudy || "Not specified"}
            </span>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-slate-500">Student ID / Index</span>
            <span className="font-semibold text-slate-800">
              {user?.profile?.indexNumber || "Not specified"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
