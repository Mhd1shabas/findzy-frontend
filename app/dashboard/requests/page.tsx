"use client";

import { useState, useEffect } from "react";
import {
  MoreVertical,
  Briefcase
} from "lucide-react";
import { API_URL } from "@/lib/api";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

type Request = {
  _id: string;
  title: string;
  description: string;
  status: "pending" | "accepted" | "declined" | "completed" | "cancelled";
  preferredDate?: string;
  preferredTime?: string;
  location: string;
  contactMethod: string;
  createdAt: string;
  service: {
    title: string;
    category: string;
    price: number;
    priceType: string;
  };
  requester?: {
    name: string;
    email: string;
    university?: string;
  };
  provider?: {
    name: string;
    businessName?: string;
    email: string;
  };
};

export default function RequestsPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"received" | "sent">("received");
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    acceptedRequests: 0,
    completedRequests: 0,
  });

  const router = useRouter();
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    fetchRequests();
    fetchStats();
  }, [activeTab]);

  const fetchRequests = async () => {
    try {
      const endpoint = activeTab === "received" ? "/api/requests/provider-requests" : "/api/requests/my-requests";
      const res = await fetch(`${API_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch requests");
      const data = await res.json();
      setRequests(data);
    } catch (error) {
      console.error("Failed to fetch requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/api/requests/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const updateRequestStatus = async (requestId: string, status: string) => {
    try {
      const res = await fetch(`${API_URL}/api/requests/${requestId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error("Failed to update request");

      // Refresh requests
      fetchRequests();
      fetchStats();
      alert(`Request ${status} successfully!`);
    } catch (error) {
      console.error("Failed to update request:", error);
      alert("Failed to update request. Please try again.");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "accepted": return "bg-green-100 text-green-800";
      case "declined": return "bg-red-100 text-red-800";
      case "completed": return "bg-blue-100 text-blue-800";
      case "cancelled": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i}>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </Card>
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Requests</h1>
          <p className="text-gray-600">Manage your service booking requests</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="!p-4">
            <div className="text-2xl font-bold text-gray-900">{stats.totalRequests}</div>
            <div className="text-sm text-gray-600">Total Requests</div>
          </Card>
          <Card className="!p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingRequests}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </Card>
          <Card className="!p-4">
            <div className="text-2xl font-bold text-primary">{stats.acceptedRequests}</div>
            <div className="text-sm text-gray-600">Accepted</div>
          </Card>
          <Card className="!p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.completedRequests}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("received")}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === "received"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
              >
                Received Requests
              </button>
              <button
                onClick={() => setActiveTab("sent")}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === "sent"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
              >
                Sent Requests
              </button>
            </nav>
          </div>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {requests.length === 0 ? (
            <Card className="text-center !p-8">
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No requests found</h3>
              <p className="text-gray-500">
                {activeTab === "received"
                  ? "You haven't received any service requests yet."
                  : "You haven't sent any service requests yet."}
              </p>
              {activeTab === "sent" && (
                <div className="mt-6 flex justify-center">
                  <Button onClick={() => router.push("/browse-services")}>
                    Browse Services
                  </Button>
                </div>
              )}
            </Card>
          ) : (
            requests.map((request) => (
              <Card key={request._id} className="!p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {request.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2">
                      {request.service.title} • {request.service.category}
                    </p>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {request.description}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-gray-500">Price:</span>
                    <div className="font-medium">${request.service.price} per {request.service.priceType}</div>
                  </div>
                  {request.preferredDate && (
                    <div>
                      <span className="text-gray-500">Date:</span>
                      <div className="font-medium">{new Date(request.preferredDate).toLocaleDateString()}</div>
                    </div>
                  )}
                  {request.preferredTime && (
                    <div>
                      <span className="text-gray-500">Time:</span>
                      <div className="font-medium">{request.preferredTime}</div>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-500">Location:</span>
                    <div className="font-medium">{request.location}</div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6 border-t border-gray-100 pt-4">
                  <div className="text-sm text-gray-500 flex flex-col gap-1">
                    {activeTab === "received" && request.requester ? (
                      <span>From: <strong className="font-medium text-gray-700">{request.requester.name}</strong> • {request.requester.university || request.requester.email}</span>
                    ) : request.provider ? (
                      <span>To: <strong className="font-medium text-gray-700">{request.provider.businessName || request.provider.name}</strong></span>
                    ) : null}
                    <span>
                      {new Date(request.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 w-full sm:w-auto self-end">
                    {activeTab === "received" && request.status === "pending" && (
                      <>
                        <Button
                          onClick={() => updateRequestStatus(request._id, "accepted")}
                          className="px-4 py-2"
                        >
                          Accept
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => updateRequestStatus(request._id, "declined")}
                          className="px-4 py-2 text-red-600 border-red-200 bg-red-50 hover:bg-red-100"
                        >
                          Decline
                        </Button>
                      </>
                    )}
                    {activeTab === "received" && request.status === "accepted" && (
                      <Button
                        onClick={() => updateRequestStatus(request._id, "completed")}
                        className="px-4 py-2"
                      >
                        Mark Complete
                      </Button>
                    )}
                    <Button
                      variant="secondary"
                      onClick={() => router.push(`/requests/${request._id}`)}
                      className="px-4 py-2"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </main>
  );
}