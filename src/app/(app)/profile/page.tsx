"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  BookOpen,
  Calendar,
  CreditCard,
  Save,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";

export default function ProfilePage() {
  const { data: session, update: updateSession } = useSession();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    institution: "",
    programOfStudy: "",
    yearOfStudy: "Year 2",
    indexNumber: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch initial profile data from server API
  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          if (data.user && isMounted) {
            setFormData({
              fullName: data.user.fullName || "",
              email: data.user.email || "",
              phone: data.user.phone || "",
              institution: data.user.profile?.institution || "",
              programOfStudy: data.user.profile?.programOfStudy || "",
              yearOfStudy: data.user.profile?.yearOfStudy || "Year 2",
              indexNumber: data.user.profile?.indexNumber || "",
            });
          }
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          phone: formData.phone,
          institution: formData.institution,
          programOfStudy: formData.programOfStudy,
          yearOfStudy: formData.yearOfStudy,
          indexNumber: formData.indexNumber,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Failed to update profile. Please try again.");
      } else {
        setSuccessMessage("Profile updated successfully in database.");
        // Trigger session update for client sync if name changed
        if (session?.user && formData.fullName !== session.user.name) {
          await updateSession({ name: formData.fullName });
        }
      }
    } catch (err) {
      setErrorMessage("An unexpected network error occurred.");
    } finally {
      setSaving(false);
    }
  };

  const initials = formData.fullName
    ? formData.fullName
        .split(" ")
        .map((n) => n[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "ST";

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-3 border-fin-navy border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-slate-500 font-medium">Loading profile from database...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-fin-gold text-fin-navy font-heading font-extrabold text-base flex items-center justify-center shadow-sm">
            {initials}
          </div>
          <div>
            <h1 className="text-base font-heading font-bold text-fin-navy">
              {formData.fullName || "Student Profile"}
            </h1>
            <p className="text-xs text-slate-500">{formData.email}</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5" />
          Verified
        </div>
      </div>

      {/* Notifications / Alerts */}
      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium flex items-center gap-2 animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Edit Form Card */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
        <div>
          <h2 className="text-xs font-heading font-bold uppercase tracking-wider text-slate-400 mb-3">
            Personal Details
          </h2>

          <div className="space-y-3">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50/50 text-xs sm:text-sm focus:ring-2 focus:ring-fin-navy/20 focus:border-fin-navy text-slate-900 font-medium"
                />
              </div>
            </div>

            {/* Email (Read-Only) */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Email Address (Read-Only)
                </label>
                <span className="text-[10px] text-slate-400 font-medium">Primary Account Key</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  disabled
                  value={formData.email}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100/80 text-xs sm:text-sm text-slate-500 font-medium cursor-not-allowed"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+233 24 000 0000"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50/50 text-xs sm:text-sm focus:ring-2 focus:ring-fin-navy/20 focus:border-fin-navy text-slate-900 font-medium"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100">
          <h2 className="text-xs font-heading font-bold uppercase tracking-wider text-slate-400 mb-3">
            Academic Profile
          </h2>

          <div className="space-y-3">
            {/* Institution */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Institution / University
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="institution"
                  value={formData.institution}
                  onChange={handleChange}
                  placeholder="e.g. University of Ghana"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50/50 text-xs sm:text-sm focus:ring-2 focus:ring-fin-navy/20 focus:border-fin-navy text-slate-900 font-medium"
                />
              </div>
            </div>

            {/* Program of Study */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Program of Study
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <BookOpen className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="programOfStudy"
                  value={formData.programOfStudy}
                  onChange={handleChange}
                  placeholder="e.g. BSc Computer Science"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50/50 text-xs sm:text-sm focus:ring-2 focus:ring-fin-navy/20 focus:border-fin-navy text-slate-900 font-medium"
                />
              </div>
            </div>

            {/* Year of Study */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Year of Study
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <select
                  name="yearOfStudy"
                  value={formData.yearOfStudy}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50/50 text-xs sm:text-sm focus:ring-2 focus:ring-fin-navy/20 focus:border-fin-navy text-slate-900 font-medium"
                >
                  <option value="Year 1">Year 1 (Freshman)</option>
                  <option value="Year 2">Year 2 (Sophomore)</option>
                  <option value="Year 3">Year 3 (Penultimate)</option>
                  <option value="Year 4">Year 4 (Final Year)</option>
                  <option value="Graduate / National Service">Graduate / National Service</option>
                </select>
              </div>
            </div>

            {/* Student ID / Index Number */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Student ID / Index Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <CreditCard className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="indexNumber"
                  value={formData.indexNumber}
                  onChange={handleChange}
                  placeholder="e.g. 10928347"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50/50 text-xs sm:text-sm focus:ring-2 focus:ring-fin-navy/20 focus:border-fin-navy text-slate-900 font-medium"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-fin-navy hover:bg-fin-navy-light text-white font-heading font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-70 active:scale-[0.99]"
          >
            {saving ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
