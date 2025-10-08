import React, { useState, useEffect } from 'react';
import { Card, Alert, Badge, Spinner, Row, Col } from 'react-bootstrap';
import { Crown, Calendar, CreditCard, ArrowUpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { subscriptionAPI } from '../services/api';
import type { Subscription } from '../types';

const SubscriptionCard: React.FC = () => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const data = await subscriptionAPI.getMySubscription();
      setSubscription(data);
      setError(null);
    } catch {
      // No subscription found, which is normal
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusVariant = (status: string | number) => {
    const statusString = typeof status === 'number' ? 
      (status === 1 ? 'Active' : status === 0 ? 'Pending' : status === 2 ? 'Canceled' : 'Expired') : 
      status;
      
    switch (statusString) {
      case 'Active':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'Expired':
        return 'secondary';
      case 'Canceled':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <Card>
        <Card.Body className="text-center">
          <Spinner animation="border" size="sm" />
          <p className="mt-2 mb-0">Loading subscription...</p>
        </Card.Body>
      </Card>
    );
  }

  if (!subscription) {
    return (
      <Card className="border-primary">
        <Card.Header className="bg-primary text-white">
          <h5 className="mb-0 d-flex align-items-center">
            <Crown size={20} className="me-2" />
            Subscription
          </h5>
        </Card.Header>
        <Card.Body className="text-center">
          <div className="mb-3">
            <CreditCard size={48} className="text-muted mb-3" />
            <h6>No Active Subscription</h6>
            <p className="text-muted mb-0">
              Upgrade to premium to unlock exclusive features and enhance your travel experience.
            </p>
          </div>
          <Link to="/plans" className="btn btn-primary">
            <ArrowUpCircle size={16} className="me-2" />
            View Plans
          </Link>
        </Card.Body>
      </Card>
    );
  }

  const daysRemaining = subscription.currentPeriodEndDate ? getDaysRemaining(subscription.currentPeriodEndDate) : null;
  const isExpiringSoon = daysRemaining !== null && daysRemaining <= 7 && daysRemaining > 0;
  const isExpired = daysRemaining !== null && daysRemaining <= 0;

  return (
    <Card className="border-success">
      <Card.Header className="bg-success text-white">
        <h5 className="mb-0 d-flex align-items-center">
          <Crown size={20} className="me-2" />
          My Subscription
        </h5>
      </Card.Header>
      <Card.Body>
        {error && (
          <Alert variant="danger" className="mb-3">
            {error}
          </Alert>
        )}

        <Row className="mb-3">
          <Col>
            <h6 className="text-primary mb-2">{subscription.planName || subscription.plan?.name || 'Active Plan'}</h6>
            {subscription.plan?.description && (
              <p className="text-muted small mb-0">{subscription.plan.description}</p>
            )}
          </Col>
        </Row>

        <Row className="mb-3">
          <Col sm={6}>
            <strong>Status:</strong>
            <div>
              <Badge bg={getStatusVariant(subscription.status)} className="ms-2">
                {subscription.status}
              </Badge>
            </div>
          </Col>
          <Col sm={6}>
            <strong>Price:</strong>
            <div className="text-success fw-bold">
              {subscription.plan?.price ? formatPrice(subscription.plan.price) : 'N/A'}
            </div>
          </Col>
        </Row>

        {subscription.startedDate && (
          <Row className="mb-3">
            <Col sm={6}>
              <strong>Start Date:</strong>
              <div className="d-flex align-items-center">
                <Calendar size={16} className="me-2 text-muted" />
                {formatDate(subscription.startedDate)}
              </div>
            </Col>
            {subscription.currentPeriodEndDate && (
              <Col sm={6}>
                <strong>End Date:</strong>
                <div className="d-flex align-items-center">
                  <Calendar size={16} className="me-2 text-muted" />
                  {formatDate(subscription.currentPeriodEndDate)}
                </div>
              </Col>
            )}
          </Row>
        )}

        {subscription.status === 'Canceled' && subscription.canceledDate && (
          <Row className="mb-3">
            <Col>
              <strong>Canceled Date:</strong>
              <div className="d-flex align-items-center">
                <Calendar size={16} className="me-2 text-muted" />
                {formatDate(subscription.canceledDate)}
              </div>
            </Col>
          </Row>
        )}

        {daysRemaining !== null && subscription.status === 'Active' && (
          <Alert 
            variant={isExpired ? 'danger' : isExpiringSoon ? 'warning' : 'info'} 
            className="mb-3"
          >
            {isExpired ? (
              <strong>Your subscription has expired.</strong>
            ) : isExpiringSoon ? (
              <strong>Your subscription expires in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}!</strong>
            ) : (
              <strong>{daysRemaining} day{daysRemaining !== 1 ? 's' : ''} remaining</strong>
            )}
          </Alert>
        )}

        <div className="mb-3">
          <strong>Benefits:</strong>
          <ul className="list-unstyled mt-2 mb-0">
            <li className="small text-muted">• Premium travel features</li>
            <li className="small text-muted">• Priority customer support</li>
            <li className="small text-muted">• Enhanced booking capabilities</li>
          </ul>
        </div>

        <div className="d-flex gap-2">
          <Link to="/plans" className="btn btn-outline-primary btn-sm">
            {subscription.status === 'Active' ? 'Upgrade Plan' : 'View Plans'}
          </Link>
        </div>
      </Card.Body>
    </Card>
  );
};

export default SubscriptionCard;