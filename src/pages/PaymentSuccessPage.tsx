import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Alert, Card, Spinner } from 'react-bootstrap';
import { CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { subscriptionAPI } from '../services/api';
import type { Subscription } from '../types';

const PaymentSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const orderCode = searchParams.get('orderCode');
  const status = searchParams.get('status');

  useEffect(() => {
    // Fetch updated subscription after payment
    const fetchSubscription = async () => {
      try {
        const data = await subscriptionAPI.getMySubscription();
        setSubscription(data);
      } catch (err) {
        console.error('Error fetching subscription:', err);
        setError('Could not verify subscription status');
      } finally {
        setLoading(false);
      }
    };

    if (status === 'PAID') {
      fetchSubscription();
    } else {
      setLoading(false);
    }
  }, [status]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Verifying payment status...</p>
      </Container>
    );
  }

  const isSuccess = status === 'PAID';

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col lg={8} xl={6}>
          <Card className="shadow-sm">
            <Card.Body className="p-5 text-center">
              {isSuccess ? (
                <>
                  <CheckCircle size={80} className="text-success mb-4" />
                  <h2 className="mb-3 text-success">Payment Successful!</h2>
                  <p className="text-muted mb-4">
                    Thank you for your subscription. Your payment has been processed successfully.
                  </p>
                  
                  {orderCode && (
                    <Alert variant="info" className="mb-4">
                      <strong>Order Code:</strong> {orderCode}
                    </Alert>
                  )}

                  {subscription && (
                    <Card className="border-success mb-4">
                      <Card.Header className="bg-success text-white">
                        <h5 className="mb-0">Subscription Details</h5>
                      </Card.Header>
                      <Card.Body>
                        <Row>
                          <Col sm={6} className="mb-3">
                            <strong>Plan:</strong>
                            <div>{subscription.plan.name}</div>
                          </Col>
                          <Col sm={6} className="mb-3">
                            <strong>Price:</strong>
                            <div>{formatPrice(subscription.plan.price)}</div>
                          </Col>
                          <Col sm={6} className="mb-3">
                            <strong>Status:</strong>
                            <div>
                              <span className="badge bg-success">{subscription.status}</span>
                            </div>
                          </Col>
                          <Col sm={6} className="mb-3">
                            <strong>Valid Until:</strong>
                            <div>
                              {subscription.currentPeriodEndDate ? formatDate(subscription.currentPeriodEndDate) : 'N/A'}
                            </div>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  )}

                  {error && (
                    <Alert variant="warning" className="mb-4">
                      {error}
                    </Alert>
                  )}

                  <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
                    <Link to="/dashboard" className="btn btn-primary btn-lg">
                      <ArrowRight size={20} className="me-2" />
                      Go to Dashboard
                    </Link>
                    <Link to="/plans" className="btn btn-outline-secondary btn-lg">
                      View Plans
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <XCircle size={80} className="text-danger mb-4" />
                  <h2 className="mb-3 text-danger">Payment Failed</h2>
                  <p className="text-muted mb-4">
                    Unfortunately, your payment could not be processed. Please try again or contact support.
                  </p>
                  
                  {orderCode && (
                    <Alert variant="warning" className="mb-4">
                      <strong>Order Code:</strong> {orderCode}
                    </Alert>
                  )}

                  <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
                    <Link to="/plans" className="btn btn-primary btn-lg">
                      Try Again
                    </Link>
                    <Link to="/" className="btn btn-outline-secondary btn-lg">
                      Back to Home
                    </Link>
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PaymentSuccessPage;