import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert, Table } from 'react-bootstrap';
import { Calendar, Clock, MapPin, User, DollarSign } from 'lucide-react';
import { tourGuideBookingService } from '../services/api';
import type { TourGuideBookingDto } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import BookingDetailsModal from '../components/BookingDetailsModal';

const GuideBookingsPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [bookings, setBookings] = useState<TourGuideBookingDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<TourGuideBookingDto | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const loadTourGuideBookings = useCallback(async () => {
    try {
      setLoading(true);
      if (!user?.id) {
        throw new Error('User ID not found');
      }
      // Use the tour guide's user ID to get their bookings
      const bookingsData = await tourGuideBookingService.getByTourGuide(user.id);
      setBookings(bookingsData);
    } catch (err) {
      console.error('Error loading tour guide bookings:', err);
      setError('Failed to load bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadTourGuideBookings();
    }
  }, [isAuthenticated, user?.id, loadTourGuideBookings]);

  const handleViewDetails = (booking: TourGuideBookingDto) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailsModal(false);
    setSelectedBooking(null);
  };

  const handleStatusUpdate = async (bookingId: number, newStatus: string) => {
    try {
      await tourGuideBookingService.updateStatus(bookingId, newStatus);
      // Reload bookings to get updated data
      await loadTourGuideBookings();
    } catch (error) {
      setError(`Failed to update booking status. Please try again.`);
      console.error('Error updating booking status:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Badge bg="warning" text="dark">Pending</Badge>;
      case 'confirmed':
        return <Badge bg="success">Confirmed</Badge>;
      case 'completed':
        return <Badge bg="info">Completed</Badge>;
      case 'cancelled':
        return <Badge bg="danger">Cancelled</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const getStatusActions = (booking: TourGuideBookingDto) => {
    const status = booking.status.toLowerCase();
    
    if (status === 'pending') {
      return (
        <div className="d-flex gap-1">
          <Button 
            variant="success" 
            size="sm"
            onClick={() => handleStatusUpdate(booking.id, 'Confirmed')}
          >
            Accept
          </Button>
          <Button 
            variant="danger" 
            size="sm"
            onClick={() => handleStatusUpdate(booking.id, 'Cancelled')}
          >
            Decline
          </Button>
        </div>
      );
    }
    
    if (status === 'confirmed') {
      return (
        <Button 
          variant="info" 
          size="sm"
          onClick={() => handleStatusUpdate(booking.id, 'Completed')}
        >
          Mark Complete
        </Button>
      );
    }
    
    return null;
  };

  const formatPrice = (amount: number, currency?: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const hours = Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return `${Math.round(hours)} hour${hours !== 1 ? 's' : ''}`;
  };

  if (!isAuthenticated) {
    return (
      <Container className="py-5">
        <Alert variant="warning">
          Please log in to view your tour guide bookings.
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
        <p className="mt-2 text-muted">Loading your tour guide bookings...</p>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold text-primary mb-3">My Tour Guide Bookings</h1>
        <p className="lead text-muted">
          Manage bookings from clients and track your tour guide schedule
        </p>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {bookings.length === 0 ? (
        <Card className="text-center py-5">
          <Card.Body>
            <Calendar size={48} className="text-muted mb-3" />
            <h5>No bookings found</h5>
            <p className="text-muted">You haven't received any tour guide bookings yet.</p>
            <Button variant="primary" href="/guide/dashboard">
              Go to Dashboard
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <>
          {/* Desktop View */}
          <div className="d-none d-lg-block">
            <Card className="shadow-sm">
              <Card.Body className="p-0">
                <Table responsive hover className="mb-0">
                  <thead className="table-dark">
                    <tr>
                      <th>Client</th>
                      <th>Date & Time</th>
                      <th>Duration</th>
                      <th>Location</th>
                      <th>Total Price</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <User size={20} className="text-muted me-2" />
                            <div>
                              <div className="fw-semibold">{booking.userName}</div>
                              <small className="text-muted">Client</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div>
                            <div className="fw-semibold">
                              {formatDateTime(booking.startDate)}
                            </div>
                            <small className="text-muted">
                              to {formatDateTime(booking.endDate)}
                            </small>
                          </div>
                        </td>
                        <td>
                          <Badge bg="light" text="dark">
                            {calculateDuration(booking.startDate, booking.endDate)}
                          </Badge>
                        </td>
                        <td>
                          <div className="d-flex align-items-center text-muted">
                            <MapPin size={16} className="me-1" />
                            {booking.location || 'Not specified'}
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <DollarSign size={16} className="text-success me-1" />
                            <strong>{formatPrice(booking.totalPrice, booking.currency)}</strong>
                          </div>
                        </td>
                        <td>{getStatusBadge(booking.status)}</td>
                        <td>
                          <div className="d-flex gap-1">
                            <Button 
                              variant="outline-primary" 
                              size="sm"
                              onClick={() => handleViewDetails(booking)}
                            >
                              View Details
                            </Button>
                            {getStatusActions(booking)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </div>

          {/* Mobile View */}
          <div className="d-lg-none">
            <Row className="g-3">
              {bookings.map((booking) => (
                <Col key={booking.id} xs={12}>
                  <Card className="shadow-sm">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div>
                          <h6 className="fw-bold mb-1">{booking.userName}</h6>
                          <div className="d-flex align-items-center text-muted mb-1">
                            <User size={14} className="me-1" />
                            <small>Client</small>
                          </div>
                          <div className="d-flex align-items-center text-muted">
                            <MapPin size={14} className="me-1" />
                            <small>{booking.location || 'Location not specified'}</small>
                          </div>
                        </div>
                        {getStatusBadge(booking.status)}
                      </div>

                      <div className="mb-3">
                        <div className="d-flex align-items-center text-muted mb-1">
                          <Calendar size={14} className="me-2" />
                          <small>Start: {formatDateTime(booking.startDate)}</small>
                        </div>
                        <div className="d-flex align-items-center text-muted mb-1">
                          <Clock size={14} className="me-2" />
                          <small>End: {formatDateTime(booking.endDate)}</small>
                        </div>
                        <div className="d-flex align-items-center text-muted">
                          <DollarSign size={14} className="me-2" />
                          <small>Total: {formatPrice(booking.totalPrice, booking.currency)}</small>
                        </div>
                      </div>

                      {booking.notes && (
                        <div className="mb-3">
                          <small className="text-muted">Client Notes:</small>
                          <p className="mb-0 small">{booking.notes}</p>
                        </div>
                      )}

                      <div className="d-flex gap-2 mb-2">
                        <Button 
                          variant="outline-primary" 
                          size="sm" 
                          className="flex-grow-1"
                          onClick={() => handleViewDetails(booking)}
                        >
                          View Details
                        </Button>
                      </div>

                      {/* Status Actions for Mobile */}
                      {getStatusActions(booking) && (
                        <div className="d-flex gap-2">
                          {getStatusActions(booking)}
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </>
      )}

      {/* Summary Statistics */}
      {bookings.length > 0 && (
        <Row className="mt-5">
          <Col md={3}>
            <Card className="text-center h-100">
              <Card.Body>
                <h4 className="text-primary">{bookings.length}</h4>
                <p className="text-muted mb-0">Total Bookings</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center h-100">
              <Card.Body>
                <h4 className="text-warning">
                  {bookings.filter(b => b.status.toLowerCase() === 'pending').length}
                </h4>
                <p className="text-muted mb-0">Pending</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center h-100">
              <Card.Body>
                <h4 className="text-success">
                  {bookings.filter(b => b.status.toLowerCase() === 'confirmed').length}
                </h4>
                <p className="text-muted mb-0">Confirmed</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center h-100">
              <Card.Body>
                <h4 className="text-info">
                  {formatPrice(
                    bookings
                      .filter(b => ['confirmed', 'completed'].includes(b.status.toLowerCase()))
                      .reduce((sum, b) => sum + b.totalPrice, 0),
                    bookings[0]?.currency
                  )}
                </h4>
                <p className="text-muted mb-0">Earnings</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Booking Details Modal */}
      <BookingDetailsModal
        show={showDetailsModal}
        onHide={handleCloseModal}
        booking={selectedBooking}
        onBookingCancelled={() => loadTourGuideBookings()} // Reload data when booking is cancelled
      />
    </Container>
  );
};

export default GuideBookingsPage;