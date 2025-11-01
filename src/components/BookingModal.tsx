import React, { useState } from 'react';
import { Modal, Form, Button, Alert, Row, Col, Spinner } from 'react-bootstrap';
import { Calendar, Clock, MapPin, DollarSign, CheckCircle } from 'lucide-react';
import { tourGuideBookingService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import type { TourGuideDto, CreateTourGuideBookingDto } from '../services/api';
import type { BookingWithPaymentResponse } from '../types';
import BookingQRPaymentModal from './BookingQRPaymentModal';

interface BookingModalProps {
  show: boolean;
  onHide: () => void;
  tourGuide: TourGuideDto | null;
  onBookingSuccess?: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ show, onHide, tourGuide, onBookingSuccess }) => {
  const { showError, showSuccess } = useAuth();
  const [formData, setFormData] = useState<CreateTourGuideBookingDto>({
    tourGuideId: 0,
    startDate: '',
    endDate: '',
    notes: '',
    location: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [bookingResult, setBookingResult] = useState<BookingWithPaymentResponse | null>(null);

  React.useEffect(() => {
    if (tourGuide) {
      setFormData(prev => ({
        ...prev,
        tourGuideId: tourGuide.id
      }));
    }
  }, [tourGuide]);

  const handleModalClose = () => {
    setError(null);
    setSuccess(false);
    setBookingResult(null);
    setShowQRModal(false);
    onHide();
  };

  const calculateTotalPrice = () => {
    if (!formData.startDate || !formData.endDate || !tourGuide?.hourlyRate) {
      return 0;
    }

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const hours = Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60);
    
    return hours * tourGuide.hourlyRate;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      // Basic validation
      if (!formData.startDate || !formData.endDate || !formData.location) {
        const errorMessage = 'Please fill in all required fields.';
        setError(errorMessage);
        showError(errorMessage, 'Validation Error');
        return;
      }
      // Validate dates
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      const now = new Date();

      if (startDate <= now) {
        const errorMessage = 'Start date must be in the future';
        setError(errorMessage);
        showError(errorMessage, 'Invalid Date');
        return;
      }

      if (endDate <= startDate) {
        const errorMessage = 'End date must be after start date';
        setError(errorMessage);
        showError(errorMessage, 'Invalid Date Range');
        return;
      }

      const result = await tourGuideBookingService.create({
        ...formData,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });

      // Store booking result and show QR payment modal
      setBookingResult(result);
      setShowQRModal(true);
      
      // Show success message for booking creation
      const successMessage = `Booking initiated for ${tourGuide?.name}! Please complete the payment to confirm your booking.`;
      showSuccess(successMessage, 'Booking Created');
      
      // Reset form but keep modal open for payment
      setFormData({
        tourGuideId: tourGuide?.id || 0,
        startDate: '',
        endDate: '',
        notes: '',
        location: ''
      });
    } catch (err) {
      let errorMessage = 'Booking failed. Please try again.';
      
      // Handle different types of errors
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string }; status?: number } };
        
        // Check server message for availability issues first
        const serverMessage = axiosErr.response?.data?.message?.toLowerCase() || '';
        const isAvailabilityError = serverMessage.includes('not available') || 
                                  serverMessage.includes('unavailable') || 
                                  serverMessage.includes('already booked') ||
                                  serverMessage.includes('time slot') ||
                                  serverMessage.includes('schedule conflict') ||
                                  serverMessage.includes('booking conflict') ||
                                  serverMessage.includes('date conflict');
        
        if (isAvailabilityError) {
          errorMessage = 'Tour guide is not available for the selected dates. Please choose different dates or times.';
        } else if (axiosErr.response?.status === 409) {
          errorMessage = 'Tour guide is not available for the selected dates. Please choose different dates or times.';
        } else if (axiosErr.response?.status === 422) {
          errorMessage = 'Tour guide is not available for the selected dates. Please choose different dates or times.';
        } else if (axiosErr.response?.status === 400) {
          // For 400 errors, assume it's likely an availability issue unless we have a specific message
          if (axiosErr.response?.data?.message) {
            errorMessage = axiosErr.response.data.message;
          } else {
            errorMessage = 'Tour guide is not available for the selected dates. Please choose different dates or times.';
          }
        } else if (axiosErr.response?.data?.message) {
          errorMessage = axiosErr.response.data.message;
        }
      } else if (err instanceof Error) {
        const errorMsg = err.message.toLowerCase();
        if (errorMsg.includes('not available') || 
            errorMsg.includes('unavailable') || 
            errorMsg.includes('already booked')) {
          errorMessage = 'Tour guide is not available for the selected dates. Please choose different dates or times.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      showError(errorMessage, 'Booking Failed');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: tourGuide?.currency || 'USD'
    }).format(amount);
  };

  const totalPrice = calculateTotalPrice();

  return (
    <Modal show={show} onHide={handleModalClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center">
          <Calendar className="me-2" size={24} />
          Book {tourGuide?.name}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && (
            <Alert variant="success" className="d-flex align-items-center">
              <CheckCircle size={20} className="me-2" />
              <div>
                <strong>Booking Confirmed!</strong>
                <div className="small">Your tour guide booking has been successfully created.</div>
              </div>
            </Alert>
          )}

          {tourGuide && (
            <div className="mb-4 p-3 bg-light rounded">
              <Row>
                <Col md={8}>
                  <h6 className="fw-bold">{tourGuide.name}</h6>
                  <p className="text-muted mb-1">{tourGuide.bio}</p>
                  <div className="d-flex align-items-center text-muted">
                    <DollarSign size={16} className="me-1" />
                    <span>{formatPrice(tourGuide.hourlyRate || 0)}/hour</span>
                  </div>
                </Col>
                <Col md={4}>
                  <img 
                    src={tourGuide.profileImage || 'https://via.placeholder.com/150x150?text=Guide'} 
                    alt={tourGuide.name}
                    className="img-fluid rounded"
                    style={{ maxHeight: '80px', objectFit: 'cover' }}
                  />
                </Col>
              </Row>
            </div>
          )}

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="d-flex align-items-center">
                  <Calendar size={16} className="me-2" />
                  Start Date & Time
                </Form.Label>
                <Form.Control
                  type="datetime-local"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="d-flex align-items-center">
                  <Clock size={16} className="me-2" />
                  End Date & Time
                </Form.Label>
                <Form.Control
                  type="datetime-local"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label className="d-flex align-items-center">
              <MapPin size={16} className="me-2" />
              Location
            </Form.Label>
            <Form.Control
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Where would you like to meet or be guided?"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Special Notes or Requirements</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Any special requests, dietary restrictions, or other notes..."
            />
          </Form.Group>

          {totalPrice > 0 && (
            <div className="border rounded p-3 bg-primary bg-opacity-10">
              <h6 className="mb-2">Booking Summary</h6>
              <Row>
                <Col md={6}>
                  <strong>Total Duration:</strong> {Math.round(calculateTotalPrice() / (tourGuide?.hourlyRate || 1))} hours
                </Col>
                <Col md={6}>
                  <strong>Total Price:</strong> {formatPrice(totalPrice)}
                </Col>
                <Col md={6} className="mt-2">
                  <strong>Upfront Payment:</strong> {formatPrice(totalPrice / 2)}
                </Col>
                <Col md={6} className="mt-2">
                  <strong>Remaining:</strong> {formatPrice(totalPrice / 2)}
                </Col>
              </Row>
              <div className="mt-2">
                <small className="text-muted">
                  * You'll pay 50% upfront to confirm the booking. The remaining 50% is paid after the tour.
                </small>
              </div>
            </div>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalClose} disabled={loading || success}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            type="submit" 
            disabled={loading || success || !formData.startDate || !formData.endDate || !formData.location}
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Booking...
              </>
            ) : success ? (
              <>
                <CheckCircle size={16} className="me-2" />
                Booking Confirmed!
              </>
            ) : (
              'Book & Proceed to Payment'
            )}
          </Button>
        </Modal.Footer>
      </Form>

      {/* QR Payment Modal */}
      <BookingQRPaymentModal
        show={showQRModal}
        onHide={() => {
          setShowQRModal(false);
          setBookingResult(null);
          // Optionally call onBookingSuccess when payment modal closes
          onBookingSuccess?.();
          // Close the main booking modal as well since booking is created
          handleModalClose();
        }}
        bookingResult={bookingResult}
      />
    </Modal>
  );
};

export default BookingModal;
