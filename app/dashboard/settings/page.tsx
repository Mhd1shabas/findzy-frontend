"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import { User as UserType } from "@/types";
import { API_URL } from "@/lib/api";
import {
  Settings as SettingsIcon,
  User,
  Mail,
  Lock,
  Save,
  ShieldCheck,
  Loader2,
  AlertCircle,
  CheckCircle2
} from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    fetchUserData();
  }, [token, router]);

  const fetchUserData = async () => {
    try {
      const res = await fetch(`${API_URL}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch user data");

      const data = await res.json();
      setUser(data);
      setFormData({
        name: data.name || "",
        email: data.email || "",
        password: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
      setMessage({ type: 'error', text: "Could not load user profile" });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (message) setMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password && formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: "Passwords do not match" });
      return;
    }

    setUpdating(true);
    setMessage(null);

    try {
      const payload: Partial<UserType> = {
        name: formData.name,
        email: formData.email,
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      const res = await fetch(`${API_URL}/api/users/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update settings");
      }

      setMessage({ type: 'success', text: "Settings updated successfully!" });

      // Update local storage name/email if needed or refresh
      setFormData(prev => ({ ...prev, password: "", confirmPassword: "" }));

    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error updating settings:", err);
      setMessage({ type: 'error', text: err.message || "An error occurred" });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50/50">
        <Sidebar user={user} />
        <div className="flex-1 lg:ml-64 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      <Sidebar user={user} />

      <div className="flex-1 lg:ml-64 p-4 md:p-8">
        {/* Header */}
        <header className="mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Settings
            </h1>
            <p className="text-gray-500 font-medium">Manage your account and profile preferences</p>
          </div>
        </header>

        <div className="max-w-4xl mx-auto">
          {message && (
            <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 border ${message.type === 'success'
              ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
              : 'bg-red-50 border-red-100 text-red-700'
              }`}>
              {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <p className="font-bold text-sm">{message.text}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Profile Section */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden transition-all">
              <div className="p-6 md:p-8 border-b border-gray-50 bg-gray-50/30">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-xl">
                    <User className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Profile Information</h2>
                </div>
              </div>

              <div className="p-6 md:p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Display Name</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </span>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </span>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Section */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden transition-all">
              <div className="p-6 md:p-8 border-b border-gray-50 bg-gray-50/30">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Security</h2>
                </div>
              </div>

              <div className="p-6 md:p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">New Password (Optional)</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </span>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        autoComplete="new-password"
                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Confirm New Password</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </span>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        autoComplete="new-password"
                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-400 font-medium">Leave password fields blank if you don&apos;t want to change it.</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={updating}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-emerald-200 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
              >
                {updating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save All Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
