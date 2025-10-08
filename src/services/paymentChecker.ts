import { subscriptionAPI } from './api';
import type { Subscription } from '../types';

// Helper function to map numeric status to string (matches backend C# enum)
const getSubscriptionStatusString = (status: string | number): string => {
  if (typeof status === 'string') return status;
  
  // Backend C# enum: Pending=0, Active=1, Canceled=2, Expired=3
  switch (status) {
    case 0: return 'Pending';   // Đang chờ thanh toán lần đầu
    case 1: return 'Active';    // Đang hoạt động
    case 2: return 'Canceled';  // Người dùng đã hủy
    case 3: return 'Expired';   // Hết hạn và chưa gia hạn
    default: return 'Unknown';
  }
};

export class PaymentStatusChecker {
  private intervalId: NodeJS.Timeout | null = null;
  private readonly checkInterval = 3000; // Check every 3 seconds
  private onPaymentConfirmed: (subscription: Subscription) => void;
  private onError: (error: string) => void;

  constructor(
    onPaymentConfirmed: (subscription: Subscription) => void,
    onError: (error: string) => void
  ) {
    this.onPaymentConfirmed = onPaymentConfirmed;
    this.onError = onError;
  }

  startChecking(): void {
    this.stopChecking(); // Ensure no duplicate intervals

    this.intervalId = setInterval(async () => {
      try {
        const subscription = await subscriptionAPI.getMySubscription();
        
        // Check if subscription is active (handle both string and numeric status)
        // Backend C# enum: Pending=0, Active=1, Canceled=2, Expired=3
        const isActive = subscription && (
          subscription.status === 'Active' || 
          subscription.status === 1  // Active status from backend enum
        );
        
        if (isActive) {
          console.log('Payment confirmed! Subscription is active:', subscription);
          this.stopChecking();
          this.onPaymentConfirmed(subscription);
        } else {
          const statusString = subscription?.status ? getSubscriptionStatusString(subscription.status) : 'No subscription';
          console.log('Payment still processing... Current status:', statusString, '(raw:', subscription?.status, ')');
        }
      } catch (error) {
        // If subscription not found, payment might still be processing
        // Continue checking until timeout or manual stop
        console.log('Payment still processing... Error:', error);
      }
    }, this.checkInterval);

    // Auto-stop checking after 5 minutes to prevent infinite requests
    setTimeout(() => {
      if (this.intervalId) {
        this.stopChecking();
        this.onError('Payment confirmation timeout. Please check your subscription status manually.');
      }
    }, 5 * 60 * 1000); // 5 minutes
  }

  stopChecking(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  isChecking(): boolean {
    return this.intervalId !== null;
  }
}

export const createPaymentChecker = (
  onPaymentConfirmed: (subscription: Subscription) => void,
  onError: (error: string) => void
) => {
  return new PaymentStatusChecker(onPaymentConfirmed, onError);
};