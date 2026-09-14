"use client";

import { useEffect, useState } from "react";
import { 
  FileText, 
  Filter, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  RefreshCw, 
  ShieldAlert,
  Mail,
  Building2,
  Send
} from "lucide-react";

interface ApplicationItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  institution: string;
  programOfStudy: string;
  yearOfStudy: string;
  indexNumber: string;
  companyNameSnapshot: string;
  companyAddressSnapshot: string | null;
  status: "PENDING_PAYMENT" | "APPLIED" | "REVIEW" | "INTERVIEW" | "OFFER" | "REJECTED";
  slaStatus: "ON_TRACK" | "WARNING" | "BREACHED";
  slaDeadlineAt: string | null;
  reviewedAt: string | null;
  letterSentAt: string | null;
  companyNotifiedAt: string | null;
  createdAt: string;
  user: {
    id: string;
    fullName: string;
    email: string;
  };
  reviewedBy: {
    id: string;
    fullName: string;
  } | null;
}

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [slaFilter, setSlaFilter] = useState<string>("ALL");

  // Modal states
  const [rejectingApp, setRejectingApp] = useState<ApplicationItem | null>(null);
  const [sendingLetterApp, setSendingLetterApp] = useState<ApplicationItem | null>(null);
  const [letterContent, setLetterContent] = useState<string>("");
  const [sendingLoading, setSendingLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (statusFilter !== "ALL") queryParams.append("status", statusFilter);
      if (slaFilter !== "ALL") queryParams.append("slaStatus", slaFilter);

      const res = await fetch(`/api/admin/applications?${queryParams.toString()}`);
      if (!res.ok) {
        throw new Error("Failed to fetch applications queue");
      }
      const data = await res.json();
      setApplications(data.applications || []);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [statusFilter, slaFilter]);

  const handleStatusTransition = async (appId: string, newStatus: string) => {
    setActionLoading(appId);
    try {
      const res = await fetch(`/api/admin/applications/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to update application status");
        return;
      }

      await fetchApplications();
    } catch (err: any) {
      alert(err.message || "Network error updating status");
    } finally {
      setActionLoading(null);
      setRejectingApp(null);
    }
  };

  const handleOpenLetterModal = (app: ApplicationItem) => {
    setSendingLetterApp(app);
    setLetterContent(
      `Dear ${app.firstName} ${app.lastName},\n\nWe are pleased to inform you that you have been offered an internship placement at ${app.companyNameSnapshot} through the Fortune Intern Network.\n\nPlease review your placement details and confirm acceptance.\n\nBest regards,\nFortune Intern Network Operations Team`
    );
  };

  const handleSendOfferLetter = async () => {
    if (!sendingLetterApp) return;
    setSendingLoading(true);
    try {
      const res = await fetch(`/api/admin/applications/${sendingLetterApp.id}/send-letter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customContent: letterContent }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to send offer letter");
        return;
      }

      alert(data.simulated ? `[SIMULATED] ${data.message}` : "Offer letter sent successfully!");
      setSendingLetterApp(null);
      await fetchApplications();
    } catch (err: any) {
      alert(err.message || "Error sending offer letter");
    } finally {
      setSendingLoading(false);
    }
  };

  const handleNotifyCompany = async (app: ApplicationItem) => {
    setActionLoading(app.id + "_notify");
    try {
      const res = await fetch(`/api/admin/applications/${app.id}/notify-company`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to notify company");
        return;
      }

      alert(data.simulated ? `[SIMULATED] ${data.message}` : "Company notification sent!");
      await fetchApplications();
    } catch (err: any) {
      alert(err.message || "Error notifying company");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            <span>Applications Review Queue</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage applicant stage progression, SLA commitments, offer letters & company notifications.
          </p>
        </div>
        <button
          onClick={fetchApplications}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Queue
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold uppercase tracking-wider mr-2">
          <Filter className="w-3.5 h-3.5 text-amber-400" /> Filter Queue:
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-900 text-slate-200 border border-slate-700 text-xs rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-amber-500 focus:outline-none"
        >
          <option value="ALL">All Application Stages</option>
          <option value="APPLIED">Submitted (APPLIED)</option>
          <option value="REVIEW">In Review</option>
          <option value="INTERVIEW">Interviewing</option>
          <option value="OFFER">Offered</option>
          <option value="REJECTED">Rejected</option>
          <option value="PENDING_PAYMENT">Pending Payment</option>
        </select>

        <select
          value={slaFilter}
          onChange={(e) => setSlaFilter(e.target.value)}
          className="bg-slate-900 text-slate-200 border border-slate-700 text-xs rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-amber-500 focus:outline-none"
        >
          <option value="ALL">All SLA Statuses</option>
          <option value="BREACHED">Breached (&gt;72h)</option>
          <option value="WARNING">Warning (&lt;12h)</option>
          <option value="ON_TRACK">On Track</option>
        </select>
      </div>

      {/* Applications Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400 gap-3">
          <RefreshCw className="w-5 h-5 animate-spin text-amber-400" />
          <span>Loading applications queue...</span>
        </div>
      ) : error ? (
        <div className="p-4 rounded-lg bg-red-950/40 border border-red-800/50 text-red-300 text-xs">
          {error}
        </div>
      ) : applications.length === 0 ? (
        <div className="p-12 rounded-xl bg-slate-950/40 border border-slate-800/80 text-center text-slate-400 text-sm">
          No applications match the selected filter criteria.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Applicant & Academic Snapshot</th>
                <th className="py-3 px-4">Host Company</th>
                <th className="py-3 px-4">Current Stage</th>
                <th className="py-3 px-4">SLA Status</th>
                <th className="py-3 px-4">Comms Status</th>
                <th className="py-3 px-4 text-right">Stage & Comms Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {applications.map((app) => {
                const isUrgentBreach = app.status === "APPLIED" && app.slaStatus === "BREACHED";
                const isUrgentWarning = app.status === "APPLIED" && app.slaStatus === "WARNING";

                return (
                  <tr
                    key={app.id}
                    className={`transition-colors hover:bg-slate-800/50 ${
                      isUrgentBreach
                        ? "bg-red-950/20"
                        : isUrgentWarning
                        ? "bg-amber-950/20"
                        : ""
                    }`}
                  >
                    {/* Applicant & Academic */}
                    <td className="py-3.5 px-4 space-y-1">
                      <div className="font-bold text-white text-sm">
                        {app.firstName} {app.lastName}
                      </div>
                      <div className="text-slate-400 text-[11px]">{app.email} • {app.phone}</div>
                      <div className="text-[11px] text-amber-400/90 font-medium">
                        {app.institution} ({app.programOfStudy}, {app.yearOfStudy})
                      </div>
                    </td>

                    {/* Host Company */}
                    <td className="py-3.5 px-4 font-semibold text-slate-200">
                      {app.companyNameSnapshot}
                    </td>

                    {/* Stage Badge */}
                    <td className="py-3.5 px-4">
                      {app.status === "APPLIED" && (
                        <span className="px-2.5 py-1 rounded-full bg-blue-950 text-blue-400 border border-blue-800 font-semibold text-[11px]">
                          Submitted (APPLIED)
                        </span>
                      )}
                      {app.status === "REVIEW" && (
                        <span className="px-2.5 py-1 rounded-full bg-purple-950 text-purple-400 border border-purple-800 font-semibold text-[11px]">
                          In Review
                        </span>
                      )}
                      {app.status === "INTERVIEW" && (
                        <span className="px-2.5 py-1 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-800 font-semibold text-[11px]">
                          Interviewing
                        </span>
                      )}
                      {app.status === "OFFER" && (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-semibold text-[11px]">
                          Offered
                        </span>
                      )}
                      {app.status === "REJECTED" && (
                        <span className="px-2.5 py-1 rounded-full bg-rose-950 text-rose-400 border border-rose-800 font-semibold text-[11px]">
                          Rejected
                        </span>
                      )}
                      {app.status === "PENDING_PAYMENT" && (
                        <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 font-semibold text-[11px]">
                          Pending Payment
                        </span>
                      )}
                    </td>

                    {/* SLA Status */}
                    <td className="py-3.5 px-4">
                      {app.status === "APPLIED" ? (
                        app.slaStatus === "BREACHED" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-950 text-red-400 border border-red-800 font-bold text-[10px]">
                            <AlertTriangle className="w-3 h-3" /> BREACHED (&gt;72h)
                          </span>
                        ) : app.slaStatus === "WARNING" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-950 text-amber-400 border border-amber-800 font-bold text-[10px]">
                            <Clock className="w-3 h-3" /> WARNING (&lt;12h)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold text-[10px]">
                            <CheckCircle2 className="w-3 h-3" /> ON TRACK
                          </span>
                        )
                      ) : (
                        <span className="text-slate-500 text-[11px]">
                          Historical ({app.slaStatus})
                        </span>
                      )}
                    </td>

                    {/* Comms Status */}
                    <td className="py-3.5 px-4 space-y-1 text-[11px]">
                      <div>
                        {app.letterSentAt ? (
                          <span className="text-emerald-400 font-medium flex items-center gap-1">
                            <Mail className="w-3 h-3" /> Letter Sent ({new Date(app.letterSentAt).toLocaleDateString()})
                          </span>
                        ) : (
                          <span className="text-slate-500">Letter Unsent</span>
                        )}
                      </div>
                      <div>
                        {app.companyNotifiedAt ? (
                          <span className="text-blue-400 font-medium flex items-center gap-1">
                            <Building2 className="w-3 h-3" /> Company Notified ({new Date(app.companyNotifiedAt).toLocaleDateString()})
                          </span>
                        ) : (
                          <span className="text-slate-500">Company Unnotified</span>
                        )}
                      </div>
                    </td>

                    {/* Stage & Comms Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex flex-col items-end gap-1.5">
                        {app.status === "APPLIED" && (
                          <button
                            onClick={() => handleStatusTransition(app.id, "REVIEW")}
                            disabled={actionLoading === app.id}
                            className="px-2.5 py-1 rounded bg-purple-900 hover:bg-purple-800 text-purple-100 text-[11px] font-semibold transition-colors disabled:opacity-50"
                          >
                            {actionLoading === app.id ? "Updating..." : "Start Review"}
                          </button>
                        )}

                        {app.status === "REVIEW" && (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleStatusTransition(app.id, "INTERVIEW")}
                              disabled={actionLoading === app.id}
                              className="px-2.5 py-1 rounded bg-indigo-900 hover:bg-indigo-800 text-indigo-100 text-[11px] font-semibold transition-colors disabled:opacity-50"
                            >
                              Interview
                            </button>
                            <button
                              onClick={() => setRejectingApp(app)}
                              disabled={actionLoading === app.id}
                              className="px-2.5 py-1 rounded bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 text-[11px] font-semibold transition-colors disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </div>
                        )}

                        {app.status === "INTERVIEW" && (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleStatusTransition(app.id, "OFFER")}
                              disabled={actionLoading === app.id}
                              className="px-2.5 py-1 rounded bg-emerald-900 hover:bg-emerald-800 text-emerald-100 text-[11px] font-semibold transition-colors disabled:opacity-50"
                            >
                              Offer Position
                            </button>
                            <button
                              onClick={() => setRejectingApp(app)}
                              disabled={actionLoading === app.id}
                              className="px-2.5 py-1 rounded bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 text-[11px] font-semibold transition-colors disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </div>
                        )}

                        {app.status === "OFFER" && (
                          <div className="flex flex-col gap-1 items-end">
                            <button
                              onClick={() => handleOpenLetterModal(app)}
                              disabled={!!app.letterSentAt || actionLoading === app.id}
                              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors flex items-center gap-1 ${
                                app.letterSentAt
                                  ? "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
                                  : "bg-emerald-700 hover:bg-emerald-600 text-white"
                              }`}
                            >
                              <Mail className="w-3 h-3" />
                              {app.letterSentAt ? "Offer Letter Sent" : "Send Offer Letter"}
                            </button>

                            <button
                              onClick={() => handleNotifyCompany(app)}
                              disabled={!!app.companyNotifiedAt || actionLoading === app.id + "_notify"}
                              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors flex items-center gap-1 ${
                                app.companyNotifiedAt
                                  ? "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
                                  : "bg-blue-700 hover:bg-blue-600 text-white"
                              }`}
                            >
                              <Building2 className="w-3 h-3" />
                              {actionLoading === app.id + "_notify"
                                ? "Notifying..."
                                : app.companyNotifiedAt
                                ? "Company Notified"
                                : "Notify Company"}
                            </button>
                          </div>
                        )}

                        {(app.status === "REJECTED" || app.status === "PENDING_PAYMENT") && (
                          <span className="text-[11px] text-slate-500 font-medium">No actions</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirmation Modal for Rejection */}
      {rejectingApp && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <ShieldAlert className="w-6 h-6 shrink-0" />
              <h3 className="text-lg font-bold text-white">Confirm Application Rejection</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to reject the application for{" "}
              <strong className="text-white">{rejectingApp.firstName} {rejectingApp.lastName}</strong> at{" "}
              <strong className="text-white">{rejectingApp.companyNameSnapshot}</strong>?
            </p>
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/40 text-[11px] text-rose-300">
              This action will move the status to <strong>REJECTED</strong> and record your staff ID in the audit trail.
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setRejectingApp(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleStatusTransition(rejectingApp.id, "REJECTED")}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white transition-colors"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Editing and Sending Internship Offer Letter */}
      {sendingLetterApp && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-emerald-400">
              <Mail className="w-6 h-6 shrink-0" />
              <h3 className="text-lg font-bold text-white">Edit & Send Internship Offer Letter</h3>
            </div>
            <p className="text-xs text-slate-300">
              Recipient: <strong className="text-white">{sendingLetterApp.firstName} {sendingLetterApp.lastName}</strong> ({sendingLetterApp.email})
            </p>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Letter Body Content
              </label>
              <textarea
                value={letterContent}
                onChange={(e) => setLetterContent(e.target.value)}
                rows={8}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSendingLetterApp(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendOfferLetter}
                disabled={sendingLoading}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition-colors inline-flex items-center gap-1.5 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                {sendingLoading ? "Sending..." : "Dispatch Offer Letter"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
