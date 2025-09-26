import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Table, Button, Modal, Form, Alert, Badge, Tab, Tabs } from 'react-bootstrap';
import { Shield, Eye, CheckCircle, XCircle, Clock, Search, Filter, Users, FileText, AlertCircle } from 'lucide-react';
import { verificationService, tourGuideService } from '../services/api';
import type { TourGuideVerificationRequest, AdminReviewRequest } from '../types';
import type { TourGuideDto } from '../services/api';

const StaffVerificationPage: React.FC = () => {
  const [requests, setRequests] = useState<TourGuideVerificationRequest[]>([]);
  const [tourGuides, setTourGuides] = useState<TourGuideDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<TourGuideVerificationRequest | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [reviewAction, setReviewAction] = useState<'Approved' | 'Rejected' | 'UnderReview'>('UnderReview');
  const [adminNotes, setAdminNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('requests');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [requestsData, tourGuidesData] = await Promise.all([
        verificationService.getAllRequests({ status: statusFilter || undefined }),
        tourGuideService.getAll()
      ]);
      setRequests(requestsData);
      setTourGuides(tourGuidesData);
    } catch {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleReview = async () => {
    if (!selectedRequest) return;

    setSubmitting(true);
    setError('');

    try {
      const reviewData: AdminReviewRequest = {
        status: reviewAction,
        adminNotes: adminNotes || undefined
      };

      await verificationService.review(selectedRequest.id, reviewData);
      setSuccess(`Request ${reviewAction.toLowerCase()} successfully!`);
      setShowReviewModal(false);
      setAdminNotes('');
      loadData();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to review request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDirectVerification = async (tourGuideId: number, isVerified: boolean) => {
    try {
      await verificationService.verifyDirectly(tourGuideId, isVerified);
      setSuccess(`Tour guide ${isVerified ? 'verified' : 'unverified'} successfully!`);
      loadData();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to update verification status');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Badge bg="warning"><Clock size={14} className="me-1" />Pending</Badge>;
      case 'UnderReview':
        return <Badge bg="info"><Eye size={14} className="me-1" />Under Review</Badge>;
      case 'Approved':
        return <Badge bg="success"><CheckCircle size={14} className="me-1" />Approved</Badge>;
      case 'Rejected':
        return <Badge bg="danger"><XCircle size={14} className="me-1" />Rejected</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const filteredRequests = requests.filter(request =>
    request.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.tourGuideName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTourGuides = tourGuides.filter(guide =>
    guide.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guide.bio?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Container className="py-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex align-items-center mb-3">
            <Shield size={32} className="me-3 text-warning" />
            <div>
              <h2 className="mb-0">Tour Guide Verification Management</h2>
              <p className="text-muted mb-0">Review and manage tour guide verification requests</p>
            </div>
          </div>
        </Col>
      </Row>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

      <Tabs activeKey={activeTab} onSelect={(key) => setActiveTab(key || 'requests')} className="mb-4">
        <Tab eventKey="requests" title="Verification Requests">
          {/* Filters */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Search</Form.Label>
                <div className="position-relative">
                  <Search size={16} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                  <Form.Control
                    type="text"
                    placeholder="Search by name, email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="ps-5"
                  />
                </div>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Filter by Status</Form.Label>
                <div className="position-relative">
                  <Filter size={16} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                  <Form.Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="ps-5"
                  >
                    <option value="">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="UnderReview">Under Review</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </Form.Select>
                </div>
              </Form.Group>
            </Col>
          </Row>

          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-light">
              <h5 className="mb-0">Verification Requests ({filteredRequests.length})</h5>
            </Card.Header>
            <Card.Body className="p-0">
              {filteredRequests.length > 0 ? (
                <Table responsive hover className="mb-0">
                  <thead>
                    <tr>
                      <th>Tour Guide</th>
                      <th>Full Name</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Submitted</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map((request) => (
                      <tr key={request.id}>
                        <td>{request.tourGuideName}</td>
                        <td>{request.fullName}</td>
                        <td>{request.email}</td>
                        <td>{getStatusBadge(request.status)}</td>
                        <td>{formatDate(request.createdAt)}</td>
                        <td>
                          <div className="d-flex gap-1">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => {
                                setSelectedRequest(request);
                                setShowDetailsModal(true);
                              }}
                            >
                              <Eye size={14} />
                            </Button>
                            {(request.status === 'Pending' || request.status === 'UnderReview') && (
                              <>
                                <Button
                                  variant="outline-success"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedRequest(request);
                                    setReviewAction('Approved');
                                    setShowReviewModal(true);
                                  }}
                                >
                                  <CheckCircle size={14} />
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedRequest(request);
                                    setReviewAction('Rejected');
                                    setShowReviewModal(true);
                                  }}
                                >
                                  <XCircle size={14} />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="text-center py-5 text-muted">
                  <Shield size={48} className="mb-3 text-muted" />
                  <p>No verification requests found.</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="tourguides" title="Tour Guides">
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-light">
              <h5 className="mb-0">
                <Users size={20} className="me-2" />
                All Tour Guides ({filteredTourGuides.length})
              </h5>
            </Card.Header>
            <Card.Body className="p-0">
              {filteredTourGuides.length > 0 ? (
                <Table responsive hover className="mb-0">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Languages</th>
                      <th>Rating</th>
                      <th>Verification Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTourGuides.map((guide) => (
                      <tr key={guide.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            {guide.profileImage && (
                              <img
                                src={guide.profileImage}
                                alt={guide.name}
                                className="rounded-circle me-2"
                                style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                              />
                            )}
                            <div>
                              <div className="fw-bold">{guide.name}</div>
                              <small className="text-muted">{guide.bio?.substring(0, 50)}...</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          {guide.languages ? (
                            guide.languages.split(',').map((lang: string, index: number) => (
                              <Badge key={index} bg="light" text="dark" className="me-1">
                                {lang.trim()}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted">N/A</span>
                          )}
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <span className="text-warning me-1">★</span>
                            {guide.rating?.toFixed(1) || '0.0'} ({guide.totalReviews} reviews)
                          </div>
                        </td>
                        <td>
                          {guide.isVerified ? (
                            <Badge bg="success">
                              <CheckCircle size={14} className="me-1" />
                              Verified
                            </Badge>
                          ) : (
                            <Badge bg="secondary">
                              <XCircle size={14} className="me-1" />
                              Not Verified
                            </Badge>
                          )}
                        </td>
                        <td>
                          <Button
                            variant={guide.isVerified ? 'outline-danger' : 'outline-success'}
                            size="sm"
                            onClick={() => handleDirectVerification(guide.id, !guide.isVerified)}
                          >
                            {guide.isVerified ? (
                              <>
                                <XCircle size={14} className="me-1" />
                                Unverify
                              </>
                            ) : (
                              <>
                                <CheckCircle size={14} className="me-1" />
                                Verify
                              </>
                            )}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="text-center py-5 text-muted">
                  <Users size={48} className="mb-3 text-muted" />
                  <p>No tour guides found.</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>

      {/* Review Modal */}
      <Modal show={showReviewModal} onHide={() => setShowReviewModal(false)} className="staff-review-modal">
        <Modal.Header closeButton className="bg-gradient border-0" style={{ 
          background: reviewAction === 'Approved' 
            ? 'linear-gradient(135deg, #28a745 0%, #20c997 100%)' 
            : 'linear-gradient(135deg, #dc3545 0%, #fd7e14 100%)'
        }}>
          <Modal.Title className="text-white d-flex align-items-center">
            <div className="bg-white bg-opacity-20 rounded-circle p-2 me-3">
              {reviewAction === 'Approved' ? (
                <CheckCircle size={24} className="text-white" />
              ) : (
                <XCircle size={24} className="text-white" />
              )}
            </div>
            <div>
              <h4 className="mb-0">
                {reviewAction === 'Approved' ? 'Approve Request' : 'Reject Request'}
              </h4>
              <small className="opacity-75">Review verification application</small>
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4" style={{ backgroundColor: '#f8f9fa' }}>
          {selectedRequest && (
            <div>
              {/* Application Overview */}
              <div className="bg-white rounded-3 p-4 mb-4 shadow-sm border">
                <h6 className="text-primary mb-3 d-flex align-items-center">
                  <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-2">
                    <Shield size={16} />
                  </div>
                  Application Summary
                </h6>
                <Row>
                  <Col md={6}>
                    <div className="mb-3">
                      <strong className="text-dark">Tour Guide:</strong>
                      <div className="mt-1 text-muted">{selectedRequest.tourGuideName || selectedRequest.userName}</div>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="mb-3">
                      <strong className="text-dark">Full Name:</strong>
                      <div className="mt-1 text-muted">{selectedRequest.fullName}</div>
                    </div>
                  </Col>
                </Row>
                <div className="mb-0">
                  <strong className="text-dark">Email:</strong>
                  <div className="mt-1 text-muted">{selectedRequest.email}</div>
                </div>
              </div>
              
              {/* Admin Decision */}
              <div className="bg-white rounded-3 p-4 shadow-sm border">
                <h6 className="text-primary mb-3 d-flex align-items-center">
                  <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-2">
                    <FileText size={16} />
                  </div>
                  Review Notes
                </h6>
                <Form.Group className="mb-0">
                  <Form.Label className="fw-semibold text-dark">Admin Notes</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add notes about your decision..."
                    className="border-2"
                    style={{ borderRadius: '10px' }}
                  />
                  <Form.Text className="text-muted">
                    These notes will be visible to the applicant and help them understand your decision.
                  </Form.Text>
                </Form.Group>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 bg-light">
          <div className="d-flex justify-content-between align-items-center w-100">
            <small className="text-muted">
              <AlertCircle size={16} className="me-1" />
              This action cannot be undone
            </small>
            <div className="d-flex gap-3">
              <Button 
                variant="outline-secondary" 
                onClick={() => setShowReviewModal(false)}
                className="px-4"
                style={{ borderRadius: '25px' }}
              >
                Cancel
              </Button>
              <Button
                variant={reviewAction === 'Approved' ? 'success' : 'danger'}
                onClick={handleReview}
                disabled={submitting}
                className="px-4 shadow-sm"
                style={{ 
                  borderRadius: '25px',
                  background: reviewAction === 'Approved' 
                    ? 'linear-gradient(135deg, #28a745 0%, #20c997 100%)' 
                    : 'linear-gradient(135deg, #dc3545 0%, #fd7e14 100%)',
                  border: 'none'
                }}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    {reviewAction === 'Approved' ? <CheckCircle size={16} className="me-2" /> : <XCircle size={16} className="me-2" />}
                    {reviewAction}
                  </>
                )}
              </Button>
            </div>
          </div>
        </Modal.Footer>
      </Modal>

      {/* Details Modal */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg" className="staff-details-modal">
        <Modal.Header closeButton className="bg-gradient border-0" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <Modal.Title className="text-white d-flex align-items-center">
            <div className="bg-white bg-opacity-20 rounded-circle p-2 me-3">
              <Eye size={24} className="text-white" />
            </div>
            <div>
              <h4 className="mb-0">Verification Request Details</h4>
              <small className="opacity-75">Complete application review</small>
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4" style={{ backgroundColor: '#f8f9fa' }}>
          {selectedRequest && (
            <div>
              {/* Status Overview */}
              <div className="bg-white rounded-3 p-4 mb-4 shadow-sm border">
                <h5 className="text-primary mb-3 d-flex align-items-center">
                  <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-2">
                    <Clock size={18} />
                  </div>
                  Application Status
                </h5>
                <Row>
                  <Col md={6}>
                    <div className="mb-3">
                      <strong className="text-dark">Current Status:</strong>
                      <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="mb-3">
                      <strong className="text-dark">Submitted:</strong>
                      <div className="mt-1 text-muted">{formatDate(selectedRequest.createdAt)}</div>
                    </div>
                  </Col>
                </Row>
              </div>

              {/* Personal Information */}
              <div className="bg-white rounded-3 p-4 mb-4 shadow-sm border">
                <h5 className="text-primary mb-3 d-flex align-items-center">
                  <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-2">
                    <Shield size={18} />
                  </div>
                  Personal Information
                </h5>
                <Row>
                  <Col md={6}>
                    <div className="mb-3">
                      <strong className="text-dark">Tour Guide:</strong>
                      <div className="mt-1 text-muted">{selectedRequest.tourGuideName || selectedRequest.userName || 'N/A'}</div>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="mb-3">
                      <strong className="text-dark">Full Name:</strong>
                      <div className="mt-1 text-muted">{selectedRequest.fullName}</div>
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <div className="mb-3">
                      <strong className="text-dark">Identity Number:</strong>
                      <div className="mt-1 text-muted">{selectedRequest.identityNumber}</div>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="mb-3">
                      <strong className="text-dark">Phone:</strong>
                      <div className="mt-1 text-muted">{selectedRequest.phoneNumber}</div>
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <div className="mb-3">
                      <strong className="text-dark">Email:</strong>
                      <div className="mt-1 text-muted">{selectedRequest.email}</div>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="mb-3">
                      <strong className="text-dark">Address:</strong>
                      <div className="mt-1 text-muted">{selectedRequest.address || 'N/A'}</div>
                    </div>
                  </Col>
                </Row>
              </div>

              {/* License Information */}
              {selectedRequest.licenseNumber && (
                <div className="bg-white rounded-3 p-4 mb-4 shadow-sm border">
                  <h5 className="text-primary mb-3 d-flex align-items-center">
                    <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-2">
                      <Shield size={18} />
                    </div>
                    License Information
                  </h5>
                  <Row>
                    <Col md={6}>
                      <div className="mb-3">
                        <strong className="text-dark">License Number:</strong>
                        <div className="mt-1 text-muted">{selectedRequest.licenseNumber}</div>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="mb-3">
                        <strong className="text-dark">Issuing Authority:</strong>
                        <div className="mt-1 text-muted">{selectedRequest.issuingAuthority || 'N/A'}</div>
                      </div>
                    </Col>
                  </Row>
                </div>
              )}

              {/* Professional Qualifications */}
              {(selectedRequest.experience || selectedRequest.languages || selectedRequest.specializations) && (
                <div className="bg-white rounded-3 p-4 mb-4 shadow-sm border">
                  <h5 className="text-primary mb-3 d-flex align-items-center">
                    <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-2">
                      <FileText size={18} />
                    </div>
                    Professional Qualifications
                  </h5>
                  
                  {selectedRequest.experience && (
                    <div className="mb-3">
                      <strong className="text-dark">Experience:</strong>
                      <div className="mt-2 p-3 bg-light rounded-2" style={{ whiteSpace: 'pre-wrap' }}>
                        {selectedRequest.experience}
                      </div>
                    </div>
                  )}

                  <Row>
                    {selectedRequest.languages && (
                      <Col md={6}>
                        <div className="mb-3">
                          <strong className="text-dark">Languages:</strong>
                          <div className="mt-1">
                            {selectedRequest.languages.split(',').map((lang: string, index: number) => (
                              <Badge key={index} bg="primary" className="me-1 mb-1">
                                {lang.trim()}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </Col>
                    )}

                    {selectedRequest.specializations && (
                      <Col md={6}>
                        <div className="mb-3">
                          <strong className="text-dark">Specializations:</strong>
                          <div className="mt-1">
                            {selectedRequest.specializations.split(',').map((spec: string, index: number) => (
                              <Badge key={index} bg="secondary" className="me-1 mb-1">
                                {spec.trim()}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </Col>
                    )}
                  </Row>
                </div>
              )}

              {/* Additional Notes */}
              {selectedRequest.additionalNotes && (
                <div className="bg-white rounded-3 p-4 mb-4 shadow-sm border">
                  <h6 className="text-primary mb-2">Additional Notes</h6>
                  <div className="mt-2 p-3 bg-light rounded-2" style={{ whiteSpace: 'pre-wrap' }}>
                    {selectedRequest.additionalNotes}
                  </div>
                </div>
              )}

              {/* Document Images Section */}
              {(selectedRequest.identityCardFrontUrl || selectedRequest.identityCardBackUrl || selectedRequest.tourGuideLicenseUrl) && (
                <div className="bg-white rounded-3 p-4 mb-4 shadow-sm border">
                  <h5 className="text-primary mb-3 d-flex align-items-center">
                    <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-2">
                      <FileText size={18} />
                    </div>
                    Submitted Documents
                  </h5>
                  <Row className="g-3">
                    {selectedRequest.identityCardFrontUrl && (
                      <Col md={4}>
                        <div className="text-center">
                          <p className="mb-2 fw-semibold text-dark">Identity Card (Front)</p>
                          <div className="position-relative">
                            <img
                              src={selectedRequest.identityCardFrontUrl}
                              alt="Identity Card Front"
                              className="img-thumbnail w-100 shadow-sm"
                              style={{ 
                                height: '200px', 
                                objectFit: 'cover', 
                                cursor: 'pointer',
                                borderRadius: '12px'
                              }}
                              onClick={() => window.open(selectedRequest.identityCardFrontUrl, '_blank')}
                            />
                            <div className="position-absolute top-0 end-0 m-2">
                              <Badge bg="primary" className="shadow-sm">
                                <Eye size={12} className="me-1" />
                                View
                              </Badge>
                            </div>
                          </div>
                          <small className="text-muted d-block mt-1">Click to view full size</small>
                        </div>
                      </Col>
                    )}
                    {selectedRequest.identityCardBackUrl && (
                      <Col md={4}>
                        <div className="text-center">
                          <p className="mb-2 fw-semibold text-dark">Identity Card (Back)</p>
                          <div className="position-relative">
                            <img
                              src={selectedRequest.identityCardBackUrl}
                              alt="Identity Card Back"
                              className="img-thumbnail w-100 shadow-sm"
                              style={{ 
                                height: '200px', 
                                objectFit: 'cover', 
                                cursor: 'pointer',
                                borderRadius: '12px'
                              }}
                              onClick={() => window.open(selectedRequest.identityCardBackUrl, '_blank')}
                            />
                            <div className="position-absolute top-0 end-0 m-2">
                              <Badge bg="primary" className="shadow-sm">
                                <Eye size={12} className="me-1" />
                                View
                              </Badge>
                            </div>
                          </div>
                          <small className="text-muted d-block mt-1">Click to view full size</small>
                        </div>
                      </Col>
                    )}
                    {selectedRequest.tourGuideLicenseUrl && (
                      <Col md={4}>
                        <div className="text-center">
                          <p className="mb-2 fw-semibold text-dark">Tour Guide License</p>
                          <div className="position-relative">
                            <img
                              src={selectedRequest.tourGuideLicenseUrl}
                              alt="Tour Guide License"
                              className="img-thumbnail w-100 shadow-sm"
                              style={{ 
                                height: '200px', 
                                objectFit: 'cover', 
                                cursor: 'pointer',
                                borderRadius: '12px'
                              }}
                              onClick={() => window.open(selectedRequest.tourGuideLicenseUrl, '_blank')}
                            />
                            <div className="position-absolute top-0 end-0 m-2">
                              <Badge bg="primary" className="shadow-sm">
                                <Eye size={12} className="me-1" />
                                View
                              </Badge>
                            </div>
                          </div>
                          <small className="text-muted d-block mt-1">Click to view full size</small>
                        </div>
                      </Col>
                    )}
                  </Row>
                </div>
              )}

              {/* Admin Review Section */}
              {(selectedRequest.reviewedByAdminName || selectedRequest.adminNotes) && (
                <div className="bg-white rounded-3 p-4 mb-4 shadow-sm border">
                  <h5 className="text-primary mb-3 d-flex align-items-center">
                    <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-2">
                      <Eye size={18} />
                    </div>
                    Admin Review
                  </h5>
                  {selectedRequest.reviewedByAdminName && (
                    <Row className="mb-3">
                      <Col md={6}>
                        <div className="mb-3">
                          <strong className="text-dark">Reviewed By:</strong>
                          <div className="mt-1 text-muted">{selectedRequest.reviewedByAdminName}</div>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="mb-3">
                          <strong className="text-dark">Review Date:</strong>
                          <div className="mt-1 text-muted">{selectedRequest.reviewedAt ? formatDate(selectedRequest.reviewedAt) : 'N/A'}</div>
                        </div>
                      </Col>
                    </Row>
                  )}
                  {selectedRequest.adminNotes && (
                    <div className="mb-0">
                      <strong className="text-dark">Admin Notes:</strong>
                      <div className="mt-2 p-3 rounded-2" style={{ 
                        backgroundColor: selectedRequest.status === 'Approved' ? '#d4edda' : '#fff3cd',
                        whiteSpace: 'pre-wrap'
                      }}>
                        {selectedRequest.adminNotes}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 bg-light">
          <div className="d-flex justify-content-between align-items-center w-100">
            <Button 
              variant="outline-primary" 
              onClick={() => setShowDetailsModal(false)}
              className="px-4"
              style={{ borderRadius: '25px' }}
            >
              Close
            </Button>
            {selectedRequest && (selectedRequest.status === 'Pending' || selectedRequest.status === 'UnderReview') && (
              <div className="d-flex gap-3">
                <Button
                  variant="success"
                  onClick={() => {
                    setReviewAction('Approved');
                    setShowDetailsModal(false);
                    setShowReviewModal(true);
                  }}
                  className="px-4 shadow-sm"
                  style={{ 
                    borderRadius: '25px',
                    background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                    border: 'none'
                  }}
                >
                  <CheckCircle size={16} className="me-2" />
                  Approve
                </Button>
                <Button
                  variant="danger"
                  onClick={() => {
                    setReviewAction('Rejected');
                    setShowDetailsModal(false);
                    setShowReviewModal(true);
                  }}
                  className="px-4 shadow-sm"
                  style={{ 
                    borderRadius: '25px',
                    background: 'linear-gradient(135deg, #dc3545 0%, #fd7e14 100%)',
                    border: 'none'
                  }}
                >
                  <XCircle size={16} className="me-2" />
                  Reject
                </Button>
              </div>
            )}
          </div>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default StaffVerificationPage;
