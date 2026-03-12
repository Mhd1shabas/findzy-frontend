"use client";

import React from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Search,
  Briefcase,
  PlusCircle,
  CalendarCheck,
  Heart,
  User,
  Settings,
  LogOut
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { name: "Browse Services", icon: Search, path: "/browse-services" },
  { name: "My Services", icon: Briefcase, path: "/dashboard/services" },
  { name: "Post Service", icon: PlusCircle, path: "/services/create" },
  { name: "My Bookings", icon: CalendarCheck, path: "/dashboard/bookings" },
  { name: "Client Bookings", icon: User, path: "/dashboard/provider/bookings" },
  { name: "Favorites", icon: Heart, path: "/dashboard/favorites" },
  { name: "Profile", icon: User, path: "/dashboard/profile" },
  { name: "Settings", icon: Settings, path: "/dashboard/settings" },
];

import { User as UserType } from "@/types";

export default function Sidebar({ user }: { user: UserType | null }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <div className="hidden lg:flex w-64 bg-gray-900 h-screen border-r border-gray-800 flex-col fixed left-0 top-0 z-20 transition-all duration-300">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-emerald-600 text-white p-1.5 rounded-lg shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <span className="text-2xl font-extrabold text-emerald-600 tracking-tight transition-colors">
            FINDZY
          </span>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <button
              key={item.name}
              onClick={() => router.push(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 group ${isActive
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-gray-300 hover:bg-gray-800 hover:text-emerald-500"
                }`}
            >
              <item.icon className={`w-5 h-5 transition-all duration-300 ${isActive
                ? "text-white"
                : "text-gray-400 group-hover:text-emerald-500 group-hover:drop-shadow-[0_0_8px_rgba(16,185,129,0.8)] group-hover:translate-x-1"
                }`} />
              {item.name}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800 space-y-2">
        {/* User Profile Mini Card */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700">
          <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold overflow-hidden">
            {user?.photos && user.photos.length > 0 ? (
              <img src={user.photos[0]} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              user?.name?.charAt(0).toUpperCase() || "U"
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{user?.name || "User Name"}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email || "user@example.com"}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200 group"
        >
          <LogOut className="w-5 h-5 text-red-400 group-hover:text-red-300 transition-colors" />
          Logout
        </button>
      </div>
    </div>
  );
}
