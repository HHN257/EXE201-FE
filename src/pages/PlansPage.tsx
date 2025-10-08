import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Modal, Spinner } from 'react-bootstrap';
import { Check, Crown, Zap, Star } from 'lucide-react';
import { planAPI, subscriptionAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import QRPaymentModal from '../components/QRPaymentModal';
import type { Plan, PaymentResult } from '../types';
import './PlansPage.css';

const PlansPage: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingPlanId, setProcessingPlanId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const data = await planAPI.getAllPlans();
      setPlans(data);
    } catch (error) {
      console.error('Error fetching plans:', error);
      setError('Failed to load plans. Please try again.');
    } finally {
      setLoading(false);
    }
  };



  const handleSubscribe = (plan: Plan) => {
    if (!isAuthenticated) {
      setError('Please log in to subscribe to a plan.');
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

      // Set payment result and show QR modal
      setPaymentResult(result);
      setShowQRModal(true);
      
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

  const canSubscribe = () => {
    return isAuthenticated;
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
          <h1 className="display-4 fw-bold mb-3">Subscription Plans</h1>
          <p className="lead text-muted">
            Unlock premium features and enhance your travel experience with VietGo
          </p>
        </Col>
      </Row>



      {/* Available Plans Section */}
      <Row className="mb-4">
        <Col lg={10} className="mx-auto">
          <h2 className="h4 mb-4">
            <Star size={24} className="me-2 text-primary" />
            Available Plans
          </h2>
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

      <Row className="g-4 justify-content-center">
        {plans.map((plan) => (
          <Col key={plan.id} xl={3} lg={4} md={6} className="d-flex">
            <Card className="h-100 position-relative plan-card">
              
              <Card.Body className="d-flex flex-column p-4">
                <div className="text-center mb-4">
                  {getPlanIcon(plan.name)}
                  <h4 className="fw-bold mt-3 mb-2">{plan.name}</h4>
                  {plan.description && (
                    <p className="text-muted mb-3">{plan.description}</p>
                  )}
                  <div className="mb-3">
                    <span className="display-5 fw-bold text-primary">
                      {formatPrice(plan.price)}
                    </span>
                    <span className="text-muted">/{formatDuration(plan.billingCycleInMonths)}</span>
                  </div>
                </div>

                <div className="flex-grow-1">
                  <h6 className="fw-bold mb-3">Plan Benefits:</h6>
                  <ul className="list-unstyled">
                    <li className="mb-2 d-flex align-items-start">
                      <Check size={20} className="text-success me-2 flex-shrink-0 mt-1" />
                      <span>Access to premium travel features</span>
                    </li>
                    <li className="mb-2 d-flex align-items-start">
                      <Check size={20} className="text-success me-2 flex-shrink-0 mt-1" />
                      <span>Priority customer support</span>
                    </li>
                    <li className="mb-2 d-flex align-items-start">
                      <Check size={20} className="text-success me-2 flex-shrink-0 mt-1" />
                      <span>Enhanced booking capabilities</span>
                    </li>
                    <li className="mb-2 d-flex align-items-start">
                      <Check size={20} className="text-success me-2 flex-shrink-0 mt-1" />
                      <span>Exclusive travel recommendations</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-4">
                  {!canSubscribe() ? (
                    <Button variant="secondary" size="lg" className="w-100" disabled>
                      {!isAuthenticated ? 'Login Required' : 'Already Subscribed'}
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