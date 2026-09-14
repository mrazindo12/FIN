"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  FileText, 
  AlertTriangle, 
  Clock, 
  Users, 
  GraduationCap, 
  Megaphone, 
  Building2, 
  ArrowRight,
  RefreshCw,
  CheckCircle2
} from "lucide-react";

interface AdminStats {
  applicationsByStatus: {
    PENDING_PAYMENT: number;
    APPLIED: number;
    REVIEW: number;
    INTERVIEW: number;
    OFFER: number;
    REJECTED: number;
  };
  slaCounts: {
    ON_TRACK: number;
    WARNING: number;
    BREACHED: number;
  };
  totalStudents: number;
  activePrograms: number;
  publishedAnnouncements: number;
  activeCompanies: number;
}

interface ApplicationItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  companyNameSnapshot: string;
  status: string;
  slaStatus: string;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [needsAttentionApps, setNeedsAttentionApps] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, appsRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/applications?status=APPLIED"),
      ]);

      if (!statsRes.ok || !appsRes.ok) {
        throw new Error("Failed to load admin dashboard data");
      }

      const statsData = await statsRes.json();
      const appsData = await appsRes.json();

      setStats(statsData);

      // Filter top breached and warning applications
      const urgent = (appsData.applications || []).filter(
        (app: ApplicationItem) => app.slaStatus === "BREACHED" || app.slaStatus === "WARNING"
      );
      setNeedsAttentionApps(urgent.slice(0, 5));
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400 gap-3">
        <RefreshCw className="w-5 h-5 animate-spin text-amber-400" />
        <span>Loading admissions dashboard statistics...</span>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-6 rounded-lg bg-red-950/40 border border-red-800/50 text-red-200">
        <h3 className="font-bold text-lg mb-2">Error Loading Dashboard</h3>
        <p className="text-sm">{error || "Could not retrieve statistics."}</p>
        <button
          onClick={fetchDashboardData}
          className="mt-4 px-4 py-2 bg-red-900 hover:bg-red-800 text-white rounded-md text-xs font-semibold"
        >
          Try Again
        </button>
      </div>
    );
  }

  const totalApplications = Object.values(stats.applicationsByStatus).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Admissions & Platform Overview</h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time pipeline metrics, SLA status, and application review queue.
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Stats
        </button>
      </div>

      {/* SLA Alert Banners */}
      {(stats.slaCounts.BREACHED > 0 || stats.slaCounts.WARNING > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {stats.slaCounts.BREACHED > 0 && (
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-red-900/50 text-red-400">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-lg font-bold text-red-400">
                    {stats.slaCounts.BREACHED} SLA Breached
                  </div>
                  <div className="text-xs text-red-300/80">Applications exceeding 72h review window</div>
                </div>
              </div>
              <Link
                href="/admin/applications?slaStatus=BREACHED"
                className="px-3 py-1.5 rounded-md bg-red-900/80 hover:bg-red-800 text-xs font-semibold text-red-100 flex items-center gap-1"
              >
                Review <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          )}

          {stats.slaCounts.WARNING > 0 && (
            <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-amber-900/50 text-amber-400">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-lg font-bold text-amber-400">
                    {stats.slaCounts.WARNING} SLA Warnings
                  </div>
                  <div className="text-xs text-amber-300/80">Less than 12h remaining for review</div>
                </div>
              </div>
              <Link
                href="/admin/applications?slaStatus=WARNING"
                className="px-3 py-1.5 rounded-md bg-amber-900/80 hover:bg-amber-800 text-xs font-semibold text-amber-100 flex items-center gap-1"
              >
                Review <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Main Stat Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Applications</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-white">{totalApplications}</div>
          <div className="text-[11px] text-slate-400 mt-1">Across all statuses</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Students</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">{stats.totalStudents}</div>
          <div className="text-[11px] text-slate-400 mt-1">Registered student accounts</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Active Programs</span>
            <GraduationCap className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-white">{stats.activePrograms}</div>
          <div className="text-[11px] text-slate-400 mt-1">Published opportunities</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Partner Companies</span>
            <Building2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white">{stats.activeCompanies}</div>
          <div className="text-[11px] text-slate-400 mt-1">Active host organization roster</div>
        </div>
      </div>

      {/* Applications Pipeline Breakdown */}
      <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
        <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
          Application Pipeline Stage Breakdown
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
            <div className="text-xs text-slate-400 font-medium">Pending Payment</div>
            <div className="text-xl font-bold text-amber-400 mt-1">
              {stats.applicationsByStatus.PENDING_PAYMENT}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
            <div className="text-xs text-slate-400 font-medium">Submitted (Applied)</div>
            <div className="text-xl font-bold text-blue-400 mt-1">
              {stats.applicationsByStatus.APPLIED}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
            <div className="text-xs text-slate-400 font-medium">In Review</div>
            <div className="text-xl font-bold text-purple-400 mt-1">
              {stats.applicationsByStatus.REVIEW}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
            <div className="text-xs text-slate-400 font-medium">Interviewing</div>
            <div className="text-xl font-bold text-indigo-400 mt-1">
              {stats.applicationsByStatus.INTERVIEW}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
            <div className="text-xs text-slate-400 font-medium">Offered</div>
            <div className="text-xl font-bold text-emerald-400 mt-1">
              {stats.applicationsByStatus.OFFER}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
            <div className="text-xs text-slate-400 font-medium">Rejected</div>
            <div className="text-xl font-bold text-rose-400 mt-1">
              {stats.applicationsByStatus.REJECTED}
            </div>
          </div>
        </div>
      </div>

      {/* Needs Attention Preview */}
      <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
              Needs Attention Queue Preview
            </h3>
          </div>
          <Link
            href="/admin/applications"
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
          >
            View Full Queue <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {needsAttentionApps.length === 0 ? (
          <div className="p-6 rounded-lg bg-slate-950/40 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>All submitted applications are currently on track with SLA requirements.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/70 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Applicant</th>
                  <th className="py-2.5 px-3">Host Company</th>
                  <th className="py-2.5 px-3">SLA Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {needsAttentionApps.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-white">{app.firstName} {app.lastName}</div>
                      <div className="text-[11px] text-slate-400">{app.email}</div>
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-200">
                      {app.companyNameSnapshot}
                    </td>
                    <td className="py-3 px-3">
                      {app.slaStatus === "BREACHED" ? (
                        <span className="px-2 py-0.5 rounded-md bg-red-950 text-red-400 border border-red-800/80 font-bold text-[10px]">
                          BREACHED (&gt;72h)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-amber-950 text-amber-400 border border-amber-800/80 font-bold text-[10px]">
                          WARNING (&lt;12h)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        href="/admin/applications"
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium border border-slate-700"
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
