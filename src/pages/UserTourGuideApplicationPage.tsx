import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Modal, Badge, Table } from 'react-bootstrap';
import { FileText, Upload, AlertCircle, CheckCircle, Clock, Eye, UserPlus } from 'lucide-react';
import { verificationService } from '../services/api';
import type { VerificationStatus, TourGuideVerificationRequest, CreateVerificationRequest } from '../types';
import { useAuth } from '../contexts/AuthContext';

const UserTourGuideApplicationPage: React.FC = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<VerificationStatus | null>(null);
  const [requests, setRequests] = useState<TourGuideVerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<TourGuideVerificationRequest | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState<CreateVerificationRequest>({
    fullName: user?.name || '',
    identityNumber: '',
    phoneNumber: user?.phoneNumber || '',
    email: user?.email || '',
    address: '',
    identityCardFrontUrl: '',
    identityCardBackUrl: '',
    tourGuideLicenseUrl: '',
    licenseNumber: '',
    issuingAuthority: '',
    licenseIssueDate: '',
    licenseExpiryDate: '',
    additionalDocumentsUrls: '',
    experience: '',
    languages: user?.preferredLanguage || '',
    specializations: '',
    additionalNotes: ''
  });

  // File upload states
  const [identityCardFrontFile, setIdentityCardFrontFile] = useState<File | null>(null);
  const [identityCardBackFile, setIdentityCardBackFile] = useState<File | null>(null);
  const [licenseFile, setLicenseFile] = useState<File | null>(null);

  // File upload handlers
  const handleFileUpload = async (file: File): Promise<string> => {
    // In a real app, you would upload to a cloud service like AWS S3, Cloudinary, etc.
    // For now, we'll create a mock URL
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockUrl = `https://example.com/uploads/${Date.now()}_${file.name}`;
        resolve(mockUrl);
      }, 1000);
    });
  };

  const handleIdentityCardFrontChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIdentityCardFrontFile(file);
      try {
        const url = await handleFileUpload(file);
        setFormData({...formData, identityCardFrontUrl: url});
      } catch {
        setError('Failed to upload identity card front image');
      }
    }
  };

  const handleIdentityCardBackChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIdentityCardBackFile(file);
      try {
        const url = await handleFileUpload(file);
        setFormData({...formData, identityCardBackUrl: url});
      } catch {
        setError('Failed to upload identity card back image');
      }
    }
  };

  const handleLicenseFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLicenseFile(file);
      try {
        const url = await handleFileUpload(file);
        setFormData({...formData, tourGuideLicenseUrl: url});
      } catch {
        setError('Failed to upload license file');
      }
    }
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      // The backend now supports both User and TourGuide roles
      // So we can call the API endpoints for both roles
      const [statusData, requestsData] = await Promise.all([
        verificationService.getMyStatus(),
        verificationService.getMyRequests()
      ]);
      setStatus(statusData);
      setRequests(requestsData);
    } catch (error) {
      console.log('Error loading data:', error);
      // Set default status on error
      setStatus({
        userId: user?.id,
        userName: user?.name,
        userRole: user?.role || 'User',
        isVerified: false,
        hasPendingRequest: false,
        canSubmitNewRequest: true
      });
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.name, user?.role]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      // Prepare data with proper undefined handling for optional fields
      const submitData = {
        ...formData,
        // Convert empty strings to undefined for optional fields
        licenseNumber: formData.licenseNumber || undefined,
        issuingAuthority: formData.issuingAuthority || undefined,
        licenseIssueDate: formData.licenseIssueDate || undefined,
        licenseExpiryDate: formData.licenseExpiryDate || undefined,
        tourGuideLicenseUrl: formData.tourGuideLicenseUrl || undefined,
        additionalDocumentsUrls: formData.additionalDocumentsUrls || undefined,
        additionalNotes: formData.additionalNotes || undefined
      };

      console.log('Submitting data:', submitData); // Debug log
      await verificationService.submit(submitData);
      setSuccess('Tour Guide application submitted successfully! Staff will review your application.');
      setShowForm(false);
      loadData();
      // Reset form
      setFormData({
        fullName: user?.name || '',
        identityNumber: '',
        phoneNumber: user?.phoneNumber || '',
        email: user?.email || '',
        address: '',
        identityCardFrontUrl: '',
        identityCardBackUrl: '',
        tourGuideLicenseUrl: '',
        licenseNumber: '',
        issuingAuthority: '',
        licenseIssueDate: '',
        licenseExpiryDate: '',
        additionalDocumentsUrls: '',
        experience: '',
        languages: user?.preferredLanguage || '',
        specializations: '',
        additionalNotes: ''
      });
      // Reset file states
      setIdentityCardFrontFile(null);
      setIdentityCardBackFile(null);
      setLicenseFile(null);
    } catch (err: unknown) {
      console.error('Submission error:', err); // Debug log
      const error = err as { 
        response?: { 
          data?: { 
            message?: string;
            errors?: Record<string, string[]>;
            title?: string;
          } 
        } 
      };
      
      let errorMessage = 'Failed to submit application';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.title) {
        errorMessage = error.response.data.title;
      } else if (error.response?.data?.errors) {
        // Handle validation errors
        const validationErrors = Object.values(error.response.data.errors).flat();
        errorMessage = validationErrors.join(', ');
      }
      
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (requestStatus: string) => {
    switch (requestStatus) {
      case 'Pending':
        return <Badge bg="warning"><Clock size={14} className="me-1" />Pending Review</Badge>;
      case 'UnderReview':
        return <Badge bg="info"><Eye size={14} className="me-1" />Under Review</Badge>;
      case 'Approved':
        return <Badge bg="success"><CheckCircle size={14} className="me-1" />Approved - Welcome Tour Guide!</Badge>;
      case 'Rejected':
        return <Badge bg="danger"><AlertCircle size={14} className="me-1" />Rejected</Badge>;
      default:
        return <Badge bg="secondary">{requestStatus}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

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
            <UserPlus size={32} className="me-3 text-primary" />
            <div>
              <h2 className="mb-0">Become a Tour Guide</h2>
              <p className="text-muted mb-0">Apply to join our tour guide community</p>
            </div>
          </div>
        </Col>
      </Row>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Current Status Card */}
      <Row className="mb-4">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-light">
              <h5 className="mb-0">Application Status</h5>
            </Card.Header>
            <Card.Body>
              {status && (
                <Row>
                  <Col md={6}>
                    <div className="mb-3">
                      <strong>Current Role:</strong>
                      <div className="mt-1">
                        <Badge bg="primary" className="fs-6">
                          {status.userRole}
                        </Badge>
                      </div>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="mb-3">
                      <strong>Tour Guide Status:</strong>
                      <div className="mt-1">
                        {status.isVerified ? (
                          <Badge bg="success" className="fs-6">
                            <CheckCircle size={16} className="me-1" />
                            Verified Tour Guide
                          </Badge>
                        ) : (
                          <Badge bg="secondary" className="fs-6">
                            <AlertCircle size={16} className="me-1" />
                            Not a Tour Guide
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Col>
                </Row>
              )}
              
              {status?.canSubmitNewRequest && user?.role === 'User' && (
                <div className="mt-3">
                  <Button 
                    variant="primary" 
                    onClick={() => setShowForm(true)}
                    disabled={submitting}
                  >
                    <FileText size={16} className="me-2" />
                    Apply to Become a Tour Guide
                  </Button>
                  <p className="text-muted mt-2 mb-0">
                    Submit your application to join our tour guide community. Our staff will review your credentials and experience.
                  </p>
                </div>
              )}

              {status?.hasPendingRequest && (
                <Alert variant="info" className="mt-3 mb-0">
                  <Clock size={16} className="me-2" />
                  Your application is being reviewed. We'll notify you once the review is complete.
                </Alert>
              )}

              {user?.role === 'TourGuide' && (
                <Alert variant="success" className="mt-3 mb-0">
                  <CheckCircle size={16} className="me-2" />
                  Congratulations! You are now a verified Tour Guide. You can access your tour guide dashboard.
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Application History */}
      <Row>
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-light">
              <h5 className="mb-0">Application History</h5>
            </Card.Header>
            <Card.Body>
              {requests.length > 0 ? (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Application Date</th>
                      <th>Status</th>
                      <th>Reviewed By</th>
                      <th>Review Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((request) => (
                      <tr key={request.id}>
                        <td>{formatDate(request.createdAt)}</td>
                        <td>{getStatusBadge(request.status)}</td>
                        <td>{request.reviewedByAdminName || '-'}</td>
                        <td>{request.reviewedAt ? formatDate(request.reviewedAt) : '-'}</td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowDetails(true);
                            }}
                          >
                            <Eye size={14} className="me-1" />
                            View Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="text-center py-4 text-muted">
                  <FileText size={48} className="mb-3 text-muted" />
                  <p>No applications submitted yet.</p>
                  {user?.role === 'User' && (
                    <p>Ready to become a tour guide? Click the button above to get started!</p>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Application Form Modal */}
      <Modal show={showForm} onHide={() => setShowForm(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <UserPlus size={20} className="me-2" />
            Tour Guide Application
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="info" className="mb-4">
            <strong>Important:</strong> Once approved, your account role will be changed to Tour Guide and you'll gain access to tour guide features.
          </Alert>
          
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Identity Number *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.identityNumber}
                    onChange={(e) => setFormData({...formData, identityNumber: e.target.value})}
                    required
                    placeholder="ID card or passport number"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Phone Number *</Form.Label>
                  <Form.Control
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email *</Form.Label>
                  <Form.Control
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                placeholder="Your current address"
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Identity Card Front Image</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={handleIdentityCardFrontChange}
                  />
                  <Form.Text className="text-muted">
                    Upload a clear photo of your ID card front side
                  </Form.Text>
                  {identityCardFrontFile && (
                    <div className="mt-2">
                      <small className="text-success">
                        ✓ {identityCardFrontFile.name} uploaded
                      </small>
                    </div>
                  )}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Identity Card Back Image</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={handleIdentityCardBackChange}
                  />
                  <Form.Text className="text-muted">
                    Upload a clear photo of your ID card back side
                  </Form.Text>
                  {identityCardBackFile && (
                    <div className="mt-2">
                      <small className="text-success">
                        ✓ {identityCardBackFile.name} uploaded
                      </small>
                    </div>
                  )}
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Tour Guide License (if any)</Form.Label>
              <Form.Control
                type="file"
                accept="image/*,.pdf"
                onChange={handleLicenseFileChange}
              />
              <Form.Text className="text-muted">
                If you have an official tour guide license, upload it here (image or PDF)
              </Form.Text>
              {licenseFile && (
                <div className="mt-2">
                  <small className="text-success">
                    ✓ {licenseFile.name} uploaded
                  </small>
                </div>
              )}
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>License Number</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
                    placeholder="License number if applicable"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Issuing Authority</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.issuingAuthority}
                    onChange={(e) => setFormData({...formData, issuingAuthority: e.target.value})}
                    placeholder="Who issued the license"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Experience *</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={formData.experience}
                onChange={(e) => setFormData({...formData, experience: e.target.value})}
                placeholder="Describe your relevant experience, background, and why you want to become a tour guide..."
                required
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Languages *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.languages}
                    onChange={(e) => setFormData({...formData, languages: e.target.value})}
                    placeholder="e.g., English, Vietnamese, French"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Specializations</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.specializations}
                    onChange={(e) => setFormData({...formData, specializations: e.target.value})}
                    placeholder="e.g., Historical tours, Adventure tourism, Cultural experiences"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Additional Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.additionalNotes}
                onChange={(e) => setFormData({...formData, additionalNotes: e.target.value})}
                placeholder="Any additional information you'd like to share..."
              />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Submitting Application...
                  </>
                ) : (
                  <>
                    <Upload size={16} className="me-2" />
                    Submit Application
                  </>
                )}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Application Details Modal */}
      <Modal show={showDetails} onHide={() => setShowDetails(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Application Details</Modal.Title>
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
                  <strong>Full Name:</strong>
                  <div className="mt-1">{selectedRequest.fullName}</div>
                </Col>
                <Col md={6}>
                  <strong>Identity Number:</strong>
                  <div className="mt-1">{selectedRequest.identityNumber}</div>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <strong>Phone:</strong>
                  <div className="mt-1">{selectedRequest.phoneNumber}</div>
                </Col>
                <Col md={6}>
                  <strong>Email:</strong>
                  <div className="mt-1">{selectedRequest.email}</div>
                </Col>
              </Row>

              {selectedRequest.address && (
                <div className="mb-3">
                  <strong>Address:</strong>
                  <div className="mt-1">{selectedRequest.address}</div>
                </div>
              )}

              {selectedRequest.experience && (
                <div className="mb-3">
                  <strong>Experience:</strong>
                  <div className="mt-1" style={{ whiteSpace: 'pre-wrap' }}>{selectedRequest.experience}</div>
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

              {selectedRequest.reviewedByAdminName && (
                <div className="mb-3">
                  <strong>Reviewed By:</strong>
                  <div className="mt-1">{selectedRequest.reviewedByAdminName}</div>
                </div>
              )}

              {selectedRequest.adminNotes && (
                <Alert variant={selectedRequest.status === 'Approved' ? 'success' : 'warning'}>
                  <strong>Review Notes:</strong>
                  <div className="mt-1" style={{ whiteSpace: 'pre-wrap' }}>{selectedRequest.adminNotes}</div>
                </Alert>
              )}

              {selectedRequest.status === 'Approved' && (
                <Alert variant="success">
                  <CheckCircle size={16} className="me-2" />
                  <strong>Congratulations!</strong> Your application has been approved. Your account has been upgraded to Tour Guide status.
                </Alert>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetails(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default UserTourGuideApplicationPage;
