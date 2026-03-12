"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import { ArrowLeft, Save, Info, Tag, MapPin, IndianRupee, Clock } from "lucide-react";
import { API_URL } from "@/lib/api";
import Link from "next/link";
import { CATEGORIES } from "@/constants/categories";


export default function EditServicePage() {
  const { id } = useParams();
  const router = useRouter();
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const [service, setService] = useState({
    title: "",
    description: "",
    category: "",
    price: 0,
    priceType: "hour",
    location: "Online",
    level: "All Levels",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    fetchService();
  }, [id, token]);

  const fetchService = async () => {
    try {
      const res = await fetch(`${API_URL}/api/services/${id}`);
      if (!res.ok) throw new Error("Failed to fetch service");
      const data = await res.json();
      setService({
        title: data.title,
        description: data.description,
        category: data.category,
        price: data.price,
        priceType: data.priceType,
        location: data.location,
        level: data.level || "All Levels",
      });
    } catch (error) {
      console.error("Error fetching service:", error);
      alert("Failed to load service details");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`${API_URL}/api/services/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(service),
      });

      if (res.ok) {
        alert("Service updated successfully!");
        router.push("/dashboard/services");
      } else {
        const data = await res.json();
        alert(data.message || "Failed to update service");
      }
    } catch (error) {
      console.error("Error updating service:", error);
      alert("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      <Sidebar user={null} />

      <div className="flex-1 lg:ml-64 p-4 md:p-8">
        <header className="mb-10">
          <Link
            href="/dashboard/services"
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-4 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Services
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Edit Service
          </h1>
        </header>

        <div className="max-w-4xl bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Title & Description */}
            <section className="space-y-6">
              <div className="flex items-center gap-2 text-emerald-600 font-bold mb-2">
                <Info className="w-5 h-5" />
                Basic Information
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Service Title</label>
                  <input
                    type="text"
                    required
                    value={service.title}
                    onChange={(e) => setService({ ...service, title: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    placeholder="e.g., Professional Portrait Photography"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Detailed Description</label>
                  <textarea
                    required
                    rows={6}
                    value={service.description}
                    onChange={(e) => setService({ ...service, description: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none"
                    placeholder="Tell your clients exactly what you offer..."
                  />
                </div>
              </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Category & Location */}
              <section className="space-y-6">
                <div className="flex items-center gap-2 text-emerald-600 font-bold mb-2">
                  <Tag className="w-5 h-5" />
                  Classification
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                  <select
                    value={service.category}
                    onChange={(e) => setService({ ...service, category: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all appearance-none cursor-pointer"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Location Type</label>
                  <select
                    value={service.location}
                    onChange={(e) => setService({ ...service, location: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="Online">Online</option>
                    <option value="In-person">In-person</option>
                    <option value="Both">Both</option>
                  </select>
                </div>
              </section>

              {/* Pricing */}
              <section className="space-y-6">
                <div className="flex items-center gap-2 text-emerald-600 font-bold mb-2">
                  <IndianRupee className="w-5 h-5" />
                  Pricing & Level
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Price (₹)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={service.price}
                      onChange={(e) => setService({ ...service, price: Number(e.target.value) })}
                      className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Per Unit</label>
                    <select
                      value={service.priceType}
                      onChange={(e) => setService({ ...service, priceType: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all appearance-none cursor-pointer"
                    >
                      <option value="hour">Hour</option>
                      <option value="project">Project</option>
                      <option value="session">Session</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Experience Level</label>
                  <select
                    value={service.level}
                    onChange={(e) => setService({ ...service, level: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="All Levels">All Levels</option>
                  </select>
                </div>
              </section>
            </div>

            <div className="pt-6 border-t border-gray-50 flex gap-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                {saving ? "Saving Changes..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/dashboard/services")}
                className="px-8 py-4 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-2xl font-bold transition-all active:scale-[0.98]"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
