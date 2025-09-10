import axios from 'axios';
import type { Location, Service, TourGuide, Category } from '../types';

const API_BASE_URL = 'https://localhost:7001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const apiService = {
  // Locations
  getPopularLocations: (): Promise<Location[]> =>
    api.get('/locations/popular').then(res => res.data),
  
  getLocationById: (id: string): Promise<Location> =>
    api.get(`/locations/${id}`).then(res => res.data),

  // Services
  getFeaturedServices: (): Promise<Service[]> =>
    api.get('/services/featured').then(res => res.data),
  
  getServicesByCategory: (categoryId: string): Promise<Service[]> =>
    api.get(`/services/category/${categoryId}`).then(res => res.data),

  // Categories
  getCategories: (): Promise<Category[]> =>
    api.get('/categories').then(res => res.data),

  // Tour Guides
  getFeaturedTourGuides: (): Promise<TourGuide[]> =>
    api.get('/tourguides/featured').then(res => res.data),

  // Search
  searchServices: (query: string, location?: string): Promise<Service[]> =>
    api.get('/services/search', { params: { query, location } }).then(res => res.data),
};
