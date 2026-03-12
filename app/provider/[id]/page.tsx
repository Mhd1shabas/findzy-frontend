"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import ServiceCard from "@/components/shared/ServiceCard";
import { MapPin, Star, UserCheck, ShieldCheck } from "lucide-react";
import { Service, User } from "@/types";
import { API_URL } from "@/lib/api";

export default function ProviderProfilePage() {
    const { id } = useParams();
    const [provider, setProvider] = useState<User | null>(null);
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchProviderData();
        }
    }, [id]);

    const fetchProviderData = async () => {
        try {
            // Assuming a generic user route or provider route exists to fetch public profile
            // For now we can fetch services and the first service will have provider info
            // Or we can use /api/providers/:id if it exists. Based on backend let's use /api/services/provider/:id
            const res = await fetch(`${API_URL}/api/services/provider/${id}`);
            if (res.ok) {
                const data = await res.json();
                setServices(data);
                if (data.length > 0) {
                    setProvider(data[0].provider);
                } else {
                    // Fallback if no services
                    const userRes = await fetch(`${API_URL}/api/users/${id}`);
                    if (userRes.ok) {
                        const userData = await userRes.json();
                        setProvider(userData);
                    }
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="max-w-4xl mx-auto px-4 py-16 animate-pulse">
                    <div className="bg-white rounded-2xl shadow-sm p-8 flex items-center gap-6">
                        <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
                        <div className="flex-1">
                            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    if (!provider) {
        return (
            <main className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="text-center py-20">
                    <h2 className="text-2xl font-bold text-gray-800">Provider not found</h2>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 pb-20">
            <Navbar />

            {/* Cover / Profile Banner */}
            <div className="bg-emerald-600 h-48 w-full relative"></div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
                <div className="bg-white rounded-2xl shadow-sm p-8 sm:p-10 mb-8 flex flex-col sm:flex-row gap-8 items-start sm:items-center">
                    <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-emerald-100 flex items-center justify-center text-4xl font-bold text-emerald-600 overflow-hidden shrink-0">
                        {provider.photos && provider.photos.length > 0 ? (
                            <img src={provider.photos[0]} alt={provider.name} className="w-full h-full object-cover" />
                        ) : (
                            provider.name?.charAt(0) || "P"
                        )}
                    </div>
                    <div className="flex-1">
                        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2">
                            {provider.businessName || provider.name}
                            <ShieldCheck className="w-6 h-6 text-emerald-500" />
                        </h1>
                        <p className="text-lg text-gray-600 mt-1">{provider.university || "University Student"}</p>

                        <div className="flex flex-wrap gap-6 mt-4 text-sm text-gray-500 font-medium">
                            <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                <span className="text-gray-900 font-bold">{provider.averageRating?.toFixed(1) || "5.0"}</span>
                                <span>Rating</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                <MapPin className="w-4 h-4 text-emerald-500" />
                                <span>{provider.location || "Online Context"}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Bio */}
                    <div className="lg:col-span-1 space-y-8">
                        <div className="bg-white rounded-2xl shadow-sm p-8 pb-10">
                            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <UserCheck className="w-5 h-5 text-emerald-600" /> About
                            </h3>
                            <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-wrap">
                                {provider.about || provider.bio || "This provider has not added a bio yet."}
                            </p>
                        </div>
                    </div>

                    {/* Right Column - Services */}
                    <div className="lg:col-span-2">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">Services Offered ({services.length})</h3>
                        {services.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                                {services.map(service => (
                                    <ServiceCard key={service._id} service={service} />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl shadow-sm p-12 text-center text-gray-500">
                                No active services from this provider.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
