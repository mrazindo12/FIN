import { Lock, Award, Zap } from "lucide-react";

export function AcademyPlaceholders() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Competency Radar Placeholder Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-heading font-bold text-slate-800">
                Competency Radar
              </h3>
              <p className="text-[11px] text-slate-400">Skill proficiency vector map</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
            <Lock className="w-3 h-3" /> Locked (Phase 4)
          </span>
        </div>

        <div className="py-8 px-4 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200 space-y-2">
          <div className="w-10 h-10 rounded-full bg-slate-200/60 text-slate-400 flex items-center justify-center mx-auto">
            <Lock className="w-5 h-5 text-slate-500" />
          </div>
          <h4 className="text-xs font-bold text-slate-700">Complete FIN Academy modules to unlock this</h4>
          <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
            Your competency radar will automatically map technical skills, interview scores, and cohort performance metrics upon course completion.
          </p>
        </div>
      </div>

      {/* Learning Intensity Placeholder Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-heading font-bold text-slate-800">
                Learning Intensity
              </h3>
              <p className="text-[11px] text-slate-400">Weekly study commitment velocity</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
            <Lock className="w-3 h-3" /> Locked (Phase 4)
          </span>
        </div>

        <div className="py-8 px-4 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200 space-y-2">
          <div className="w-10 h-10 rounded-full bg-slate-200/60 text-slate-400 flex items-center justify-center mx-auto">
            <Lock className="w-5 h-5 text-slate-500" />
          </div>
          <h4 className="text-xs font-bold text-slate-700">Complete FIN Academy modules to unlock this</h4>
          <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
            Learning velocity heatmaps and daily study streak counters will activate when Academy module tracking launches in Phase 4.
          </p>
        </div>
      </div>
    </div>
  );
}
