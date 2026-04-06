"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { HeroSection } from "@/components/ui/HeroSection";
import { SearchBox } from "@/components/ui/SearchBox";
import { Card } from "@/components/ui/Card";
import ServiceCard from "@/components/shared/ServiceCard";
import { Heart, MapPin, SlidersHorizontal } from "lucide-react";
import { CATEGORIES, COLLEGES } from "@/constants/categories";
import { API_URL } from "@/lib/api";

import { Service } from "@/types";

export default function ServicesPage() {
  return (
    <Suspense fallback={<div>Loading services...</div>}>
      <ServicesContent />
    </Suspense>
  );
}

function ServicesContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "";

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: initialCategory,
    minPrice: "",
    maxPrice: "",
    search: "",
    sort: "newest",
    college: "",
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const router = useRouter();

  useEffect(() => {
    if (initialCategory !== filters.category) {
      setFilters(f => ({ ...f, category: initialCategory }));
    }
  }, [initialCategory]);

  useEffect(() => {
    fetchServices();
    if (token) {
      fetchFavorites();
      fetchCurrentUser();
    }
  }, [filters, token]);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUserId(data._id);
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
    }
  };

  const fetchFavorites = async () => {
    try {
      const res = await fetch(`${API_URL}/api/favorites`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setFavoriteIds(data.map((s: { _id: string }) => s._id));
      }
    } catch (error) {
      console.error("Failed to fetch favorites:", error);
    }
  };

  const fetchServices = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.category) queryParams.append("category", filters.category);
      if (filters.minPrice) queryParams.append("minPrice", filters.minPrice);
      if (filters.maxPrice) queryParams.append("maxPrice", filters.maxPrice);
      if (filters.search) queryParams.append("search", filters.search);
      if (filters.college) queryParams.append("college", filters.college);

      if (filters.sort === "price_asc") {
        queryParams.append("sort", "price");
        queryParams.append("order", "asc");
      } else if (filters.sort === "price_desc") {
        queryParams.append("sort", "price");
        queryParams.append("order", "desc");
      } else {
        queryParams.append("sort", "createdAt");
        queryParams.append("order", "desc");
      }

      const res = await fetch(`${API_URL}/api/services?${queryParams}`);
      if (!res.ok) {
        console.error("API error:", res.status, res.statusText);
        return;
      }
      const data = await res.json();
      setServices(Array.isArray(data) ? data : (data.services || []));
    } catch (error) {
      console.error("Failed to fetch services:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <HeroSection
        title="Find Student Services"
        subtitle="Book video editing, design, tutoring, and more from fellow students"
        className="!py-16"
      />

      {/* Top Filter Bar */}
      <div className="bg-white border-b border-gray-100 shadow-sm transition-all sticky top-[64px] z-30">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex-1 w-full">
              <SearchBox
                placeholder="Search services (e.g., video editing)..."
                value={filters.search}
                onChange={(val) => handleFilterChange("search", val)}
                onSearch={fetchServices}
              />
            </div>
            <div className="w-full md:w-80">
              <div className="relative group">
                <select
                  value={filters.college}
                  onChange={(e) => handleFilterChange("college", e.target.value)}
                  className="w-full h-[58px] bg-gray-50 border border-gray-100 rounded-2xl md:rounded-full px-6 shadow-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-[15px] font-bold text-gray-700 transition-all appearance-none cursor-pointer pr-12"
                >
                  <option value="">All Colleges</option>
                  {COLLEGES.map((college) => (
                    <option key={college} value={college}>{college}</option>
                  ))}
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-emerald-600">
                  <MapPin className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="md:hidden flex items-center justify-between w-full bg-white p-4 rounded-xl shadow-[0_2px_10px_rgb(0,0,0,0.04)] border border-gray-100 font-bold text-gray-700 hover:border-emerald-200 transition-colors"
          >
            <span>Marketplace Filters</span>
            <span>{showMobileFilters ? "−" : "+"}</span>
          </button>

          {/* Filters Sidebar */}
          <aside className={`w-full md:w-64 flex-shrink-0 ${showMobileFilters ? "block" : "hidden md:block"}`}>
            <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[17px] font-black text-gray-900 tracking-tight">Filters</h3>
                <button
                  onClick={() => setFilters({ category: "", minPrice: "", maxPrice: "", search: "", sort: "newest", college: "" })}
                  className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-6">
                {/* Category Filter */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange("category", e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-[13px] font-semibold text-gray-700 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">All Categories</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* College Filter */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Select College</label>
                  <select
                    value={filters.college}
                    onChange={(e) => handleFilterChange("college", e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-[13px] font-semibold text-gray-700 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">All Colleges</option>
                    {COLLEGES.map((college) => (
                      <option key={college} value={college}>{college}</option>
                    ))}
                  </select>
                </div>

                {/* Sort By Filter */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Sort By</label>
                  <select
                    value={filters.sort}
                    onChange={(e) => handleFilterChange("sort", e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-[13px] font-semibold text-gray-700 transition-all appearance-none cursor-pointer"
                  >
                    <option value="newest">Newest Arrivals</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                  </select>
                </div>

                {/* Price Range Filter */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Price Range</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      placeholder="Min ₹"
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange("minPrice", e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-[13px] font-semibold transition-all"
                    />
                    <span className="text-gray-300 font-black">-</span>
                    <input
                      type="number"
                      placeholder="Max ₹"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-[13px] font-semibold transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Services Grid */}
          <div className="flex-1 w-full max-w-full">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-4"></div>
                    <div className="h-20 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : services.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  {filters.college ? "No providers found for this college" : (filters.category || filters.search || filters.minPrice || filters.maxPrice ? "No services found" : "No services yet")}
                </h3>
                <p className="text-gray-500 mb-6">
                  {filters.category || filters.search || filters.minPrice || filters.maxPrice
                    ? "Try different filters or clear your search."
                    : "Be the first to post a service on Findzy!"}
                </p>
                {(filters.category || filters.search || filters.minPrice || filters.maxPrice || filters.college) ? (
                  <button
                    onClick={() => {
                      setFilters({ category: "", minPrice: "", maxPrice: "", search: "", sort: "newest", college: "" });
                      if (searchParams.get("category")) {
                        router.push("/browse-services");
                      }
                    }}
                    className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors"
                  >
                    Clear Filters
                  </button>
                ) : (
                  <button
                    onClick={() => router.push("/services/create")}
                    className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors"
                  >
                    + Post a Service
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                {services.map((service) => (
                  <ServiceCard
                    key={service._id}
                    service={service}
                    isFavorited={favoriteIds.includes(service._id)}
                    onFavoriteToggle={(id, isFav) => {
                      if (isFav) {
                        setFavoriteIds(prev => [...prev, id]);
                      } else {
                        setFavoriteIds(prev => prev.filter(fid => fid !== id));
                      }
                    }}
                    currentUserId={currentUserId}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}