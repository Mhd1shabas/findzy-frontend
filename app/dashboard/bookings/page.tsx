"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import {
  Calendar,
  Clock,
  Tag,
  Loader2,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  XCircle
} from "lucide-react";
import Link from "next/link";
import { Booking, User } from "@/types";
import { API_URL } from "@/lib/api";

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
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

        // Fetch bookings
        const bookRes = await fetch(`${API_URL}/api/bookings`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (bookRes.ok) {
          const data = await bookRes.json();
          setBookings(data);
        }
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!token) {
      router.push("/login");
      return;
    }
    fetchData();
  }, [token, router]);

  const handleUpdateStatus = async (bookingId: string, newStatus: string) => {
    try {
      const res = await fetch(`${API_URL}/api/bookings/${bookingId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setBookings(prev =>
          prev.map(b => b._id === bookingId ? { ...b, bookingStatus: newStatus } : b)
        );
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-amber-100 text-amber-700 border-amber-200";
      case "accepted": return "bg-blue-100 text-blue-700 border-blue-200";
      case "in_progress": return "bg-indigo-100 text-indigo-700 border-indigo-200";
      case "completed": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "rejected":
      case "cancelled": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="w-4 h-4" />;
      case "accepted": return <CheckCircle2 className="w-4 h-4" />;
      case "in_progress": return <Clock className="w-4 h-4" />;
      case "completed": return <CheckCircle2 className="w-4 h-4" />;
      case "rejected":
      case "cancelled": return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      <Sidebar user={user} />

      <div className="flex-1 lg:ml-64 p-4 md:p-8">
        {/* Header */}
        <header className="mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            My Bookings
          </h1>
          <p className="text-gray-500 font-medium">Track and manage your service appointments</p>
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100 shadow-sm px-6 text-center">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-4">
              <Calendar className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No bookings yet</h2>
            <p className="text-gray-500 mb-8 max-w-sm">You haven&apos;t booked any services yet. Find expert students to help you with your next project!</p>
            <Link
              href="/browse-services"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-emerald-200 transition-all"
            >
              Browse Services
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6 md:p-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex gap-4">
                      <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0">
                        <Briefcase className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {booking.serviceId?.title || "Deleted Service"}
                        </h3>
                        <p className="text-gray-500 font-medium mb-3">
                          Provider: <span className="text-gray-900">{booking.providerId?.businessName || booking.providerId?.name || "Unknown"}</span>
                        </p>

                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          <div className="flex items-center gap-1.5 text-gray-500">
                            <Calendar className="w-4 h-4" />
                            {new Date(booking.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric"
                            })}
                          </div>
                          <div className="flex items-center gap-1.5 font-bold text-emerald-600">
                            <Tag className="w-4 h-4" />
                            ₹{booking.price?.toLocaleString("en-IN")}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-sm font-bold capitalize ${getStatusColor(booking.bookingStatus)}`}>
                        {getStatusIcon(booking.bookingStatus)}
                        {booking.bookingStatus.replace("_", " ")}
                      </div>

                      {booking.bookingStatus === "accepted" && (
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center gap-2 text-blue-700 bg-blue-50 px-4 py-3 rounded-xl text-sm font-bold border border-blue-100">
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                            Your booking was accepted. Contact the provider.
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {(booking.providerId?.whatsapp || booking.providerId?.phone) && (
                              <a
                                href={`https://wa.me/${(booking.providerId?.whatsapp || booking.providerId?.phone || "").replace(/\D/g, "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-5 py-2.5 bg-[#25D366] text-white rounded-xl font-bold hover:bg-[#128C7E] transition shadow-md shadow-emerald-100 text-[13px]"
                              >
                                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                                Contact Provider
                              </a>
                            )}
                            <button
                              onClick={() => handleUpdateStatus(booking._id, "completed")}
                              className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition text-[13px]"
                            >
                              Mark Completed
                            </button>
                          </div>
                        </div>
                      )}

                      {booking.bookingStatus === "in_progress" && (
                        <div className="flex flex-col sm:flex-row items-center gap-3">
                          <div className="flex items-center gap-2 text-indigo-700 bg-indigo-50 px-4 py-3 rounded-xl text-sm font-bold border border-indigo-100">
                            <Clock className="w-4 h-4 shrink-0" />
                            Work is in progress.
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {(booking.providerId?.whatsapp || booking.providerId?.phone) && (
                              <a
                                href={`https://wa.me/${(booking.providerId?.whatsapp || booking.providerId?.phone || "").replace(/\D/g, "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-5 py-2.5 bg-[#25D366] text-white rounded-xl font-bold hover:bg-[#128C7E] transition shadow-md shadow-emerald-100 text-[13px]"
                              >
                                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                                Contact Provider
                              </a>
                            )}
                            <button
                              onClick={() => handleUpdateStatus(booking._id, "completed")}
                              className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition"
                            >
                              Mark Completed
                            </button>
                          </div>
                        </div>
                      )}

                      {booking.bookingStatus === "completed" && (
                        <Link
                          href={`/services/${booking.serviceId?._id}#reviews`}
                          className="px-4 py-2 bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 rounded-xl hover:bg-emerald-100 transition"
                        >
                          Leave a Review
                        </Link>
                      )}

                      <Link
                        href={`/services/${booking.serviceId?._id}`}
                        className="w-full sm:w-auto text-center px-6 py-2.5 rounded-xl bg-gray-50 text-gray-900 font-bold border border-gray-200 hover:bg-gray-100 transition-colors"
                      >
                        View Service
                      </Link>
                    </div>
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
