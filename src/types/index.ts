export interface User {
  id: number;  // Changed from string to number to match backend
  email: string;
  name: string;  // Changed from fullName to name to match backend
  phoneNumber?: string;
  nationality?: string;
  preferredLanguage?: string;
  role: string; // User, TourGuide, Staff, Admin
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

// Verification Types
export interface TourGuideVerificationRequest {
  id: number;
  tourGuideId?: number; // Make optional for User applications
  userId?: number; // Add userId for User applications
  tourGuideName?: string; // Make optional
  userName?: string; // Add userName for User applications
  applicantRole: string; // Role of the person applying (User or TourGuide)
  fullName: string;
  identityNumber: string;
  phoneNumber: string;
  email: string;
  address?: string;
  identityCardFrontUrl?: string;
  identityCardBackUrl?: string;
  tourGuideLicenseUrl?: string;
  licenseNumber?: string;
  issuingAuthority?: string;
  licenseIssueDate?: string;
  licenseExpiryDate?: string;
  additionalDocumentsUrls?: string;
  experience?: string;
  languages?: string;
  specializations?: string;
  additionalNotes?: string;
  status: string;
  adminNotes?: string;
  reviewedByAdminId?: number;
  reviewedByAdminName?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateVerificationRequest {
  fullName: string;
  identityNumber: string;
  phoneNumber: string;
  email: string;
  address?: string;
  identityCardFrontUrl?: string;
  identityCardBackUrl?: string;
  tourGuideLicenseUrl?: string;
  licenseNumber?: string;
  issuingAuthority?: string;
  licenseIssueDate?: string;
  licenseExpiryDate?: string;
  additionalDocumentsUrls?: string;
  experience?: string;
  languages?: string;
  specializations?: string;
  additionalNotes?: string;
}

export interface AdminReviewRequest {
  status: 'Approved' | 'Rejected' | 'UnderReview';
  adminNotes?: string;
  promoteToTourGuide?: boolean; // New field for User -> TourGuide promotion
}

export interface VerificationStatus {
  tourGuideId?: number; // Backend returns TourGuideId (with capital T)
  tourGuideName?: string; // Backend returns TourGuideName
  isVerified: boolean; // Backend returns IsVerified
  hasPendingRequest: boolean; // Backend returns HasPendingRequest
  latestRequestStatus?: string; // Backend returns LatestRequestStatus
  latestRequestDate?: string; // Backend returns LatestRequestDate
  canSubmitNewRequest: boolean; // Backend returns CanSubmitNewRequest
  userId?: number; // For User applications
  userName?: string; // For User applications
  userRole?: string; // For User applications
}

// Chatbot Types
export interface ChatMessage {
  message: string;
  context?: string;
  language?: string;
}

export interface ChatResponse {
  response: string;
  isSuccessful: boolean;
  errorMessage?: string;
  timestamp: string;
  suggestedQuestions?: string[];
}

export interface ChatConversation {
  userId: string;
  messages: ChatHistoryItem[];
}

export interface ChatHistoryItem {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
