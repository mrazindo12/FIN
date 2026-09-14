"use client";

import { useEffect, useState } from "react";
import { 
  Megaphone, 
  Plus, 
  Edit, 
  Pin, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  User, 
  Calendar, 
  X 
} from "lucide-react";

interface AnnouncementItem {
  id: string;
  title: string;
  body: string;
  pinned: boolean;
  isPublished: boolean;
  publishedAt: string;
  createdAt: string;
  author?: {
    fullName: string;
    email: string;
  } | null;
}

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<AnnouncementItem | null>(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formTitle, setFormTitle] = useState("");
  const [formBody, setFormBody] = useState("");
  const [formPinned, setFormPinned] = useState(false);
  const [formIsPublished, setFormIsPublished] = useState(true);

  const fetchAnnouncements = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/announcements");
      if (!res.ok) {
        throw new Error("Failed to load announcements");
      }
      const data = await res.json();
      setAnnouncements(data.announcements || []);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const openCreateModal = () => {
    setEditingAnnouncement(null);
    setFormTitle("");
    setFormBody("");
    setFormPinned(false);
    setFormIsPublished(true);
    setModalOpen(true);
  };

  const openEditModal = (ann: AnnouncementItem) => {
    setEditingAnnouncement(ann);
    setFormTitle(ann.title);
    setFormBody(ann.body);
    setFormPinned(ann.pinned);
    setFormIsPublished(ann.isPublished);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: formTitle,
        body: formBody,
        pinned: formPinned,
        isPublished: formIsPublished,
      };

      const url = editingAnnouncement
        ? `/api/admin/announcements/${editingAnnouncement.id}`
        : "/api/admin/announcements";

      const method = editingAnnouncement ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to save announcement");
      }

      setModalOpen(false);
      await fetchAnnouncements();
    } catch (err: any) {
      alert(err.message || "Error saving announcement");
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePin = async (ann: AnnouncementItem) => {
    try {
      const res = await fetch(`/api/admin/announcements/${ann.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pinned: !ann.pinned }),
      });

      if (!res.ok) throw new Error("Failed to toggle pin status");
      await fetchAnnouncements();
    } catch (err: any) {
      alert(err.message || "Error toggling pin");
    }
  };

  const handleTogglePublish = async (ann: AnnouncementItem) => {
    try {
      const res = await fetch(`/api/admin/announcements/${ann.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !ann.isPublished }),
      });

      if (!res.ok) throw new Error("Failed to toggle publish status");
      await fetchAnnouncements();
    } catch (err: any) {
      alert(err.message || "Error toggling publish status");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-amber-400" />
            <span>Announcements Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Publish, pin, and manage broadcast messages for the student portal feed.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-xs font-bold text-slate-950 transition-colors self-start sm:self-auto shadow-lg shadow-amber-500/10"
        >
          <Plus className="w-4 h-4" />
          Create Announcement
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400 gap-3">
          <RefreshCw className="w-5 h-5 animate-spin text-amber-400" />
          <span>Loading announcements...</span>
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
                <th className="py-3 px-4">Title & Message Body</th>
                <th className="py-3 px-4">Pin Priority</th>
                <th className="py-3 px-4">Publish Status</th>
                <th className="py-3 px-4">Author & Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {announcements.map((ann) => (
                <tr key={ann.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 space-y-1">
                    <div className="font-bold text-white text-sm flex items-center gap-1.5">
                      {ann.pinned && <Pin className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />}
                      <span>{ann.title}</span>
                    </div>
                    <div className="text-slate-400 text-[11px] line-clamp-2">{ann.body}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => handleTogglePin(ann)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold border transition-colors ${
                        ann.pinned
                          ? "bg-amber-950 text-amber-400 border-amber-800 hover:bg-amber-900"
                          : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
                      }`}
                    >
                      <Pin className="w-3 h-3" /> {ann.pinned ? "Pinned Top" : "Standard"}
                    </button>
                  </td>

                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => handleTogglePublish(ann)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold border transition-colors ${
                        ann.isPublished
                          ? "bg-emerald-950 text-emerald-400 border-emerald-800 hover:bg-emerald-900"
                          : "bg-rose-950 text-rose-400 border-rose-800 hover:bg-rose-900"
                      }`}
                    >
                      {ann.isPublished ? (
                        <>
                          <Eye className="w-3 h-3" /> Published
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3" /> Draft / Hidden
                        </>
                      )}
                    </button>
                  </td>

                  <td className="py-3.5 px-4 space-y-0.5 text-[11px]">
                    <div className="text-slate-200 font-medium">{ann.author?.fullName || "Staff"}</div>
                    <div className="text-slate-400">{new Date(ann.publishedAt).toLocaleDateString()}</div>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => openEditModal(ann)}
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
                {editingAnnouncement ? "Edit Announcement" : "Create New Announcement"}
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
                <label className="block text-slate-300 font-semibold mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  placeholder="e.g. 📌 2026 Cohort Applications Open"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Message Body *</label>
                <textarea
                  required
                  rows={4}
                  value={formBody}
                  onChange={(e) => setFormBody(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  placeholder="Announcement message content..."
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="pinned"
                    checked={formPinned}
                    onChange={(e) => setFormPinned(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-slate-950 border-slate-700"
                  />
                  <label htmlFor="pinned" className="text-slate-300 font-semibold cursor-pointer">
                    Pin to Top of Student Feed
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPublished"
                    checked={formIsPublished}
                    onChange={(e) => setFormIsPublished(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-slate-950 border-slate-700"
                  />
                  <label htmlFor="isPublished" className="text-slate-300 font-semibold cursor-pointer">
                    Publish Immediately
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
                  {saving ? "Saving..." : editingAnnouncement ? "Update Announcement" : "Create Announcement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
