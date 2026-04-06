"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import ServiceCard from "@/components/shared/ServiceCard";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CATEGORIES, COLLEGES } from "@/constants/categories";

import { LucideIcon, Palette, Video, Camera, PenTool, Code, BookOpen, Compass } from "lucide-react";
import { Service } from "@/types";
import { API_URL } from "@/lib/api";

const CATEGORY_DETAILS: Record<string, { icon: LucideIcon, desc: string }> = {
  "Design & Creative": { icon: Palette, desc: "Logos, banners & more" },
  "Video Editing": { icon: Video, desc: "Professional video editing" },
  "Photography": { icon: Camera, desc: "Capture your best moments" },
  "Writing & Content": { icon: PenTool, desc: "Essays, blogs & translation" },
  "Programming & Tech": { icon: Code, desc: "Coding and bug fixing" },
  "Tutoring": { icon: BookOpen, desc: "Academic help and lessons" }
};

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [recentServices, setRecentServices] = useState<Service[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [selectedCollege, setSelectedCollege] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const featuredCategories = CATEGORIES.slice(0, 6);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() || selectedCollege) {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append("search", searchQuery.trim());
      if (selectedCollege) params.append("college", selectedCollege);
      router.push(`/browse-services?${params.toString()}`);
    }
  };

  useEffect(() => {
    const fetchRecentServices = async () => {
      try {
        console.log("🌐 Fetching services from:", `${API_URL}/api/services`);
        const [recentRes, allRes] = await Promise.all([
          fetch(`${API_URL}/api/services?limit=10`),
          fetch(`${API_URL}/api/services?limit=1000`)
        ]);

        console.log("📡 Responded:", recentRes.status, allRes.status);

        if (recentRes.ok) {
          const data = await recentRes.json();
          console.log("✅ Recent Services Data:", data.services?.length || 0, "items");
          setRecentServices(data.services || []);
        } else {
          console.error("❌ Recent services fetch failed:", recentRes.statusText);
        }

        if (allRes.ok) {
          const allData = await allRes.json();
          console.log("✅ All Services Data:", allData.services?.length || 0, "items");
          const counts: Record<string, number> = {};
          allData.services?.forEach((s: Service) => {
            counts[s.category] = (counts[s.category] || 0) + 1;
          });
          setCategoryCounts(counts);
        }

      } catch (error) {
        console.error("💥 Critical Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentServices();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 text-gray-900">
      <Navbar />

      {/* HERO */}
      <section className="bg-gradient-to-br from-primary-light/40 to-primary-light border-b border-gray-100 px-4 py-12 sm:py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-4 text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight">
            Discover Student Services on Your Campus
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg text-gray-600 leading-relaxed">
            Browse and book services offered by fellow students — photography, design, tutoring, and more.
          </p>

          <form
            onSubmit={handleSearch}
            className="mx-auto flex max-w-2xl gap-3 rounded-2xl bg-white p-4 shadow-lg border border-gray-200"
          >
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for a service (e.g. video editing, tutor)..."
              className="flex-1 rounded-lg border-0 px-6 py-4 text-lg focus:ring-2 focus:ring-primary focus:outline-none"
            />
            <select
              value={selectedCollege}
              onChange={(e) => setSelectedCollege(e.target.value)}
              className="hidden sm:block border-l border-gray-200 px-4 py-4 text-gray-600 focus:outline-none bg-transparent font-semibold"
            >
              <option value="">All Colleges</option>
              {COLLEGES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-xl bg-primary px-8 py-4 text-white font-semibold hover:bg-primary-dark transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Search
            </button>
          </form>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/services/create" className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 transition-colors shadow-sm">
              + Post a Service
            </Link>
            <Link href="/browse-services" className="rounded-full bg-white px-5 py-2.5 text-sm font-bold text-gray-700 hover:text-primary transition-colors border border-gray-200 shadow-sm">
              Browse All Services →
            </Link>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="px-4 py-12 md:py-20 bg-slate-50 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 pointer-events-none transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 pointer-events-none transform -translate-x-1/2 translate-y-1/2"></div>

        <div className="mx-auto max-w-7xl relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 gap-4">
            <div>
              <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2 md:mb-3">
                Browse by Category
              </h3>
              <p className="text-gray-600 text-base md:text-lg max-w-2xl">Find the perfect student service for your needs, organized by expert categories.</p>
            </div>
            <Link
              href="/browse-services"
              className="hidden md:flex items-center gap-2 text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors bg-white border border-emerald-100 shadow-sm hover:shadow-md px-6 py-3 rounded-full group"
            >
              View all categories
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-6">
            {featuredCategories.map((cat) => {
              const details = CATEGORY_DETAILS[cat] || { icon: Compass, desc: "Explore unique services" };
              const Icon = details.icon;
              const count = categoryCounts[cat] || 0;

              return (
                <Link
                  key={cat}
                  href={`/browse-services?category=${encodeURIComponent(cat)}`}
                  className="group relative flex flex-col p-6 rounded-2xl bg-white border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 hover:border-emerald-200 overflow-hidden text-center"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-50 to-transparent rounded-bl-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                  <div className="relative z-10 w-full mb-1 flex flex-col items-center">
                    <Icon className="w-8 h-8 text-emerald-600 mb-3 mx-auto hover:scale-105 transition-transform" />
                  </div>

                  <div className="relative z-10 flex-1 flex flex-col items-center">
                    <h4 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-emerald-700 transition-colors line-clamp-1">{cat}</h4>
                    <p className="text-sm text-gray-500 mb-5 line-clamp-2 leading-relaxed flex-1">{details.desc}</p>
                    <div className="inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-50 text-xs font-bold text-slate-600 group-hover:bg-emerald-50 border border-slate-100 group-hover:border-emerald-100 group-hover:text-emerald-700 transition-colors w-fit">
                      {count} {count === 1 ? 'Service' : 'Services'}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="mt-10 md:hidden text-center">
            <Link
              href="/browse-services"
              className="inline-flex items-center justify-center gap-2 text-sm font-bold text-emerald-600 border border-emerald-100 bg-white hover:bg-emerald-50 px-8 py-3.5 rounded-full transition-colors w-full sm:w-auto shadow-sm group"
            >
              View all categories
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* RECENT SERVICES */}
      <section className="px-4 py-12 md:py-16 bg-slate-50">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 md:mb-12 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                Recently Posted Services
              </h3>
              <p className="text-gray-600 text-sm md:text-base">
                Fresh listings from students in your campus
              </p>
            </div>

            <Link
              href="/browse-services"
              className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors flex items-center gap-2"
            >
              View all services →
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="rounded-2xl bg-white shadow-sm border border-gray-100">
                  <div className="h-48 rounded-t-2xl bg-gray-200 animate-pulse" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse" />
                    <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentServices.length > 0 ? (
            <div className="relative overflow-hidden py-4">
              <div
                className="flex animate-scroll hover:[animation-play-state:paused] w-max px-4"
              >
                {/* First set of cards */}
                {recentServices.map((service) => (
                  <div key={`${service._id}-orig`} className="w-[300px] sm:w-[350px] flex-shrink-0 pr-8">
                    <ServiceCard service={service} />
                  </div>
                ))}
                {/* Duplicated set for seamless looping */}
                {recentServices.map((service) => (
                  <div key={`${service._id}-dup`} className="w-[300px] sm:w-[350px] flex-shrink-0 pr-8">
                    <ServiceCard service={service} />
                  </div>
                ))}
              </div>

              {/* Fade masks for elegant scrolling edges */}
              <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-slate-50 via-slate-50/50 to-transparent z-10 pointer-events-none"></div>
              <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-slate-50 via-slate-50/50 to-transparent z-10 pointer-events-none"></div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No services posted yet.</p>
              <Link
                href="/services/create"
                className="inline-block bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors"
              >
                Be the first to post a service!
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-200 bg-white px-4 py-12 text-center">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6">
            <h4 className="text-2xl font-bold text-primary mb-2">Findzy</h4>
            <p className="text-gray-600">
              Connecting college students with amazing talents and services
            </p>
          </div>
          <div className="text-sm text-gray-500">
            © {new Date().getFullYear()} Findzy. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
