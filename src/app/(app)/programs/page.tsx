"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Script from "next/script";
import {
  Briefcase,
  Building,
  MapPin,
  Calendar,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  CreditCard,
  PlusCircle,
  GraduationCap,
  Sparkles,
  ExternalLink
} from "lucide-react";
import { StatusBadge, ApplicationStatusType } from "@/components/status/StatusBadge";

declare global {
  interface Window {
    PaystackPop?: {
      setup: (options: {
        key: string;
        email: string;
        amount: number;
        currency?: string;
        ref: string;
        callback: (response: { reference: string }) => void;
        onClose: () => void;
      }) => {
        openIframe: () => void;
      };
    };
  }
}

interface ApplicationItem {
  id: string;
  companyNameSnapshot: string;
  companyAddressSnapshot: string | null;
  firstName: string;
  lastName: string;
  status: ApplicationStatusType;
  createdAt: string;
  submittedAt: string | null;
  payments?: {
    id: string;
    paystackReference: string;
    status: string;
  }[];
}

interface ProgramItem {
  id: string;
  title: string;
  description: string;
  location: string;
  category: string;
  companyId: string | null;
  companyNameSnapshot: string;
  applicationDeadline: string | null;
  isActive: boolean;
}

export default function ProgramsPage() {
  const [activeTab, setActiveTab] = useState<"EXPLORE" | "MY_APPLICATIONS">("EXPLORE");
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [programs, setPrograms] = useState<ProgramItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [resumingId, setResumingId] = useState<string | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [appRes, progRes] = await Promise.all([
        fetch("/api/applications"),
        fetch("/api/programs"),
      ]);

      if (appRes.ok) {
        const appData = await appRes.json();
        setApplications(appData.applications || []);
      }

      if (progRes.ok) {
        const progData = await progRes.json();
        setPrograms(progData.programs || []);
      }
    } catch (err) {
      console.error("Error fetching programs and applications data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    return () => {
      if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
    };
  }, []);

  const handleResumePayment = async (applicationId: string) => {
    setResumingId(applicationId);
    setNotice(null);

    try {
      const res = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId }),
      });

      const data = await res.json();

      if (!res.ok || !data.reference) {
        setNotice(data.error || "Failed to initialize payment gateway.");
        setResumingId(null);
        return;
      }

      const { reference, publicKey, amount, email } = data;

      if (typeof window !== "undefined" && window.PaystackPop && publicKey && !publicKey.includes("placeholder")) {
        const handler = window.PaystackPop.setup({
          key: publicKey,
          email,
          amount,
          currency: "GHS",
          ref: reference,
          callback: function () {
            setVerifyingId(applicationId);
            startPolling(applicationId);
          },
          onClose: function () {
            setResumingId(null);
            setNotice("Checkout closed. Application remains in pending payment status.");
          },
        });

        handler.openIframe();
        setResumingId(null);
      } else {
        setResumingId(null);
        setVerifyingId(applicationId);
        setNotice(`Payment initialized (Ref: ${reference}). Awaiting confirmation.`);
        startPolling(applicationId);
      }
    } catch (err) {
      console.error("Resume payment error:", err);
      setNotice("Network error during payment resumption.");
      setResumingId(null);
    }
  };

  const startPolling = (applicationId: string) => {
    let count = 0;
    pollingTimerRef.current = setInterval(async () => {
      count += 1;
      try {
        const res = await fetch(`/api/applications/${applicationId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.application?.status === "APPLIED") {
            if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
            setVerifyingId(null);
            setNotice("✓ Payment verified! Application officially submitted.");
            loadData();
          }
        }
      } catch (e) {
        console.error("Polling error:", e);
      }

      if (count >= 15) {
        if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
        setVerifyingId(null);
        loadData();
      }
    }, 2000);
  };

  const submittedApps = applications.filter((a) => a.status !== "PENDING_PAYMENT");
  const pendingApps = applications.filter((a) => a.status === "PENDING_PAYMENT");

  if (loading) {
    return (
      <div className="py-16 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-fin-navy animate-spin mb-3" />
        <p className="text-xs text-slate-500 font-medium">Loading placement programs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <Script src="https://js.paystack.co/v1/inline.js" strategy="lazyOnload" />

      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-fin-gold/15 text-fin-navy flex items-center justify-center font-bold">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-heading font-bold text-fin-navy">
              FIN Internship Directory
            </h1>
            <p className="text-xs text-slate-500">
              Explore verified opportunities & manage cohort applications
            </p>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab("EXPLORE")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === "EXPLORE"
                ? "bg-white text-fin-navy shadow-2xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Explore Opportunities ({programs.length})
          </button>
          <button
            onClick={() => setActiveTab("MY_APPLICATIONS")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === "MY_APPLICATIONS"
                ? "bg-white text-fin-navy shadow-2xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            My Applications ({applications.length})
          </button>
        </div>
      </div>

      {notice && (
        <div className="p-3.5 rounded-xl bg-slate-800 text-white text-xs font-medium flex items-center gap-2">
          <span>{notice}</span>
        </div>
      )}

      {/* TAB 1: EXPLORE OPPORTUNITIES */}
      {activeTab === "EXPLORE" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-heading font-bold uppercase tracking-wider text-slate-500">
              Verified Host Opportunities ({programs.length})
            </span>
            <button
              onClick={loadData}
              className="text-xs text-slate-400 hover:text-fin-navy flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Refresh</span>
            </button>
          </div>

          {programs.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center">
              <GraduationCap className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700">No active programs available right now</p>
              <p className="text-[11px] text-slate-400 mt-1">Check back soon as admissions adds new host company cohorts.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {programs.map((prog) => (
                <div
                  key={prog.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-fin-navy/30 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-100">
                        {prog.category}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {prog.location}
                      </span>
                    </div>

                    <h3 className="text-sm font-heading font-bold text-slate-900 leading-snug">
                      {prog.title}
                    </h3>
                    <p className="text-xs font-medium text-fin-navy">
                      {prog.companyNameSnapshot}
                    </p>
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                      {prog.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        Deadline:{" "}
                        {prog.applicationDeadline
                          ? new Date(prog.applicationDeadline).toLocaleDateString()
                          : "Rolling Basis"}
                      </span>
                    </div>

                    <Link
                      href={`/apply?companyId=${prog.companyId || ""}`}
                      className="px-3.5 py-1.5 rounded-xl bg-fin-navy hover:bg-fin-navy-light text-white text-xs font-heading font-bold transition-colors flex items-center gap-1 shadow-2xs"
                    >
                      <span>Apply Now</span>
                      <ArrowRight className="w-3.5 h-3.5 text-fin-gold" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY APPLICATIONS */}
      {activeTab === "MY_APPLICATIONS" && (
        <div className="space-y-4">
          {/* Submitted Applications List */}
          {submittedApps.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-heading font-bold uppercase tracking-wider text-slate-500">
                  Submitted Applications ({submittedApps.length})
                </span>
                <button
                  onClick={loadData}
                  className="text-xs text-slate-400 hover:text-fin-navy flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Refresh</span>
                </button>
              </div>

              {submittedApps.map((app) => (
                <div
                  key={app.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-slate-300 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-heading font-bold text-slate-900 leading-snug">
                        {app.companyNameSnapshot}
                      </h3>
                      {app.companyAddressSnapshot && (
                        <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate max-w-xs">{app.companyAddressSnapshot}</span>
                        </p>
                      )}
                    </div>
                    <StatusBadge status={app.status} />
                  </div>

                  <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        Submitted:{" "}
                        {app.submittedAt
                          ? new Date(app.submittedAt).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "Recently"}
                      </span>
                    </span>
                    <span className="font-mono text-[11px] text-slate-400">
                      ID: #{app.id.slice(-6).toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
                <Briefcase className="w-6 h-6" />
              </div>
              <h2 className="text-sm font-heading font-bold text-slate-800">
                No submitted applications yet
              </h2>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                Explore available opportunities or fill out the placement form.
              </p>
              <button
                onClick={() => setActiveTab("EXPLORE")}
                className="inline-flex items-center gap-1.5 mt-5 px-4 py-2 rounded-xl bg-fin-navy text-white text-xs font-heading font-bold hover:bg-fin-navy-light transition-all shadow-sm"
              >
                <span>Browse Host Opportunities</span>
                <ArrowRight className="w-3.5 h-3.5 text-fin-gold" />
              </button>
            </div>
          )}

          {/* Pending Applications (PENDING_PAYMENT) */}
          {pendingApps.length > 0 && (
            <div className="pt-2 space-y-3">
              <div className="flex items-center gap-1.5 px-1 text-amber-700">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span className="text-xs font-heading font-bold uppercase tracking-wider">
                  Payment Incomplete ({pendingApps.length})
                </span>
              </div>

              {pendingApps.map((app) => (
                <div
                  key={app.id}
                  className="bg-amber-50/50 rounded-2xl p-4 border border-amber-200 shadow-2xs space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xs font-heading font-bold text-slate-800">
                        {app.companyNameSnapshot}
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Application drafted — awaiting Paystack checkout
                      </p>
                    </div>
                    <StatusBadge status="PENDING_PAYMENT" size="sm" />
                  </div>

                  <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-mono">
                      Draft ID: #{app.id.slice(-6).toUpperCase()}
                    </span>
                    <button
                      onClick={() => handleResumePayment(app.id)}
                      disabled={resumingId === app.id || verifyingId === app.id}
                      className="px-3 py-1.5 rounded-lg bg-fin-navy text-white text-[11px] font-heading font-bold hover:bg-fin-navy-light transition-all shadow-2xs flex items-center gap-1.5"
                    >
                      {resumingId === app.id || verifyingId === app.id ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Resuming...</span>
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-3 h-3 text-fin-gold" />
                          <span>Resume Payment</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
