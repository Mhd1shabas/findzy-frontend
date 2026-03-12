"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { API_URL } from "@/lib/api";
import { User } from "@/types";

type Request = {
  _id: string;
  title: string;
  description: string;
  status: "pending" | "accepted" | "declined" | "completed" | "cancelled";
  preferredDate?: string;
  preferredTime?: string;
  location: string;
  contactMethod: string;
  contactInfo: string;
  additionalNotes?: string;
  createdAt: string;
  updatedAt: string;
  service: {
    _id: string;
    title: string;
    description: string;
    category: string;
    price: number;
    priceType: string;
    availability: string[];
  };
  requester: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    university?: string;
    major?: string;
    year?: string;
  };
  provider: {
    _id: string;
    name: string;
    businessName?: string;
    email: string;
    phone?: string;
    university?: string;
    major?: string;
    year?: string;
  };
};

export default function RequestDetailPage() {
  const [request, setRequest] = useState<Request | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const router = useRouter();
  const params = useParams();
  const requestId = params.id as string;
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    fetchRequest();
  }, [requestId]);

  const fetchRequest = async () => {
    try {
      const res = await fetch(`${API_URL}/api/requests/${requestId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch request");
      const data = await res.json();
      setRequest(data);
    } catch (error) {
      console.error("Failed to fetch request:", error);
      alert("Failed to load request details");
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (status: string) => {
    if (!request) return;

    setUpdating(true);
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

      // Refresh request data
      fetchRequest();
      alert(`Request ${status} successfully!`);
    } catch (error) {
      console.error("Failed to update request:", error);
      alert("Failed to update request. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "accepted": return "bg-green-100 text-green-800 border-green-200";
      case "declined": return "bg-red-100 text-red-800 border-red-200";
      case "completed": return "bg-blue-100 text-blue-800 border-blue-200";
      case "cancelled": return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getContactLink = (method: string, info: string) => {
    switch (method.toLowerCase()) {
      case "whatsapp":
        return `https://wa.me/${info.replace(/\D/g, "")}`;
      case "email":
        return `mailto:${info}`;
      case "phone":
        return `tel:${info}`;
      default:
        return "#";
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="bg-white rounded-lg p-6 mb-6">
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="bg-white rounded-lg p-6">
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!request) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card className="text-center !p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Request Not Found</h1>
            <p className="text-gray-600 mb-4">The request you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.</p>
            <Button onClick={() => router.push("/dashboard/requests")}>
              Back to Requests
            </Button>
          </Card>
        </div>
      </main>
    );
  }

  const isProvider = request.provider._id === (typeof window !== "undefined" ? localStorage.getItem("userId") : null);
  const otherParty = isProvider ? request.requester : request.provider;

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <Card className="mb-6 !p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{request.title}</h1>
              <p className="text-gray-600 mb-2">Service: {request.service.title}</p>
              <p className="text-sm text-gray-500">
                Created on {new Date(request.createdAt).toLocaleDateString()} at {new Date(request.createdAt).toLocaleTimeString()}
              </p>
            </div>
            <span className={`px-4 py-2 rounded-lg text-sm font-medium border ${getStatusColor(request.status)}`}>
              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {isProvider && request.status === "pending" && (
              <>
                <Button
                  onClick={() => updateRequestStatus("accepted")}
                  disabled={updating}
                >
                  {updating ? "Updating..." : "Accept Request"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => updateRequestStatus("declined")}
                  disabled={updating}
                  className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:text-red-700"
                >
                  {updating ? "Updating..." : "Decline Request"}
                </Button>
              </>
            )}
            {isProvider && request.status === "accepted" && (
              <Button
                onClick={() => updateRequestStatus("completed")}
                disabled={updating}
              >
                {updating ? "Updating..." : "Mark as Completed"}
              </Button>
            )}
            {!isProvider && request.status === "pending" && (
              <Button
                variant="outline"
                onClick={() => updateRequestStatus("cancelled")}
                disabled={updating}
              >
                {updating ? "Updating..." : "Cancel Request"}
              </Button>
            )}
            <Button
              variant="secondary"
              onClick={() => router.push("/dashboard/requests")}
            >
              Back to Requests
            </Button>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Request Details */}
            <Card className="!p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Request Details</h2>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-700 leading-relaxed">{request.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Preferred Date & Time</h3>
                    <p className="text-gray-700">
                      {request.preferredDate
                        ? new Date(request.preferredDate).toLocaleDateString()
                        : "Not specified"}
                      {request.preferredTime && ` at ${request.preferredTime}`}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Location</h3>
                    <p className="text-gray-700">{request.location}</p>
                  </div>
                </div>

                {request.additionalNotes && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Additional Notes</h3>
                    <p className="text-gray-700">{request.additionalNotes}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Service Information */}
            <Card className="!p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Service Information</h2>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">{request.service.title}</h3>
                  <p className="text-gray-700">{request.service.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-500">Category:</span>
                    <span className="ml-2 font-medium">{request.service.category}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Price:</span>
                    <span className="ml-2 font-medium">₹{request.service.price.toLocaleString("en-IN")} per {request.service.priceType}</span>
                  </div>
                </div>

                <div>
                  <span className="text-gray-500">Availability:</span>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {request.service.availability.map((day, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {day}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card className="!p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>

              <div className="space-y-3">
                <div>
                  <span className="text-gray-500">Preferred Method:</span>
                  <span className="ml-2 font-medium capitalize">{request.contactMethod}</span>
                </div>

                <div>
                  <span className="text-gray-500">Contact Info:</span>
                  <div className="mt-1">
                    <a
                      href={getContactLink(request.contactMethod, request.contactInfo)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      {request.contactInfo}
                    </a>
                  </div>
                </div>
              </div>
            </Card>

            {/* Party Information */}
            <Card className="!p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {isProvider ? "Requester" : "Provider"} Information
              </h2>

              <div className="space-y-3">
                <div>
                  <span className="text-gray-500">Name:</span>
                  <span className="ml-2 font-medium">{otherParty.name}</span>
                </div>

                {("businessName" in otherParty && (otherParty as User).businessName) && (
                  <div>
                    <span className="text-gray-500">Business:</span>
                    <span className="ml-2 font-medium">{(otherParty as User).businessName}</span>
                  </div>
                )}

                <div>
                  <span className="text-gray-500">Email:</span>
                  <span className="ml-2 font-medium">{otherParty.email}</span>
                </div>

                {otherParty.phone && (
                  <div>
                    <span className="text-gray-500">Phone:</span>
                    <span className="ml-2 font-medium">{otherParty.phone}</span>
                  </div>
                )}

                {otherParty.university && (
                  <div>
                    <span className="text-gray-500">University:</span>
                    <span className="ml-2 font-medium">{otherParty.university}</span>
                  </div>
                )}

                {otherParty.major && (
                  <div>
                    <span className="text-gray-500">Major:</span>
                    <span className="ml-2 font-medium">{otherParty.major}</span>
                  </div>
                )}

                {otherParty.year && (
                  <div>
                    <span className="text-gray-500">Year:</span>
                    <span className="ml-2 font-medium">{otherParty.year}</span>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}