"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Briefcase } from "lucide-react";
import Link from "next/link";
import { API_URL } from "@/lib/api";

import { Service } from "@/types";

export default function RecentServices({ services = [] }: { services?: Service[] }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Your Services</h2>
        <button className="text-emerald-600 font-semibold text-sm hover:underline">View All</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.length > 0 ? (
          services.map((service) => (
            <Card key={service._id} className="!p-0 border-none shadow-sm h-full overflow-hidden group">
              <div className="relative h-40 w-full overflow-hidden bg-gray-100">
                {(() => {
                  const images = service.serviceImages?.length ? service.serviceImages :
                    (service.images?.length ? service.images :
                      (service.photos?.length ? service.photos :
                        (service.image ? [service.image] : [])));

                  if (images && images.length > 0) {
                    const firstImage = images[0];
                    if (typeof firstImage === 'string') {
                      const src = firstImage.startsWith('http')
                        ? firstImage
                        : (firstImage.startsWith('/') ? `${API_URL}${firstImage}` : `${API_URL}/${firstImage}`);

                      return (
                        <img
                          src={src}
                          alt={service.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/images/service-placeholder.png";
                          }}
                        />
                      );
                    }
                  }

                  return (
                    <div className="w-full h-full relative">
                      <img
                        src="/images/service-placeholder.png"
                        alt="Placeholder"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center text-gray-300/50">
                        <Briefcase className="w-10 h-10" />
                      </div>
                    </div>
                  );
                })()}
                <div className="absolute top-3 left-3">
                  <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold text-emerald-600 shadow-sm">
                    {service.category}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-900 line-clamp-1">{service.title}</h3>
                <p className="text-xs text-gray-400 mt-1 uppercase font-bold tracking-wider">{service.category}</p>
              </div>
            </Card>
          ))
        ) : (
          <div className="sm:col-span-2 lg:col-span-3 py-10 text-center text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
            No services posted yet
          </div>
        )}

        {/* Add button */}
        <Link
          href="/services/create"
          className="h-full min-h-[180px] rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-emerald-300 hover:text-emerald-500 hover:bg-emerald-50/10 transition-all duration-200"
        >
          <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
            <PlusIcon className="w-6 h-6" />
          </div>
          <span className="text-sm font-bold">Add New Service</span>
        </Link>
      </div>
    </div>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  )
}
