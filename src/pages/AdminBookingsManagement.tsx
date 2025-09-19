import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Modal, Form, Alert, InputGroup, Spinner, Tab, Tabs } from 'react-bootstrap';
import { Calendar, Search, Filter, Eye, Edit3, MapPin, Clock, DollarSign, User, UserCheck } from 'lucide-react';
import { config } from '../config';

interface Booking {
  id: number;
  bookingReference: string;
  bookingDate: string;
  serviceDate: string;
  notes?: string;
  amount: number;
  currency: string;
  status: string;
  userId: number;
  serviceId: number;
  serviceName: string;
  userName: string;
}

interface TourGuideBooking {
  id: number;
  startDate: string;
  endDate: string;
  notes?: string;
  totalPrice: number;
  currency: string;
  location?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  tourGuideId: number;
  tourGuideName: string;
  userId: number;
  userName: string;
}

const AdminBookingsManagement: React.FC = () => {
  const [serviceBookings, setServiceBookings] = useState<Booking[]>([]);
  const [tourGuideBookings, setTourGuideBookings] = useState<TourGuideBooking[]>([]);
  const [filteredServiceBookings, setFilteredServiceBookings] = useState<Booking[]>([]);
  const [filteredTourGuideBookings, setFilteredTourGuideBookings] = useState<TourGuideBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [activeTab, setActiveTab] = useState('services');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | TourGuideBooking | null>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'danger' | 'warning'; message: string } | null>(null);

  const statusOptions = [
    { value: 'All', label: 'All Status' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Confirmed', label: 'Confirmed' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Cancelled', label: 'Cancelled' },
    { value: 'Refunded', label: 'Refunded' }
  ];

  useEffect(() => {
    if (activeTab === 'services') {
      fetchServiceBookings();
    } else {
      fetchTourGuideBookings();
    }
  }, [activeTab]);

  const filterServiceBookings = useCallback(() => {
    let filtered = serviceBookings;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(booking =>
        booking.bookingReference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.serviceName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'All') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }

    setFilteredServiceBookings(filtered);
  }, [serviceBookings, searchTerm, statusFilter]);

  const filterTourGuideBookings = useCallback(() => {
    let filtered = tourGuideBookings;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(booking =>
        booking.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.tourGuideName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (booking.location && booking.location.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Status filter
    if (statusFilter !== 'All') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }

    setFilteredTourGuideBookings(filtered);
  }, [tourGuideBookings, searchTerm, statusFilter]);

  useEffect(() => {
    if (activeTab === 'services') {
      filterServiceBookings();
    } else {
      filterTourGuideBookings();
    }
  }, [activeTab, filterServiceBookings, filterTourGuideBookings]);

  const fetchServiceBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_BASE_URL}/bookings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const bookingData = await response.json();
        setServiceBookings(bookingData);
      } else {
        setAlert({ type: 'danger', message: 'Failed to fetch service bookings' });
      }
    } catch (error) {
      setAlert({ type: 'danger', message: 'Error fetching service bookings' });
      console.error('Error fetching service bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTourGuideBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_BASE_URL}/tourguidebookings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const bookingData = await response.json();
        setTourGuideBookings(bookingData);
      } else {
        setAlert({ type: 'danger', message: 'Failed to fetch tour guide bookings' });
      }
    } catch (error) {
      setAlert({ type: 'danger', message: 'Error fetching tour guide bookings' });
      console.error('Error fetching tour guide bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (booking: Booking | TourGuideBooking) => {
    setSelectedBooking(booking);
    setShowDetailModal(true);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Confirmed': return 'success';
      case 'Completed': return 'info';
      case 'Cancelled': return 'danger';
      case 'Refunded': return 'warning';
      case 'Pending': return 'secondary';
      default: return 'light';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency === 'VND' ? 'VND' : 'USD',
      minimumFractionDigits: currency === 'VND' ? 0 : 2
    }).format(amount);
  };

  const isServiceBooking = (booking: Booking | TourGuideBooking): booking is Booking => {
    return 'bookingReference' in booking;
  };

  const renderServiceBookings = () => (
    <>
      {/* Statistics Cards */}
      <Row className="g-3 mb-4">
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <h4 className="text-secondary">{serviceBookings.filter(b => b.status === 'Pending').length}</h4>
              <p className="text-muted mb-0 small">Pending Bookings</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <h4 className="text-success">{serviceBookings.filter(b => b.status === 'Confirmed').length}</h4>
              <p className="text-muted mb-0 small">Confirmed</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <h4 className="text-info">{serviceBookings.filter(b => b.status === 'Completed').length}</h4>
              <p className="text-muted mb-0 small">Completed</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <h4 className="text-primary">
                {formatCurrency(
                  serviceBookings.reduce((sum, b) => sum + b.amount, 0),
                  'VND'
                )}
              </h4>
              <p className="text-muted mb-0 small">Total Revenue</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-light">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Service Bookings ({filteredServiceBookings.length})</h5>
            <div className="d-flex align-items-center">
              <Filter size={16} className="me-2" />
              <span className="small text-muted">
                Showing {filteredServiceBookings.length} of {serviceBookings.length} bookings
              </span>
            </div>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
              <p className="mt-2 text-muted">Loading service bookings...</p>
            </div>
          ) : filteredServiceBookings.length === 0 ? (
            <div className="text-center py-5">
              <Calendar size={48} className="text-muted mb-3" />
              <p className="text-muted">No service bookings found</p>
            </div>
          ) : (
            <Table responsive hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>Booking Ref</th>
                  <th>Customer</th>
                  <th>Service</th>
                  <th>Service Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Booked On</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredServiceBookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>
                      <strong>{booking.bookingReference}</strong>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <User size={16} className="me-2" />
                        {booking.userName}
                      </div>
                    </td>
                    <td>{booking.serviceName}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <Calendar size={16} className="me-2" />
                        {formatDate(booking.serviceDate)}
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <DollarSign size={16} className="me-1" />
                        {formatCurrency(booking.amount, booking.currency)}
                      </div>
                    </td>
                    <td>
                      <Badge bg={getStatusBadgeVariant(booking.status)}>
                        {booking.status}
                      </Badge>
                    </td>
                    <td>{formatDate(booking.bookingDate)}</td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleViewDetails(booking)}
                      >
                        <Eye size={14} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </>
  );

  const renderTourGuideBookings = () => (
    <>
      {/* Statistics Cards */}
      <Row className="g-3 mb-4">
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <h4 className="text-secondary">{tourGuideBookings.filter(b => b.status === 'Pending').length}</h4>
              <p className="text-muted mb-0 small">Pending Bookings</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <h4 className="text-success">{tourGuideBookings.filter(b => b.status === 'Confirmed').length}</h4>
              <p className="text-muted mb-0 small">Confirmed</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <h4 className="text-info">{tourGuideBookings.filter(b => b.status === 'Completed').length}</h4>
              <p className="text-muted mb-0 small">Completed</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <h4 className="text-primary">
                {formatCurrency(
                  tourGuideBookings.reduce((sum, b) => sum + b.totalPrice, 0),
                  'VND'
                )}
              </h4>
              <p className="text-muted mb-0 small">Total Revenue</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-light">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Tour Guide Bookings ({filteredTourGuideBookings.length})</h5>
            <div className="d-flex align-items-center">
              <Filter size={16} className="me-2" />
              <span className="small text-muted">
                Showing {filteredTourGuideBookings.length} of {tourGuideBookings.length} bookings
              </span>
            </div>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
              <p className="mt-2 text-muted">Loading tour guide bookings...</p>
            </div>
          ) : filteredTourGuideBookings.length === 0 ? (
            <div className="text-center py-5">
              <UserCheck size={48} className="text-muted mb-3" />
              <p className="text-muted">No tour guide bookings found</p>
            </div>
          ) : (
            <Table responsive hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>Customer</th>
                  <th>Tour Guide</th>
                  <th>Duration</th>
                  <th>Location</th>
                  <th>Total Price</th>
                  <th>Status</th>
                  <th>Booked On</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTourGuideBookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <User size={16} className="me-2" />
                        {booking.userName}
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <UserCheck size={16} className="me-2" />
                        {booking.tourGuideName}
                      </div>
                    </td>
                    <td>
                      <div>
                        <div className="d-flex align-items-center">
                          <Clock size={16} className="me-2" />
                          <small>
                            {formatDate(booking.startDate)}
                          </small>
                        </div>
                        <small className="text-muted">
                          to {formatDate(booking.endDate)}
                        </small>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <MapPin size={16} className="me-2" />
                        {booking.location || 'Not specified'}
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <DollarSign size={16} className="me-1" />
                        {formatCurrency(booking.totalPrice, booking.currency)}
                      </div>
                    </td>
                    <td>
                      <Badge bg={getStatusBadgeVariant(booking.status)}>
                        {booking.status}
                      </Badge>
                    </td>
                    <td>{formatDate(booking.createdAt)}</td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleViewDetails(booking)}
                      >
                        <Eye size={14} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </>
  );

  return (
    <Container fluid className="py-4">
      {alert && (
        <Alert 
          variant={alert.type} 
          onClose={() => setAlert(null)} 
          dismissible
          className="mb-4"
        >
          {alert.message}
        </Alert>
      )}

      <Row className="mb-4">
        <Col>
          <div className="d-flex align-items-center mb-3">
            <Calendar size={32} className="me-3 text-primary" />
            <div>
              <h2 className="mb-0">Bookings Management</h2>
              <p className="text-muted mb-0">Manage service and tour guide bookings</p>
            </div>
          </div>
        </Col>
      </Row>

      {/* Filters and Search */}
      <Row className="mb-4">
        <Col md={6}>
          <InputGroup>
            <InputGroup.Text>
              <Search size={16} />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search by customer, service, or reference..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={4}>
          <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </Form.Select>
        </Col>
        <Col md={2}>
          <Button 
            variant="outline-primary" 
            onClick={activeTab === 'services' ? fetchServiceBookings : fetchTourGuideBookings} 
            disabled={loading}
          >
            {loading ? <Spinner size="sm" /> : 'Refresh'}
          </Button>
        </Col>
      </Row>

      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'services')} className="mb-4">
        <Tab eventKey="services" title="Service Bookings">
          {renderServiceBookings()}
        </Tab>
        <Tab eventKey="tourguides" title="Tour Guide Bookings">
          {renderTourGuideBookings()}
        </Tab>
      </Tabs>

      {/* Booking Details Modal */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <Edit3 size={20} className="me-2" />
            Booking Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedBooking && (
            <div>
              {isServiceBooking(selectedBooking) ? (
                // Service Booking Details
                <div>
                  <Row className="mb-4">
                    <Col md={6}>
                      <h6>Booking Information</h6>
                      <div className="border rounded p-3 bg-light">
                        <p><strong>Reference:</strong> {selectedBooking.bookingReference}</p>
                        <p><strong>Customer:</strong> {selectedBooking.userName}</p>
                        <p><strong>Service:</strong> {selectedBooking.serviceName}</p>
                        <p><strong>Service Date:</strong> {formatDate(selectedBooking.serviceDate)}</p>
                        <p><strong>Booking Date:</strong> {formatDate(selectedBooking.bookingDate)}</p>
                      </div>
                    </Col>
                    <Col md={6}>
                      <h6>Payment Information</h6>
                      <div className="border rounded p-3 bg-light">
                        <p><strong>Amount:</strong> {formatCurrency(selectedBooking.amount, selectedBooking.currency)}</p>
                        <p><strong>Currency:</strong> {selectedBooking.currency}</p>
                        <p><strong>Status:</strong> 
                          <Badge bg={getStatusBadgeVariant(selectedBooking.status)} className="ms-2">
                            {selectedBooking.status}
                          </Badge>
                        </p>
                      </div>
                    </Col>
                  </Row>
                  {selectedBooking.notes && (
                    <Row>
                      <Col>
                        <h6>Notes</h6>
                        <div className="border rounded p-3 bg-light">
                          <p className="mb-0">{selectedBooking.notes}</p>
                        </div>
                      </Col>
                    </Row>
                  )}
                </div>
              ) : (
                // Tour Guide Booking Details
                <div>
                  <Row className="mb-4">
                    <Col md={6}>
                      <h6>Booking Information</h6>
                      <div className="border rounded p-3 bg-light">
                        <p><strong>Customer:</strong> {selectedBooking.userName}</p>
                        <p><strong>Tour Guide:</strong> {selectedBooking.tourGuideName}</p>
                        <p><strong>Start Date:</strong> {formatDate(selectedBooking.startDate)}</p>
                        <p><strong>End Date:</strong> {formatDate(selectedBooking.endDate)}</p>
                        <p><strong>Location:</strong> {selectedBooking.location || 'Not specified'}</p>
                      </div>
                    </Col>
                    <Col md={6}>
                      <h6>Payment Information</h6>
                      <div className="border rounded p-3 bg-light">
                        <p><strong>Total Price:</strong> {formatCurrency(selectedBooking.totalPrice, selectedBooking.currency)}</p>
                        <p><strong>Currency:</strong> {selectedBooking.currency}</p>
                        <p><strong>Status:</strong> 
                          <Badge bg={getStatusBadgeVariant(selectedBooking.status)} className="ms-2">
                            {selectedBooking.status}
                          </Badge>
                        </p>
                        <p><strong>Booked On:</strong> {formatDate(selectedBooking.createdAt)}</p>
                        <p><strong>Last Updated:</strong> {formatDate(selectedBooking.updatedAt)}</p>
                      </div>
                    </Col>
                  </Row>
                  {selectedBooking.notes && (
                    <Row>
                      <Col>
                        <h6>Notes</h6>
                        <div className="border rounded p-3 bg-light">
                          <p className="mb-0">{selectedBooking.notes}</p>
                        </div>
                      </Col>
                    </Row>
                  )}
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminBookingsManagement;