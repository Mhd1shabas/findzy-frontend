"use client";

import { useState, useEffect } from "react";
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
  // student fields
  university?: string;
  major?: string;
  yearOfStudy?: string;
  skills?: string[];
  interests?: string[];
  bio?: string;
  // provider fields
  businessName?: string;
  category?: string;
  city?: string;
  location?: string;
  about?: string;
  availability?: string; // string or array based on model, but setup page uses it as something else?
  // User model has availability: String (Weekdays/Weekends etc) but setup page used it as array of days.
  // I will stick to what the form actually uses and ensure it maps to the backend.
};

export default function ProfileSetupPage() {
  const [profile, setProfile] = useState<UserProfile>({
    _id: "",
    name: "",
    email: "",
    skills: [],
    interests: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [skillInput, setSkillInput] = useState("");

  const router = useRouter();
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_URL}/api/profile/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setProfile({
          ...data,
          skills: data.skills || [],
          interests: data.interests || [],
        });
      } else {
        console.error("Failed to fetch profile: Profile might not exist yet.");
        // Try fetching basic user info from /me if profile fails
        const userRes = await fetch(`${API_URL}/api/profile/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`${API_URL}/api/profile/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profile),
      });

      if (!res.ok) throw new Error("Failed to save profile");

      alert("Profile saved successfully!");
      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to save profile:", error);
      alert("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !profile.skills?.includes(skillInput.trim())) {
      setProfile({
        ...profile,
        skills: [...(profile.skills || []), skillInput.trim()],
      });
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setProfile({
      ...profile,
      skills: profile.skills?.filter(s => s !== skill) || [],
    });
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <Card className="!p-6">
              <div className="h-8 bg-gray-200 rounded mb-6"></div>
              <div className="space-y-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-10 bg-gray-200 rounded"></div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card className="!p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
            <p className="text-gray-600">
              Welcome back, <span className="text-primary font-bold">{profile.name}</span>!
              Update your profile details to start buying and selling on Findzy.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={profile.name || ""}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={profile.phone || ""}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary transition-colors"
                />
              </div>
            </div>

            {/* University Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  University
                </label>
                <input
                  type="text"
                  value={profile.university || ""}
                  onChange={(e) => setProfile({ ...profile, university: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Major
                </label>
                <input
                  type="text"
                  value={profile.major || ""}
                  onChange={(e) => setProfile({ ...profile, major: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year of Study
                </label>
                <select
                  value={profile.yearOfStudy || ""}
                  onChange={(e) => setProfile({ ...profile, yearOfStudy: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary transition-colors"
                >
                  <option value="">Select Year</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="Graduate">Graduate</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Business Details */}
            <div className="space-y-6 pt-4 border-t border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Business Details</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    value={profile.businessName || ""}
                    onChange={(e) => setProfile({ ...profile, businessName: e.target.value })}
                    placeholder="e.g., John's Design Studio"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Industry Category
                  </label>
                  <select
                    value={profile.category || ""}
                    onChange={(e) => setProfile({ ...profile, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary transition-colors"
                  >
                    <option value="">Select Category</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  About Your Service
                </label>
                <textarea
                  value={profile.about || ""}
                  onChange={(e) => setProfile({ ...profile, about: e.target.value })}
                  placeholder="Describe what you offer in detail..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  General Availability
                </label>
                <select
                  value={profile.availability || ""}
                  onChange={(e) => setProfile({ ...profile, availability: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary transition-colors"
                >
                  <option value="Flexible">Flexible</option>
                  <option value="Weekdays">Weekdays</option>
                  <option value="Weekends">Weekends</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Full-time">Full-time</option>
                </select>
              </div>
            </div>

            {/* Common Profile Fields */}
            <div className="space-y-6 pt-4 border-t border-gray-100">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={profile.location || ""}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  placeholder="e.g., Campus Area, Downtown, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Professional Bio
                </label>
                <textarea
                  value={profile.bio || ""}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="Tell us about yourself and your expertise..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary transition-colors"
                />
              </div>

              {/* Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skills & Expertise
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                    placeholder="Add a skill (e.g. Photoshop, Calculus)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary transition-colors"
                  />
                  <Button type="button" onClick={addSkill} className="px-6">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.skills?.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-light text-primary-dark font-medium border border-primary-light/50"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-2 text-primary-dark hover:text-red-500 transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <Button type="submit" disabled={saving} className="w-full">
                {saving ? "Saving Changes..." : "Save Profile"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </main>
  );
}
