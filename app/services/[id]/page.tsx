"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { Heart, Loader2, Star, MapPin, Clock, ShieldCheck, ChevronRight, ChevronLeft, Check, Award, Briefcase } from "lucide-react";
import { API_URL } from "@/lib/api";

type Service = {
  _id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  price: number;
  priceType: string;
  duration?: string;
  level: string;
  tags: string[];
  availability: string[];
  location: string;
  images?: string[];
  serviceImages?: string[];
  rating?: number;
  provider: {
    _id: string;
    name: string;
    businessName?: string;
    university?: string;
    major?: string;
    email?: string;
    phone?: string;
    whatsapp?: string;
    about?: string;
    averageRating?: number;
    skills: string[];
    photos?: string[];
  };
};

import { Review } from "@/types";

export default function ServiceDetailPage() {
  const params = useParams<{ id: string }>();
  const serviceId = params?.id;
  const router = useRouter();

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Review State
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (serviceId) {
      fetchService();
      fetchReviews();
      if (token) {
        fetchFavoriteStatus();
        fetchCurrentUser();
      }
    }
  }, [serviceId, token]);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`${API_URL}/api/reviews/service/${serviceId}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUserId(data._id);
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
    }
  };

  const fetchFavoriteStatus = async () => {
    try {
      const res = await fetch(`${API_URL}/api/favorites`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setIsFavorited(data.some((s: { _id: string }) => s._id === serviceId));
      }
    } catch (error) {
      console.error("Failed to fetch favorite status:", error);
    }
  };

  const fetchService = async () => {
    try {
      const res = await fetch(`${API_URL}/api/services/${serviceId}`);
      if (!res.ok) throw new Error("Failed to fetch service");
      const data = await res.json();
      setService(data);
    } catch (error) {
      console.error("Failed to fetch service:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookService = async () => {
    if (!token || !service) return;

    setBookingLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          serviceId: service._id,
          providerId: service.provider._id,
          price: service.price,
        }),
      });

      if (!res.ok) throw new Error("Failed to create booking");

      alert("Service booked successfully!");
      router.push("/dashboard/bookings");
    } catch (error) {
      console.error("Failed to book service:", error);
      alert("Failed to book service. Please try again.");
    } finally {
      setBookingLoading(false);
    }
  };

  const toggleFavorite = async () => {
    if (!token || !service) {
      router.push("/login");
      return;
    }

    setFavLoading(true);
    try {
      const endpoint = isFavorited ? `/api/favorites/remove/${service._id}` : "/api/favorites/add";
      const method = isFavorited ? "DELETE" : "POST";

      const res = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: method === "POST" ? JSON.stringify({ serviceId: service._id }) : undefined,
      });

      if (res.ok) {
        setIsFavorited(!isFavorited);
      }
    } catch (error) {
      console.error("Favorite toggle failed:", error);
    } finally {
      setFavLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      router.push("/login");
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await fetch(`${API_URL}/api/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          serviceId: service?._id,
          rating: reviewRating,
          comment: reviewComment,
        }),
      });

      if (res.ok) {
        setReviewComment("");
        setReviewRating(5);
        fetchReviews(); // Refresh review list
        alert("Review submitted successfully!");
      } else {
        const data = await res.json();
        alert(data.message || "Failed to submit review");
      }
    } catch (error) {
      console.error("Failed to submit review:", error);
      alert("Error submitting review");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="max-w-7xl w-full mx-auto px-4 py-8 flex-1">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded mb-4 w-3/4"></div>
            <div className="h-6 bg-gray-200 rounded mb-8 w-1/2"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 space-y-8">
                <div className="h-[400px] bg-gray-200 rounded-2xl"></div>
                <div className="h-64 bg-gray-200 rounded-2xl"></div>
              </div>
              <div className="h-[500px] bg-gray-200 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!service) {
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="max-w-7xl w-full mx-auto px-4 py-20 text-center flex-1">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Service Not Found</h1>
          <p className="text-gray-600 mb-8">The service you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <button onClick={() => router.push('/browse-services')} className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold">
            Browse Similar Services
          </button>
        </div>
      </main>
    );
  }

  // Handle images securely and handle legacy local URLs
  const images = (service.serviceImages?.length ? service.serviceImages : service.images) || [];
  const processedImages = images.map(img => {
    if (typeof img !== 'string') return '';
    
    let processedImg = img;
    // Fix for hardcoded URLs in DB
    if (processedImg.includes('localhost:5000') || processedImg.includes('findzy-backend-1.onrender.com')) {
      const parts = processedImg.split('/uploads/');
      if (parts.length > 1) {
        processedImg = `/uploads/${parts[1]}`;
      }
    }

    return processedImg.startsWith('http') ? processedImg : `${API_URL}${processedImg}`;
  }).filter(Boolean);

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % processedImages.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + processedImages.length) % processedImages.length);

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* Main Content (Left) */}
          <div className="lg:col-span-8 space-y-12">

            {/* Header Section */}
            <div className="space-y-6">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-[1.3] block">
                {service.title}
              </h1>

              <div className="flex flex-wrap items-center gap-y-3 gap-x-5 text-sm md:text-base text-gray-700">
                <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => router.push(`/provider/${service.provider._id}`)}>
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-600 shrink-0">
                    {service.provider.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-bold text-gray-900">{service.provider.businessName || service.provider.name}</span>
                </div>

                <div className="hidden sm:block text-gray-300">|</div>

                <div className="flex items-center gap-1.5 font-bold text-yellow-500">
                  <Star className="w-5 h-5 fill-current" />
                  <span className="text-gray-900 underline decoration-gray-300 underline-offset-4 cursor-pointer hover:decoration-gray-900">
                    {service.rating ? service.rating.toFixed(1) : (service.provider.averageRating?.toFixed(1) || "5.0")}
                  </span>
                  <span className="font-normal text-gray-500 ml-0.5">({reviews.length})</span>
                </div>

                <div className="hidden sm:block text-gray-300">|</div>

                <span className="font-semibold bg-gray-100 px-3 py-1 rounded-md text-gray-700">
                  {service.category}
                </span>

                <div className="hidden sm:block text-gray-300">|</div>

                <span className="flex items-center gap-1.5 text-gray-600 font-medium">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  {service.location}
                </span>
              </div>
            </div>

            {/* Gallery Section */}
            {processedImages.length > 0 ? (
              <div className="space-y-4">
                <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200 group">
                  <img
                    src={processedImages[currentImageIndex]}
                    alt={`Preview ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover transition-all duration-300 group-hover:scale-[1.02]"
                  />
                  {processedImages.length > 1 && (
                    <>
                      <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all opacity-0 group-hover:opacity-100">
                        <ChevronLeft className="w-6 h-6 text-gray-800" />
                      </button>
                      <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all opacity-0 group-hover:opacity-100">
                        <ChevronRight className="w-6 h-6 text-gray-800" />
                      </button>
                    </>
                  )}
                </div>
                {processedImages.length > 1 && (
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {processedImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`relative w-24 h-16 shrink-0 rounded-md overflow-hidden border-2 transition-all ${currentImageIndex === idx ? 'border-emerald-600 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                      >
                        <img src={img} className="w-full h-full object-cover" alt={`Thumb ${idx}`} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-video bg-emerald-50 rounded-lg border border-emerald-100 flex flex-col items-center justify-center text-emerald-600/50">
                <Briefcase className="w-20 h-20 mb-4 opacity-50" />
                <span className="font-medium">No images available for this service</span>
              </div>
            )}

            {/* Description Section */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">About This Service</h2>
              <div className="prose max-w-none text-gray-700 leading-8 text-[17px]">
                <p className="whitespace-pre-wrap">{service.description}</p>
              </div>

              {/* Tags/Categories */}
              {service.tags && service.tags.length > 0 && (
                <div className="mt-8 pt-8 border-t border-gray-100">
                  <h4 className="text-lg font-bold text-gray-900 mb-4">Skills & Metadata</h4>
                  <div className="flex flex-wrap gap-2">
                    {service.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Provider Detailed Section */}
            <div className="pt-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Get to know the provider</h2>
              <div className="border border-gray-200 rounded-2xl p-8 hover:border-emerald-200 transition-colors bg-white">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
                  <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center text-white font-bold text-3xl shrink-0 overflow-hidden text-emerald-600">
                    {service.provider.photos && service.provider.photos.length > 0 ? (
                      (() => {
                        let photo = service.provider.photos[0];
                        if (photo.includes('localhost:5000') || photo.includes('findzy-backend-1.onrender.com')) {
                          const parts = photo.split('/uploads/');
                          if (parts.length > 1) photo = `/uploads/${parts[1]}`;
                        }
                        const src = photo.startsWith('http') ? photo : `${API_URL}${photo}`;
                        return <img src={src} alt="provider" className="w-full h-full object-cover" />;
                      })()
                    ) : (
                      service.provider.name.charAt(0).toUpperCase()
                    )}
                  </div>

                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-gray-900 hover:underline cursor-pointer" onClick={() => router.push(`/provider/${service.provider._id}`)}>
                      {service.provider.businessName || service.provider.name}
                    </h4>
                    <p className="text-gray-600 mt-1 mb-2 font-medium">
                      {service.provider.university || "University Student"} {service.provider.major ? `• ${service.provider.major}` : ""}
                    </p>
                    <div className="flex items-center justify-center sm:justify-start gap-2 mb-4">
                      <span className="flex items-center text-yellow-500 font-bold">
                        <Star className="w-4 h-4 mr-1 fill-current" />
                        {service.provider.averageRating?.toFixed(1) || "New"}
                      </span>
                    </div>
                    <button onClick={() => router.push(`/provider/${service.provider._id}`)} className="border border-gray-900 text-gray-900 font-bold px-6 py-2.5 rounded-lg hover:bg-gray-900 hover:text-white transition-colors">
                      View Profile
                    </button>
                  </div>
                </div>

                {service.provider.about && (
                  <div className="mt-8 pt-8 border-t border-gray-100">
                    <p className="text-gray-700 leading-relaxed max-w-3xl whitespace-pre-wrap">{service.provider.about}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 pt-8 border-t border-gray-100 text-sm">
                  <div>
                    <span className="block text-gray-500 mb-1">From</span>
                    <span className="font-bold text-gray-900">{service.location}</span>
                  </div>
                  <div>
                    <span className="block text-gray-500 mb-1">Avg. response time</span>
                    <span className="font-bold text-gray-900">1 hour</span>
                  </div>
                  <div>
                    <span className="block text-gray-500 mb-1">Services offered</span>
                    <span className="font-bold text-gray-900 hover:underline cursor-pointer" onClick={() => router.push(`/provider/${service.provider._id}`)}>View Profile</span>
                  </div>
                  <div>
                    <span className="block text-gray-500 mb-1">Level status</span>
                    <span className="font-bold text-gray-900 capitalize">{service.level}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="pt-6" id="reviews">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                {reviews.length} Reviews <span className="text-yellow-500 flex items-center gap-1 text-xl"><Star className="w-6 h-6 fill-current" />{service.rating?.toFixed(1) || "5.0"}</span>
              </h2>

              {/* Leave a review block */}
              {token && currentUserId !== service.provider._id && (
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-6 mb-10 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-4 text-lg">Leave a Review</h3>
                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Rating</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewRating(star)}
                            className={`transition-colors text-2xl ${star <= reviewRating ? "text-yellow-500" : "text-gray-300 hover:text-yellow-400"
                              }`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Review Comment</label>
                      <textarea
                        required
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="How was the service? (Required)"
                        rows={3}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="px-6 py-2.5 bg-gray-900 text-white font-bold rounded-lg hover:bg-black transition-colors disabled:opacity-50"
                    >
                      {submittingReview ? "Posting..." : "Post Review"}
                    </button>
                  </form>
                </div>
              )}

              <div className="space-y-6">
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div key={review._id} className="border-t border-gray-200 pt-8 mt-8 first:border-0 first:pt-0 first:mt-0">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-600 text-lg">
                            {review.userId?.name?.charAt(0) || "U"}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 text-base">{review.userId?.name || "Anonymous User"}</div>
                            <div className="text-sm text-gray-500 flex items-center gap-2 mt-0.5">
                              <span className="flex text-yellow-500">
                                {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                              </span>
                              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                              {new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-800 text-base leading-relaxed pl-16">
                        {review.comment}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-500 font-medium">
                    No reviews yet for this service. Be the first to try it!
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Sidebar (Right) */}
          <div className="lg:col-span-4 space-y-8">
            {/* Booking Card */}
            <div className="border border-gray-200 rounded-xl p-6 md:p-8 sticky top-6 bg-white shadow-xl shadow-gray-200/20">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-3xl font-extrabold text-gray-900">₹{service.price.toLocaleString("en-IN")}</h3>
                <span className="text-gray-500 font-medium mt-2 capitalize whitespace-nowrap ml-2">per {service.priceType}</span>
              </div>

              <div className="space-y-5 mb-8 text-[15px] font-medium text-gray-600 bg-gray-50/80 p-5 rounded-lg border border-gray-100">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="block font-bold text-gray-900 mb-0.5">Delivery Time</span>
                    <span>{service.duration || "Flexible timing"}</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Award className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="block font-bold text-gray-900 mb-0.5">Available Days</span>
                    <span>{Array.isArray(service.availability) ? service.availability.join(", ") : service.availability}</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Loader2 className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="block font-bold text-gray-900 mb-0.5">Response Time</span>
                    <span>Usually responds in 1 hour</span>
                  </div>
                </div>
              </div>

              {!token ? (
                <div className="text-center">
                  <p className="text-gray-600 mb-4 font-medium">Please log in to book this service</p>
                  <button
                    onClick={() => router.push("/login")}
                    className="w-full bg-emerald-600 text-white py-3.5 px-4 rounded-lg font-bold hover:bg-emerald-700 transition-colors mb-3"
                  >
                    Log In to Book
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {currentUserId === service.provider._id ? (
                    <div className="w-full text-center py-3.5 px-4 bg-gray-100 text-gray-600 rounded-lg font-bold border border-gray-200">
                      This is your service
                    </div>
                  ) : (
                    <button
                      onClick={handleBookService}
                      disabled={bookingLoading}
                      className="w-full bg-emerald-600 text-white py-3.5 px-4 rounded-lg font-bold hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50 text-lg flex items-center justify-center gap-2"
                    >
                      {bookingLoading ? "Processing..." : "Continue"} <ChevronRight className="w-5 h-5" />
                    </button>
                  )}

                  <button
                    onClick={toggleFavorite}
                    disabled={favLoading}
                    className={`w-full flex items-center justify-center gap-2 p-3 rounded-lg border-2 font-bold transition-all ${isFavorited
                      ? "bg-red-50 border-red-100 text-red-500"
                      : "bg-white border-gray-200 text-gray-600 hover:border-gray-900 hover:text-gray-900"
                      }`}
                  >
                    <Heart className={`w-5 h-5 ${isFavorited ? "fill-current" : ""}`} />
                    {isFavorited ? "Saved to Favorites" : "Save to Favorites"}
                  </button>
                </div>
              )}
            </div>

            {/* Trust Section */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-6">
              <h4 className="font-extrabold text-gray-900 mb-4 flex items-center gap-2 text-lg">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
                Why choose FINDZY?
              </h4>
              <ul className="space-y-4 text-sm text-gray-700 font-medium">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-4 h-4" />
                  </span>
                  <span>Top-rated quality and clear communication from peer students.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-4 h-4" />
                  </span>
                  <span>Verified university providers and student community.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-4 h-4" />
                  </span>
                  <span>Secure platform handling with reliable rating system.</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}