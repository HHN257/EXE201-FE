export interface User {
  id: number;
  email: string;
  name: string;
  phoneNumber?: string;
  nationality?: string;
  preferredLanguage?: string;
  role: string; // User, TourGuide, Staff, Admin
  createdAt: string;
  lastLoginAt?: string;
  isActive: boolean;
  profileImage?: string;
}

export interface Location {
  id: number;
  name: string;
  address?: string;
  placeType?: string;
  rating?: number;
  userReview?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  latitude?: number;
  longitude?: number;
  imageUrl?: string;
}

export interface CreateLocationDto {
  name: string;
  address?: string;
  placeType?: string;
  rating?: number;
  userReview?: string;
  imageUrl?: File;
}

export interface UpdateLocationDto {
  name?: string;
  address?: string;
  placeType?: string;
  rating?: number;
  userReview?: string;
  imageUrl?: File;
}

export interface LocationSearchDto {
  query?: string;
  placeType?: string;
  minRating?: number;
  page?: number;
  pageSize?: number;
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
  identityCardFrontUrl?: File;
  identityCardBackUrl?: File;
  tourGuideLicenseUrl?: File;
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

// Plan and Subscription Types
export interface Plan {
  id: number;
  name: string;
  description?: string;
  price: number;
  billingCycleInMonths: number; // Billing cycle in months
  isActive: boolean;
}

export interface CreatePlanDto {
  name: string;
  description?: string;
  price: number;
  billingCycleInMonths: number;
}

export interface UpdatePlanDto {
  name?: string;
  description?: string;
  price?: number;
  billingCycleInMonths?: number;
  isActive?: boolean;
}

export type SubscriptionStatus = 'Pending' | 'Active' | 'Canceled' | 'Expired' | 0 | 1 | 2 | 3;

export interface Subscription {
  id: string; // Guid maps to string in TypeScript
  userId: number;
  planId: number;
  plan?: Plan; // Optional nested plan object
  planName?: string; // Plan name directly from API
  status: SubscriptionStatus;
  startedDate?: string; // DateTime? maps to optional string
  currentPeriodEndDate?: string; // DateTime? maps to optional string
  canceledDate?: string; // DateTime? maps to optional string
}

export interface CreateSubscriptionRequestDto {
  planId: number;
}

export interface PaymentResult {
  checkoutUrl?: string;
  paymentLinkId?: string;
  qrCode?: string;
  orderCode?: number;
  status?: string;
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
