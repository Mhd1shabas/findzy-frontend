"use client";

import React from "react";

import { CheckCircle, XCircle } from "lucide-react";

import { Booking } from "@/types";

export default function RecentBookings({ bookings = [], onUpdateStatus }: { bookings?: Booking[], onUpdateStatus?: (id: string, status: string) => void }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden text-gray-800">
      <div className="p-6 border-b border-gray-50 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Recent Bookings</h2>
        <button className="text-emerald-600 font-semibold text-sm hover:underline">View All</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Service</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {bookings.length > 0 ? (
              bookings.map((booking) => (
                <tr key={booking._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs">
                        {booking.userId?.name?.charAt(0) || "U"}
                      </div>
                      <span className="font-semibold text-gray-900">{booking.userId?.name || "Anonymous"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{booking.serviceId?.title || "Deleted Service"}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${booking.bookingStatus === "completed" ? "bg-emerald-100 text-emerald-700" :
                      booking.bookingStatus === "accepted" || booking.bookingStatus === "in_progress" ? "bg-blue-100 text-blue-700" :
                        "bg-yellow-100 text-yellow-700"
                      }`}>
                      {booking.bookingStatus?.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                    {new Date(booking.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {booking.bookingStatus === "pending" && onUpdateStatus ? (
                      <>
                        <button
                          onClick={() => onUpdateStatus(booking._id, "accepted")}
                          className="text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-2 py-1 rounded shadow-sm text-xs font-bold"
                        >
                          <CheckCircle className="w-4 h-4 inline mr-1" />
                          Accept
                        </button>
                        <button
                          onClick={() => onUpdateStatus(booking._id, "rejected")}
                          className="text-red-600 hover:text-red-700 bg-red-50 px-2 py-1 rounded shadow-sm text-xs font-bold"
                        >
                          <XCircle className="w-4 h-4 inline mr-1" />
                          Reject
                        </button>
                      </>
                    ) : (
                      <span className="text-gray-400 text-xs">No Actions</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-gray-400">
                  No bookings yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
