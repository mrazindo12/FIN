"use client";

import { useEffect, useState } from "react";
import { 
  GraduationCap, 
  Plus, 
  Edit, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Building2, 
  MapPin, 
  Calendar,
  X
} from "lucide-react";

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
  createdAt: string;
  company?: {
    id: string;
    name: string;
  } | null;
}

interface CompanyOption {
  id: string;
  name: string;
}

export default function AdminProgramsPage() {
  const [programs, setPrograms] = useState<ProgramItem[]>([]);
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<ProgramItem | null>(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formCompanyId, setFormCompanyId] = useState("");
  const [formCompanyName, setFormCompanyName] = useState("");
  const [formDeadline, setFormDeadline] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [progRes, compRes] = await Promise.all([
        fetch("/api/admin/programs"),
        fetch("/api/admin/companies"),
      ]);

      if (!progRes.ok || !compRes.ok) {
        throw new Error("Failed to load programs data");
      }

      const progData = await progRes.json();
      const compData = await compRes.json();

      setPrograms(progData.programs || []);
      setCompanies(compData.companies || []);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingProgram(null);
    setFormTitle("");
    setFormDescription("");
    setFormLocation("");
    setFormCategory("Software Engineering");
    setFormCompanyId(companies[0]?.id || "");
    setFormCompanyName(companies[0]?.name || "");
    setFormDeadline("");
    setFormIsActive(true);
    setModalOpen(true);
  };

  const openEditModal = (prog: ProgramItem) => {
    setEditingProgram(prog);
    setFormTitle(prog.title);
    setFormDescription(prog.description);
    setFormLocation(prog.location);
    setFormCategory(prog.category);
    setFormCompanyId(prog.companyId || "");
    setFormCompanyName(prog.companyNameSnapshot);
    setFormDeadline(
      prog.applicationDeadline ? new Date(prog.applicationDeadline).toISOString().slice(0, 10) : ""
    );
    setFormIsActive(prog.isActive);
    setModalOpen(true);
  };

  const handleCompanySelect = (comp: CompanyOption) => {
    setFormCompanyId(comp.id);
    setFormCompanyName(comp.name);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: formTitle,
        description: formDescription,
        location: formLocation,
        category: formCategory,
        companyId: formCompanyId || null,
        companyNameSnapshot: formCompanyName,
        applicationDeadline: formDeadline ? formDeadline : null,
        isActive: formIsActive,
      };

      const url = editingProgram
        ? `/api/admin/programs/${editingProgram.id}`
        : "/api/admin/programs";

      const method = editingProgram ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to save program");
      }

      setModalOpen(false);
      await fetchData();
    } catch (err: any) {
      alert(err.message || "Error saving program");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (prog: ProgramItem) => {
    try {
      const res = await fetch(`/api/admin/programs/${prog.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !prog.isActive }),
      });

      if (!res.ok) {
        throw new Error("Failed to update status");
      }

      await fetchData();
    } catch (err: any) {
      alert(err.message || "Error toggling status");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-amber-400" />
            <span>Internship Programs Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Create, edit, and toggle active status of student internship programs.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-xs font-bold text-slate-950 transition-colors self-start sm:self-auto shadow-lg shadow-amber-500/10"
        >
          <Plus className="w-4 h-4" />
          Create Program
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400 gap-3">
          <RefreshCw className="w-5 h-5 animate-spin text-amber-400" />
          <span>Loading programs...</span>
        </div>
      ) : error ? (
        <div className="p-4 rounded-lg bg-red-950/40 border border-red-800/50 text-red-300 text-xs">
          {error}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Program Title & Details</th>
                <th className="py-3 px-4">Host Organization</th>
                <th className="py-3 px-4">Category & Location</th>
                <th className="py-3 px-4">Deadline</th>
                <th className="py-3 px-4">Active Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {programs.map((prog) => (
                <tr key={prog.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 space-y-1">
                    <div className="font-bold text-white text-sm">{prog.title}</div>
                    <div className="text-slate-400 text-[11px] line-clamp-2">{prog.description}</div>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-200">
                    {prog.companyNameSnapshot}
                  </td>
                  <td className="py-3.5 px-4 space-y-1">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-medium border border-slate-700">
                      {prog.category}
                    </span>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-500" /> {prog.location}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 text-[11px]">
                    {prog.applicationDeadline
                      ? new Date(prog.applicationDeadline).toLocaleDateString()
                      : "Rolling Basis"}
                  </td>
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => handleToggleActive(prog)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                        prog.isActive
                          ? "bg-emerald-950 text-emerald-400 border-emerald-800 hover:bg-emerald-900"
                          : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
                      }`}
                    >
                      {prog.isActive ? (
                        <>
                          <CheckCircle className="w-3 h-3" /> Active
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3" /> Inactive
                        </>
                      )}
                    </button>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => openEditModal(prog)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium border border-slate-700 inline-flex items-center gap-1"
                    >
                      <Edit className="w-3 h-3 text-amber-400" /> Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Form */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">
                {editingProgram ? "Edit Program" : "Create New Program"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Program Title *</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  placeholder="e.g. Software Engineering Fellowship 2026"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description *</label>
                <textarea
                  required
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  placeholder="Describe program goals, requirements, and responsibilities..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category *</label>
                  <input
                    type="text"
                    required
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                    placeholder="e.g. Banking & Finance"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Location *</label>
                  <input
                    type="text"
                    required
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                    placeholder="e.g. Accra / Hybrid"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Host Company Snapshot *</label>
                <select
                  value={formCompanyId}
                  onChange={(e) => {
                    const selectedComp = companies.find((c) => c.id === e.target.value);
                    if (selectedComp) handleCompanySelect(selectedComp);
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 mb-1"
                >
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  required
                  value={formCompanyName}
                  onChange={(e) => setFormCompanyName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  placeholder="Custom company name snapshot"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Application Deadline</label>
                  <input
                    type="date"
                    value={formDeadline}
                    onChange={(e) => setFormDeadline(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-slate-950 border-slate-700"
                  />
                  <label htmlFor="isActive" className="text-slate-300 font-semibold cursor-pointer">
                    Program Active (Visible to students)
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-xs font-bold text-slate-950 disabled:opacity-50"
                >
                  {saving ? "Saving..." : editingProgram ? "Update Program" : "Create Program"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
