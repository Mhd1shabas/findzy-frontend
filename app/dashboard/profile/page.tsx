"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CATEGORIES } from "@/constants/categories";
import { API_URL } from "@/lib/api";

type UserProfile = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  university?: string;
  major?: string;
  yearOfStudy?: string;
  skills?: string[];
  interests?: string[];
  bio?: string;
  businessName?: string;
  category?: string;
  city?: string;
  location?: string;
  about?: string;
  availability?: string;
  photos?: string[];
};

export default function EditProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [form, setForm] = useState<Partial<UserProfile>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [profileFile, setProfileFile] = useState<File | null>(null);


  const yearOptions = ["1st Year", "2nd Year", "3rd Year", "4th Year", "Graduate", "Other"];
  const availabilityOptions = ["Weekdays", "Weekends", "Flexible", "Part-time", "Full-time"];

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    fetchProfile();
  }, [router]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/profile/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setForm(data);
        if (data.photos && data.photos.length > 0) {
          setProfilePreview(data.photos[0]);
        }
      } else {
        setMessage({ type: "error", text: "Failed to load profile data." });
      }
    } catch (error) {
      console.error("Fetch profile error:", error);
      setMessage({ type: "error", text: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleProfileFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileFile(file);
      setProfilePreview(URL.createObjectURL(file));
    }
  };

  const uploadPhotos = async (files: File[]) => {
    if (files.length === 0) return [];
    const formData = new FormData();
    files.forEach((f) => formData.append("photos", f));

    try {
      const res = await fetch(`${API_URL}/api/providers/photos`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      return data.urls || [];
    } catch (error) {
      console.error("Upload error:", error);
      return [];
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const updatedForm = { ...form };

      if (profileFile) {
        const urls = await uploadPhotos([profileFile]);
        if (urls.length) {
          updatedForm.photos = [urls[0], ...(profile?.photos?.slice(1) || [])];
        }
      }

      const res = await fetch(`${API_URL}/api/profile/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedForm),
      });

      if (res.ok) {
        const data = await res.json();
        setProfile(data.user);
        setForm(data.user);
        setIsEditing(false);
        setMessage({ type: "success", text: "Profile updated successfully!" });
        // Scroll to top to see message
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      console.error("Save error:", error);
      setMessage({ type: "error", text: "Failed to save profile. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your profile...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="mx-auto max-w-2xl px-4 py-10">
        {message && (
          <div className={`mb-6 p-4 rounded-xl text-center font-medium ${message.type === "success" ? "bg-emerald-100 text-emerald-800 border border-emerald-200" : "bg-red-100 text-red-800 border border-red-200"
            }`}>
            {message.text}
          </div>
        )}

        <Card className="!p-0 overflow-hidden border-none shadow-xl">
          {/* Header Banner */}
          <div className="h-32 bg-gradient-to-r from-emerald-400 to-emerald-600 relative">
            <div className="absolute -bottom-16 left-8">
              <div className="h-32 w-32 rounded-2xl border-4 border-white overflow-hidden bg-white shadow-lg group relative">
                <img
                  src={profilePreview || "/default-avatar.png"}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
                {isEditing && (
                  <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <span className="text-white text-xs font-bold">Change Photo</span>
                    <input type="file" accept="image/*" onChange={handleProfileFile} className="hidden" />
                  </label>
                )}
              </div>
            </div>
            <div className="absolute bottom-4 right-8">
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-md border-white/30">
                  Edit Profile
                </Button>
              ) : (
                <Button onClick={() => { setIsEditing(false); setForm(profile || {}); }} className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-md border-white/30">
                  Cancel
                </Button>
              )}
            </div>
          </div>

          <div className="pt-20 px-8 pb-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">{profile?.name}</h1>
              <p className="text-emerald-600 font-medium">{profile?.businessName || 'Member since ' + new Date().getFullYear()}</p>
            </div>

            <form onSubmit={handleSave} className="space-y-8">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 ml-1">Full Name</label>
                    <input
                      name="name"
                      value={form.name || ""}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full rounded-xl border border-gray-100 bg-gray-50/50 px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition disabled:opacity-75 disabled:cursor-default"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 ml-1">Email Address</label>
                    <input
                      name="email"
                      value={form.email || ""}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full rounded-xl border border-gray-100 bg-gray-50/50 px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition disabled:opacity-75 disabled:cursor-default"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 ml-1">Phone Number</label>
                    <input
                      name="phone"
                      value={form.phone || ""}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full rounded-xl border border-gray-100 bg-gray-50/50 px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition disabled:opacity-75 disabled:cursor-default"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 ml-1">WhatsApp (Optional)</label>
                    <input
                      name="whatsapp"
                      value={form.whatsapp || ""}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="+1..."
                      className="w-full rounded-xl border border-gray-100 bg-gray-50/50 px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition disabled:opacity-75 disabled:cursor-default"
                    />
                  </div>
                </div>
              </div>

              {/* Identity Related */}
              <div className="space-y-4 pt-4 border-t border-gray-50">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">
                  Profile Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 ml-1">University</label>
                    <input
                      name="university"
                      value={form.university || ""}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full rounded-xl border border-gray-100 bg-gray-50/50 px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition disabled:opacity-75 disabled:cursor-default"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 ml-1">Year of Study</label>
                    <select
                      name="yearOfStudy"
                      value={form.yearOfStudy || ""}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full rounded-xl border border-gray-100 bg-gray-50/50 px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition disabled:opacity-75 disabled:cursor-default appearance-none"
                    >
                      <option value="">Select year</option>
                      {yearOptions.map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 ml-1">Business Name</label>
                    <input
                      name="businessName"
                      value={form.businessName || ""}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full rounded-xl border border-gray-100 bg-gray-50/50 px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition disabled:opacity-75 disabled:cursor-default"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 ml-1">Expertise Category</label>
                    <select
                      name="category"
                      value={form.category || ""}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full rounded-xl border border-gray-100 bg-gray-50/50 px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition disabled:opacity-75 disabled:cursor-default appearance-none"
                    >
                      <option value="">Select category</option>
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 ml-1">Location</label>
                    <input
                      name="location"
                      value={form.location || ""}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="e.g. New York, NY"
                      className="w-full rounded-xl border border-gray-100 bg-gray-50/50 px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition disabled:opacity-75 disabled:cursor-default"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 ml-1">General Availability</label>
                    <select
                      name="availability"
                      value={form.availability || ""}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full rounded-xl border border-gray-100 bg-gray-50/50 px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition disabled:opacity-75 disabled:cursor-default appearance-none"
                    >
                      <option value="">Select Availability</option>
                      {availabilityOptions.map((v) => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* About Section */}
              <div className="space-y-1">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3 pt-4 border-t border-gray-50">About Me</h3>
                <textarea
                  name="bio"
                  value={form.bio || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                  rows={4}
                  placeholder="Tell people a bit about yourself..."
                  className="w-full rounded-xl border border-gray-100 bg-gray-50/50 px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition disabled:opacity-75 disabled:cursor-default resize-none"
                />
              </div>

              {isEditing && (
                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 h-12 text-lg shadow-emerald-200"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => { setIsEditing(false); setForm(profile || {}); }}
                    disabled={saving}
                    className="h-12 px-8"
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </form>
          </div>
        </Card>
      </section>
    </main>
  );
}
