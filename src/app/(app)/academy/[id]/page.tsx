"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  CheckCircle2, 
  Circle, 
  ArrowLeft, 
  ArrowRight, 
  Award, 
  Loader2, 
  Sparkles,
  BookOpen
} from "lucide-react";

interface ModuleItem {
  id: string;
  title: string;
  content: string;
  order: number;
  skillAxis: string;
}

interface CourseDetail {
  id: string;
  title: string;
  description: string;
  modules: ModuleItem[];
}

export default function CourseDetailPage({ params }: { params: { id: string } }) {
  const courseId = params.id;
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [completedModuleIds, setCompletedModuleIds] = useState<string[]>([]);
  const [activeModuleIndex, setActiveModuleIndex] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [earnedCertCode, setEarnedCertCode] = useState<string | null>(null);

  const fetchCourseDetails = async () => {
    try {
      const res = await fetch("/api/academy/courses");
      if (res.ok) {
        const data = await res.json();
        const found = (data.courses || []).find((c: any) => c.id === courseId);
        if (found) {
          setCourse(found);
        }
        setCompletedModuleIds(data.completedModuleIds || []);
      }
    } catch (err) {
      console.error("Error loading course details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseDetails();
  }, [courseId]);

  const handleMarkComplete = async (moduleId: string) => {
    setCompleting(true);
    try {
      const res = await fetch(`/api/academy/modules/${moduleId}/complete`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to mark module complete");
        return;
      }

      // Add to completed list locally
      if (!completedModuleIds.includes(moduleId)) {
        setCompletedModuleIds((prev) => [...prev, moduleId]);
      }

      if (data.certificateIssued && data.certificateCode) {
        setEarnedCertCode(data.certificateCode);
      }

      // Move to next module if available
      if (course && activeModuleIndex < course.modules.length - 1) {
        setActiveModuleIndex((prev) => prev + 1);
      }
    } catch (err) {
      alert("Network error completing module");
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 text-fin-navy animate-spin" />
        <p className="text-xs font-medium">Loading course module reader...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <p className="text-sm font-semibold text-slate-700">Course not found.</p>
        <Link href="/academy" className="text-xs text-fin-navy font-bold hover:underline mt-2 inline-block">
          Return to Academy
        </Link>
      </div>
    );
  }

  const currentModule = course.modules[activeModuleIndex] || course.modules[0];
  const isCurrentCompleted = currentModule ? completedModuleIds.includes(currentModule.id) : false;

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Back Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/academy"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-fin-navy transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Courses
        </Link>

        <span className="text-xs font-semibold text-slate-500">
          Module {activeModuleIndex + 1} of {course.modules.length}
        </span>
      </div>

      {/* Main Course Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Module Sidebar */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3 lg:col-span-1">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-heading font-bold text-slate-900 leading-snug">
              {course.title}
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">{course.description}</p>
          </div>

          <div className="space-y-1">
            {course.modules.map((mod, index) => {
              const isCompleted = completedModuleIds.includes(mod.id);
              const isActive = index === activeModuleIndex;

              return (
                <button
                  key={mod.id}
                  onClick={() => setActiveModuleIndex(index)}
                  className={`w-full text-left p-3 rounded-xl text-xs flex items-center justify-between transition-all border ${
                    isActive
                      ? "bg-fin-navy text-white font-bold border-fin-navy shadow-xs"
                      : "bg-slate-50/70 hover:bg-slate-100 text-slate-700 border-slate-200/60"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    {isCompleted ? (
                      <CheckCircle2 className={`w-4 h-4 shrink-0 ${isActive ? "text-fin-gold" : "text-emerald-600"}`} />
                    ) : (
                      <Circle className={`w-4 h-4 shrink-0 ${isActive ? "text-slate-300" : "text-slate-400"}`} />
                    )}
                    <span className="truncate">{mod.title}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Module Content Reader */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm lg:col-span-2 space-y-6 flex flex-col justify-between min-h-[420px]">
          {currentModule ? (
            <>
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-4">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-100">
                      Axis: {currentModule.skillAxis.replace("_", " ")}
                    </span>
                    <h1 className="text-lg font-heading font-bold text-slate-900 mt-2">
                      {currentModule.title}
                    </h1>
                  </div>

                  {isCurrentCompleted && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                    </span>
                  )}
                </div>

                {/* Lesson Body */}
                <div className="prose prose-slate max-w-none text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                  {currentModule.content}
                </div>
              </div>

              {/* Reader Action Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  disabled={activeModuleIndex === 0}
                  onClick={() => setActiveModuleIndex((prev) => Math.max(0, prev - 1))}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 disabled:opacity-40 transition-colors flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Previous Module
                </button>

                <button
                  onClick={() => handleMarkComplete(currentModule.id)}
                  disabled={completing}
                  className="px-5 py-2 rounded-xl bg-fin-navy hover:bg-fin-navy-light text-white text-xs font-heading font-bold transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  {completing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Progress...</span>
                    </>
                  ) : isCurrentCompleted ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-fin-gold" />
                      <span>Completed (Re-verify)</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-fin-gold" />
                      <span>Mark Module Complete</span>
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <p className="text-xs text-slate-500">Select a module from the sidebar to begin.</p>
          )}
        </div>
      </div>

      {/* Earned Certificate Modal */}
      {earnedCertCode && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl border border-fin-gold/30 relative">
            <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto ring-8 ring-amber-50/50">
              <Award className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
                Course Certificate Issued!
              </span>
              <h3 className="text-lg font-heading font-bold text-slate-900 pt-1">
                Congratulations! 🎉
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                You have successfully completed all modules in <strong className="text-slate-900">{course.title}</strong>.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 text-white font-mono text-xs font-bold border border-slate-800">
              Certificate Code: {earnedCertCode}
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={() => setEarnedCertCode(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700"
              >
                Close
              </button>
              <Link
                href="/certificates"
                className="px-4 py-2 rounded-xl bg-fin-navy hover:bg-fin-navy-light text-white text-xs font-heading font-bold flex items-center gap-1 shadow-sm"
              >
                <span>View & Download Certificate</span>
                <ArrowRight className="w-3.5 h-3.5 text-fin-gold" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
