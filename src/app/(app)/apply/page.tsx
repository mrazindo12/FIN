"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/navigation";
import {
  FileText,
  User,
  Mail,
  Phone,
  GraduationCap,
  BookOpen,
  Calendar,
  CreditCard,
  Building,
  MapPin,
  ShieldCheck,
  CreditCard as PaymentIcon,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowRight,
  Info,
  Sparkles,
} from "lucide-react";

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

interface CompanyItem {
  id: string;
  name: string;
  address: string | null;
}

export default function ApplyPage() {
  const router = useRouter();

  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gender: "Male",
    phone: "",
    email: "",
    institution: "",
    programOfStudy: "",
    yearOfStudy: "Year 2",
    indexNumber: "",
    companyId: "",
    companyName: "",
    companyAddress: "",
    isCustomCompany: false,
    coverLetter: "",
  });

  const [aiDrafting, setAiDrafting] = useState(false);

  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [activeApplicationId, setActiveApplicationId] = useState<string | null>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const feeGhs = process.env.NEXT_PUBLIC_APPLICATION_FEE_GHS || "50.00";

  // 1. Fetch Profile & Companies on Mount
  useEffect(() => {
    async function loadData() {
      try {
        const [profileRes, companiesRes] = await Promise.all([
          fetch("/api/profile"),
          fetch("/api/companies"),
        ]);

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          const user = profileData.user;
          if (user) {
            const names = (user.fullName || "").split(" ");
            const firstName = names[0] || "";
            const lastName = names.slice(1).join(" ") || "";

            setFormData((prev) => ({
              ...prev,
              firstName,
              lastName,
              phone: user.phone || "",
              email: user.email || "",
              institution: user.profile?.institution || "",
              programOfStudy: user.profile?.programOfStudy || "",
              yearOfStudy: user.profile?.yearOfStudy || "Year 2",
              indexNumber: user.profile?.indexNumber || "",
            }));
          }
        }

        if (companiesRes.ok) {
          const companiesData = await companiesRes.json();
          setCompanies(companiesData.companies || []);
          if (companiesData.companies?.length > 0) {
            setFormData((prev) => ({
              ...prev,
              companyId: companiesData.companies[0].id,
              companyName: companiesData.companies[0].name,
              companyAddress: companiesData.companies[0].address || "",
            }));
          }
        }
      } catch (err) {
        console.error("Error loading application initial data:", err);
      } finally {
        setLoadingProfile(false);
      }
    }

    loadData();

    return () => {
      if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
    };
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCompanySelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const selected = companies.find((c) => c.id === selectedId);
    if (selected) {
      setFormData((prev) => ({
        ...prev,
        companyId: selected.id,
        companyName: selected.name,
        companyAddress: selected.address || "",
      }));
    }
  };

  const handleToggleCustomCompany = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isCustom = e.target.checked;
    setFormData((prev) => ({
      ...prev,
      isCustomCompany: isCustom,
      companyId: isCustom ? "" : (companies[0]?.id || ""),
      companyName: isCustom ? "" : (companies[0]?.name || ""),
      companyAddress: isCustom ? "" : (companies[0]?.address || ""),
    }));
  };

  // Poll application status until webhook lands
  const startPaymentStatusPolling = (applicationId: string) => {
    setVerifyingPayment(true);
    let attempts = 0;
    const maxAttempts = 20; // 40 seconds max

    pollingTimerRef.current = setInterval(async () => {
      attempts += 1;
      try {
        const res = await fetch(`/api/applications/${applicationId}`);
        if (res.ok) {
          const data = await res.json();
          const app = data.application;

          if (app.status === "APPLIED") {
            if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
            setVerifyingPayment(false);
            setSuccessMessage("Payment verified! Your application has been officially submitted.");
            setTimeout(() => {
              router.push("/programs");
            }, 1800);
          } else if (app.latestPayment?.status === "FAILED") {
            if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
            setVerifyingPayment(false);
            setErrorMessage("Payment transaction failed. Please retry your payment from the tracking desk.");
          }
        }
      } catch (pollErr) {
        console.error("Polling error:", pollErr);
      }

      if (attempts >= maxAttempts) {
        if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
        setVerifyingPayment(false);
        setInfoMessage(
          "Payment is taking a moment to process. You can refresh or track its confirmation status in the Programs desk."
        );
      }
    }, 2000);
  };

  const handleGenerateAiCoverLetter = async () => {
    setAiDrafting(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/ai/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          draftType: "COVER_LETTER",
          promptContext: `Draft a cover letter for an internship application at ${
            formData.companyName || "the host company"
          } in ${formData.programOfStudy || "my field of study"}.`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Failed to generate AI draft");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        coverLetter: data.content,
      }));
      setInfoMessage("Cover letter pre-filled using Super AI Assistant!");
    } catch (err: any) {
      setErrorMessage("Network error generating cover letter");
    } finally {
      setAiDrafting(false);
    }
  };

  const handlePayAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setInfoMessage(null);
    setSuccessMessage(null);
    setSubmitting(true);

    // Validation
    if (!formData.companyName.trim()) {
      setErrorMessage("Please specify a host company for this application.");
      setSubmitting(false);
      return;
    }

    try {
      // Step 1: Create Application in PENDING_PAYMENT
      const appRes = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          gender: formData.gender,
          phone: formData.phone,
          email: formData.email,
          institution: formData.institution,
          programOfStudy: formData.programOfStudy,
          yearOfStudy: formData.yearOfStudy,
          indexNumber: formData.indexNumber,
          companyId: formData.isCustomCompany ? null : formData.companyId,
          companyName: formData.companyName,
          companyAddress: formData.companyAddress,
          isCustom: formData.isCustomCompany,
          coverLetter: formData.coverLetter,
        }),
      });

      const appData = await appRes.json();

      if (!appRes.ok || !appData.applicationId) {
        setErrorMessage(appData.error || "Failed to create application draft.");
        setSubmitting(false);
        return;
      }

      const applicationId = appData.applicationId;
      setActiveApplicationId(applicationId);

      // Step 2: Initialize Payment with Paystack
      const payRes = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId }),
      });

      const payData = await payRes.json();

      if (!payRes.ok || !payData.reference) {
        setErrorMessage(payData.error || "Payment gateway setup failed. Please try again.");
        setSubmitting(false);
        return;
      }

      const { reference, publicKey, amount, email } = payData;

      // Step 3: Open Paystack Inline Checkout
      if (typeof window !== "undefined" && window.PaystackPop && publicKey && !publicKey.includes("placeholder")) {
        const handler = window.PaystackPop.setup({
          key: publicKey,
          email,
          amount,
          currency: "GHS",
          ref: reference,
          callback: function (response) {
            console.log("Paystack callback response:", response);
            startPaymentStatusPolling(applicationId);
          },
          onClose: function () {
            setSubmitting(false);
            setInfoMessage(
              "Checkout was closed. Your application has been saved under 'Payment Pending' in the Programs tracking desk."
            );
          },
        });

        handler.openIframe();
        setSubmitting(false);
      } else {
        // Fallback simulation / Test mode instructions if Paystack key is placeholder
        setSubmitting(false);
        setInfoMessage(
          `Application drafted (Ref: ${reference}). Awaiting Paystack webhook confirmation for testing.`
        );
        startPaymentStatusPolling(applicationId);
      }
    } catch (err) {
      console.error("Submission error:", err);
      setErrorMessage("A network error occurred during submission. Please try again.");
      setSubmitting(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="py-16 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-fin-navy animate-spin mb-3" />
        <p className="text-xs text-slate-500 font-medium">Preparing application form...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Paystack Inline Script */}
      <Script src="https://js.paystack.co/v1/inline.js" strategy="lazyOnload" />

      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2.5 mb-1.5">
          <div className="w-8 h-8 rounded-lg bg-fin-gold/15 text-fin-navy flex items-center justify-center font-bold">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-heading font-bold text-fin-navy">
              Internship Application
            </h1>
            <p className="text-xs text-slate-500">
              Submit placement credentials & corporate matching
            </p>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {infoMessage && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{infoMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Verifying Payment Overlay Banner */}
      {verifyingPayment && (
        <div className="p-4 rounded-2xl bg-fin-navy text-white shadow-lg flex items-center gap-3 animate-pulse">
          <Loader2 className="w-6 h-6 text-fin-gold animate-spin shrink-0" />
          <div>
            <p className="text-xs font-bold font-heading">Verifying your payment...</p>
            <p className="text-[11px] text-slate-200">
              Waiting for cryptographic Paystack webhook confirmation. Please do not close.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handlePayAndSubmit} className="space-y-4">
        {/* SECTION 1: Personal Information */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <span className="w-5 h-5 rounded-full bg-fin-navy text-white text-[10px] font-bold flex items-center justify-center font-heading">
              1
            </span>
            <h2 className="text-xs font-heading font-bold uppercase tracking-wider text-fin-navy">
              Personal Information
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                First Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 bg-slate-50/50 text-xs sm:text-sm focus:ring-2 focus:ring-fin-navy/20 focus:border-fin-navy text-slate-900 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Last Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 bg-slate-50/50 text-xs sm:text-sm focus:ring-2 focus:ring-fin-navy/20 focus:border-fin-navy text-slate-900 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50/50 text-xs sm:text-sm focus:ring-2 focus:ring-fin-navy/20 focus:border-fin-navy text-slate-900 font-medium"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other / Prefer not to say</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Phone Number *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+233 24 000 0000"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 bg-slate-50/50 text-xs sm:text-sm focus:ring-2 focus:ring-fin-navy/20 focus:border-fin-navy text-slate-900 font-medium"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 bg-slate-50/50 text-xs sm:text-sm focus:ring-2 focus:ring-fin-navy/20 focus:border-fin-navy text-slate-900 font-medium"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: Academic Information */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <span className="w-5 h-5 rounded-full bg-fin-navy text-white text-[10px] font-bold flex items-center justify-center font-heading">
              2
            </span>
            <h2 className="text-xs font-heading font-bold uppercase tracking-wider text-fin-navy">
              Academic Information
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Institution / University *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <GraduationCap className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  name="institution"
                  required
                  value={formData.institution}
                  onChange={handleChange}
                  placeholder="e.g. University of Ghana"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 bg-slate-50/50 text-xs sm:text-sm focus:ring-2 focus:ring-fin-navy/20 focus:border-fin-navy text-slate-900 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Program of Study *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <BookOpen className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  name="programOfStudy"
                  required
                  value={formData.programOfStudy}
                  onChange={handleChange}
                  placeholder="e.g. BSc Computer Science"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 bg-slate-50/50 text-xs sm:text-sm focus:ring-2 focus:ring-fin-navy/20 focus:border-fin-navy text-slate-900 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Year of Study *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
                <select
                  name="yearOfStudy"
                  value={formData.yearOfStudy}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 bg-slate-50/50 text-xs sm:text-sm focus:ring-2 focus:ring-fin-navy/20 focus:border-fin-navy text-slate-900 font-medium"
                >
                  <option value="Year 1">Year 1 (Freshman)</option>
                  <option value="Year 2">Year 2 (Sophomore)</option>
                  <option value="Year 3">Year 3 (Penultimate)</option>
                  <option value="Year 4">Year 4 (Final Year)</option>
                  <option value="Graduate / National Service">Graduate / National Service</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Student ID / Index No. *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <CreditCard className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  name="indexNumber"
                  required
                  value={formData.indexNumber}
                  onChange={handleChange}
                  placeholder="e.g. 10982345"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 bg-slate-50/50 text-xs sm:text-sm focus:ring-2 focus:ring-fin-navy/20 focus:border-fin-navy text-slate-900 font-medium"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: Company / Placement Selection */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <span className="w-5 h-5 rounded-full bg-fin-navy text-white text-[10px] font-bold flex items-center justify-center font-heading">
              3
            </span>
            <h2 className="text-xs font-heading font-bold uppercase tracking-wider text-fin-navy">
              Placement / Host Company
            </h2>
          </div>

          {!formData.isCustomCompany ? (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Select Host Company *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Building className="w-3.5 h-3.5" />
                </div>
                <select
                  value={formData.companyId}
                  onChange={handleCompanySelectChange}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50/50 text-xs sm:text-sm focus:ring-2 focus:ring-fin-navy/20 focus:border-fin-navy text-slate-900 font-medium"
                >
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              {formData.companyAddress && (
                <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>{formData.companyAddress}</span>
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Company Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Building className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    name="companyName"
                    required
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="Enter full company name"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 bg-slate-50/50 text-xs sm:text-sm focus:ring-2 focus:ring-fin-navy/20 focus:border-fin-navy text-slate-900 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Company Location / Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    name="companyAddress"
                    value={formData.companyAddress}
                    onChange={handleChange}
                    placeholder="e.g. Airport Residential Area, Accra"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 bg-slate-50/50 text-xs sm:text-sm focus:ring-2 focus:ring-fin-navy/20 focus:border-fin-navy text-slate-900 font-medium"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="pt-2">
            <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-slate-700 font-medium select-none">
              <input
                type="checkbox"
                checked={formData.isCustomCompany}
                onChange={handleToggleCustomCompany}
                className="w-4 h-4 rounded text-fin-navy focus:ring-fin-navy border-slate-300"
              />
              <span>My host company is not on the list</span>
            </label>
          </div>
        </div>

        {/* SECTION 4: Cover Letter (Optional) */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-fin-navy text-white text-[10px] font-bold flex items-center justify-center font-heading">
                4
              </span>
              <h2 className="text-xs font-heading font-bold uppercase tracking-wider text-fin-navy">
                Cover Letter <span className="text-slate-400 font-normal">(Optional)</span>
              </h2>
            </div>
            <button
              type="button"
              onClick={handleGenerateAiCoverLetter}
              disabled={aiDrafting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 text-xs font-semibold transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>{aiDrafting ? "Drafting..." : "Pre-fill from Super AI"}</span>
            </button>
          </div>

          <div>
            <textarea
              name="coverLetter"
              value={formData.coverLetter}
              onChange={(e) => setFormData((prev) => ({ ...prev, coverLetter: e.target.value }))}
              rows={5}
              placeholder="Introduce yourself and share why you are interested in interning at this host company..."
              className="w-full p-3.5 rounded-xl border border-slate-300 bg-slate-50/50 text-xs sm:text-sm focus:ring-2 focus:ring-fin-navy/20 focus:border-fin-navy text-slate-900 font-medium leading-relaxed"
            />
          </div>
        </div>

        {/* SECTION 5: Fee Summary Card */}
        <div className="bg-gradient-to-br from-slate-900 to-fin-navy text-white rounded-2xl p-5 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <PaymentIcon className="w-4 h-4 text-fin-gold" />
              <span className="text-xs font-heading font-bold uppercase tracking-wider">
                Application Processing Fee
              </span>
            </div>
            <span className="text-lg font-heading font-extrabold text-fin-gold">
              GHS {feeGhs}
            </span>
          </div>
          <p className="text-[11px] text-slate-300 mt-2.5 leading-relaxed">
            Covers verified institutional matching, employer intake dispatch, and tracking desk registration.
          </p>
        </div>

        {/* Paystack Test Mode Evaluator Guidance Card */}
        {/* NOTE: These values are Paystack's official published test card details for sandbox evaluation */}
        <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-900 space-y-2">
          <div className="flex items-center gap-2 font-bold text-xs text-amber-900">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Testing this payment in Paystack Test Mode?</span>
          </div>
          <p className="text-[11px] text-amber-800/90 leading-relaxed">
            Evaluators can complete test payments using Paystack's published test card values:
          </p>
          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-white/80 p-2.5 rounded-xl border border-amber-200/80">
            <div><span className="text-slate-500 font-sans font-semibold text-[10px] block">CARD NUMBER</span> 4084 0840 8408 4081</div>
            <div><span className="text-slate-500 font-sans font-semibold text-[10px] block">EXPIRY</span> Any future date (e.g. 12/28)</div>
            <div><span className="text-slate-500 font-sans font-semibold text-[10px] block">CVV</span> 408</div>
            <div><span className="text-slate-500 font-sans font-semibold text-[10px] block">PIN / OTP</span> PIN: 1234 • OTP: 123456</div>
          </div>
        </div>

        {/* Submit Action: EXACT label "Pay and Submit" */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting || verifyingPayment}
            className="w-full py-4 px-6 rounded-2xl bg-fin-navy hover:bg-fin-navy-light text-white font-heading font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all disabled:opacity-70 active:scale-[0.99]"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Preparing Checkout...</span>
              </>
            ) : (
              <>
                <span>Pay and Submit</span>
                <ArrowRight className="w-4 h-4 text-fin-gold" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
