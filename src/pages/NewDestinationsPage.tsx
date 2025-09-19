import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form, InputGroup, Spinner, Alert } from 'react-bootstrap';
import { Search, Star, MapPin } from 'lucide-react';
import { apiService } from '../services/api';
import type { Location, LocationSearchDto } from '../types';

const DestinationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlaceType, setSelectedPlaceType] = useState('');
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Place types for filtering
  const placeTypes = [
    'All Types',
    'tourist_attraction',
    'restaurant',
    'hotel',
    'museum',
    'park',
    'beach'
  ];

  // Fetch locations on component mount
  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getAllLocations(1, 20);
      setLocations(data);
    } catch (err) {
      console.error('Error fetching locations:', err);
      setError('Failed to load locations. Please try again later.');
      // Fallback to mock data
      setLocations([
        {
          id: 1,
          name: 'Ha Long Bay',
          address: 'Quang Ninh Province, Vietnam',
          placeType: 'tourist_attraction',
          rating: 4.9,
          userReview: 'UNESCO World Heritage site with stunning limestone karsts and emerald waters',
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z'
        },
        {
          id: 2,
          name: 'Hoi An Ancient Town',
          address: 'Hoi An, Quang Nam Province, Vietnam',
          placeType: 'tourist_attraction',
          rating: 4.8,
          userReview: 'Charming ancient trading port with well-preserved architecture',
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z'
        },
        {
          id: 3,
          name: 'Sapa Rice Terraces',
          address: 'Sapa, Lao Cai Province, Vietnam',
          placeType: 'tourist_attraction',
          rating: 4.7,
          userReview: 'Breathtaking mountain landscapes and ethnic culture',
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm && !selectedPlaceType) {
      fetchLocations();
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const searchParams: LocationSearchDto = {
        query: searchTerm || undefined,
        placeType: selectedPlaceType && selectedPlaceType !== 'All Types' ? selectedPlaceType : undefined,
        page: 1,
        pageSize: 20
      };
      const data = await apiService.searchLocations(searchParams);
      setLocations(data);
    } catch (err) {
      console.error('Error searching locations:', err);
      setError('Failed to search locations. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Filter locations locally
  const filteredLocations = locations.filter(location => {
    const matchesSearch = !searchTerm || 
                         location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (location.address && location.address.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = !selectedPlaceType || selectedPlaceType === 'All Types' ||
                        location.placeType === selectedPlaceType;
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light py-5">
      <Container>
        {/* Header */}
        <Row className="mb-5">
          <Col lg={8} className="mx-auto text-center">
            <h1 className="display-4 fw-bold mb-4">Discover Vietnam</h1>
            <p className="lead text-muted">
              Explore amazing destinations across Vietnam with our curated collection of must-visit places.
            </p>
          </Col>
        </Row>

        {/* Search and Filters */}
        <Row className="mb-4">
          <Col lg={8} className="mx-auto">
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <Row className="g-3">
                  <Col md={6}>
                    <InputGroup>
                      <Form.Control
                        type="text"
                        placeholder="Search destinations..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      />
                      <Button variant="primary" onClick={handleSearch}>
                        <Search size={16} />
                      </Button>
                    </InputGroup>
                  </Col>
                  <Col md={4}>
                    <Form.Select
                      value={selectedPlaceType}
                      onChange={(e) => setSelectedPlaceType(e.target.value)}
                    >
                      {placeTypes.map((type) => (
                        <option key={type} value={type}>
                          {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </option>
                      ))}
                    </Form.Select>
                  </Col>
                  <Col md={2}>
                    <Button variant="outline-primary" onClick={fetchLocations} className="w-100">
                      Reset
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Error Alert */}
        {error && (
          <Row className="mb-4">
            <Col lg={8} className="mx-auto">
              <Alert variant="warning">
                {error}
              </Alert>
            </Col>
          </Row>
        )}

        {/* Results */}
        <Row className="mb-4">
          <Col>
            <h5 className="text-muted">
              {filteredLocations.length} location{filteredLocations.length !== 1 ? 's' : ''} found
            </h5>
          </Col>
        </Row>

        {/* Destinations Grid */}
        <Row className="g-4">
          {filteredLocations.map((location) => (
            <Col key={location.id} md={6} lg={4}>
              <Card className="h-100 border-0 shadow-sm">
                <div className="position-relative overflow-hidden" style={{ height: '200px' }}>
                  <Card.Img
                    variant="top"
                    src={`https://images.unsplash.com/photo-1528127269322-539801943592?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80`}
                    alt={location.name}
                    className="h-100 w-100 object-fit-cover"
                  />
                  {location.rating && (
                    <div className="position-absolute top-0 end-0 m-3">
                      <span className="bg-white rounded-pill px-2 py-1 d-flex align-items-center small fw-semibold">
                        <Star size={14} className="text-warning me-1" fill="currentColor" />
                        {location.rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
                <Card.Body className="d-flex flex-column">
                  <Card.Title className="h5 fw-bold mb-2">{location.name}</Card.Title>
                  {location.userReview && (
                    <Card.Text className="text-muted mb-3 flex-grow-1">
                      {location.userReview}
                    </Card.Text>
                  )}
                  <div className="mt-auto">
                    {location.address && (
                      <div className="d-flex align-items-center text-muted small mb-2">
                        <MapPin size={14} className="me-1" />
                        <span>{location.address}</span>
                      </div>
                    )}
                    {location.placeType && (
                      <div className="mb-3">
                        <span className="badge bg-light text-dark">
                          {location.placeType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </div>
                    )}
                    <Button 
                      variant="primary" 
                      size="sm" 
                      className="w-100"
                      onClick={() => navigate(`/destinations/${location.id}`)}
                    >
                      View Details
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {filteredLocations.length === 0 && !loading && (
          <Row>
            <Col className="text-center py-5">
              <h4 className="text-muted">No locations found</h4>
              <p className="text-muted">Try adjusting your search criteria or check back later.</p>
            </Col>
          </Row>
        )}
      </Container>
    </div>
  );
};

export default DestinationsPage;