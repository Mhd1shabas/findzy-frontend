"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import ProviderDashboard from "@/components/dashboard/ProviderDashboard";
import { API_URL } from "@/lib/api";
import { Service, Booking } from "@/types";

type DashboardStats = {
  totalRequests: number;
  pendingRequests: number;
  acceptedRequests: number;
  completedRequests: number;
  myServices: number;
  profileComplete: boolean;
};

type RecentActivity = {
  _id: string;
  type: "request_sent" | "request_received" | "service_created" | "request_updated";
  title: string;
  description: string;
  createdAt: string;
  link?: string;
};

type UserProfile = {
  _id: string;
  name: string;
  email: string;
  photos?: string[];
};

export default function DashboardPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalRequests: 0,
    pendingRequests: 0,
    acceptedRequests: 0,
    completedRequests: 0,
    myServices: 0,
    profileComplete: false,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [myServices, setMyServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    fetchDashboardData();
  }, [router, token]);

  const fetchDashboardData = async () => {
    try {
      // Fetch user profile using the new /api/auth/me route
      const userRes = await fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData);
      }

      // Fetch stats
      const statsRes = await fetch(`${API_URL}/api/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // Fetch recent activity
      const activityRes = await fetch(`${API_URL}/api/dashboard/activity`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (activityRes.ok) {
        const activityData = await activityRes.json();
        setRecentActivity(activityData);
      }

      // Fetch user's services
      const servicesRes = await fetch(`${API_URL}/api/services/my-services`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (servicesRes.ok) {
        const servicesData = await servicesRes.json();
        setMyServices(servicesData);
      }

      // Fetch recent bookings received as a provider
      const bookingsRes = await fetch(`${API_URL}/api/bookings/provider?limit=5`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json();
        setBookings(bookingsData);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`${API_URL}/api/bookings/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (res.ok) {
        // Refresh bookings
        const bookingsRes = await fetch(`${API_URL}/api/bookings/provider?limit=5`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (bookingsRes.ok) {
          const bookingsData = await bookingsRes.json();
          setBookings(bookingsData);
        }
      }
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-10 bg-gray-200 rounded-xl w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-100 rounded-2xl"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-100 rounded-2xl"></div>
          </div>
        </div>
      </main>
    );
  }

  // Use the unified dashboard for everyone
  return (
    <ProviderDashboard
      user={user}
      stats={stats}
      recentActivity={recentActivity}
      myServices={myServices}
      bookings={bookings}
      onUpdateStatus={handleUpdateStatus}
    />
  );
}
