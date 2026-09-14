"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Lock, Mail, ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import { Logo } from "@/components/brand/Logo";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleQuickLogin = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: demoEmail,
        password: demoPass,
      });

      if (res?.error) {
        setError("Demo login failed. Please verify seed status.");
        setLoading(false);
      } else {
        router.push("/overview");
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred during demo login.");
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: email.trim().toLowerCase(),
        password,
      });

      if (res?.error) {
        setError("Invalid email or password. Please verify your credentials.");
        setLoading(false);
      } else {
        router.push("/overview");
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-fin-paper font-sans">
      {/* Editorial Left Hero Panel (Desktop) */}
      <section className="hidden lg:flex lg:col-span-5 bg-fin-navy-deep text-fin-paper flex-col justify-between p-12 relative overflow-hidden">
        {/* Background ambient circular rings */}
        <div className="absolute -right-24 -bottom-24 w-96 h-96 rounded-full border border-fin-gold/20 pointer-events-none" />
        <div className="absolute -right-8 -bottom-8 w-48 h-48 rounded-full border border-fin-gold/30 pointer-events-none" />

        {/* Top Brand */}
        <div className="relative z-10">
          <Logo size={42} lightText={true} />
        </div>

        {/* Center Content */}
        <div className="relative z-10 my-auto py-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-fin-gold/15 border border-fin-gold/30 text-fin-gold text-xs font-semibold uppercase tracking-wider mb-6">
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified Career Gateway
          </div>

          <h1 className="text-3xl xl:text-4xl font-heading font-bold text-white tracking-tight leading-snug">
            Bridging Academic Talent with <span className="text-fin-gold">High-Impact</span> Careers.
          </h1>

          <p className="mt-4 text-slate-300 text-sm leading-relaxed max-w-md">
            Fortune Intern Network connects ambitious Ghanaian university students with vetted corporate internships, graduate traineeships, and industry mentorship.
          </p>

          <ul className="mt-8 space-y-3.5 border-t border-white/10 pt-6">
            {[
              "Mandatory verified student identity gate",
              "Direct pipeline to accredited corporate partners",
              "Structured career milestones & institutional tracking",
            ].map((text, idx) => (
              <li key={idx} className="flex items-center gap-3 text-xs text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-fin-gold shrink-0" />
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-[11px] uppercase tracking-widest text-slate-400 font-semibold border-t border-white/10 pt-4 flex items-center justify-between">
          <span>Accra, Ghana</span>
          <span>© 2026 Fortune Intern</span>
        </div>
      </section>

      {/* Right Login Form Container */}
      <section className="col-span-1 lg:col-span-7 flex flex-col items-center justify-center p-4 sm:p-8 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Brand Header */}
          <div className="lg:hidden flex justify-center mb-8">
            <Logo size={36} />
          </div>

          {/* Card Frame */}
          <div className="bg-white rounded-2xl shadow-xl lg:shadow-2xl border border-slate-200/80 p-6 sm:p-8">
            {/* Split Switch Tabs */}
            <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1 mb-8">
              <button
                type="button"
                className="py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg bg-fin-navy text-white shadow-sm transition-all"
              >
                Sign In
              </button>
              <Link
                href="/register"
                className="py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg text-slate-600 hover:text-fin-navy text-center transition-all"
              >
                Create Account
              </Link>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-heading font-bold text-fin-navy tracking-tight">
                Welcome Back
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Enter your credentials to access your protected student portal.
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium animate-in fade-in duration-200">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@university.edu.gh"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 bg-slate-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-fin-navy/20 focus:border-fin-navy text-slate-900 placeholder:text-slate-400 font-medium transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-300 bg-slate-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-fin-navy/20 focus:border-fin-navy text-slate-900 placeholder:text-slate-400 font-medium transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 px-4 rounded-xl bg-fin-navy hover:bg-fin-navy-light text-white font-heading font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-70 active:scale-[0.99]"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500">
                New to Fortune Intern Network?{" "}
                <Link
                  href="/register"
                  className="font-bold text-fin-navy hover:underline"
                >
                  Create an account
                </Link>
              </p>
            </div>
          </div>

          {/* Demo Access Panel (Evaluation Mode) */}
          {process.env.NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS !== "false" && (
            <div className="mt-6 bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-xl space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs font-heading font-bold uppercase tracking-wider text-amber-400">
                    Demo Access Panel
                  </h3>
                </div>
                <span className="text-[10px] font-semibold bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded-full">
                  For evaluation purposes only
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                {/* Demo Student Card */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 block mb-0.5">
                      Demo Student
                    </span>
                    <p className="font-mono text-slate-200 text-[11px] truncate">student@fortuneintern.com</p>
                    <p className="font-mono text-slate-400 text-[10px]">Pass: StudentDemo2026!</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin("student@fortuneintern.com", "StudentDemo2026!")}
                    disabled={loading}
                    className="w-full py-1.5 px-2.5 rounded-lg bg-sky-900 hover:bg-sky-800 text-sky-100 text-[11px] font-bold transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                  >
                    <span>Fill &amp; Sign In</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Demo Staff Card */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-0.5">
                      Demo Staff / Admin
                    </span>
                    <p className="font-mono text-slate-200 text-[11px] truncate">admin@fortuneintern.com</p>
                    <p className="font-mono text-slate-400 text-[10px]">Pass: StaffDemo2026!</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin("admin@fortuneintern.com", "StaffDemo2026!")}
                    disabled={loading}
                    className="w-full py-1.5 px-2.5 rounded-lg bg-emerald-900 hover:bg-emerald-800 text-emerald-100 text-[11px] font-bold transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                  >
                    <span>Fill &amp; Sign In</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
