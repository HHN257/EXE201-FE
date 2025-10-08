import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert, Table } from 'react-bootstrap';
import { Calendar, Clock, MapPin, User, DollarSign } from 'lucide-react';
import { tourGuideBookingService } from '../services/api';
import type { TourGuideBookingDto } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import BookingDetailsModal from '../components/BookingDetailsModal';

const BookingsPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [bookings, setBookings] = useState<TourGuideBookingDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<TourGuideBookingDto | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadBookings();
    }
  }, [isAuthenticated]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const bookingsData = await tourGuideBookingService.getAll();
      setBookings(bookingsData);
    } catch {
      setError('Failed to load bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (booking: TourGuideBookingDto) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailsModal(false);
    setSelectedBooking(null);
  };

  const handleBookingCancelled = (bookingId: number) => {
    // Remove the cancelled booking from the list
    setBookings(prevBookings => 
      prevBookings.filter(booking => booking.id !== bookingId)
    );
  };

  const handleQuickCancel = async (bookingId: number) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await tourGuideBookingService.cancel(bookingId);
        handleBookingCancelled(bookingId);
      } catch (error) {
        setError('Failed to cancel booking. Please try again.');
        console.error('Error cancelling booking:', error);
      }
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
          Please log in to view your bookings.
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
        <p className="mt-2 text-muted">Loading your bookings...</p>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold text-primary mb-3">My Bookings</h1>
        <p className="lead text-muted">
          Manage your tour guide bookings and view booking history
        </p>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {bookings.length === 0 ? (
        <Card className="text-center py-5">
          <Card.Body>
            <Calendar size={48} className="text-muted mb-3" />
            <h5>No bookings found</h5>
            <p className="text-muted">You haven't made any tour guide bookings yet.</p>
            <Button variant="primary" href="/tour-guides">
              Browse Tour Guides
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
                      <th>Tour Guide</th>
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
                            <strong>{booking.tourGuideName}</strong>
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
                            {booking.status.toLowerCase() === 'pending' && (
                              <Button 
                                variant="outline-danger" 
                                size="sm"
                                onClick={() => handleQuickCancel(booking.id)}
                              >
                                Cancel
                              </Button>
                            )}
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
                          <h6 className="fw-bold mb-1">{booking.tourGuideName}</h6>
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
                          <small className="text-muted">Notes:</small>
                          <p className="mb-0 small">{booking.notes}</p>
                        </div>
                      )}

                      <div className="d-flex gap-2">
                        <Button 
                          variant="outline-primary" 
                          size="sm" 
                          className="flex-grow-1"
                          onClick={() => handleViewDetails(booking)}
                        >
                          View Details
                        </Button>
                        {booking.status.toLowerCase() === 'pending' && (
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleQuickCancel(booking.id)}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
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
                <h4 className="text-info">
                  {formatPrice(
                    bookings.reduce((sum, b) => sum + b.totalPrice, 0),
                    bookings[0]?.currency
                  )}
                </h4>
                <p className="text-muted mb-0">Total Spent</p>
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
        onBookingCancelled={handleBookingCancelled}
      />
    </Container>
  );
};

export default BookingsPage;
