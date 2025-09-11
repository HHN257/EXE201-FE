export interface User {
  id: number;  // Changed from string to number to match backend
  email: string;
  name: string;  // Changed from fullName to name to match backend
  phoneNumber?: string;
  nationality?: string;
  preferredLanguage?: string;
  createdAt: string;
  lastLoginAt?: string;
  isActive: boolean;
}

export interface Location {
  id: string;
  name: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  imageUrl?: string;
  rating: number;
  reviewCount: number;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  category: Category;
  location: Location;
  priceRange: string;
  rating: number;
  reviewCount: number;
  imageUrls: string[];
  isActive: boolean;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  iconUrl?: string;
}

export interface TourGuide {
  id: string;
  fullName: string;
  bio: string;
  languages: string[];
  rating: number;
  reviewCount: number;
  pricePerHour: number;
  avatar?: string;
  specialties: string[];
  isAvailable: boolean;
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  author: User;
  createdAt: string;
  media?: ReviewMedia[];
}

export interface ReviewMedia {
  id: string;
  type: 'image' | 'video';
  url: string;
}
