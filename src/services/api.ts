import axios from 'axios';
import type { Location, Service, TourGuide, Category, User } from '../types';
import { config } from '../config';

const API_BASE_URL = config.API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  nationality: string;
  preferredLanguage: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}

export const apiService = {
  // Authentication
  login: async (credentials: LoginRequest): Promise<{ user: User; token: string }> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    if (response.data.success && response.data.token && response.data.user) {
      return {
        user: response.data.user,
        token: response.data.token
      };
    }
    throw new Error(response.data.message || 'Login failed');
  },
  
  register: async (userData: RegisterRequest): Promise<{ user: User; token: string }> => {
    const response = await api.post<AuthResponse>('/auth/register', userData);
    if (response.data.success && response.data.token && response.data.user) {
      return {
        user: response.data.user,
        token: response.data.token
      };
    }
    throw new Error(response.data.message || 'Registration failed');
  },
  
  getCurrentUser: (): Promise<User> =>
    api.get('/users/profile').then(res => res.data),

  // Locations
  getPopularLocations: (): Promise<Location[]> =>
    api.get('/locations/popular').then(res => res.data),
  
  getLocationById: (id: string): Promise<Location> =>
    api.get(`/locations/${id}`).then(res => res.data),

  searchLocations: (query: string): Promise<Location[]> =>
    api.get('/locations/search', { params: { query } }).then(res => res.data),

  // Services
  getFeaturedServices: (): Promise<Service[]> =>
    api.get('/services/featured').then(res => res.data),
  
  getServicesByCategory: (categoryId: string): Promise<Service[]> =>
    api.get(`/services/category/${categoryId}`).then(res => res.data),

  getServiceById: (id: string): Promise<Service> =>
    api.get(`/services/${id}`).then(res => res.data),

  // Categories
  getCategories: (): Promise<Category[]> =>
    api.get('/categories').then(res => res.data),

  // Tour Guides
  getFeaturedTourGuides: (): Promise<TourGuide[]> =>
    api.get('/tourguides/featured').then(res => res.data),

  getTourGuideById: (id: string): Promise<TourGuide> =>
    api.get(`/tourguides/${id}`).then(res => res.data),

  searchTourGuides: (query: string, location?: string): Promise<TourGuide[]> =>
    api.get('/tourguides/search', { params: { query, location } }).then(res => res.data),

  // Search
  searchServices: (query: string, location?: string): Promise<Service[]> =>
    api.get('/services/search', { params: { query, location } }).then(res => res.data),
  
  // Reviews
  getServiceReviews: (serviceId: string) =>
    api.get(`/services/${serviceId}/reviews`).then(res => res.data),
  
  getTourGuideReviews: (guideId: string) =>
    api.get(`/tourguides/${guideId}/reviews`).then(res => res.data),
};
