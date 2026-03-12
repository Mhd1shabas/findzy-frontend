"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Sidebar from "./Sidebar";
import StatsCards from "./StatsCards";
import RecentBookings from "./RecentBookings";
import QuickActions from "./QuickActions";
import RecentServices from "./RecentServices";
import { User, DashboardStats, Activity, Service, Booking } from "@/types";
import { Bell, Search as SearchIcon, Check } from "lucide-react";
import { API_URL } from "@/lib/api";

type Notification = {
  _id: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

interface ProviderDashboardProps {
  user: User | null;
  stats?: DashboardStats;
  recentActivity?: Activity[];
  myServices?: Service[];
  bookings?: Booking[];
  onUpdateStatus?: (id: string, status: string) => void;
}

export default function ProviderDashboard({ user, stats, recentActivity, myServices, bookings, onUpdateStatus }: ProviderDashboardProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const firstName = user?.name?.split(" ")[0] || "there";

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error("Failed to fetch notifications");
    }
  }, [token]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    // Close dropdown when clicking outside
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/api/notifications/${id}/read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      }
    } catch (err) {
      console.error("Failed to mark as read");
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      {/* Sidebar Navigation */}
      <Sidebar user={user} />

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64 p-4 md:p-8">
        {/* Top Header Section */}
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Welcome back, <span className="text-emerald-600">{firstName}</span>!
            </h1>
            <p className="text-gray-500 font-medium mt-1">Here&apos;s what&apos;s happening with your business today.</p>
          </div>

          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="relative hidden md:block">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-gray-400" />
              </span>
              <input
                type="text"
                placeholder="Search resources..."
                className="pl-10 pr-4 py-2 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none w-64 shadow-sm"
              />
            </div>

            {/* Notifications */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl bg-white border border-gray-100 shadow-sm text-gray-500 hover:text-emerald-600 transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="font-bold text-gray-900">Notifications</h3>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2.5 py-1 rounded-full">{unreadCount} New</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map(notif => (
                        <div
                          key={notif._id}
                          onClick={() => !notif.isRead && markAsRead(notif._id)}
                          className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer flex gap-3 ${!notif.isRead ? 'bg-emerald-50/30' : ''}`}
                        >
                          <div className="mt-0.5">
                            <span className={`w-2 h-2 rounded-full inline-block ${!notif.isRead ? 'bg-emerald-500' : 'bg-transparent'}`}></span>
                          </div>
                          <div>
                            <p className={`text-sm ${!notif.isRead ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                              {notif.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-1 font-medium">
                              {new Date(notif.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-sm text-gray-500">
                        No notifications yet.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar */}
            <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-600 font-bold shadow-sm overflow-hidden">
              {user?.photos && user.photos.length > 0 ? (
                <img src={user.photos[0]} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                firstName.charAt(0).toUpperCase()
              )}
            </div>
          </div>
        </header>

        {/* Dash Grid Layout */}
        <div className="space-y-10">
          {/* Statistics Section */}
          <section>
            <StatsCards
              activeServices={stats?.myServices || 0}
              totalEarnings={`₹${(stats?.totalEarnings || 0).toLocaleString("en-IN")}`}
              avgRating={stats?.avgRating || 0}
              totalBookings={stats?.completedRequests || 0}
            />
          </section>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Recent Bookings Section (Main Col) */}
            <div className="xl:col-span-2 space-y-10">
              <section>
                <RecentBookings bookings={bookings} onUpdateStatus={onUpdateStatus} />
              </section>

              {/* Recent Services Section */}
              <section>
                <RecentServices services={myServices} />
              </section>

              {/* Recent Activity Section */}
              <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
                  <button className="text-emerald-600 font-semibold text-sm hover:underline">View All</button>
                </div>
                <div className="divide-y divide-gray-50">
                  {recentActivity && recentActivity.length > 0 ? (
                    recentActivity.map((activity) => (
                      <div key={activity._id} className="p-6 hover:bg-gray-50/50 transition-colors">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-bold text-gray-900">{activity.title}</h4>
                          <span className="text-xs text-gray-400 font-medium">
                            {new Date(activity.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{activity.description}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-10 text-center text-gray-400">
                      No recent activity
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* Right Sidebar Section (Quick Actions + Alerts) */}
            <div className="space-y-8">
              <section>
                <QuickActions />
              </section>

              {/* Achievement/Tip Card */}
              <section className="bg-emerald-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-200 relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="font-bold text-lg mb-2">Grow Your Business</h3>
                  <p className="text-emerald-50 text-sm leading-relaxed mb-4">You&apos;re in the top 5% of providers this month! Post a new service to reach more customers.</p>
                  <button className="bg-white text-emerald-600 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-emerald-50 transition-colors">
                    Post New
                  </button>
                </div>
                <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                <div className="absolute bottom-[-40px] left-[-20px] w-48 h-48 bg-emerald-400/20 rounded-full blur-3xl"></div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
