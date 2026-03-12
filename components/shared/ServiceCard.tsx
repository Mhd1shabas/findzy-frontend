"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Heart, MapPin, Tag, Briefcase } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { API_URL } from "@/lib/api";

import { Service } from "@/types";

interface ServiceCardProps {
  service: Service;
  isFavorited?: boolean;
  onFavoriteToggle?: (serviceId: string, isFavorited: boolean) => void;
  currentUserId?: string | null;
}

export default function ServiceCard({
  service,
  isFavorited: initialIsFavorited = false,
  onFavoriteToggle,
  currentUserId
}: ServiceCardProps) {
  const router = useRouter();
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsFavorited(initialIsFavorited);
  }, [initialIsFavorited]);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      const endpoint = isFavorited ? `/api/favorites/remove/${service._id}` : "/api/favorites/add";
      const method = isFavorited ? "DELETE" : "POST";

      const res = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: method === "POST" ? JSON.stringify({ serviceId: service._id }) : undefined,
      });

      if (res.ok) {
        setIsFavorited(!isFavorited);
        if (onFavoriteToggle) onFavoriteToggle(service._id, !isFavorited);
      }
    } catch (error) {
      console.error("Favorite toggle failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/services/${service._id}`);
  };

  const isOwnService = currentUserId && service.provider?._id === currentUserId;

  return (
    <Card
      className="!p-0 overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 relative cursor-pointer flex flex-col h-full rounded-2xl border border-gray-100 bg-white"
      onClick={() => router.push(`/services/${service._id}`)}
    >
      {/* Favorite Button */}
      <button
        onClick={toggleFavorite}
        disabled={loading}
        className={`absolute top-4 right-4 z-20 p-2.5 rounded-full transition-all duration-300 transform hover:scale-110 shadow-sm ${isFavorited
          ? "bg-red-50 text-red-500"
          : "bg-white/90 backdrop-blur-md text-gray-400 hover:text-red-500"
          }`}
      >
        <Heart className={`w-4 h-4 ${isFavorited ? "fill-current" : ""}`} />
      </button>

      {/* Image Section */}
      <div className="relative h-56 overflow-hidden bg-gray-100">
        {(() => {
          // Check all possible image fields
          const images = service.serviceImages?.length ? service.serviceImages :
            (service.images?.length ? service.images :
              (service.photos?.length ? service.photos :
                (service.image ? [service.image] : [])));

          if (images && images.length > 0) {
            const firstImage = images[0];
            // Ensure firstImage is a string and handle relative paths correctly
            if (typeof firstImage === 'string') {
              const src = firstImage.startsWith('http')
                ? firstImage
                : (firstImage.startsWith('/') ? `${API_URL}${firstImage}` : `${API_URL}/${firstImage}`);

              return (
                <img
                  src={src}
                  alt={service.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  onError={(e) => {
                    // Fallback to placeholder if image fails to load
                    (e.target as HTMLImageElement).src = "/images/service-placeholder.png";
                  }}
                />
              );
            }
          }

          // No image found at all
          return (
            <div className="w-full h-full relative">
              <img
                src="/images/service-placeholder.png"
                alt="Placeholder"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center text-gray-300/50">
                <Briefcase className="w-16 h-16" />
              </div>
            </div>
          );
        })()}

        {/* Gradient Overlay for bottom text readability if needed natively, skip for now */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 poimter-events-none"></div>

        <div className="absolute top-4 left-4 z-10">
          <span className="bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[11px] font-black text-emerald-700 shadow-sm uppercase tracking-wider">
            {service.category}
          </span>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        {/* Provider Top Header inside Content block */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-[10px] overflow-hidden">
            {service.provider?.photos && service.provider.photos.length > 0 ? (
              <img src={service.provider.photos[0]} alt="provider" className="w-full h-full object-cover" />
            ) : (
              (service.provider?.businessName || service.provider?.name || "?").charAt(0).toUpperCase()
            )}
          </div>
          <p className="text-xs font-bold text-gray-600 truncate flex-1 hover:text-emerald-600 transition-colors">
            {service.provider?.businessName || service.provider?.name || "Provider"}
          </p>
          <div className="flex items-center gap-0.5">
            <span className="text-amber-400 text-sm">★</span>
            <span className="text-[11px] font-black text-gray-700">
              {service.rating ? service.rating.toFixed(1) : (service.provider?.averageRating?.toFixed(1) || "5.0")}
            </span>
          </div>
        </div>

        <h3 className="text-[17px] font-bold text-gray-900 mb-2 line-clamp-2 leading-snug group-hover:text-emerald-600 transition-colors">
          {service.title}
        </h3>

        <div className="flex flex-wrap text-[12px] text-gray-500 mb-auto mt-2">
          <p className="line-clamp-2">{service.description}</p>
        </div>

        <div className="border-t border-gray-100 pt-4 mt-5 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Starting at</span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-black text-gray-900">₹{(service.price || 0).toLocaleString("en-IN")}</span>
              <span className="text-[11px] text-gray-500 font-medium">/{service.priceType}</span>
            </div>
          </div>

          <div>
            {isOwnService ? (
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 inline-block shadow-sm">
                Your Service
              </span>
            ) : (
              <button
                onClick={handleBook}
                className="text-[12px] shadow-[0_2px_10px_rgb(16,185,129,0.2)] font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-5 py-2.5 rounded-xl transition-all hover:scale-105 active:scale-95"
              >
                Book
              </button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
