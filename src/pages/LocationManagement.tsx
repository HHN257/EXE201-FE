import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Modal, Form, Alert, Badge, Spinner } from 'react-bootstrap';
import { MapPin, Plus, Edit, Trash2, Eye, Search, Star } from 'lucide-react';
import { apiService } from '../services/api';
import type { Location } from '../types';
import type { CreateLocationDto, UpdateLocationDto } from '../types';

const LocationManagement: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [viewingLocation, setViewingLocation] = useState<Location | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [alert, setAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    placeType: 'tourist_attraction',
    rating: 0,
    userReview: '',
    isActive: true,
    imageFile: null as File | null
  });
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  const placeTypes = [
    'tourist_attraction',
    'restaurant',
    'hotel',
    'museum',
    'park',
    'beach',
    'shopping_mall',
    'entertainment'
  ];

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const data = await apiService.getAllLocations(1, 50);
      setLocations(data);
    } catch (error) {
      console.error('Error fetching locations:', error);
      // Fallback to mock data for demonstration
      setLocations([
        {
          id: 1,
          name: 'Ha Long Bay',
          address: 'Quang Ninh Province, Vietnam',
          placeType: 'tourist_attraction',
          rating: 4.9,
          userReview: 'UNESCO World Heritage site with stunning limestone karsts',
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z'
        },
        {
          id: 2,
          name: 'Hoi An Ancient Town',
          address: 'Hoi An, Quang Nam Province, Vietnam',
          placeType: 'tourist_attraction',
          rating: 4.8,
          userReview: 'Charming ancient trading port',
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors: {[key: string]: string} = {};

    // Name validation (Required, max 200 characters)
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.length > 200) {
      errors.name = 'Name cannot exceed 200 characters';
    }

    // Address validation (max 500 characters)
    if (formData.address && formData.address.length > 500) {
      errors.address = 'Address cannot exceed 500 characters';
    }

    // PlaceType validation (max 50 characters)
    if (formData.placeType && formData.placeType.length > 50) {
      errors.placeType = 'PlaceType cannot exceed 50 characters';
    }

    // Rating validation (0-5 range)
    if (formData.rating < 0 || formData.rating > 5) {
      errors.rating = 'Rating must be between 0 and 5';
    }

    // UserReview validation (max 1000 characters)
    if (formData.userReview && formData.userReview.length > 1000) {
      errors.userReview = 'UserReview cannot exceed 1000 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      if (editingLocation) {
        // Update existing location using API
        const updateDto: Partial<UpdateLocationDto> & { imageUrl?: File } = {
          name: formData.name,
          address: formData.address,
          placeType: formData.placeType,
          rating: formData.rating,
          userReview: formData.userReview,
        };
        if (formData.imageFile) {
          updateDto.imageUrl = formData.imageFile;
        }
        const updated = await apiService.updateLocation(editingLocation.id, updateDto);
        setLocations(locations.map(loc => loc.id === editingLocation.id ? updated : loc));
        setAlert({ type: 'success', message: 'Location updated successfully!' });
      } else {
        // Create new location using API
        const createDto: CreateLocationDto & { imageUrl?: File } = {
          name: formData.name,
          address: formData.address,
          placeType: formData.placeType,
          rating: formData.rating,
          userReview: formData.userReview,
        };
        if (formData.imageFile) {
          createDto.imageUrl = formData.imageFile;
        }
        const created = await apiService.createLocation(createDto);
        setLocations([...locations, created]);
        setAlert({ type: 'success', message: 'Location created successfully!' });
      }
      handleCloseModal();
    } catch (error) {
      console.error('Error saving location:', error);
      setAlert({ type: 'danger', message: 'Error saving location. Please try again.' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this location?')) return;
    
    try {
      await apiService.deleteLocation(id);
      setLocations(locations.filter(loc => loc.id !== id));
      setAlert({ type: 'success', message: 'Location deleted successfully!' });
    } catch (error) {
      console.error('Error deleting location:', error);
      setAlert({ type: 'danger', message: 'Error deleting location. Please try again.' });
    }
  };

  const handleViewDetails = async (id: number) => {
    try {
      setLoadingDetail(true);
      const locationDetail = await apiService.getLocationById(id);
      setViewingLocation(locationDetail);
      setShowViewModal(true);
    } catch (error) {
      console.error('Error fetching location details:', error);
      // Fallback to local data if API fails
      const localLocation = locations.find(loc => loc.id === id);
      if (localLocation) {
        setViewingLocation(localLocation);
        setShowViewModal(true);
      } else {
        setAlert({ type: 'danger', message: 'Failed to load location details.' });
      }
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleEdit = (location: Location) => {
    setEditingLocation(location);
    setFormData({
      name: location.name,
      address: location.address || '',
      placeType: location.placeType || 'tourist_attraction',
      rating: location.rating || 0,
      userReview: location.userReview || '',
      isActive: location.isActive,
      imageFile: null
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingLocation(null);
    setFormData({
      name: '',
      address: '',
      placeType: 'tourist_attraction',
      rating: 0,
      userReview: '',
      isActive: true,
      imageFile: null
    });
    setFormErrors({});
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setViewingLocation(null);
  };

  const filteredLocations = locations.filter(location =>
    location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (location.address && location.address.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
      </div>
    );
  }

  return (
    <Container className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <MapPin size={32} className="me-3 text-primary" />
              <div>
                <h2 className="mb-0">Location Management</h2>
                <p className="text-muted mb-0">Manage destinations and places</p>
              </div>
            </div>
            <Button variant="primary" onClick={() => setShowModal(true)}>
              <Plus size={16} className="me-2" />
              Add Location
            </Button>
          </div>
        </Col>
      </Row>

      {/* Alert */}
      {alert && (
        <Row className="mb-4">
          <Col>
            <Alert 
              variant={alert.type} 
              dismissible 
              onClose={() => setAlert(null)}
            >
              {alert.message}
            </Alert>
          </Col>
        </Row>
      )}

      {/* Search and Stats */}
      <Row className="mb-4">
        <Col md={6}>
          <div className="d-flex align-items-center">
            <Search size={20} className="me-2 text-muted" />
            <Form.Control
              type="text"
              placeholder="Search locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </Col>
        <Col md={6} className="text-end">
          <span className="text-muted">
            Total: {locations.length} | Active: {locations.filter(l => l.isActive).length}
          </span>
        </Col>
      </Row>

      {/* Locations Table */}
      <Row>
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-0">
              <Table responsive className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Name</th>
                    <th>Address</th>
                    <th>Type</th>
                    <th>Rating</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLocations.map((location) => (
                    <tr key={location.id}>
                      <td className="fw-semibold">{location.name}</td>
                      <td className="text-muted">{location.address || 'N/A'}</td>
                      <td>
                        <Badge bg="light" text="dark">
                          {location.placeType?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Badge>
                      </td>
                      <td>
                        {location.rating && (
                          <div className="d-flex align-items-center">
                            <Star size={14} className="text-warning me-1" fill="currentColor" />
                            {location.rating.toFixed(1)}
                          </div>
                        )}
                      </td>
                      <td>
                        <Badge bg={location.isActive ? 'success' : 'secondary'}>
                          {location.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button
                            variant="outline-info"
                            size="sm"
                            title="View Details"
                            onClick={() => handleViewDetails(location.id)}
                            disabled={loadingDetail}
                          >
                            <Eye size={14} />
                          </Button>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleEdit(location)}
                            title="Edit"
                          >
                            <Edit size={14} />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(location.id)}
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              
              {filteredLocations.length === 0 && (
                <div className="text-center py-5 text-muted">
                  <MapPin size={48} className="mb-3 opacity-50" />
                  <h5>No locations found</h5>
                  <p>Try adjusting your search or add a new location.</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingLocation ? 'Edit Location' : 'Add New Location'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Name * <small className="text-muted">(max 200 chars)</small></Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    isInvalid={!!formErrors.name}
                    maxLength={200}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.name}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Place Type</Form.Label>
                  <Form.Select
                    value={formData.placeType}
                    onChange={(e) => setFormData({ ...formData, placeType: e.target.value })}
                  >
                    {placeTypes.map(type => (
                      <option key={type} value={type}>
                        {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Address <small className="text-muted">(max 500 chars)</small></Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    isInvalid={!!formErrors.address}
                    maxLength={500}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.address}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Rating (0-5)</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || 0 })}
                    isInvalid={!!formErrors.rating}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.rating}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={formData.isActive ? 'true' : 'false'}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Description <small className="text-muted">(max 1000 chars)</small></Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={formData.userReview}
                    onChange={(e) => setFormData({ ...formData, userReview: e.target.value })}
                    placeholder="Enter location description..."
                    isInvalid={!!formErrors.userReview}
                    maxLength={1000}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.userReview}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    {formData.userReview.length}/1000 characters
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Image Upload</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = (e.target as HTMLInputElement).files?.[0] || null;
                      setFormData({ ...formData, imageFile: file });
                    }}
                  />
                  <Form.Text className="text-muted">
                    Upload an image for this location (optional)
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingLocation ? 'Update Location' : 'Create Location'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* View Details Modal */}
      <Modal show={showViewModal} onHide={handleCloseViewModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Location Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {viewingLocation ? (
            <Row className="g-4">
              {/* Location Image */}
              <Col md={12}>
                <div className="text-center mb-4">
                  <img
                    src={viewingLocation.imageUrl || `https://images.unsplash.com/photo-1528127269322-539801943592?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80`}
                    alt={viewingLocation.name}
                    className="img-fluid rounded shadow-sm"
                    style={{ maxHeight: '300px', objectFit: 'cover', width: '100%' }}
                  />
                </div>
              </Col>

              {/* Basic Information */}
              <Col md={6}>
                <Card className="border-0 bg-light h-100">
                  <Card.Body>
                    <h6 className="text-primary mb-3">Basic Information</h6>
                    <div className="mb-3">
                      <strong>Name:</strong>
                      <div className="mt-1">{viewingLocation.name}</div>
                    </div>
                    <div className="mb-3">
                      <strong>Address:</strong>
                      <div className="mt-1 text-muted">
                        {viewingLocation.address || 'Not specified'}
                      </div>
                    </div>
                    <div className="mb-3">
                      <strong>Place Type:</strong>
                      <div className="mt-1">
                        <Badge bg="primary">
                          {viewingLocation.placeType?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Not specified'}
                        </Badge>
                      </div>
                    </div>
                    <div className="mb-3">
                      <strong>Status:</strong>
                      <div className="mt-1">
                        <Badge bg={viewingLocation.isActive ? 'success' : 'secondary'}>
                          {viewingLocation.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              {/* Rating and Stats */}
              <Col md={6}>
                <Card className="border-0 bg-light h-100">
                  <Card.Body>
                    <h6 className="text-primary mb-3">Rating & Statistics</h6>
                    <div className="mb-3">
                      <strong>Rating:</strong>
                      <div className="mt-1 d-flex align-items-center">
                        {viewingLocation.rating ? (
                          <>
                            <Star size={16} className="text-warning me-1" fill="currentColor" />
                            <span className="fw-bold">{viewingLocation.rating.toFixed(1)}</span>
                            <span className="text-muted ms-1">/ 5.0</span>
                          </>
                        ) : (
                          <span className="text-muted">No rating available</span>
                        )}
                      </div>
                    </div>
                    <div className="mb-3">
                      <strong>Created:</strong>
                      <div className="mt-1 text-muted">
                        {new Date(viewingLocation.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                    {viewingLocation.updatedAt && (
                      <div className="mb-3">
                        <strong>Last Updated:</strong>
                        <div className="mt-1 text-muted">
                          {new Date(viewingLocation.updatedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                    )}
                    <div className="mb-3">
                      <strong>Location ID:</strong>
                      <div className="mt-1">
                        <code>#{viewingLocation.id}</code>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              {/* Description */}
              <Col md={12}>
                <Card className="border-0 bg-light">
                  <Card.Body>
                    <h6 className="text-primary mb-3">Description</h6>
                    <div className="text-muted" style={{ lineHeight: '1.6' }}>
                      {viewingLocation.userReview || 'No description available for this location.'}
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              {/* Coordinates (if available) */}
              {(viewingLocation.latitude || viewingLocation.longitude) && (
                <Col md={12}>
                  <Card className="border-0 bg-light">
                    <Card.Body>
                      <h6 className="text-primary mb-3">Coordinates</h6>
                      <Row>
                        <Col md={6}>
                          <strong>Latitude:</strong>
                          <div className="mt-1 text-muted">{viewingLocation.latitude || 'Not available'}</div>
                        </Col>
                        <Col md={6}>
                          <strong>Longitude:</strong>
                          <div className="mt-1 text-muted">{viewingLocation.longitude || 'Not available'}</div>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </Col>
              )}
            </Row>
          ) : (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" />
              <div className="mt-2 text-muted">Loading location details...</div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseViewModal}>
            Close
          </Button>
          {viewingLocation && (
            <Button 
              variant="primary" 
              onClick={() => {
                handleCloseViewModal();
                handleEdit(viewingLocation);
              }}
            >
              Edit Location
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default LocationManagement;