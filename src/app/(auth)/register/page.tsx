"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  BookOpen,
  Calendar,
  CreditCard,
  Lock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    institution: "",
    programOfStudy: "",
    yearOfStudy: "Year 2",
    indexNumber: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          institution: formData.institution,
          programOfStudy: formData.programOfStudy,
          yearOfStudy: formData.yearOfStudy,
          indexNumber: formData.indexNumber,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create account. Please check your details.");
        setLoading(false);
        return;
      }

      // Automatically sign in upon registration
      const signInRes = await signIn("credentials", {
        redirect: false,
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      if (signInRes?.error) {
        // Fallback to login page if immediate auto-signin fails
        router.push("/login?registered=true");
      } else {
        router.push("/overview");
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected network error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-fin-paper font-sans">
      {/* Left Hero Panel */}
      <section className="hidden lg:flex lg:col-span-5 bg-fin-navy-deep text-fin-paper flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute -right-24 -bottom-24 w-96 h-96 rounded-full border border-fin-gold/20 pointer-events-none" />
        <div className="absolute -right-8 -bottom-8 w-48 h-48 rounded-full border border-fin-gold/30 pointer-events-none" />

        <div className="relative z-10">
          <Logo size={42} lightText={true} />
        </div>

        <div className="relative z-10 my-auto py-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-fin-gold/15 border border-fin-gold/30 text-fin-gold text-xs font-semibold uppercase tracking-wider mb-6">
            <ShieldCheck className="w-3.5 h-3.5" />
            Accredited Student Registration
          </div>

          <h1 className="text-3xl xl:text-4xl font-heading font-bold text-white tracking-tight leading-snug">
            Launch Your Professional Journey with <span className="text-fin-gold">FIN</span>.
          </h1>

          <p className="mt-4 text-slate-300 text-sm leading-relaxed max-w-md">
            Create your authenticated student profile to match with partner institutions, verified corporate sponsors, and career development cohorts.
          </p>

          <ul className="mt-8 space-y-3.5 border-t border-white/10 pt-6">
            {[
              "Verified student record & university placement tracking",
              "Exclusive access to corporate internship batches",
              "Transparent hiring and interview scheduling",
            ].map((text, idx) => (
              <li key={idx} className="flex items-center gap-3 text-xs text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-fin-gold shrink-0" />
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 text-[11px] uppercase tracking-widest text-slate-400 font-semibold border-t border-white/10 pt-4 flex items-center justify-between">
          <span>Accra, Ghana</span>
          <span>© 2026 Fortune Intern</span>
        </div>
      </section>

      {/* Right Registration Form */}
      <section className="col-span-1 lg:col-span-7 flex flex-col items-center justify-center p-4 sm:p-8 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-lg my-auto py-6">
          <div className="lg:hidden flex justify-center mb-6">
            <Logo size={36} />
          </div>

          <div className="bg-white rounded-2xl shadow-xl lg:shadow-2xl border border-slate-200/80 p-6 sm:p-8">
            <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1 mb-6">
              <Link
                href="/login"
                className="py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg text-slate-600 hover:text-fin-navy text-center transition-all"
              >
                Sign In
              </Link>
              <button
                type="button"
                className="py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg bg-fin-navy text-white shadow-sm transition-all"
              >
                Create Account
              </button>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-heading font-bold text-fin-navy tracking-tight">
                Create Student Account
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Enter your academic and personal details to register.
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium animate-in fade-in duration-200">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Personal Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Full Name *
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
                      placeholder="e.g. Kwame Mensah"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50/50 text-xs sm:text-sm focus:ring-2 focus:ring-fin-navy/20 focus:border-fin-navy text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
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
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50/50 text-xs sm:text-sm focus:ring-2 focus:ring-fin-navy/20 focus:border-fin-navy text-slate-900"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Email Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="student@university.edu.gh"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50/50 text-xs sm:text-sm focus:ring-2 focus:ring-fin-navy/20 focus:border-fin-navy text-slate-900"
                  />
                </div>
              </div>

              {/* Academic Info */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] font-heading font-bold uppercase tracking-wider text-slate-400 block mb-3">
                  Academic Information
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
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
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50/50 text-xs sm:text-sm focus:ring-2 focus:ring-fin-navy/20 focus:border-fin-navy text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
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
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50/50 text-xs sm:text-sm focus:ring-2 focus:ring-fin-navy/20 focus:border-fin-navy text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
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

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                      Student ID / Index No.
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
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50/50 text-xs sm:text-sm focus:ring-2 focus:ring-fin-navy/20 focus:border-fin-navy text-slate-900"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Password Section */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] font-heading font-bold uppercase tracking-wider text-slate-400 block mb-3">
                  Account Security
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                      Password *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type="password"
                        name="password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50/50 text-xs sm:text-sm focus:ring-2 focus:ring-fin-navy/20 focus:border-fin-navy text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type="password"
                        name="confirmPassword"
                        required
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50/50 text-xs sm:text-sm focus:ring-2 focus:ring-fin-navy/20 focus:border-fin-navy text-slate-900"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-3.5 px-4 rounded-xl bg-fin-navy hover:bg-fin-navy-light text-white font-heading font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-70 active:scale-[0.99]"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Complete Registration</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500">
                Already registered?{" "}
                <Link
                  href="/login"
                  className="font-bold text-fin-navy hover:underline"
                >
                  Sign in to your account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
