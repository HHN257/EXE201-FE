# Tour Guide Booking Payment Integration

## Overview
This document describes the implementation of payment integration for tour guide bookings, similar to the existing subscription payment flow.

## Backend API Response Format
The backend `/tourguidebookings` POST endpoint now returns a structured response containing both booking details and payment information:

```typescript
interface BookingWithPaymentResponse {
  booking: {
    id: number;
    startDate: string;
    endDate: string;
    totalPrice: number;
    paymentAmount: number; // 50% upfront payment
    currency: string;
    status: string;
    tourGuideName: string;
    orderCode: number;
  };
  payment: {
    checkoutUrl?: string;
    paymentLinkId?: string;
    qrCode?: string;
    orderCode?: number;
    status?: string;
  };
}
```

## Frontend Implementation

### 1. Updated BookingModal Component
**File**: `src/components/BookingModal.tsx`

**Key Changes**:
- Updated to handle the new `BookingWithPaymentResponse` type
- Added state management for QR payment modal
- Modified form submission to show payment modal after booking creation
- Updated pricing display to show upfront payment (50%) and remaining balance
- Changed button text to "Book & Proceed to Payment"

### 2. New BookingQRPaymentModal Component  
**File**: `src/components/BookingQRPaymentModal.tsx`

**Features**:
- QR code generation using the `qrcode` library
- Payment instructions and alternative payment link
- Booking summary display with payment amount breakdown
- Manual payment status checking
- Responsive design matching the existing subscription payment modal

### 3. Updated API Service
**File**: `src/services/api.ts`

**Changes**:
- Updated `tourGuideBookingService.create()` return type to `BookingWithPaymentResponse`
- Added import for `BookingWithPaymentResponse` type

### 4. Updated Type Definitions
**File**: `src/types/index.ts`

**New Types Added**:
```typescript
interface BookingWithPaymentResponse {
  booking: {
    id: number;
    startDate: string;
    endDate: string;
    totalPrice: number;
    paymentAmount: number;
    currency: string;
    status: string;
    tourGuideName: string;
    orderCode: number;
  };
  payment: PaymentResult;
}
```

## Payment Flow

### 1. User Journey
1. User fills out booking form in `BookingModal`
2. User clicks "Book & Proceed to Payment"
3. Backend creates booking with "Pending" status
4. Backend generates payment link and QR code
5. `BookingQRPaymentModal` displays with QR code and payment instructions
6. User completes payment via QR code or payment link
7. User manually checks payment status or is redirected after successful payment

### 2. Backend Integration
The backend handles:
- Booking creation with 50% upfront payment calculation
- Payment link generation using PayOS service
- QR code generation for mobile payment
- Order code generation for tracking
- Success/failure URL handling

### 3. Payment Options
- **QR Code**: Generated dynamically for mobile banking apps
- **Payment Link**: Direct browser-based payment
- **Manual Status Check**: User can manually verify payment completion

## Key Features

### Pricing Structure
- **Total Price**: Full cost of tour guide service (hours × hourly rate)  
- **Upfront Payment**: 50% paid during booking to confirm reservation
- **Remaining Balance**: 50% paid after tour completion
- **Currency Support**: Dynamic currency formatting based on tour guide settings

### User Experience
- Booking summary shows payment breakdown clearly
- QR code auto-generates for easy mobile payment
- Alternative payment link for desktop users
- Clear payment instructions with step-by-step guide
- Error handling for availability conflicts and payment issues

### Error Handling
- Tour guide availability validation
- Date range validation (future dates only)
- Payment processing error handling
- User-friendly error messages for common issues

## Integration Points

### With Existing Components
- **TourGuidesPage**: Uses updated `BookingModal` without changes needed
- **QRPaymentModal**: Reuses existing payment modal pattern from subscriptions
- **API Service**: Maintains consistent error handling patterns

### With Backend Services
- **PayOS Integration**: Uses same payment service as subscriptions
- **Database**: Creates booking record before payment initiation
- **Notification**: Ready for email confirmation integration

## Testing Considerations
1. Test QR code generation with various payment amounts
2. Verify payment link functionality across different browsers
3. Test error handling for unavailable tour guides
4. Validate currency formatting for different locales
5. Test modal interactions and state management

## Future Enhancements
1. **Real-time Payment Verification**: Implement webhook-based payment confirmation
2. **Push Notifications**: Real-time payment status updates
3. **Multiple Payment Methods**: Add support for credit cards, digital wallets
4. **Installment Payments**: Support for payment plans
5. **Refund Processing**: Handle booking cancellations and refunds

## Files Modified
- `src/components/BookingModal.tsx` - Updated booking flow
- `src/components/BookingQRPaymentModal.tsx` - New payment modal  
- `src/services/api.ts` - Updated API response types
- `src/types/index.ts` - Added new type definitions

## Dependencies Used
- `qrcode` - QR code generation
- `react-bootstrap` - UI components
- `lucide-react` - Icons
- Existing payment infrastructure from subscription system