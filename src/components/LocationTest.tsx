import React, { useState } from 'react';
import { Card, Button, Alert, Form, Row, Col, Spinner } from 'react-bootstrap';
import { apiService } from '../services/api';
import type { Location, LocationSearchDto, CreateLocationDto } from '../types';

const LocationTest: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newLocation, setNewLocation] = useState<CreateLocationDto>({
    name: '',
    address: '',
    placeType: 'tourist_attraction',
    rating: 5,
    userReview: ''
  });

  const testGetAllLocations = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const data = await apiService.getAllLocations(1, 10);
      setLocations(data);
      setSuccess(`Successfully fetched ${data.length} locations`);
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const testSearchLocations = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a search query');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const searchParams: LocationSearchDto = {
        query: searchQuery,
        page: 1,
        pageSize: 10
      };
      const data = await apiService.searchLocations(searchParams);
      setLocations(data);
      setSuccess(`Found ${data.length} locations matching "${searchQuery}"`);
    } catch (err) {
      setError(`Search error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const testCreateLocation = async () => {
    if (!newLocation.name.trim()) {
      setError('Location name is required');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const created = await apiService.createLocation(newLocation);
      setSuccess(`Successfully created location: ${created.name}`);
      setNewLocation({
        name: '',
        address: '',
        placeType: 'tourist_attraction',
        rating: 5,
        userReview: ''
      });
      // Refresh the list
      testGetAllLocations();
    } catch (err) {
      setError(`Create error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-4">
      <Card.Header>
        <h5 className="mb-0">🗺️ Location API Test</h5>
      </Card.Header>
      <Card.Body>
        {/* Status Messages */}
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        
        {/* Test Buttons */}
        <Row className="mb-4">
          <Col md={4}>
            <Button 
              variant="primary" 
              onClick={testGetAllLocations} 
              disabled={loading}
              className="w-100 mb-2"
            >
              {loading ? <Spinner size="sm" /> : 'Get All Locations'}
            </Button>
          </Col>
          <Col md={4}>
            <div className="d-flex gap-2">
              <Form.Control
                type="text"
                placeholder="Search query..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && testSearchLocations()}
              />
              <Button 
                variant="info" 
                onClick={testSearchLocations} 
                disabled={loading}
              >
                Search
              </Button>
            </div>
          </Col>
        </Row>

        {/* Create Location Form */}
        <Card className="mb-4">
          <Card.Header>
            <h6 className="mb-0">Create New Location</h6>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Name *</Form.Label>
                  <Form.Control
                    type="text"
                    value={newLocation.name}
                    onChange={(e) => setNewLocation({...newLocation, name: e.target.value})}
                    placeholder="Enter location name"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    type="text"
                    value={newLocation.address || ''}
                    onChange={(e) => setNewLocation({...newLocation, address: e.target.value})}
                    placeholder="Enter address"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Place Type</Form.Label>
                  <Form.Select
                    value={newLocation.placeType || ''}
                    onChange={(e) => setNewLocation({...newLocation, placeType: e.target.value})}
                  >
                    <option value="tourist_attraction">Tourist Attraction</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="hotel">Hotel</option>
                    <option value="museum">Museum</option>
                    <option value="park">Park</option>
                    <option value="beach">Beach</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Rating</Form.Label>
                  <Form.Select
                    value={newLocation.rating?.toString() || '5'}
                    onChange={(e) => setNewLocation({...newLocation, rating: parseFloat(e.target.value)})}
                  >
                    <option value="5">5 Stars</option>
                    <option value="4.5">4.5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3.5">3.5 Stars</option>
                    <option value="3">3 Stars</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Review/Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={newLocation.userReview || ''}
                    onChange={(e) => setNewLocation({...newLocation, userReview: e.target.value})}
                    placeholder="Enter review or description"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Button 
              variant="success" 
              onClick={testCreateLocation} 
              disabled={loading}
            >
              {loading ? <Spinner size="sm" /> : 'Create Location'}
            </Button>
          </Card.Body>
        </Card>

        {/* Results */}
        {locations.length > 0 && (
          <div>
            <h6>Results ({locations.length} locations):</h6>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {locations.map((location) => (
                <Card key={location.id} className="mb-2">
                  <Card.Body className="py-2">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <strong>{location.name}</strong>
                        {location.address && <div className="text-muted small">{location.address}</div>}
                        {location.userReview && <div className="text-muted small">{location.userReview}</div>}
                      </div>
                      <div className="text-end">
                        <div className="badge bg-light text-dark">
                          {location.placeType?.replace('_', ' ')}
                        </div>
                        {location.rating && (
                          <div className="text-warning small">
                            ⭐ {location.rating}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default LocationTest;