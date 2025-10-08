import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert, Form } from 'react-bootstrap';
import { Star, Clock, Users, Verified, Calendar, MessageCircle } from 'lucide-react';
import BookingModal from '../components/BookingModal';
import { tourGuideService, tourGuideReviewService } from '../services/api';
import type { TourGuideDto, TourGuideReviewDto, CreateTourGuideReviewDto } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const TourGuideDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, user } = useAuth();
  const [tourGuide, setTourGuide] = useState<TourGuideDto | null>(null);
  const [reviews, setReviews] = useState<TourGuideReviewDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState<CreateTourGuideReviewDto>({
    tourGuideId: 0,
    rating: 5,
    comment: ''
  });

  // Check if current user has already reviewed this tour guide
  const hasUserReviewed = user && reviews.some(review => review.userId === user.id);

  useEffect(() => {
    if (id) {
      loadTourGuideDetails(parseInt(id));
    }
  }, [id]);

  const loadTourGuideDetails = async (tourGuideId: number) => {
    try {
      setLoading(true);
      const [guideData, reviewsData] = await Promise.all([
        tourGuideService.getById(tourGuideId),
        tourGuideService.getReviews(tourGuideId)
      ]);
      
      setTourGuide(guideData);
      setReviews(reviewsData);
      setReviewForm(prev => ({ 
        ...prev, 
        tourGuideId: tourGuideId 
      }));
    } catch {
      setError('Failed to load tour guide details.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tourGuide) return;

    try {
      await tourGuideReviewService.create(reviewForm);
      setShowReviewForm(false);
      setReviewForm({ tourGuideId: tourGuide.id, rating: 5, comment: '' });
      // Reload reviews
      loadTourGuideDetails(tourGuide.id);
    } catch (error) {
      let errorMessage = 'Failed to submit review. Please try again.';
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: string; status?: number } };
        
        // Handle specific error messages
        if (axiosError.response?.data === "You have already reviewed this tour guide") {
          errorMessage = 'You have already submitted a review for this tour guide.';
        } else if (axiosError.response?.data === "Rating must be between 1 and 5") {
          errorMessage = 'Please select a valid rating between 1 and 5 stars.';
        } else if (axiosError.response?.data === "Tour guide not found") {
          errorMessage = 'Tour guide not found. Please refresh the page and try again.';
        }
      }
      
      setError(errorMessage);
    }
  };

  const formatRate = (rate?: number, currency?: string) => {
    if (!rate) return 'Contact for pricing';
    
    // Default to VND for Vietnamese market
    const displayCurrency = currency || 'VND';
    
    if (displayCurrency === 'VND') {
      // Format for Vietnamese currency
      const formattedRate = rate.toLocaleString('vi-VN');
      return `${formattedRate} VND/giờ`;
    } else {
      // Format for other currencies (USD, etc.)
      return `${displayCurrency}${rate}/hour`;
    }
  };

  const getSpecializationBadges = () => {
    if (!tourGuide?.specializations) return [];
    return tourGuide.specializations.split(',').map(s => s.trim());
  };

  const getLanguages = () => {
    if (!tourGuide?.languages) return 'English';
    return tourGuide.languages.split(',').map(l => l.trim()).join(', ');
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        fill={i < rating ? 'currentColor' : 'none'}
        className={i < rating ? 'text-warning' : 'text-muted'}
      />
    ));
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
        <p className="mt-2 text-muted">Loading tour guide details...</p>
      </Container>
    );
  }

  if (error || !tourGuide) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          {error || 'Tour guide not found'}
        </Alert>
        <Link to="/tour-guides" className="btn btn-primary">
          Back to Tour Guides
        </Link>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row>
        <Col lg={8}>
          {/* Main Profile Card */}
          <Card className="mb-4 shadow-sm">
            <Card.Body>
              <Row>
                <Col md={4}>
                  <div className="text-center">
                    <img
                      src={tourGuide.profileImage || 'https://via.placeholder.com/300x300?text=Tour+Guide'}
                      alt={tourGuide.name}
                      className="img-fluid rounded-circle mb-3"
                      style={{ width: '200px', height: '200px', objectFit: 'cover' }}
                    />
                    {tourGuide.isVerified && (
                      <Badge bg="success" className="d-flex align-items-center justify-content-center gap-1 mb-2">
                        <Verified size={14} />
                        Verified Guide
                      </Badge>
                    )}
                  </div>
                </Col>
                <Col md={8}>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h1 className="h2 mb-0">{tourGuide.name}</h1>
                    <div className="d-flex align-items-center text-warning">
                      <Star size={20} fill="currentColor" />
                      <span className="ms-1 fw-bold fs-5">
                        {tourGuide.rating ? tourGuide.rating.toFixed(1) : 'New'}
                      </span>
                      <small className="text-muted ms-1">
                        ({tourGuide.totalReviews} reviews)
                      </small>
                    </div>
                  </div>

                  {tourGuide.bio && (
                    <Card.Text className="text-muted mb-3">
                      {tourGuide.bio}
                    </Card.Text>
                  )}

                  <Row className="g-3 mb-3">
                    <Col sm={6}>
                      <div className="d-flex align-items-center text-muted">
                        <Users size={16} className="me-2" />
                        <span>Languages: {getLanguages()}</span>
                      </div>
                    </Col>
                    <Col sm={6}>
                      <div className="d-flex align-items-center text-muted">
                        <Clock size={16} className="me-2" />
                        <span className="fw-semibold text-primary">
                          {formatRate(tourGuide.hourlyRate, tourGuide.currency)}
                        </span>
                      </div>
                    </Col>
                  </Row>

                  {getSpecializationBadges().length > 0 && (
                    <div className="mb-3">
                      <h6 className="text-muted mb-2">Specializations:</h6>
                      {getSpecializationBadges().map((spec, index) => (
                        <Badge key={index} bg="primary" className="me-2 mb-1">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  )}
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Reviews Section */}
          <Card className="shadow-sm">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h4 className="mb-0">Reviews ({reviews.length})</h4>
              {isAuthenticated && !hasUserReviewed && (
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => setShowReviewForm(!showReviewForm)}
                >
                  Write Review
                </Button>
              )}
              {isAuthenticated && hasUserReviewed && (
                <Badge bg="success" className="fs-6">
                  You've reviewed this guide
                </Badge>
              )}
            </Card.Header>
            <Card.Body>
              {/* Review Form */}
              {showReviewForm && (
                <Card className="mb-4 bg-light">
                  <Card.Body>
                    <h6 className="mb-3">Write a Review</h6>
                    <Form onSubmit={handleSubmitReview}>
                      <Row>
                        <Col sm={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Rating</Form.Label>
                            <Form.Select
                              value={reviewForm.rating}
                              onChange={(e) => setReviewForm(prev => ({ ...prev, rating: Number(e.target.value) }))}
                            >
                              <option value={5}>5 Stars - Excellent</option>
                              <option value={4}>4 Stars - Very Good</option>
                              <option value={3}>3 Stars - Good</option>
                              <option value={2}>2 Stars - Fair</option>
                              <option value={1}>1 Star - Poor</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>
                      </Row>
                      <Form.Group className="mb-3">
                        <Form.Label>Comment</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          value={reviewForm.comment || ''}
                          onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                          placeholder="Share your experience with this tour guide..."
                        />
                      </Form.Group>
                      <div className="d-flex gap-2">
                        <Button type="submit" variant="primary" size="sm">
                          Submit Review
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline-secondary" 
                          size="sm"
                          onClick={() => setShowReviewForm(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </Form>
                  </Card.Body>
                </Card>
              )}

              {/* Reviews List */}
              {reviews.length === 0 ? (
                <div className="text-center py-4">
                  <MessageCircle size={48} className="text-muted mb-3" />
                  <h6 className="text-muted">No reviews yet</h6>
                  <p className="text-muted">Be the first to review this tour guide!</p>
                </div>
              ) : (
                <div className="reviews-list">
                  {reviews.map((review) => {
                    const isUserReview = user && review.userId === user.id;
                    return (
                      <div 
                        key={review.id} 
                        className={`border-bottom pb-3 mb-3 last:border-0 ${isUserReview ? 'bg-light rounded p-3' : ''}`}
                      >
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div>
                            <h6 className="mb-1">
                              {review.userName}
                              {isUserReview && (
                                <Badge bg="primary" className="ms-2 fs-6">Your Review</Badge>
                              )}
                            </h6>
                            <div className="d-flex align-items-center gap-2">
                              <div className="d-flex">{renderStars(review.rating)}</div>
                              {review.isVerified && (
                                <Badge bg="success">Verified</Badge>
                              )}
                            </div>
                          </div>
                          <small className="text-muted">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </small>
                        </div>
                        {review.comment && (
                          <Card.Text className="text-muted mb-0">
                            {review.comment}
                          </Card.Text>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Sidebar */}
        <Col lg={4}>
          <Card className="shadow-sm" style={{ top: '100px' }}>
            <Card.Body>
              <div className="text-center mb-3">
                <h5 className="fw-bold text-primary">
                  {formatRate(tourGuide.hourlyRate, tourGuide.currency)}
                </h5>
                <p className="text-muted mb-0">per hour</p>
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-100 mb-3"
                onClick={() => setShowBookingModal(true)}
              >
                <Calendar size={20} className="me-2" />
                Book This Guide
              </Button>

              <div className="text-center">
                <Link to="/tour-guides" className="btn btn-outline-secondary w-100">
                  Back to All Guides
                </Link>
              </div>

              <hr />

              <div className="quick-facts">
                <h6 className="fw-bold mb-3">Quick Facts</h6>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Response rate:</span>
                  <span>Very high</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Languages:</span>
                  <span>{getLanguages()}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Total reviews:</span>
                  <span>{tourGuide.totalReviews}</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Booking Modal */}
      <BookingModal
        show={showBookingModal}
        onHide={() => setShowBookingModal(false)}
        tourGuide={tourGuide}
        onBookingSuccess={() => {
          setShowBookingModal(false);
          // You might want to show a success message
        }}
      />
    </Container>
  );
};

export default TourGuideDetailPage;
