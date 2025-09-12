import React, { useState } from 'react';
import { Modal, Form, Button, Alert, Row, Col, Spinner } from 'react-bootstrap';
import { Calendar, Clock, MapPin, DollarSign } from 'lucide-react';
import { tourGuideBookingService } from '../services/api';
import type { TourGuideDto, CreateTourGuideBookingDto } from '../services/api';

interface BookingModalProps {
  show: boolean;
  onHide: () => void;
  tourGuide: TourGuideDto | null;
  onBookingSuccess?: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ show, onHide, tourGuide, onBookingSuccess }) => {
  const [formData, setFormData] = useState<CreateTourGuideBookingDto>({
    tourGuideId: 0,
    startDate: '',
    endDate: '',
    notes: '',
    location: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (tourGuide) {
      setFormData(prev => ({
        ...prev,
        tourGuideId: tourGuide.id
      }));
    }
  }, [tourGuide]);

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
    setLoading(true);

    try {
      // Validate dates
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      const now = new Date();

      if (startDate <= now) {
        throw new Error('Start date must be in the future');
      }

      if (endDate <= startDate) {
        throw new Error('End date must be after start date');
      }

      await tourGuideBookingService.create({
        ...formData,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });

      onBookingSuccess?.();
      onHide();
      
      // Reset form
      setFormData({
        tourGuideId: tourGuide?.id || 0,
        startDate: '',
        endDate: '',
        notes: '',
        location: ''
      });
    } catch (err) {
      let errorMessage = 'Booking failed. Please try again.';
      if (err && typeof err === 'object' && 'response' in err) {
        const response = (err as { response?: { data?: { message?: string } } }).response;
        if (response?.data?.message) {
          errorMessage = response.data.message;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
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
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center">
          <Calendar className="me-2" size={24} />
          Book {tourGuide?.name}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}

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
                <Col>
                  <strong>Total Duration:</strong> {Math.round(calculateTotalPrice() / (tourGuide?.hourlyRate || 1))} hours
                </Col>
                <Col>
                  <strong>Total Price:</strong> {formatPrice(totalPrice)}
                </Col>
              </Row>
            </div>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            type="submit" 
            disabled={loading || !formData.startDate || !formData.endDate || !formData.location}
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Booking...
              </>
            ) : (
              'Confirm Booking'
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default BookingModal;
