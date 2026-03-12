"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/api";
import Navbar from "@/components/layout/Navbar";
import { CATEGORIES } from "@/constants/categories";
import { ChevronRight, ChevronLeft, UploadCloud, X, CheckCircle2 } from "lucide-react";

type ServiceData = {
  title: string;
  category: string;
  description: string;
  price: number;
  priceType: "hour" | "project" | "session";
  location: string;
  images: File[];
  imagePreviews: string[];
  availability: string[];
  requirements: string;
  tags: string[];
  portfolioLinks: string[];
};

const STEPS = [
  "Basic Info",
  "Pricing",
  "Portfolio Images",
  "Availability",
  "Extras",
];

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function CreateServiceWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [linkInput, setLinkInput] = useState("");

  const [formData, setFormData] = useState<ServiceData>({
    title: "",
    category: "",
    description: "",
    price: 0,
    priceType: "hour",
    location: "",
    images: [],
    imagePreviews: [],
    availability: [],
    requirements: "",
    tags: [],
    portfolioLinks: [],
  });

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) {
      router.push("/login");
    }
  }, [token, router]);

  const updateForm = (key: keyof ServiceData, value: string | number | string[] | File[]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const validateStep = () => {
    switch (currentStep) {
      case 1:
        return formData.title.trim() !== "" && formData.category !== "" && formData.description.trim() !== "";
      case 2:
        return formData.price > 0 && formData.location.trim() !== "";
      case 3:
        return true; // Images are optional, wait until upload limits
      case 4:
        return formData.availability.length > 0;
      case 5:
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep() && currentStep < STEPS.length) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Step 3 Actions
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const validImages = filesArray.filter(file => file.type.startsWith('image/'));

      if (formData.images.length + validImages.length > 5) {
        alert("You can only upload a maximum of 5 images.");
        return;
      }

      const newImages = [...formData.images, ...validImages];
      const newPreviews = validImages.map(file => URL.createObjectURL(file));

      setFormData(prev => ({
        ...prev,
        images: newImages,
        imagePreviews: [...prev.imagePreviews, ...newPreviews]
      }));
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...formData.images];
    const newPreviews = [...formData.imagePreviews];

    URL.revokeObjectURL(newPreviews[index]); // clean up
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);

    setFormData(prev => ({
      ...prev,
      images: newImages,
      imagePreviews: newPreviews
    }));
  };

  // Step 4 Actions
  const toggleDay = (day: string) => {
    const current = [...formData.availability];
    if (current.includes(day)) {
      updateForm("availability", current.filter(d => d !== day));
    } else {
      updateForm("availability", [...current, day]);
    }
  };

  // Step 5 Actions
  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      updateForm("tags", [...formData.tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    updateForm("tags", formData.tags.filter(t => t !== tag));
  };

  const addLink = () => {
    if (linkInput.trim() && !formData.portfolioLinks.includes(linkInput.trim())) {
      updateForm("portfolioLinks", [...formData.portfolioLinks, linkInput.trim()]);
      setLinkInput("");
    }
  };

  const removeLink = (link: string) => {
    updateForm("portfolioLinks", formData.portfolioLinks.filter(l => l !== link));
  };

  // Submit Logic
  const handleSubmit = async () => {
    if (!validateStep()) return;
    setSaving(true);

    try {

      const submitData = new FormData();
      submitData.append("title", formData.title);
      submitData.append("category", formData.category);
      submitData.append("description", formData.description);
      submitData.append("price", formData.price.toString());
      submitData.append("priceType", formData.priceType);
      submitData.append("location", formData.location);
      submitData.append("requirements", formData.requirements || "");

      // Arrays must be stringified for FormData to safely parse them on backend safely
      submitData.append("tags", JSON.stringify(formData.tags));
      submitData.append("availability", JSON.stringify(formData.availability));
      submitData.append("portfolioLinks", JSON.stringify(formData.portfolioLinks));

      formData.images.forEach(img => {
        submitData.append("serviceImages", img);
      });

      const res = await fetch(`${API_URL}/api/services`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // don't set Content-Type manually with FormData
        },
        body: submitData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create service");
      }

      alert("Service created successfully!");
      router.push(`/dashboard`);
    } catch (error: unknown) {
      const err = error as Error;
      console.error(err);
      alert(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 flex flex-col items-center justify-center">

        {/* Progress Header */}
        <div className="w-full mb-8">
          <div className="flex justify-between items-center relative z-10 w-full mb-2">
            {STEPS.map((stepName, i) => (
              <div key={i} className="flex flex-col items-center relative z-20">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 ${currentStep > i + 1 ? "bg-emerald-600 text-white" :
                  currentStep === i + 1 ? "bg-emerald-600 text-white ring-4 ring-emerald-100" :
                    "bg-white text-gray-400 border border-gray-200"
                  }`}>
                  {currentStep > i + 1 ? <CheckCircle2 className="w-5 h-5 text-white" /> : i + 1}
                </div>
                <span className={`text-xs mt-2 font-medium hidden sm:block ${currentStep === i + 1 ? 'text-gray-900' : 'text-gray-500'}`}>
                  {stepName}
                </span>
              </div>
            ))}
            <div className="absolute top-4 left-0 w-full h-[2px] bg-gray-200 -z-10">
              <div
                className="h-full bg-emerald-600 transition-all duration-300"
                style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Wizard Card */}
        <div className="w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8 sm:p-10 min-h-[400px] flex flex-col justify-between transition-all duration-500">

          <div className="flex-1">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Basic Information</h2>
                  <p className="text-gray-500">Let&apos;s start with a strong title and description.</p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Service Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => updateForm("title", e.target.value)}
                    placeholder="I will edit standard Youtube videos..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => updateForm("category", e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  >
                    <option value="">Select Category</option>
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => updateForm("description", e.target.value)}
                    placeholder="Detail exactly what you will be offering to buyers..."
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Pricing */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Scope & Pricing</h2>
                  <p className="text-gray-500">Set your base rates.</p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Price (INR)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-gray-500 font-bold">₹</span>
                    <input
                      type="number"
                      min="0"
                      value={formData.price || ""}
                      onChange={(e) => updateForm("price", parseFloat(e.target.value) || 0)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Price Format</label>
                  <select
                    value={formData.priceType}
                    onChange={(e) => updateForm("priceType", e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  >
                    <option value="hour">Per Hour</option>
                    <option value="project">Per Project</option>
                    <option value="session">Per Session</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => updateForm("location", e.target.value)}
                    placeholder="e.g. Remote, Library, Main Campus"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Portfolio Images */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Showcase Your Work</h2>
                  <p className="text-gray-500">Upload up to 5 images to build trust with buyers.</p>
                </div>

                <div className="border-2 border-dashed border-gray-300 bg-gray-50 rounded-2xl p-8 text-center hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-600 transition-colors group cursor-pointer relative">
                  <input
                    type="file"
                    accept="image/jpeg, image/png, image/jpg"
                    multiple
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <UploadCloud className="w-12 h-12 mx-auto mb-4 text-gray-400 group-hover:text-emerald-500 transition-colors" />
                  <p className="text-sm font-bold text-gray-700 group-hover:text-emerald-700">Drag & drop or click to upload</p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB (Max 5)</p>
                </div>

                {formData.imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
                    {formData.imagePreviews.map((src, i) => (
                      <div key={i} className="relative group rounded-xl overflow-hidden border border-gray-200 shadow-sm aspect-video">
                        <img src={src} className="w-full h-full object-cover" alt="Preview" />
                        <button
                          onClick={() => removeImage(i)}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Availability */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Availability</h2>
                  <p className="text-gray-500">When are you available to work?</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {DAYS_OF_WEEK.map(day => {
                    const isSelected = formData.availability.includes(day);
                    return (
                      <button
                        key={day}
                        onClick={() => toggleDay(day)}
                        className={`p-4 rounded-xl border flex items-center justify-between transition-all font-bold ${isSelected
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm"
                          : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                          }`}
                      >
                        {day}
                        {isSelected && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 5: Extras */}
            {currentStep === 5 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Final Touches</h2>
                  <p className="text-gray-500">Add requirements from buyers and tags for searchability.</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Requirements (Optional)</label>
                  <textarea
                    value={formData.requirements}
                    onChange={(e) => updateForm("requirements", e.target.value)}
                    placeholder="Tell buyers what you need from them to start..."
                    rows={2}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Tags</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addTag()}
                      placeholder="e.g. beginner-friendly"
                      className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    />
                    <button onClick={addTag} className="px-5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-bold">Add</button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium flex items-center gap-1">
                        {tag} <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => removeTag(tag)} />
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Portfolio Links</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={linkInput}
                      onChange={(e) => setLinkInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addLink()}
                      placeholder="https://..."
                      className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    />
                    <button onClick={addLink} className="px-5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-bold">Add</button>
                  </div>
                  <div className="flex flex-col gap-2 mt-3">
                    {formData.portfolioLinks.map(link => (
                      <div key={link} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-lg">
                        <span className="text-sm text-emerald-600 truncate mr-2">{link}</span>
                        <X className="w-4 h-4 cursor-pointer text-gray-400 hover:text-red-500" onClick={() => removeLink(link)} />
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="flex justify-between items-center mt-10 pt-6 border-t border-gray-100">
            <button
              onClick={handleBack}
              disabled={currentStep === 1 || saving}
              className={`px-6 py-2.5 rounded-full font-bold transition-all ${currentStep > 1
                ? "text-gray-700 hover:bg-gray-100"
                : "text-gray-300 cursor-not-allowed opacity-50"
                }`}
            >
              Back
            </button>

            {currentStep < STEPS.length ? (
              <button
                onClick={handleNext}
                disabled={!validateStep()}
                className={`flex items-center gap-2 px-8 py-2.5 rounded-full font-bold transition-all shadow-sm transform ${validateStep()
                  ? "bg-emerald-600 text-white hover:bg-emerald-700 hover:-translate-y-0.5 hover:shadow-md"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!validateStep() || saving}
                className="flex items-center justify-center gap-2 px-8 py-2.5 bg-gray-900 text-white rounded-full font-bold hover:bg-black transition-all shadow-md transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Publishing..." : "Publish Service"}
              </button>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}