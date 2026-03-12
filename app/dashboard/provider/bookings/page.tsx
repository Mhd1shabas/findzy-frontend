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
    XCircle,
    User as UserIcon,
    MessageCircle
} from "lucide-react";
import { Booking, User } from "@/types";
import { API_URL } from "@/lib/api";

export default function ProviderBookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
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

            const userRes = await fetch(`${API_URL}/api/auth/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (userRes.ok) {
                setUser(await userRes.json());
            }

            const bookRes = await fetch(`${API_URL}/api/bookings/provider`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (bookRes.ok) {
                const data = await bookRes.json();
                setBookings(data);
            }
        } catch (error) {
            console.error("Error fetching provider bookings:", error);
        } finally {
            setLoading(false);
        }
    };

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
                        Client Bookings
                    </h1>
                    <p className="text-gray-500 font-medium">Manage and respond to your incoming service requests.</p>
                </header>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100 shadow-sm px-6 text-center">
                        <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-4">
                            <Briefcase className="w-8 h-8" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">No client bookings yet</h2>
                        <p className="text-gray-500 mb-8 max-w-sm">When clients book your services, they will appear securely right here.</p>
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
                                            {booking.userId?.photos && booking.userId.photos.length > 0 ? (
                                                <img src={booking.userId.photos[0]} alt="client" className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-gray-100" />
                                            ) : (
                                                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 shrink-0 border border-gray-100">
                                                    <UserIcon className="w-8 h-8" />
                                                </div>
                                            )}
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 mb-1 leading-tight">
                                                    {booking.serviceId?.title || "Deleted Service"}
                                                </h3>
                                                <p className="text-gray-500 font-medium mb-3 text-sm">
                                                    Client: <span className="text-gray-900 font-bold">{booking.userId?.name || "Unknown User"}</span>
                                                    <span className="text-xs ml-1 text-gray-400">({booking.userId?.university || "Student"})</span>
                                                </p>

                                                <div className="flex flex-wrap items-center gap-4 text-sm">
                                                    <div className="flex items-center gap-1.5 text-gray-500 bg-gray-50 px-3 py-1 rounded-lg">
                                                        <Calendar className="w-4 h-4" />
                                                        {new Date(booking.createdAt).toLocaleDateString("en-IN", {
                                                            day: "numeric",
                                                            month: "short",
                                                            year: "numeric"
                                                        })}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">
                                                        <Tag className="w-4 h-4" />
                                                        ₹{booking.price?.toLocaleString("en-IN")}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-col sm:flex-row items-center gap-3">
                                            <div className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-[13px] font-bold capitalize shadow-sm ${getStatusColor(booking.bookingStatus)}`}>
                                                {getStatusIcon(booking.bookingStatus)}
                                                {booking.bookingStatus.replace("_", " ")}
                                            </div>

                                            {/* Status Mutation Logic */}
                                            {booking.bookingStatus === "pending" && (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleUpdateStatus(booking._id, "rejected")}
                                                        className="px-4 py-2 bg-red-50 text-red-600 rounded-xl font-bold border border-red-100 hover:bg-red-100 transition shadow-sm text-sm"
                                                    >
                                                        Reject
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateStatus(booking._id, "accepted")}
                                                        className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition shadow-sm text-sm"
                                                    >
                                                        Accept Booking
                                                    </button>
                                                </div>
                                            )}

                                            {booking.bookingStatus === "accepted" && (
                                                <div className="flex gap-2">
                                                    {booking.userId?.phone || booking.userId?.whatsapp ? (
                                                        <a
                                                            href={`https://wa.me/${(booking.userId?.whatsapp || booking.userId?.phone || "").replace(/\D/g, "")}?text=${encodeURIComponent(`Hi ${booking.userId?.name || "Client"}, I accepted your booking for ${booking.serviceId?.title || "Service"} on Findzy. Let's discuss the details.`)}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-xl font-bold hover:bg-indigo-100 transition shadow-sm text-sm"
                                                        >
                                                            <MessageCircle className="w-4 h-4" /> Message Client
                                                        </a>
                                                    ) : (
                                                        <button
                                                            disabled
                                                            className="flex items-center gap-1.5 px-4 py-2 bg-gray-50 border border-gray-200 text-gray-400 rounded-xl font-bold cursor-not-allowed text-sm"
                                                        >
                                                            <MessageCircle className="w-4 h-4" /> Message Client
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleUpdateStatus(booking._id, "in_progress")}
                                                        className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition shadow-sm text-sm"
                                                    >
                                                        Start Work
                                                    </button>
                                                </div>
                                            )}

                                            {booking.bookingStatus === "in_progress" && (
                                                <div className="flex gap-2">
                                                    {booking.userId?.phone || booking.userId?.whatsapp ? (
                                                        <a
                                                            href={`https://wa.me/${(booking.userId?.whatsapp || booking.userId?.phone || "").replace(/\D/g, "")}?text=${encodeURIComponent(`Hi ${booking.userId?.name || "Client"}, I accepted your booking for ${booking.serviceId?.title || "Service"} on Findzy. Let's discuss the details.`)}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-xl font-bold hover:bg-indigo-100 transition shadow-sm text-sm"
                                                        >
                                                            <MessageCircle className="w-4 h-4" /> Message Client
                                                        </a>
                                                    ) : (
                                                        <button
                                                            disabled
                                                            className="flex items-center gap-1.5 px-4 py-2 bg-gray-50 border border-gray-200 text-gray-400 rounded-xl font-bold cursor-not-allowed text-sm"
                                                        >
                                                            <MessageCircle className="w-4 h-4" /> Message Client
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleUpdateStatus(booking._id, "completed")}
                                                        className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition shadow-sm text-sm"
                                                    >
                                                        Mark Completed
                                                    </button>
                                                </div>
                                            )}
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
