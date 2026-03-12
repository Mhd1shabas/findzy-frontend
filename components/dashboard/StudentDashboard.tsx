"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";

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

interface StudentDashboardProps {
  stats: DashboardStats;
  recentActivity: RecentActivity[];
}

export default function StudentDashboard({ stats, recentActivity }: StudentDashboardProps) {
  const router = useRouter();

  return (
    <div className="space-y-8">
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card
          onClick={() => router.push("/browse-services")}
          className="text-left cursor-pointer hover:border-emerald-500 transition-colors border-emerald-100 bg-white"
        >
          <div className="flex items-center mb-2">
            <div className="bg-emerald-50 p-2 rounded-lg mr-3">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900">Find Services</h3>
          </div>
          <p className="text-gray-500 text-sm">Browse student talents and skills on campus</p>
        </Card>

        <Card
          onClick={() => router.push("/browse-services")}
          className="text-left cursor-pointer hover:border-emerald-500 transition-colors border-emerald-100 bg-white"
        >
          <div className="flex items-center mb-2">
            <div className="bg-emerald-50 p-2 rounded-lg mr-3">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900">Search Services</h3>
          </div>
          <p className="text-gray-500 text-sm">Quickly search for specific freelancers or skills</p>
        </Card>

        <Card
          onClick={() => router.push("/requests/my-requests")}
          className="text-left cursor-pointer hover:border-emerald-500 transition-colors border-emerald-100 bg-white"
        >
          <div className="flex items-center mb-2">
            <div className="bg-emerald-50 p-2 rounded-lg mr-3">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5h8m-8 5h8m-8 5h8m-8 5h8M5 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H7a2 2 0 01-2-2V5zm0 10a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H7a2 2 0 01-2-2v-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900">View Bookings</h3>
          </div>
          <p className="text-gray-500 text-sm">Track your sent requests and service progress</p>
        </Card>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="px-5 py-4 border-none shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalRequests}</div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-tight">Sent Requests</div>
            </div>
            <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="px-5 py-4 border-none shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingRequests}</div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-tight">Waiting</div>
            </div>
            <div className="bg-yellow-100 p-2 rounded-lg text-yellow-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="px-5 py-4 border-none shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-emerald-600">{stats.acceptedRequests}</div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-tight">Active</div>
            </div>
            <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="px-5 py-4 border-none shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-emerald-700">{stats.completedRequests}</div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-tight">Completed</div>
            </div>
            <div className="bg-emerald-100 p-2 rounded-lg text-emerald-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-none shadow-lg">
        <h2 className="text-xl font-bold text-gray-900 mb-6 px-2">Your Activity</h2>
        {recentActivity.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-400 font-medium">You haven&apos;t requested any services yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity._id} className="flex items-start space-x-4 p-4 rounded-xl hover:bg-emerald-50/50 transition-colors">
                <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                   </svg>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900">{activity.title}</p>
                  <p className="text-sm text-gray-500">{activity.description}</p>
                  <p className="text-xs text-gray-400 mt-1 uppercase font-bold tracking-wider">
                    {new Date(activity.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {activity.link && (
                  <button onClick={() => router.push(activity.link!)} className="text-emerald-600 font-bold text-sm hover:underline">
                    View
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
