import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import { MapPin, Star, ArrowLeft, Info } from 'lucide-react';
import { apiService } from '../services/api';
import type { Location } from '../types';

const LocationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocation = async () => {
      if (!id || isNaN(Number(id))) {
        setError('Invalid location ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const locationData = await apiService.getLocationById(Number(id));
        setLocation(locationData);
      } catch (err) {
        console.error('Error fetching location:', err);
        setError('Failed to load location details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchLocation();
  }, [id]);

  const handleViewOnMap = () => {
    if (location?.name) {
      // Encode the location name for URL
      const encodedName = encodeURIComponent(location.name);
      // Create Google Maps URL
      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedName}`;
      // Open in new tab
      window.open(googleMapsUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
      </div>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8}>
            <Alert variant="danger">
              <Alert.Heading>Error</Alert.Heading>
              <p>{error}</p>
              <Button variant="outline-danger" onClick={() => navigate('/destinations')}>
                Back to Destinations
              </Button>
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  if (!location) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8}>
            <Alert variant="warning">
              <Alert.Heading>Location Not Found</Alert.Heading>
              <p>The location you're looking for doesn't exist or has been removed.</p>
              <Button variant="outline-warning" onClick={() => navigate('/destinations')}>
                Back to Destinations
              </Button>
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      {/* Hero Section */}
      <div 
        className="position-relative"
        style={{
          height: '400px',
          backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${location.imageUrl || 'https://via.placeholder.com/1200x400?text=No+Image'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <Container className="h-100 d-flex align-items-end pb-4">
          <Row className="w-100">
            <Col>
              <Button 
                variant="outline-light" 
                className="mb-3"
                onClick={() => navigate('/destinations')}
              >
                <ArrowLeft size={16} className="me-2" />
                Back to Destinations
              </Button>
              <h1 className="display-4 text-white fw-bold mb-2">{location.name}</h1>
              {location.address && (
                <div className="d-flex align-items-center text-white-50 mb-3">
                  <MapPin size={20} className="me-2" />
                  <span className="fs-5">{location.address}</span>
                </div>
              )}
              <div className="d-flex align-items-center gap-3">
                {location.rating && (
                  <div className="bg-white rounded-pill px-3 py-2 d-flex align-items-center">
                    <Star size={18} className="text-warning me-1" fill="currentColor" />
                    <span className="fw-semibold">{location.rating.toFixed(1)}</span>
                  </div>
                )}
                {location.placeType && (
                  <Badge bg="primary" className="px-3 py-2 fs-6">
                    {location.placeType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Badge>
                )}
                {location.isActive && (
                  <Badge bg="success" className="px-3 py-2 fs-6">
                    Active
                  </Badge>
                )}
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Content Section */}
      <Container className="py-5">
        <Row>
          <Col lg={8}>
            {/* Description */}
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body className="p-4">
                <h3 className="h4 fw-bold mb-3 d-flex align-items-center">
                  <Info size={24} className="me-2 text-primary" />
                  About This Location
                </h3>
                {location.userReview ? (
                  <p className="text-muted fs-5 lh-lg">{location.userReview}</p>
                ) : (
                  <p className="text-muted">No description available for this location.</p>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Sidebar */}
          <Col lg={4}>
            <Card className="border-0 shadow-sm" style={{ top: '2rem' }}>
              <Card.Body className="p-4">
                <h4 className="fw-bold mb-3">Plan Your Visit</h4>
                <div className="d-grid gap-2">
                  <Button 
                    variant="primary" 
                    size="lg"
                    onClick={() => navigate('/tour-guides')}
                  >
                    Book Tour Guide
                  </Button>
                  <Button 
                    variant="outline-primary"
                    onClick={handleViewOnMap}
                    disabled={!location?.name}
                  >
                    View on Map
                  </Button>
                </div>
                
                {location.address && (
                  <div className="mt-4 p-3 bg-light rounded">
                    <h6 className="fw-semibold mb-2">Address</h6>
                    <p className="text-muted mb-0 small">{location.address}</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default LocationDetailPage;