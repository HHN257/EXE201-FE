import axios from 'axios';
import type { 
  Location, 
  Service, 
  TourGuide, 
  Category, 
  User, 
  TourGuideVerificationRequest,
  CreateVerificationRequest,
  AdminReviewRequest,
  VerificationStatus,
  ChatMessage,
  ChatResponse,
  ChatConversation
} from '../types';
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

export interface CurrencyRate {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  lastUpdated: string;
}

export interface ConversionRequest {
  from: string;
  to: string;
  amount: number;
  useRealTime?: boolean;
}

export interface BatchConvertItem {
  from: string;
  to: string;
  amount: number;
  useRealTime?: boolean;
}

export interface ConversionResult {
  from: string;
  to: string;
  amount: number;
  result: number;
  realTime: boolean;
}

export interface TourGuideDto {
  id: number;
  name: string;
  bio?: string;
  languages?: string;
  specializations?: string;
  hourlyRate?: number;
  currency?: string;
  rating?: number;
  totalReviews: number;
  profileImage?: string;
  isVerified: boolean;
}

export interface CreateTourGuideDto {
  name: string;
  bio?: string;
  phoneNumber?: string;
  email?: string;
  languages?: string;
  specializations?: string;
  hourlyRate?: number;
  currency?: string;
  profileImage?: string;
  isVerified?: boolean;
  isActive?: boolean;
}

export interface TourGuideBookingDto {
  id: number;
  startDate: string;
  endDate: string;
  notes?: string;
  totalPrice: number;
  currency?: string;
  location?: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  tourGuideId: number;
  tourGuideName: string;
  userId: number;
  userName: string;
}

export interface CreateTourGuideBookingDto {
  tourGuideId: number;
  startDate: string;
  endDate: string;
  notes?: string;
  location?: string;
}

export interface TourGuideReviewDto {
  id: number;
  rating: number;
  comment?: string;
  createdAt: string;
  isVerified: boolean;
  tourGuideId: number;
  tourGuideName: string;
  userId: number;
  userName: string;
}

export interface CreateTourGuideReviewDto {
  tourGuideId: number;
  rating: number;
  comment?: string;
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

// Currency service
export const currencyService = {
  // Get currency rates
  getRates: (useRealTime = false, baseCurrency = 'USD', symbols?: string): Promise<CurrencyRate[]> =>
    api.get('/currency/rates', { 
      params: { useRealTime, baseCurrency, symbols } 
    }).then(res => res.data),

  // Convert single currency
  convert: (from: string, to: string, amount: number, useRealTime = false): Promise<number> =>
    api.get('/currency/convert', { 
      params: { from, to, amount, useRealTime } 
    }).then(res => res.data),

  // Batch convert multiple currencies
  batchConvert: (items: BatchConvertItem[]): Promise<ConversionResult[]> =>
    api.post('/currency/convert/batch', items).then(res => res.data),
};

// Tour Guide service
export const tourGuideService = {
  // Get all tour guides
  getAll: (): Promise<TourGuideDto[]> =>
    api.get('/tourguides').then(res => res.data),

  // Get tour guide by ID
  getById: (id: number): Promise<TourGuideDto> =>
    api.get(`/tourguides/${id}`).then(res => res.data),

  // Create tour guide
  create: (data: CreateTourGuideDto): Promise<TourGuideDto> =>
    api.post('/tourguides', data).then(res => res.data),

  // Get tour guide reviews
  getReviews: (id: number): Promise<TourGuideReviewDto[]> =>
    api.get(`/tourguides/${id}/reviews`).then(res => res.data),
};

// Tour Guide Booking service
export const tourGuideBookingService = {
  // Get user's bookings
  getAll: (): Promise<TourGuideBookingDto[]> =>
    api.get('/tourguidebookings').then(res => res.data),

  // Get booking by ID
  getById: (id: number): Promise<TourGuideBookingDto> =>
    api.get(`/tourguidebookings/${id}`).then(res => res.data),

  // Create new booking
  create: (data: CreateTourGuideBookingDto): Promise<TourGuideBookingDto> =>
    api.post('/tourguidebookings', data).then(res => res.data),

  // Get bookings for a tour guide
  getByTourGuide: (tourGuideId: number): Promise<TourGuideBookingDto[]> =>
    api.get(`/tourguidebookings/tourguide/${tourGuideId}`).then(res => res.data),
};

// Tour Guide Review service
export const tourGuideReviewService = {
  // Get all reviews
  getAll: (): Promise<TourGuideReviewDto[]> =>
    api.get('/tourguidereviews').then(res => res.data),

  // Get review by ID
  getById: (id: number): Promise<TourGuideReviewDto> =>
    api.get(`/tourguidereviews/${id}`).then(res => res.data),

  // Create review
  create: (data: CreateTourGuideReviewDto): Promise<TourGuideReviewDto> =>
    api.post('/tourguidereviews', data).then(res => res.data),

  // Get reviews for a tour guide
  getByTourGuide: (tourGuideId: number): Promise<TourGuideReviewDto[]> =>
    api.get(`/tourguidereviews/tourguide/${tourGuideId}`).then(res => res.data),
};

// Tour Guide Verification service
export const verificationService = {
  // Get my verification status (for tour guides)
  getMyStatus: (): Promise<VerificationStatus> =>
    api.get('/tourguideverification/my-status').then(res => res.data),

  // Get my verification requests (for tour guides)
  getMyRequests: (): Promise<TourGuideVerificationRequest[]> =>
    api.get('/tourguideverification/my-requests').then(res => res.data),

  // Submit verification request (for tour guides)
  submit: (data: CreateVerificationRequest): Promise<TourGuideVerificationRequest> =>
    api.post('/tourguideverification', data).then(res => res.data),

  // Update verification request (for tour guides)
  update: (id: number, data: Partial<CreateVerificationRequest>): Promise<TourGuideVerificationRequest> =>
    api.put(`/tourguideverification/${id}`, data).then(res => res.data),

  // Delete verification request (for tour guides)
  delete: (id: number): Promise<void> =>
    api.delete(`/tourguideverification/${id}`).then(res => res.data),

  // Get verification request by ID
  getById: (id: number): Promise<TourGuideVerificationRequest> =>
    api.get(`/tourguideverification/${id}`).then(res => res.data),

  // Admin/Staff endpoints
  // Get all verification requests (for admin/staff)
  getAllRequests: (params?: { status?: string; page?: number; pageSize?: number }): Promise<TourGuideVerificationRequest[]> =>
    api.get('/tourguideverification/admin/all', { params }).then(res => res.data),

  // Review verification request (for admin/staff)
  review: (id: number, data: AdminReviewRequest): Promise<TourGuideVerificationRequest> =>
    api.put(`/tourguideverification/admin/${id}/review`, data).then(res => res.data),

  // Verify tour guide directly (for admin/staff)
  verifyDirectly: (tourGuideId: number, isVerified: boolean): Promise<TourGuide> =>
    api.put(`/tourguideverification/staff/${tourGuideId}/verify`, { isVerified }).then(res => res.data),
};

// Chatbot API
export const chatbotApi = {
  // Send a simple message without conversation history
  sendMessage: (data: ChatMessage): Promise<ChatResponse> =>
    api.post('/chatbot/message', data).then(res => res.data),

  // Send a message with conversation history
  sendMessageWithHistory: (data: ChatMessage): Promise<ChatResponse> =>
    api.post('/chatbot/conversation', data).then(res => res.data),

  // Get conversation history
  getHistory: (): Promise<ChatConversation> =>
    api.get('/chatbot/history').then(res => res.data),

  // Clear conversation history
  clearHistory: (): Promise<{ message: string }> =>
    api.delete('/chatbot/history').then(res => res.data),

  // Get suggested questions
  getSuggestedQuestions: (language: string = 'en'): Promise<string[]> =>
    api.get('/chatbot/suggested-questions', { params: { language } }).then(res => res.data),

  // Health check
  healthCheck: (): Promise<{ status: string }> =>
    api.get('/chatbot/health').then(res => res.data),
};
