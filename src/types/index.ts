export interface User {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  avatar?: string;
  isVerified: boolean;
  createdAt: string;
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
