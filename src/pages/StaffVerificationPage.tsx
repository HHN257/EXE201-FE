import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Table, Button, Modal, Form, Alert, Badge, Tab, Tabs } from 'react-bootstrap';
import { Shield, Eye, CheckCircle, XCircle, Clock, Search, Filter, Users } from 'lucide-react';
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
      <Modal show={showReviewModal} onHide={() => setShowReviewModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {reviewAction === 'Approved' ? (
              <><CheckCircle size={20} className="me-2 text-success" />Approve Request</>
            ) : (
              <><XCircle size={20} className="me-2 text-danger" />Reject Request</>
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRequest && (
            <div>
              <div className="mb-3">
                <strong>Tour Guide:</strong> {selectedRequest.tourGuideName}
              </div>
              <div className="mb-3">
                <strong>Full Name:</strong> {selectedRequest.fullName}
              </div>
              <div className="mb-3">
                <strong>Email:</strong> {selectedRequest.email}
              </div>
              
              <Form.Group className="mb-3">
                <Form.Label>Admin Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about your decision..."
                />
              </Form.Group>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReviewModal(false)}>
            Cancel
          </Button>
          <Button
            variant={reviewAction === 'Approved' ? 'success' : 'danger'}
            onClick={handleReview}
            disabled={submitting}
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
        </Modal.Footer>
      </Modal>

      {/* Details Modal */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Verification Request Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRequest && (
            <div>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Status:</strong>
                  <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                </Col>
                <Col md={6}>
                  <strong>Submitted:</strong>
                  <div className="mt-1">{formatDate(selectedRequest.createdAt)}</div>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <strong>Tour Guide:</strong>
                  <div className="mt-1">{selectedRequest.tourGuideName}</div>
                </Col>
                <Col md={6}>
                  <strong>Full Name:</strong>
                  <div className="mt-1">{selectedRequest.fullName}</div>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <strong>Identity Number:</strong>
                  <div className="mt-1">{selectedRequest.identityNumber}</div>
                </Col>
                <Col md={6}>
                  <strong>Phone:</strong>
                  <div className="mt-1">{selectedRequest.phoneNumber}</div>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <strong>Email:</strong>
                  <div className="mt-1">{selectedRequest.email}</div>
                </Col>
                <Col md={6}>
                  <strong>Address:</strong>
                  <div className="mt-1">{selectedRequest.address || 'N/A'}</div>
                </Col>
              </Row>

              {selectedRequest.licenseNumber && (
                <Row className="mb-3">
                  <Col md={6}>
                    <strong>License Number:</strong>
                    <div className="mt-1">{selectedRequest.licenseNumber}</div>
                  </Col>
                  <Col md={6}>
                    <strong>Issuing Authority:</strong>
                    <div className="mt-1">{selectedRequest.issuingAuthority || 'N/A'}</div>
                  </Col>
                </Row>
              )}

              {selectedRequest.experience && (
                <div className="mb-3">
                  <strong>Experience:</strong>
                  <div className="mt-1">{selectedRequest.experience}</div>
                </div>
              )}

              {selectedRequest.languages && (
                <div className="mb-3">
                  <strong>Languages:</strong>
                  <div className="mt-1">{selectedRequest.languages}</div>
                </div>
              )}

              {selectedRequest.specializations && (
                <div className="mb-3">
                  <strong>Specializations:</strong>
                  <div className="mt-1">{selectedRequest.specializations}</div>
                </div>
              )}

              {selectedRequest.additionalNotes && (
                <div className="mb-3">
                  <strong>Additional Notes:</strong>
                  <div className="mt-1">{selectedRequest.additionalNotes}</div>
                </div>
              )}

              {selectedRequest.reviewedByAdminName && (
                <Row className="mb-3">
                  <Col md={6}>
                    <strong>Reviewed By:</strong>
                    <div className="mt-1">{selectedRequest.reviewedByAdminName}</div>
                  </Col>
                  <Col md={6}>
                    <strong>Review Date:</strong>
                    <div className="mt-1">{selectedRequest.reviewedAt ? formatDate(selectedRequest.reviewedAt) : 'N/A'}</div>
                  </Col>
                </Row>
              )}

              {selectedRequest.adminNotes && (
                <Alert variant={selectedRequest.status === 'Approved' ? 'success' : 'warning'}>
                  <strong>Admin Notes:</strong>
                  <div className="mt-1">{selectedRequest.adminNotes}</div>
                </Alert>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Close
          </Button>
          {selectedRequest && (selectedRequest.status === 'Pending' || selectedRequest.status === 'UnderReview') && (
            <div className="d-flex gap-2">
              <Button
                variant="success"
                onClick={() => {
                  setReviewAction('Approved');
                  setShowDetailsModal(false);
                  setShowReviewModal(true);
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
              >
                <XCircle size={16} className="me-2" />
                Reject
              </Button>
            </div>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default StaffVerificationPage;
