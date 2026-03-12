"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/dashboard/Sidebar";
import { User, Service } from "@/types";
import { API_URL } from "@/lib/api";
import {
  Plus,
  Search,
  MapPin,
  Tag,
  ExternalLink,
  Edit,
  Trash2,
  MoreVertical,
  Briefcase
} from "lucide-react";

export default function MyServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    fetchUserAndServices();
  }, [token, router]);

  const fetchUserAndServices = async () => {
    try {
      setLoading(true);

      // Fetch user
      const userRes = await fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (userRes.ok) {
        setUser(await userRes.json());
      }

      await fetchMyServices();
    } catch (error) {
      console.error("Error loading dashboard content:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyServices = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/services/my-services`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch services");

      const data = await res.json();
      setServices(data);
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this service? This action cannot be undone.")) return;

    try {
      const res = await fetch(`${API_URL}/api/services/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setServices(services.filter(s => s._id !== id));
        alert("Service deleted successfully");
      } else {
        const data = await res.json();
        alert(data.message || "Failed to delete service");
      }
    } catch (error) {
      console.error("Error deleting service:", error);
      alert("Something went wrong");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      <Sidebar user={user} />

      <div className="flex-1 lg:ml-64 p-4 md:p-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              My Services
            </h1>
            <p className="text-gray-500 font-medium">Manage and monitor your service offerings</p>
          </div>

          <Link
            href="/services/create"
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-emerald-200 transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Post New Service
          </Link>
        </header>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-3xl h-80 animate-pulse border border-gray-100 shadow-sm"></div>
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100 shadow-sm px-6 text-center">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-4">
              <Briefcase className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No services found</h2>
            <p className="text-gray-500 mb-8 max-w-sm">You haven&apos;t posted any services yet. Start offering your skills to the student community today!</p>
            <Link
              href="/services/create"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-emerald-200 transition-all"
            >
              Get Started
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {services.map((service) => (
              <div
                key={service._id}
                className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300"
              >
                {/* Image Section */}
                <div className="relative h-48 overflow-hidden bg-gray-100">
                  {(() => {
                    const images = service.serviceImages?.length ? service.serviceImages :
                      (service.images?.length ? service.images :
                        (service.photos?.length ? service.photos :
                          (service.image ? [service.image] : [])));

                    if (images && images.length > 0) {
                      const firstImage = images[0];
                      if (typeof firstImage === 'string') {
                        const src = firstImage.startsWith('http')
                          ? firstImage
                          : (firstImage.startsWith('/') ? `${API_URL}${firstImage}` : `${API_URL}/${firstImage}`);

                        return (
                          <img
                            src={src}
                            alt={service.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/images/service-placeholder.png";
                            }}
                          />
                        );
                      }
                    }

                    return (
                      <div className="w-full h-full relative">
                        <img
                          src="/images/service-placeholder.png"
                          alt="Placeholder"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center text-gray-300/50">
                          <Briefcase className="w-12 h-12" />
                        </div>
                      </div>
                    );
                  })()}
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-600 shadow-sm uppercase tracking-wider">
                      {service.category}
                    </span>
                  </div>
                </div>

                {/* Info Section */}
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">{service.title}</h3>

                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-emerald-500" />
                      {service.location}
                    </div>
                    <div className="flex items-center gap-1.5 font-bold text-emerald-600">
                      <Tag className="w-4 h-4" />
                      ₹{(service.price || 0).toLocaleString("en-IN")} <span className="text-[10px] text-gray-400 font-medium">/{service.priceType}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-4 border-t border-gray-50">
                    <Link
                      href={`/services/${service._id}`}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-50 text-gray-900 font-bold text-sm hover:bg-gray-100 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View
                    </Link>
                    <button
                      onClick={() => router.push(`/dashboard/services/edit/${service._id}`)}
                      className="p-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                      title="Edit Service"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(service._id)}
                      className="p-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                      title="Delete Service"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}