"use client";

import React from "react";
import { 
  Briefcase, 
  IndianRupee, 
  Star, 
  CheckCircle 
} from "lucide-react";

interface StatsProps {
  activeServices: number;
  totalEarnings: string;
  avgRating: number;
  totalBookings: number;
}

export default function StatsCards({ 
  activeServices = 12, 
  totalEarnings = "₹1,240.00", 
  avgRating = 4.8, 
  totalBookings = 156 
}: Partial<StatsProps>) {
  const stats = [
    { 
      label: "Active Services", 
      value: activeServices, 
      icon: Briefcase, 
      color: "bg-blue-50 text-blue-600",
      iconBg: "bg-blue-100"
    },
    { 
      label: "Total Earnings", 
      value: totalEarnings, 
      icon: IndianRupee, 
      color: "bg-emerald-50 text-emerald-600",
      iconBg: "bg-emerald-100"
    },
    { 
      label: "Average Rating", 
      value: avgRating.toFixed(1), 
      icon: Star, 
      color: "bg-yellow-50 text-yellow-600",
      iconBg: "bg-yellow-100"
    },
    { 
      label: "Total Bookings", 
      value: totalBookings, 
      icon: CheckCircle, 
      color: "bg-purple-50 text-purple-600",
      iconBg: "bg-purple-100"
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, i) => (
        <div key={i} className={`p-6 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center gap-4`}>
          <div className={`${stat.iconBg} p-3 rounded-xl`}>
            <stat.icon className={`w-6 h-6 ${stat.color.split(' ')[1]}`} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-400 uppercase tracking-tight">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
