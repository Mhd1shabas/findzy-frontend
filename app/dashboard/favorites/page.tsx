"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import ServiceCard from "@/components/shared/ServiceCard";
import { Heart, Loader2, Search } from "lucide-react";
import Link from "next/link";
import { Service, User } from "@/types";
import { API_URL } from "@/lib/api";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Service[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    fetchData();
  }, [token, router]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch user for sidebar
      const userRes = await fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (userRes.ok) {
        setUser(await userRes.json());
      }

      // Fetch favorites
      const favRes = await fetch(`${API_URL}/api/favorites`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (favRes.ok) {
        const data = await favRes.json();
        setFavorites(data);
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteToggle = (serviceId: string, isNowFavorited: boolean) => {
    if (!isNowFavorited) {
      // Remove from list if unfavorited on the favorites page
      setFavorites(prev => prev.filter(s => s._id !== serviceId));
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      <Sidebar user={user} />

      <div className="flex-1 lg:ml-64 p-4 md:p-8">
        {/* Header */}
        <header className="mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            My Favorites
          </h1>
          <p className="text-gray-500 font-medium">Services you&apos;ve saved for later</p>
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          </div>
        ) : favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100 shadow-sm px-6 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 mb-4">
              <Heart className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">You have no favorite services yet.</h2>
            <p className="text-gray-500 mb-8 max-w-sm">Explore our marketplace and save the services that catch your eye!</p>
            <Link
              href="/browse-services"
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-emerald-200 transition-all"
            >
              <Search className="w-5 h-5" />
              Discover Services
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {favorites.map((service) => (
              <ServiceCard
                key={service._id}
                service={service}
                isFavorited={true}
                onFavoriteToggle={handleFavoriteToggle}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
