import React, { useState } from 'react';
import { Modal, Button, Row, Col, Badge, Card, Alert, Spinner } from 'react-bootstrap';
import { Calendar, Clock, MapPin, User, DollarSign, FileText, Hash, CalendarCheck, CalendarX, AlertTriangle } from 'lucide-react';
import { tourGuideBookingService } from '../services/api';
import type { TourGuideBookingDto } from '../services/api';

interface BookingDetailsModalProps {
  show: boolean;
  onHide: () => void;
  booking: TourGuideBookingDto | null;
  onBookingCancelled?: (bookingId: number) => void;
}

const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({
  show,
  onHide,
  booking,
  onBookingCancelled
}) => {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  if (!booking) {
    return null;
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      const remainingHours = diffHours % 24;
      return remainingHours > 0 ? `${diffDays}d ${remainingHours}h` : `${diffDays} day${diffDays > 1 ? 's' : ''}`;
    }
    return `${diffHours} hour${diffHours > 1 ? 's' : ''}`;
  };

  const formatPrice = (amount: number, currency?: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Badge bg="warning" text="dark" className="px-3 py-2">Pending</Badge>;
      case 'confirmed':
        return <Badge bg="success" className="px-3 py-2">Confirmed</Badge>;
      case 'completed':
        return <Badge bg="info" className="px-3 py-2">Completed</Badge>;
      case 'cancelled':
        return <Badge bg="danger" className="px-3 py-2">Cancelled</Badge>;
      default:
        return <Badge bg="secondary" className="px-3 py-2">{status}</Badge>;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'warning';
      case 'confirmed':
        return 'success';
      case 'completed':
        return 'info';
      case 'cancelled':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const handleCancelClick = () => {
    setShowCancelConfirm(true);
    setCancelError(null);
  };

  const handleCancelConfirm = async () => {
    try {
      setIsCancelling(true);
      setCancelError(null);
      
      await tourGuideBookingService.cancel(booking.id);
      
      // Call the parent callback to remove the booking from the list
      if (onBookingCancelled) {
        onBookingCancelled(booking.id);
      }
      
      // Close the confirmation dialog and the main modal
      setShowCancelConfirm(false);
      onHide();
    } catch (error) {
      setCancelError('Failed to cancel booking. Please try again.');
      console.error('Error cancelling booking:', error);
    } finally {
      setIsCancelling(false);
    }
  };

  const handleCancelDialogClose = () => {
    setShowCancelConfirm(false);
    setCancelError(null);
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className={`bg-${getStatusColor(booking.status)} text-white`}>
        <Modal.Title className="d-flex align-items-center">
          <Calendar size={24} className="me-2" />
          Booking Details
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-4">
        {/* Status and ID */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h6 className="text-muted mb-1">Booking ID</h6>
            <div className="d-flex align-items-center">
              <Hash size={16} className="text-muted me-1" />
              <span className="fw-bold">#{booking.id}</span>
            </div>
          </div>
          <div className="text-end">
            <h6 className="text-muted mb-1">Status</h6>
            {getStatusBadge(booking.status)}
          </div>
        </div>

        {/* Tour Guide Information */}
        <Card className="mb-4 border-0 bg-light">
          <Card.Body className="py-3">
            <h6 className="text-muted mb-2">Tour Guide</h6>
            <div className="d-flex align-items-center">
              <User size={20} className="text-primary me-2" />
              <span className="fw-bold fs-5">{booking.tourGuideName}</span>
            </div>
          </Card.Body>
        </Card>

        {/* Booking Details Grid */}
        <Row className="g-4">
          {/* Date & Time */}
          <Col md={6}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body>
                <h6 className="text-muted mb-3">
                  <Calendar size={16} className="me-2" />
                  Schedule
                </h6>
                <div className="mb-3">
                  <div className="d-flex align-items-center mb-1">
                    <CalendarCheck size={16} className="text-success me-2" />
                    <strong>Start:</strong>
                  </div>
                  <div className="ms-4 text-muted">
                    {formatDateTime(booking.startDate)}
                  </div>
                </div>
                <div>
                  <div className="d-flex align-items-center mb-1">
                    <CalendarX size={16} className="text-danger me-2" />
                    <strong>End:</strong>
                  </div>
                  <div className="ms-4 text-muted">
                    {formatDateTime(booking.endDate)}
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Duration & Location */}
          <Col md={6}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body>
                <h6 className="text-muted mb-3">
                  <Clock size={16} className="me-2" />
                  Duration & Location
                </h6>
                <div className="mb-3">
                  <strong>Duration:</strong>
                  <div className="text-muted ms-2">
                    {calculateDuration(booking.startDate, booking.endDate)}
                  </div>
                </div>
                <div>
                  <div className="d-flex align-items-center mb-1">
                    <MapPin size={16} className="text-primary me-2" />
                    <strong>Location:</strong>
                  </div>
                  <div className="ms-4 text-muted">
                    {booking.location || 'Not specified'}
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Pricing */}
          <Col md={6}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body>
                <h6 className="text-muted mb-3">
                  <DollarSign size={16} className="me-2" />
                  Pricing
                </h6>
                <div className="text-center">
                  <div className="display-6 fw-bold text-success">
                    {formatPrice(booking.totalPrice, booking.currency)}
                  </div>
                  <small className="text-muted">Total Amount</small>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Booking Metadata */}
          <Col md={6}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body>
                <h6 className="text-muted mb-3">
                  <Hash size={16} className="me-2" />
                  Booking Info
                </h6>
                <div className="mb-2">
                  <strong>Created:</strong>
                  <div className="text-muted ms-2">
                    {formatDate(booking.createdAt)}
                  </div>
                </div>
                {booking.updatedAt && (
                  <div className="mb-2">
                    <strong>Last Updated:</strong>
                    <div className="text-muted ms-2">
                      {formatDate(booking.updatedAt)}
                    </div>
                  </div>
                )}
                <div>
                  <strong>Booked by:</strong>
                  <div className="text-muted ms-2">
                    {booking.userName}
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Notes */}
          {booking.notes && (
            <Col xs={12}>
              <Card className="border-0 shadow-sm">
                <Card.Body>
                  <h6 className="text-muted mb-3">
                    <FileText size={16} className="me-2" />
                    Special Notes
                  </h6>
                  <div className="bg-light p-3 rounded">
                    <p className="mb-0 text-muted fst-italic">
                      "{booking.notes}"
                    </p>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          )}
        </Row>
      </Modal.Body>

      <Modal.Footer className="bg-light">
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        {booking.status.toLowerCase() === 'pending' && (
          <Button variant="outline-danger" className="ms-2" onClick={handleCancelClick}>
            Cancel Booking
          </Button>
        )}
        {(booking.status.toLowerCase() === 'confirmed' || booking.status.toLowerCase() === 'completed') && (
          <Button variant="primary" className="ms-2">
            Contact Tour Guide
          </Button>
        )}
      </Modal.Footer>

      {/* Cancel Confirmation Modal */}
      <Modal show={showCancelConfirm} onHide={handleCancelDialogClose} centered>
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title className="d-flex align-items-center">
            <AlertTriangle size={24} className="me-2" />
            Cancel Booking
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body className="p-4">
          {cancelError && (
            <Alert variant="danger" className="mb-3">
              {cancelError}
            </Alert>
          )}
          
          <div className="text-center">
            <AlertTriangle size={48} className="text-warning mb-3" />
            <h5 className="mb-3">Are you sure you want to cancel this booking?</h5>
            <p className="text-muted mb-3">
              This action cannot be undone. You will lose your reservation with <strong>{booking.tourGuideName}</strong> 
              scheduled for <strong>{formatDate(booking.startDate)}</strong>.
            </p>
            <div className="bg-light p-3 rounded mb-3">
              <small className="text-muted">Booking ID: #{booking.id}</small><br />
              <small className="text-muted">Total Amount: {formatPrice(booking.totalPrice, booking.currency)}</small>
            </div>
          </div>
        </Modal.Body>
        
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCancelDialogClose} disabled={isCancelling}>
            Keep Booking
          </Button>
          <Button 
            variant="danger" 
            onClick={handleCancelConfirm}
            disabled={isCancelling}
            className="d-flex align-items-center"
          >
            {isCancelling ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Cancelling...
              </>
            ) : (
              'Yes, Cancel Booking'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Modal>
  );
};

export default BookingDetailsModal;