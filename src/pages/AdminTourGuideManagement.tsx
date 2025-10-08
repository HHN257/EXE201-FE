import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Modal, Form, Alert, InputGroup, Spinner, Tab, Tabs } from 'react-bootstrap';
import { UserCheck, Users, Search, Filter, Eye, CheckCircle, XCircle, Clock, FileText, MapPin, Calendar, Star } from 'lucide-react';
import { config } from '../config';

interface TourGuideVerificationRequest {
  id: number;
  tourGuideId: number;
  tourGuideName: string;
  fullName: string;
  identityNumber: string;
  phoneNumber: string;
  email: string;
  address: string;
  identityCardFrontUrl?: string;
  identityCardBackUrl?: string;
  tourGuideLicenseUrl?: string;
  licenseNumber?: string;
  issuingAuthority?: string;
  licenseIssueDate?: string;
  licenseExpiryDate?: string;
  additionalDocumentsUrls?: string;
  experience: string;
  languages: string;
  specializations: string;
  additionalNotes?: string;
  status: string;
  adminNotes?: string;
  reviewedByAdminId?: number;
  reviewedByAdminName?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface TourGuide {
  id: number;
  name: string;
  bio?: string;
  phoneNumber?: string;
  email: string;
  languages?: string;
  specializations?: string;
  hourlyRate?: number;
  currency?: string;
  profileImage?: string;
  isVerified: boolean;
  isActive: boolean;
  rating?: number;
  totalReviews: number;
  createdAt: string;
}

const AdminTourGuideManagement: React.FC = () => {
  const [verificationRequests, setVerificationRequests] = useState<TourGuideVerificationRequest[]>([]);
  const [tourGuides, setTourGuides] = useState<TourGuide[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<TourGuideVerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<TourGuideVerificationRequest | null>(null);
  const [reviewStatus, setReviewStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [alert, setAlert] = useState<{ type: 'success' | 'danger' | 'warning'; message: string } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('requests');

  const statusOptions = [
    { value: 'All', label: 'All Status' },
    { value: 'Pending', label: 'Pending' },
    { value: 'UnderReview', label: 'Under Review' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Rejected', label: 'Rejected' }
  ];

  useEffect(() => {
    if (activeTab === 'requests') {
      fetchVerificationRequests();
    } else {
      fetchTourGuides();
    }
  }, [activeTab]);

  const filterRequests = useCallback(() => {
    let filtered = verificationRequests;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(request =>
        request.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.tourGuideName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'All') {
      filtered = filtered.filter(request => request.status === statusFilter);
    }

    setFilteredRequests(filtered);
  }, [verificationRequests, searchTerm, statusFilter]);

  useEffect(() => {
    filterRequests();
  }, [filterRequests]);

  const fetchVerificationRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_BASE_URL}/tourguideVerification/admin/all`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const requestData = await response.json();
        setVerificationRequests(requestData);
      } else {
        setAlert({ type: 'danger', message: 'Failed to fetch verification requests' });
      }
    } catch (error) {
      setAlert({ type: 'danger', message: 'Error fetching verification requests' });
      console.error('Error fetching verification requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTourGuides = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_BASE_URL}/tourguides`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const guideData = await response.json();
        setTourGuides(guideData);
      } else {
        setAlert({ type: 'danger', message: 'Failed to fetch tour guides' });
      }
    } catch (error) {
      setAlert({ type: 'danger', message: 'Error fetching tour guides' });
      console.error('Error fetching tour guides:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewRequest = (request: TourGuideVerificationRequest) => {
    setSelectedRequest(request);
    setReviewStatus(request.status);
    setAdminNotes(request.adminNotes || '');
    setShowReviewModal(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedRequest) return;

    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_BASE_URL}/tourguideVerification/admin/${selectedRequest.id}/review`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: reviewStatus,
          adminNotes: adminNotes
        })
      });

      if (response.ok) {
        setAlert({ type: 'success', message: 'Verification request reviewed successfully' });
        setShowReviewModal(false);
        fetchVerificationRequests(); // Refresh the list
      } else {
        const errorData = await response.text();
        setAlert({ type: 'danger', message: errorData || 'Failed to review verification request' });
      }
    } catch {
      setAlert({ type: 'danger', message: 'Error reviewing verification request' });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Approved': return 'success';
      case 'Rejected': return 'danger';
      case 'UnderReview': return 'warning';
      case 'Pending': return 'secondary';
      default: return 'light';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved': return <CheckCircle size={16} />;
      case 'Rejected': return <XCircle size={16} />;
      case 'UnderReview': return <Clock size={16} />;
      case 'Pending': return <Clock size={16} />;
      default: return null;
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

  const renderVerificationRequests = () => (
    <>
      {/* Filters and Search */}
      <Row className="mb-4">
        <Col md={6}>
          <InputGroup>
            <InputGroup.Text>
              <Search size={16} />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search by name, email, or tour guide name..."
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
          <Button variant="outline-primary" onClick={fetchVerificationRequests} disabled={loading}>
            {loading ? <Spinner size="sm" /> : 'Refresh'}
          </Button>
        </Col>
      </Row>

      {/* Statistics Cards */}
      <Row className="g-3 mb-4">
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <h4 className="text-secondary">{verificationRequests.filter(r => r.status === 'Pending').length}</h4>
              <p className="text-muted mb-0 small">Pending Requests</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <h4 className="text-warning">{verificationRequests.filter(r => r.status === 'UnderReview').length}</h4>
              <p className="text-muted mb-0 small">Under Review</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <h4 className="text-success">{verificationRequests.filter(r => r.status === 'Approved').length}</h4>
              <p className="text-muted mb-0 small">Approved</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <h4 className="text-danger">{verificationRequests.filter(r => r.status === 'Rejected').length}</h4>
              <p className="text-muted mb-0 small">Rejected</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Verification Requests Table */}
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-light">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Verification Requests ({filteredRequests.length})</h5>
            <div className="d-flex align-items-center">
              <Filter size={16} className="me-2" />
              <span className="small text-muted">
                Showing {filteredRequests.length} of {verificationRequests.length} requests
              </span>
            </div>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
              <p className="mt-2 text-muted">Loading verification requests...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-5">
              <UserCheck size={48} className="text-muted mb-3" />
              <p className="text-muted">No verification requests found</p>
            </div>
          ) : (
            <Table responsive hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>Applicant</th>
                  <th>Contact</th>
                  <th>License Info</th>
                  <th>Experience</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((request) => (
                  <tr key={request.id}>
                    <td>
                      <div>
                        <strong>{request.fullName}</strong><br />
                        <small className="text-muted">Tour Guide: {request.tourGuideName}</small><br />
                        <small className="text-muted">ID: {request.identityNumber}</small>
                      </div>
                    </td>
                    <td>
                      <div>
                        <small>📧 {request.email}</small><br />
                        <small>📞 {request.phoneNumber}</small><br />
                        <small><MapPin size={12} /> {request.address}</small>
                      </div>
                    </td>
                    <td>
                      <div>
                        {request.licenseNumber && (
                          <>
                            <small><strong>License:</strong> {request.licenseNumber}</small><br />
                            <small><strong>Authority:</strong> {request.issuingAuthority}</small><br />
                          </>
                        )}
                        {request.licenseExpiryDate && (
                          <small><Calendar size={12} /> Expires: {formatDate(request.licenseExpiryDate)}</small>
                        )}
                      </div>
                    </td>
                    <td>
                      <div>
                        <small><strong>Languages:</strong> {request.languages}</small><br />
                        <small><strong>Specializations:</strong> {request.specializations}</small><br />
                        <small className="text-muted">{request.experience.substring(0, 50)}...</small>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center mb-1">
                        {getStatusIcon(request.status)}
                        <Badge bg={getStatusBadgeVariant(request.status)} className="ms-1">
                          {request.status}
                        </Badge>
                      </div>
                      {request.reviewedByAdminName && (
                        <small className="text-muted">By: {request.reviewedByAdminName}</small>
                      )}
                    </td>
                    <td>
                      <small>{formatDate(request.createdAt)}</small>
                      {request.reviewedAt && (
                        <>
                          <br />
                          <small className="text-muted">Reviewed: {formatDate(request.reviewedAt)}</small>
                        </>
                      )}
                    </td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleReviewRequest(request)}
                        disabled={actionLoading}
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

  const renderTourGuides = () => (
    <Card className="border-0 shadow-sm">
      <Card.Header className="bg-light">
        <h5 className="mb-0">All Tour Guides ({tourGuides.length})</h5>
      </Card.Header>
      <Card.Body className="p-0">
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" />
            <p className="mt-2 text-muted">Loading tour guides...</p>
          </div>
        ) : tourGuides.length === 0 ? (
          <div className="text-center py-5">
            <Users size={48} className="text-muted mb-3" />
            <p className="text-muted">No tour guides found</p>
          </div>
        ) : (
          <Table responsive hover className="mb-0">
            <thead className="table-light">
              <tr>
                <th>Tour Guide</th>
                <th>Contact</th>
                <th>Skills</th>
                <th>Rate</th>
                <th>Status</th>
                <th>Reviews</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {tourGuides.map((guide) => (
                <tr key={guide.id}>
                  <td>
                    <div className="d-flex align-items-center">
                      {guide.profileImage && (
                        <img 
                          src={guide.profileImage} 
                          alt={guide.name}
                          className="rounded-circle me-2"
                          style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                        />
                      )}
                      <div>
                        <strong>{guide.name}</strong><br />
                        <small className="text-muted">{guide.bio?.substring(0, 50)}...</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div>
                      <small>📧 {guide.email}</small><br />
                      {guide.phoneNumber && (
                        <small>📞 {guide.phoneNumber}</small>
                      )}
                    </div>
                  </td>
                  <td>
                    <div>
                      <small><strong>Languages:</strong> {guide.languages || 'N/A'}</small><br />
                      <small><strong>Specializations:</strong> {guide.specializations || 'N/A'}</small>
                    </div>
                  </td>
                  <td>
                    {guide.hourlyRate ? (
                      <div>
                        <strong>{guide.hourlyRate.toLocaleString()} {guide.currency}</strong><br />
                        <small className="text-muted">per hour</small>
                      </div>
                    ) : (
                      <small className="text-muted">Not set</small>
                    )}
                  </td>
                  <td>
                    <div>
                      <Badge bg={guide.isVerified ? 'success' : 'warning'}>
                        {guide.isVerified ? 'Verified' : 'Unverified'}
                      </Badge><br />
                      <Badge bg={guide.isActive ? 'success' : 'secondary'} className="mt-1">
                        {guide.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center">
                      <Star size={16} className="text-warning me-1" />
                      <span>{guide.rating ? guide.rating.toFixed(1) : 'N/A'}</span>
                      <br />
                      <small className="text-muted">({guide.totalReviews} reviews)</small>
                    </div>
                  </td>
                  <td>
                    <small>{formatDate(guide.createdAt)}</small>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card.Body>
    </Card>
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
            <UserCheck size={32} className="me-3 text-primary" />
            <div>
              <h2 className="mb-0">Tour Guide Management</h2>
              <p className="text-muted mb-0">Manage verification requests and tour guide profiles</p>
            </div>
          </div>
        </Col>
      </Row>

      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'requests')} className="mb-4">
        <Tab eventKey="requests" title="Verification Requests">
          {renderVerificationRequests()}
        </Tab>
        <Tab eventKey="guides" title="All Tour Guides">
          {renderTourGuides()}
        </Tab>
      </Tabs>

      {/* Review Modal */}
      <Modal show={showReviewModal} onHide={() => setShowReviewModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FileText size={20} className="me-2" />
            Review Verification Request
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRequest && (
            <>
              <Row className="mb-4">
                <Col md={6}>
                  <h6>Applicant Information</h6>
                  <div className="border rounded p-3 bg-light">
                    <p><strong>Full Name:</strong> {selectedRequest.fullName}</p>
                    <p><strong>Email:</strong> {selectedRequest.email}</p>
                    <p><strong>Phone:</strong> {selectedRequest.phoneNumber}</p>
                    <p><strong>Address:</strong> {selectedRequest.address}</p>
                    <p><strong>Identity Number:</strong> {selectedRequest.identityNumber}</p>
                  </div>
                </Col>
                <Col md={6}>
                  <h6>License Information</h6>
                  <div className="border rounded p-3 bg-light">
                    <p><strong>License Number:</strong> {selectedRequest.licenseNumber || 'N/A'}</p>
                    <p><strong>Issuing Authority:</strong> {selectedRequest.issuingAuthority || 'N/A'}</p>
                    {selectedRequest.licenseIssueDate && (
                      <p><strong>Issue Date:</strong> {formatDate(selectedRequest.licenseIssueDate)}</p>
                    )}
                    {selectedRequest.licenseExpiryDate && (
                      <p><strong>Expiry Date:</strong> {formatDate(selectedRequest.licenseExpiryDate)}</p>
                    )}
                  </div>
                </Col>
              </Row>

              <Row className="mb-4">
                <Col>
                  <h6>Experience & Skills</h6>
                  <div className="border rounded p-3 bg-light">
                    <p><strong>Languages:</strong> {selectedRequest.languages}</p>
                    <p><strong>Specializations:</strong> {selectedRequest.specializations}</p>
                    <p><strong>Experience:</strong></p>
                    <p className="mb-2">{selectedRequest.experience}</p>
                    {selectedRequest.additionalNotes && (
                      <>
                        <p><strong>Additional Notes:</strong></p>
                        <p>{selectedRequest.additionalNotes}</p>
                      </>
                    )}
                  </div>
                </Col>
              </Row>

              <Row className="mb-4">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Review Status</Form.Label>
                    <Form.Select 
                      value={reviewStatus} 
                      onChange={(e) => setReviewStatus(e.target.value)}
                    >
                      <option value="Pending">Pending</option>
                      <option value="UnderReview">Under Review</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Current Status</Form.Label>
                    <div className="d-flex align-items-center">
                      {getStatusIcon(selectedRequest.status)}
                      <Badge bg={getStatusBadgeVariant(selectedRequest.status)} className="ms-2">
                        {selectedRequest.status}
                      </Badge>
                    </div>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Admin Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about your review decision..."
                />
              </Form.Group>

              {selectedRequest.adminNotes && (
                <div className="border rounded p-3 bg-warning bg-opacity-10">
                  <p className="mb-1"><strong>Previous Admin Notes:</strong></p>
                  <p className="mb-0">{selectedRequest.adminNotes}</p>
                  {selectedRequest.reviewedByAdminName && (
                    <small className="text-muted">
                      By: {selectedRequest.reviewedByAdminName} 
                      {selectedRequest.reviewedAt && ` on ${formatDate(selectedRequest.reviewedAt)}`}
                    </small>
                  )}
                </div>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReviewModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmitReview}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <>
                <Spinner size="sm" className="me-2" />
                Submitting...
              </>
            ) : (
              'Submit Review'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminTourGuideManagement;