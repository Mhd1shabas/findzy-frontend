export interface User {
  _id: string;
  name: string;
  email: string;
  role?: string;
  photos?: string[];
  businessName?: string;
  university?: string;
  college?: string;
  major?: string;
  year?: string;
  whatsapp?: string;
  phone?: string;
  password?: string;
  about?: string;
  bio?: string;
  location?: string;
  skills?: string[];
  averageRating?: number;
}

export interface Service {
  _id: string;
  title: string;
  description: string;
  category: string;
  college?: string;
  location: string;
  price: number;
  priceType: string;
  images?: string[];
  serviceImages?: string[];
  photos?: string[];
  image?: string;
  level?: string;
  tags?: string[];
  rating?: number;
  provider?: {
    _id: string;
    name: string;
    businessName?: string;
    university?: string;
    college?: string;
    major?: string;
    about?: string;
    averageRating?: number;
    skills?: string[];
    email?: string;
    phone?: string;
    whatsapp?: string;
    photos?: string[];
    rating?: number;
  };
}

export interface Booking {
  _id: string;
  serviceId?: Service;
  providerId?: User;
  requesterId?: User;
  userId?: User;
  bookingStatus: string;
  price: number;
  createdAt: string;
}

export interface Activity {
  _id: string;
  type: string;
  title: string;
  description: string;
  createdAt: string;
  link?: string;
}

export interface Review {
  _id: string;
  userId: User;
  serviceId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface DashboardStats {
  totalRequests: number;
  pendingRequests: number;
  acceptedRequests: number;
  completedRequests: number;
  myServices: number;
  profileComplete: boolean;
  totalEarnings?: number;
  avgRating?: number;
}
