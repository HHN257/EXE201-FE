import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Modal, Spinner } from 'react-bootstrap';
import { Check, Crown, Zap, Star } from 'lucide-react';
import { planAPI, subscriptionAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import QRPaymentModal from '../components/QRPaymentModal';
import type { Plan, PaymentResult, Subscription } from '../types';
import './PlansPage.css';

const PlansPage: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingPlanId, setProcessingPlanId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
  const { isAuthenticated, showError, showSuccess } = useAuth();

  useEffect(() => {
    fetchPlans();
    if (isAuthenticated) {
      fetchCurrentSubscription();
    }
  }, [isAuthenticated]);

  const fetchPlans = async () => {
    try {
      const data = await planAPI.getAllPlans();
      setPlans(data);
    } catch (error) {
      console.error('Error fetching plans:', error);
      const errorMessage = 'Failed to load plans. Please try again.';
      setError(errorMessage);
      showError(errorMessage, 'Loading Error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentSubscription = async () => {
    try {
      const subscription = await subscriptionAPI.getMySubscription();
      setCurrentSubscription(subscription);
      console.log(subscription);
    } catch (error) {
      console.error('Error fetching subscription:', error);
      // Don't set error state here as not having a subscription is normal
      setCurrentSubscription(null);
    }
  };

  const handleSubscribe = (plan: Plan) => {
    if (!isAuthenticated) {
      const errorMessage = 'Please log in to subscribe to a plan.';
      setError(errorMessage);
      showError(errorMessage, 'Authentication Required');
      return;
    }

    // Check if user already has an active subscription to this plan
    if (isUserSubscribedToPlan(plan)) {
      const errorMessage = 'You are already subscribed to this plan.';
      setError(errorMessage);
      showError(errorMessage, 'Already Subscribed');
      return;
    }
    
    setSelectedPlan(plan);
    setShowConfirmModal(true);
  };

  const confirmSubscription = async () => {
    if (!selectedPlan) return;

    setProcessingPlanId(selectedPlan.id);
    setShowConfirmModal(false);
    setError(null);

    try {
      const result: PaymentResult = await subscriptionAPI.createSubscription({
        planId: selectedPlan.id
      });

      setPaymentResult(result);
      setShowQRModal(true);
      showSuccess(`Payment initiated for ${selectedPlan.name} plan. Please scan the QR code to complete payment.`, 'Payment Started');
      
      // Refresh current subscription after successful payment initiation
      if (isAuthenticated) {
        fetchCurrentSubscription();
      }
      
    } catch (error) {
      console.error('Error creating subscription:', error);
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(errorMessage || 'Failed to create subscription. Please try again.');
    } finally {
      setProcessingPlanId(null);
    }
  };

  const getPlanIcon = (planName: string) => {
    const name = planName.toLowerCase();
    if (name.includes('premium') || name.includes('pro')) {
      return <Crown className="text-warning" size={24} />;
    } else if (name.includes('basic') || name.includes('starter')) {
      return <Zap className="text-primary" size={24} />;
    } else {
      return <Star className="text-success" size={24} />;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDuration = (months: number) => {
    if (months >= 12) {
      const years = Math.floor(months / 12);
      return `${years} year${years > 1 ? 's' : ''}`;
    } else {
      return `${months} month${months > 1 ? 's' : ''}`;
    }
  };

  const isUserSubscribedToPlan = (plan: Plan): boolean => {
    if (!currentSubscription) {
      console.log('No current subscription');
      return false;
    }
    
    console.log('Checking subscription:', {
      currentSubscription,
      planName: plan.name,
      currentPlanName: currentSubscription.planName,
      status: currentSubscription.status,
      isMatchingPlan: currentSubscription.planName === plan.name,
      isActive: currentSubscription.status === 'Active' || currentSubscription.status === 1
    });
    
    // Check if user has an active subscription
    const isActive = currentSubscription.status === 'Active' || 
                     currentSubscription.status === 1;
    
    // Check if plan names match (case-insensitive comparison)
    const currentPlanName = (currentSubscription.planName || '').toLowerCase().trim();
    const targetPlanName = (plan.name || '').toLowerCase().trim();
    
    const isMatchingPlan = currentPlanName === targetPlanName;
    
    const isSubscribed = isMatchingPlan && isActive;
           
    console.log('Is subscribed:', isSubscribed, {
      currentPlanName,
      targetPlanName,
      isMatchingPlan,
      isActive
    });
    return isSubscribed;
  };

  const canSubscribe = (plan: Plan) => {
    const result = isAuthenticated && !isUserSubscribedToPlan(plan);
    console.log('canSubscribe result for plan', plan.name, ':', result, {
      isAuthenticated,
      isUserSubscribedToPlan: isUserSubscribedToPlan(plan)
    });
    return result;
  };

  const getSubscriptionButtonText = (plan: Plan): string => {
    if (!isAuthenticated) {
      return 'Login to Subscribe';
    }
    if (isUserSubscribedToPlan(plan)) {
      return 'Currently Subscribed';
    }
    return 'Subscribe Now';
  };

  const getSubscriptionButtonVariant = (plan: Plan): string => {
    if (isUserSubscribedToPlan(plan)) {
      return 'secondary';
    }
    return 'primary';
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading subscription plans...</p>
      </Container>
    );
  }

  return (
    <div className="plans-page">
      <Container className="py-5">
        <Row className="mb-5">
          <Col lg={10} className="mx-auto text-center">
            <h1 className="display-4 fw-bold mb-3 text-white">Subscription Plans</h1>
            <p className="lead text-white-50">
              Unlock premium features and enhance your travel experience with VietGo
            </p>
          </Col>
        </Row>

        {error && (
          <Row className="mb-4">
            <Col lg={10} className="mx-auto">
              <Alert variant="danger" dismissible onClose={() => setError(null)}>
                {error}
              </Alert>
            </Col>
          </Row>
        )}

        {plans.length === 1 ? (
          // Single Plan Enhanced Layout
          <div className="single-plan-enhanced">
            {plans.map((plan) => (
              <div key={plan.id}>
                {/* Featured Badge */}
                <Row className="mb-4">
                  <Col className="text-center">
                    <span className="badge bg-primary text-white rounded-pill px-4 py-2" style={{ fontSize: '1.1rem' }}>
                      <Crown size={20} className="me-2" style={{ verticalAlign: 'middle' }} />
                      Featured Plan
                    </span>
                  </Col>
                </Row>

                {/* Main Card */}
                <Row className="justify-content-center">
                  <Col lg={10} xl={8}>
                    <Card className="shadow-lg border-0 overflow-hidden">
                      <div className="card-header bg-primary text-white py-4">
                        <Row className="align-items-center">
                          <Col md={8} className="d-flex align-items-center">
                            <div className="me-4">
                              {React.cloneElement(getPlanIcon(plan.name), {
                                size: 48,
                                className: 'text-white'
                              })}
                            </div>
                            <div className="flex-grow-1">
                              <h2 className="h3 mb-2 fw-bold">{plan.name}</h2>
                              {plan.description && (
                                <p className="mb-0 text-white-50 fs-6">{plan.description}</p>
                              )}
                            </div>
                          </Col>
                          <Col md={4} className="text-md-end text-center text-md-start mt-3 mt-md-0">
                            <div className="display-4 fw-bold lh-1">{formatPrice(plan.price)}</div>
                            <div className="text-white-50 fs-6">per {formatDuration(plan.billingCycleInMonths)}</div>
                          </Col>
                        </Row>
                      </div>

                      <Card.Body className="p-5">
                        <h5 className="fw-bold mb-4">
                          <Star size={20} className="text-primary me-2" />
                          Everything That Is Included In This Plan !
                        </h5>

                        <Row className="g-4">
                          <Col md={6}>
                            <ul className="list-unstyled mb-0">
                              <li className="mb-3 d-flex align-items-center">
                                <Check size={20} className="text-success me-3 flex-shrink-0" />
                                <span className="fw-medium">Premium Travel Features</span>
                              </li>
                              <li className="mb-3 d-flex align-items-center">
                                <Check size={20} className="text-success me-3 flex-shrink-0" />
                                <span className="fw-medium">Priority Customer Support</span>
                              </li>
                              <li className="mb-3 d-flex align-items-center">
                                <Check size={20} className="text-success me-3 flex-shrink-0" />
                                <span className="fw-medium">Account's Special Effects</span>
                              </li>
                            </ul>
                          </Col>
                          <Col md={6}>
                            <ul className="list-unstyled mb-0">
                              <li className="mb-3 d-flex align-items-center">
                                <Check size={20} className="text-success me-3 flex-shrink-0" />
                                <span className="fw-medium">Travel Recommendations</span>
                              </li>
                              <li className="mb-3 d-flex align-items-center">
                                <Check size={20} className="text-success me-3 flex-shrink-0" />
                                <span className="fw-medium">Offline Maps & Guides</span>
                              </li>
                              <li className="mb-3 d-flex align-items-center">
                                <Check size={20} className="text-success me-3 flex-shrink-0" />
                                <span className="fw-medium">24/7 Travel Assistance</span>
                              </li>
                            </ul>
                          </Col>
                        </Row>

                        <div className="border-top pt-4 mt-4">
                          <Row className="align-items-center g-3">
                            <Col md={7} className="order-2 order-md-1">
                              <p className="text-muted mb-0 small">
                                <i className="fas fa-shield-alt me-2"></i>
                                Secure payment processing through PayOS
                              </p>
                            </Col>
                            <Col md={5} className="order-1 order-md-2">
                              {!canSubscribe(plan) ? (
                                <Button 
                                  variant={getSubscriptionButtonVariant(plan)}
                                  size="lg" 
                                  className="w-100"
                                  disabled
                                >
                                  {getSubscriptionButtonText(plan)}
                                </Button>
                              ) : (
                                <Button
                                  variant="primary"
                                  size="lg"
                                  className="w-100"
                                  onClick={() => handleSubscribe(plan)}
                                  disabled={processingPlanId === plan.id}
                                >
                                  {processingPlanId === plan.id ? (
                                    <>
                                      <Spinner animation="border" size="sm" className="me-2" />
                                      Processing...
                                    </>
                                  ) : (
                                    <>
                                      <Crown size={20} className="me-2" />
                                      Subscribe Now
                                    </>
                                  )}
                                </Button>
                              )}
                            </Col>
                          </Row>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                {/* Trust Indicators */}
                <Row className="mt-5">
                  <Col lg={10} xl={8} className="mx-auto">
                    <Row className="text-center">
                      <Col md={4} className="mb-3 mb-md-0">
                        <div className="p-3">
                          <Zap size={32} className="text-primary mb-2" />
                          <h6 className="fw-bold text-white">Instant Access</h6>
                          <p className="text-white-50 small mb-0">Start using premium features immediately</p>
                        </div>
                      </Col>
                      <Col md={4} className="mb-3 mb-md-0">
                        <div className="p-3">
                          <Check size={32} className="text-success mb-2" />
                          <h6 className="fw-bold text-white">Secure Payment</h6>
                          <p className="text-white-50 small mb-0">Protected by PayOS encryption</p>
                        </div>
                      </Col>
                      <Col md={4}>
                        <div className="p-3">
                          <Star size={32} className="text-warning mb-2" />
                          <h6 className="fw-bold text-white">Premium Support</h6>
                          <p className="text-white-50 small mb-0">24/7 dedicated customer service</p>
                        </div>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </div>
            ))}
          </div>
        ) : (
          // Multiple Plans Grid Layout
          <Row>
            {plans.map((plan) => (
              <Col key={plan.id} xl={3} lg={4} md={6} className="mb-4">
                <Card className="h-100 shadow-sm border-0">
                  <Card.Body className="d-flex flex-column p-4">
                    <div className="text-center mb-4">
                      {getPlanIcon(plan.name)}
                      <h4 className="fw-bold mt-3 mb-2">{plan.name}</h4>
                      {plan.description && (
                        <p className="text-muted mb-3">{plan.description}</p>
                      )}
                      <div className="mb-3">
                        <span className="h2 fw-bold text-primary">
                          {formatPrice(plan.price)}
                        </span>
                        <span className="text-muted">/{formatDuration(plan.billingCycleInMonths)}</span>
                      </div>
                    </div>

                    <div className="flex-grow-1">
                      <h6 className="fw-bold mb-3">What's Included:</h6>
                      <ul className="list-unstyled">
                        <li className="mb-2 d-flex align-items-start">
                          <Check size={20} className="text-success me-2 flex-shrink-0" style={{ marginTop: '2px' }} />
                          <span>Access to premium travel features</span>
                        </li>
                        <li className="mb-2 d-flex align-items-start">
                          <Check size={20} className="text-success me-2 flex-shrink-0" style={{ marginTop: '2px' }} />
                          <span>Priority customer support</span>
                        </li>
                        <li className="mb-2 d-flex align-items-start">
                          <Check size={20} className="text-success me-2 flex-shrink-0" style={{ marginTop: '2px' }} />
                          <span>Enhanced booking capabilities</span>
                        </li>
                        <li className="mb-2 d-flex align-items-start">
                          <Check size={20} className="text-success me-2 flex-shrink-0" style={{ marginTop: '2px' }} />
                          <span>Exclusive travel recommendations</span>
                        </li>
                      </ul>
                    </div>

                    <div className="mt-4">
                      {!canSubscribe(plan) ? (
                        <Button 
                          variant={getSubscriptionButtonVariant(plan)}
                          size="lg" 
                          className="w-100" 
                          disabled
                        >
                          {getSubscriptionButtonText(plan)}
                        </Button>
                      ) : (
                        <Button
                          variant="primary"
                          size="lg"
                          className="w-100"
                          onClick={() => handleSubscribe(plan)}
                          disabled={processingPlanId === plan.id}
                        >
                          {processingPlanId === plan.id ? (
                            <>
                              <Spinner animation="border" size="sm" className="me-2" />
                              Processing...
                            </>
                          ) : (
                            'Subscribe Now'
                          )}
                        </Button>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        {plans.length === 0 && !loading && (
          <Row>
            <Col lg={10} className="mx-auto text-center">
              <Alert variant="info">
                <h5>No Plans Available</h5>
                <p>There are currently no subscription plans available. Please check back later.</p>
              </Alert>
            </Col>
          </Row>
        )}

        {/* Confirmation Modal */}
        <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Subscription</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedPlan && (
              <div>
                <h5>Subscribe to {selectedPlan.name}</h5>
                {selectedPlan.description && (
                  <p className="text-muted">{selectedPlan.description}</p>
                )}
                <div className="border rounded p-3 mb-3">
                  <div className="d-flex justify-content-between mb-2">
                    <span>Plan:</span>
                    <strong>{selectedPlan.name}</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Duration:</span>
                    <strong>{formatDuration(selectedPlan.billingCycleInMonths)}</strong>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Price:</span>
                    <strong className="text-primary">{formatPrice(selectedPlan.price)}</strong>
                  </div>
                </div>
                <p className="small text-muted">
                  You will be redirected to PayOS to complete your payment securely.
                </p>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={confirmSubscription}>
              Proceed to Payment
            </Button>
          </Modal.Footer>
        </Modal>

        {/* QR Payment Modal */}
        <QRPaymentModal
          show={showQRModal}
          onHide={() => {
            setShowQRModal(false);
            setPaymentResult(null);
            setProcessingPlanId(null);
          }}
          paymentResult={paymentResult}
          selectedPlan={selectedPlan}
        />
      </Container>
    </div>
  );
};

export default PlansPage;