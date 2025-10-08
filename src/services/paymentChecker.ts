import { subscriptionAPI } from './api';
import type { Subscription } from '../types';

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
        
        // If subscription is active, payment was successful
        if (subscription && subscription.status === 'Active') {
          this.stopChecking();
          this.onPaymentConfirmed(subscription);
        }
      } catch {
        // If subscription not found, payment might still be processing
        // Continue checking until timeout or manual stop
        console.log('Payment still processing...');
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