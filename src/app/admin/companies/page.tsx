"use client";

import { useEffect, useState } from "react";
import { 
  Building2, 
  Plus, 
  Edit, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  MapPin, 
  FileText, 
  X 
} from "lucide-react";

interface CompanyItem {
  id: string;
  name: string;
  address: string | null;
  isCustom: boolean;
  isActive: boolean;
  createdAt: string;
  _count?: {
    applications: number;
    programs: number;
  };
}

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<CompanyItem | null>(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formName, setFormName] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);

  const fetchCompanies = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/companies");
      if (!res.ok) {
        throw new Error("Failed to load companies");
      }
      const data = await res.json();
      setCompanies(data.companies || []);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const openCreateModal = () => {
    setEditingCompany(null);
    setFormName("");
    setFormAddress("");
    setFormIsActive(true);
    setModalOpen(true);
  };

  const openEditModal = (comp: CompanyItem) => {
    setEditingCompany(comp);
    setFormName(comp.name);
    setFormAddress(comp.address || "");
    setFormIsActive(comp.isActive);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: formName,
        address: formAddress || null,
        isActive: formIsActive,
      };

      const url = editingCompany
        ? `/api/admin/companies/${editingCompany.id}`
        : "/api/admin/companies";

      const method = editingCompany ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to save company");
      }

      setModalOpen(false);
      await fetchCompanies();
    } catch (err: any) {
      alert(err.message || "Error saving company");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (comp: CompanyItem) => {
    try {
      const res = await fetch(`/api/admin/companies/${comp.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !comp.isActive }),
      });

      if (!res.ok) throw new Error("Failed to toggle company status");
      await fetchCompanies();
    } catch (err: any) {
      alert(err.message || "Error toggling active status");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-400" />
            <span>Partner Host Companies Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage partner organizations appearing in the applicant dropdown roster.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-xs font-bold text-slate-950 transition-colors self-start sm:self-auto shadow-lg shadow-amber-500/10"
        >
          <Plus className="w-4 h-4" />
          Add Host Company
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400 gap-3">
          <RefreshCw className="w-5 h-5 animate-spin text-amber-400" />
          <span>Loading companies...</span>
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
                <th className="py-3 px-4">Company Name & Head Office Address</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Active Applications / Programs</th>
                <th className="py-3 px-4">Roster Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {companies.map((comp) => (
                <tr key={comp.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 space-y-1">
                    <div className="font-bold text-white text-sm">{comp.name}</div>
                    {comp.address && (
                      <div className="text-slate-400 text-[11px] flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-500 shrink-0" /> {comp.address}
                      </div>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                      comp.isCustom
                        ? "bg-purple-950 text-purple-400 border-purple-800"
                        : "bg-slate-800 text-slate-300 border-slate-700"
                    }`}>
                      {comp.isCustom ? "Student Custom" : "Verified Partner"}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 space-y-0.5 text-[11px] text-slate-300">
                    <div>{comp._count?.applications || 0} applications submitted</div>
                    <div className="text-slate-400">{comp._count?.programs || 0} active programs</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => handleToggleActive(comp)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                        comp.isActive
                          ? "bg-emerald-950 text-emerald-400 border-emerald-800 hover:bg-emerald-900"
                          : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
                      }`}
                    >
                      {comp.isActive ? (
                        <>
                          <CheckCircle className="w-3 h-3" /> Active Dropdown
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3" /> Deactivated (Hidden)
                        </>
                      )}
                    </button>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => openEditModal(comp)}
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
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">
                {editingCompany ? "Edit Host Company" : "Add Host Company"}
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
                <label className="block text-slate-300 font-semibold mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  placeholder="e.g. Standard Chartered Bank Ghana"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Head Office Address</label>
                <textarea
                  rows={2}
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  placeholder="e.g. High Street, Accra, Ghana"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="compIsActive"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-slate-950 border-slate-700"
                />
                <label htmlFor="compIsActive" className="text-slate-300 font-semibold cursor-pointer">
                  Active (Show in applicant dropdown)
                </label>
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
                  {saving ? "Saving..." : editingCompany ? "Update Company" : "Add Company"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
