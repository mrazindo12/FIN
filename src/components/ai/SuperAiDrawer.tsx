"use client";

import { useState } from "react";
import { Sparkles, X, Send, FileText, CheckCircle2, AlertCircle, Copy, Loader2 } from "lucide-react";

interface SuperAiDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDraft?: (content: string) => void;
}

export function SuperAiDrawer({ isOpen, onClose, onSelectDraft }: SuperAiDrawerProps) {
  const [draftType, setDraftType] = useState<"COVER_LETTER" | "CV">("COVER_LETTER");
  const [contextInput, setContextInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiAvailable, setAiAvailable] = useState<boolean | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [generatedDraft, setGeneratedDraft] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setGeneratedDraft(null);

    try {
      const res = await fetch("/api/ai/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: draftType,
          context: contextInput,
        }),
      });

      const data = await res.json();

      if (data.available === false) {
        setAiAvailable(false);
        setMessage(data.message || "Super AI assistant isn't configured yet.");
      } else if (data.draft) {
        setAiAvailable(true);
        setGeneratedDraft(data.draft.content);
        setMessage("Draft generated and saved successfully!");
      } else {
        throw new Error(data.error || "Failed to draft");
      }
    } catch (err: any) {
      setMessage(err.message || "Error generating draft");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-slate-900 text-white h-full shadow-2xl flex flex-col justify-between border-l border-slate-800 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-heading font-bold text-white flex items-center gap-1.5">
                <span>Super AI Assistant</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  FIN Super
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">Automated Cover Letter & CV Drafting</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4 text-xs">
          {/* AI Unconfigured Banner */}
          {aiAvailable === false && (
            <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Super Assistant Setup Required</span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-300/90">
                {message || "Super AI isn't fully set up yet. Drop your AI_API_KEY into the environment variables to activate live AI drafting."}
              </p>
            </div>
          )}

          {/* Type Selector */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold">Draft Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDraftType("COVER_LETTER")}
                className={`py-2 px-3 rounded-lg font-semibold text-xs border transition-colors ${
                  draftType === "COVER_LETTER"
                    ? "bg-amber-500 text-slate-950 border-amber-400"
                    : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                }`}
              >
                Cover Letter
              </button>
              <button
                type="button"
                onClick={() => setDraftType("CV")}
                className={`py-2 px-3 rounded-lg font-semibold text-xs border transition-colors ${
                  draftType === "CV"
                    ? "bg-amber-500 text-slate-950 border-amber-400"
                    : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                }`}
              >
                CV Summary
              </button>
            </div>
          </div>

          {/* Prompt Context Input */}
          <form onSubmit={handleGenerate} className="space-y-3">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Context & Career Goals (Optional)
              </label>
              <textarea
                rows={4}
                value={contextInput}
                onChange={(e) => setContextInput(e.target.value)}
                placeholder="Mention specific skills, target company goals, or relevant achievements..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-xs leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Drafting Content...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate {draftType === "COVER_LETTER" ? "Cover Letter" : "CV"} Draft</span>
                </>
              )}
            </button>
          </form>

          {/* Generated Result Output */}
          {generatedDraft && (
            <div className="space-y-2 pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-amber-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Draft Ready
                </span>
                {onSelectDraft && (
                  <button
                    onClick={() => {
                      onSelectDraft(generatedDraft);
                      onClose();
                    }}
                    className="text-[11px] font-bold text-sky-400 hover:underline flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" /> Pre-fill Application
                  </button>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-mono text-[11px] leading-relaxed whitespace-pre-line max-h-60 overflow-y-auto">
                {generatedDraft}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 text-center text-[11px] text-slate-500">
          Super AI Assistant • Fortune Intern Network Phase 4
        </div>
      </div>
    </div>
  );
}
