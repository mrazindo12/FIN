"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Award, Download, ExternalLink, RefreshCw, Loader2, ShieldCheck, CheckCircle2 } from "lucide-react";

interface CertificateItem {
  id: string;
  certificateCode: string;
  issuedAt: string;
  course: {
    id: string;
    title: string;
    description: string;
  };
}

export default function CertificatesPage() {
  const [studentName, setStudentName] = useState<string>("Student");
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCertificates = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/certificates");
      if (!res.ok) throw new Error("Failed to load certificates");
      const data = await res.json();
      setStudentName(data.studentName || "Student");
      setCertificates(data.certificates || []);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const downloadCertificatePNG = (cert: CertificateItem) => {
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 850;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background Gradient & Border
    const bgGradient = ctx.createLinearGradient(0, 0, 1200, 850);
    bgGradient.addColorStop(0, "#0F172A");
    bgGradient.addColorStop(1, "#1E293B");
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, 1200, 850);

    // Decorative Gold Border
    ctx.strokeStyle = "#F59E0B";
    ctx.lineWidth = 12;
    ctx.strokeRect(30, 30, 1140, 790);

    ctx.strokeStyle = "rgba(245, 158, 11, 0.4)";
    ctx.lineWidth = 2;
    ctx.strokeRect(45, 45, 1110, 760);

    // Header Branding
    ctx.fillStyle = "#F59E0B";
    ctx.font = "bold 32px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("FORTUNE INTERN NETWORK ACADEMY", 600, 120);

    ctx.fillStyle = "#94A3B8";
    ctx.font = "16px sans-serif";
    ctx.fillText("OFFICIAL VERIFIED CERTIFICATE OF COMPLETION", 600, 160);

    // Main Certificate Body
    ctx.fillStyle = "#F8FAFC";
    ctx.font = "22px sans-serif";
    ctx.fillText("This is proudly presented to", 600, 260);

    ctx.fillStyle = "#38BDF8";
    ctx.font = "bold 48px sans-serif";
    ctx.fillText(studentName.toUpperCase(), 600, 340);

    ctx.fillStyle = "#94A3B8";
    ctx.font = "20px sans-serif";
    ctx.fillText("for successfully completing all modules in the course", 600, 420);

    ctx.fillStyle = "#F59E0B";
    ctx.font = "bold 36px sans-serif";
    ctx.fillText(cert.course.title, 600, 490);

    // Divider Line
    ctx.strokeStyle = "rgba(241, 245, 249, 0.2)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(300, 560);
    ctx.lineTo(900, 560);
    ctx.stroke();

    // Issue Date & Certificate Code
    const issuedDateStr = new Date(cert.issuedAt).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    ctx.fillStyle = "#CBD5E1";
    ctx.font = "18px sans-serif";
    ctx.fillText(`Issued Date: ${issuedDateStr}`, 400, 630);
    ctx.fillText(`Verification Code: ${cert.certificateCode}`, 800, 630);

    // Footer Verification Note
    ctx.fillStyle = "#64748B";
    ctx.font = "14px sans-serif";
    ctx.fillText(
      `Verify authenticity online at: /api/certificates/verify/${cert.certificateCode}`,
      600,
      760
    );

    // Trigger PNG Download
    const dataUrl = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `FIN-Certificate-${cert.certificateCode}.png`;
    a.click();
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-heading font-bold text-fin-navy">
              My Earned Certificates
            </h1>
            <p className="text-xs text-slate-500">
              Verified digital credentials & public verification codes
            </p>
          </div>
        </div>

        <button
          onClick={fetchCertificates}
          className="text-xs text-slate-400 hover:text-fin-navy flex items-center gap-1"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 text-fin-navy animate-spin" />
          <p className="text-xs font-medium">Loading certificates gallery...</p>
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
          {error}
        </div>
      ) : certificates.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm text-center space-y-3">
          <Award className="w-10 h-10 text-slate-300 mx-auto" />
          <div>
            <h3 className="text-sm font-heading font-bold text-slate-800">No certificates earned yet</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 leading-relaxed">
              Complete all modules in any FIN Academy course to automatically issue a verified certificate.
            </p>
          </div>
          <Link
            href="/academy"
            className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-fin-navy text-white text-xs font-heading font-bold hover:bg-fin-navy-light transition-all shadow-sm mt-2"
          >
            Go to Academy Courses
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-lg flex flex-col justify-between space-y-4 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />

              <div className="space-y-3 relative z-10">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold">
                    <ShieldCheck className="w-3 h-3" /> VERIFIED CREDENTIAL
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {new Date(cert.issuedAt).toLocaleDateString()}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-heading font-bold text-white leading-snug">
                    {cert.course.title}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">Issued to: <strong className="text-sky-400">{studentName}</strong></p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 space-y-3 relative z-10">
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between font-mono text-xs">
                  <span className="text-slate-400 text-[11px]">Code:</span>
                  <span className="font-bold text-amber-400 tracking-wider">{cert.certificateCode}</span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <Link
                    href={`/api/certificates/verify/${cert.certificateCode}`}
                    target="_blank"
                    className="text-[11px] font-semibold text-slate-400 hover:text-sky-400 flex items-center gap-1 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Public Verification
                  </Link>

                  <button
                    onClick={() => downloadCertificatePNG(cert)}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/20"
                  >
                    <Download className="w-3.5 h-3.5" /> Download PNG
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
