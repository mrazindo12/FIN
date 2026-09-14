"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  BookOpen, 
  GraduationCap, 
  CheckCircle2, 
  Award, 
  ArrowRight, 
  RefreshCw, 
  Loader2,
  Sparkles
} from "lucide-react";

interface CourseItem {
  id: string;
  title: string;
  description: string;
  order: number;
  totalModules: number;
  completedCount: number;
  progressPercent: number;
  certificate: {
    code: string;
    issuedAt: string;
  } | null;
}

export default function StudentAcademyPage() {
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/academy/courses");
      if (!res.ok) {
        throw new Error("Failed to load academy courses");
      }
      const data = await res.json();
      setCourses(data.courses || []);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-fin-navy to-slate-900 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 rounded-full bg-fin-gold/10 pointer-events-none blur-2xl" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-fin-gold/20 text-fin-gold text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> FIN Academy Curriculum
          </div>
          <h1 className="text-2xl font-heading font-bold tracking-tight">
            Skill Progression & Masterclasses
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg leading-relaxed">
            Complete core competency modules to build your radar profile and earn verifiable digital certificates.
          </p>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 text-fin-navy animate-spin" />
          <p className="text-xs font-medium">Loading academy courses & progression...</p>
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-fin-navy/30 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="w-9 h-9 rounded-xl bg-fin-gold/15 text-fin-navy flex items-center justify-center font-bold text-sm">
                    {course.order}
                  </div>
                  {course.certificate && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px]">
                      <Award className="w-3.5 h-3.5 text-emerald-600" /> Certificate Earned
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-heading font-bold text-slate-900 leading-snug">
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                    {course.description}
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-100">
                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-semibold">
                    <span className="text-slate-500">Course Progress</span>
                    <span className="text-fin-navy font-bold">{course.progressPercent}% ({course.completedCount}/{course.totalModules} modules)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-fin-gold rounded-full transition-all duration-300"
                      style={{ width: `${course.progressPercent}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-400">
                    {course.totalModules} Interactive Modules
                  </span>
                  <Link
                    href={`/academy/${course.id}`}
                    className="px-3.5 py-1.5 rounded-xl bg-fin-navy hover:bg-fin-navy-light text-white text-xs font-heading font-bold transition-colors flex items-center gap-1 shadow-2xs"
                  >
                    <span>{course.progressPercent === 100 ? "Review Course" : "Continue Learning"}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-fin-gold" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
