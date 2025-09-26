import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Modal, Badge, Table, Image } from 'react-bootstrap';
import { FileText, Upload, AlertCircle, CheckCircle, Clock, Eye, UserPlus, X, Shield } from 'lucide-react';
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
    identityCardFrontUrl: undefined,
    identityCardBackUrl: undefined,
    tourGuideLicenseUrl: undefined,
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
  
  // Image preview states
  const [identityCardFrontPreview, setIdentityCardFrontPreview] = useState<string | null>(null);
  const [identityCardBackPreview, setIdentityCardBackPreview] = useState<string | null>(null);
  const [licensePreview, setLicensePreview] = useState<string | null>(null);

  // File upload handlers

  const handleIdentityCardFrontChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIdentityCardFrontFile(file);
      setFormData({...formData, identityCardFrontUrl: file});
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setIdentityCardFrontPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleIdentityCardBackChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIdentityCardBackFile(file);
      setFormData({...formData, identityCardBackUrl: file});
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setIdentityCardBackPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLicenseFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLicenseFile(file);
      setFormData({...formData, tourGuideLicenseUrl: file});
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLicensePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
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
        identityCardFrontUrl: undefined,
        identityCardBackUrl: undefined,
        tourGuideLicenseUrl: undefined,
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
      // Reset preview states
      setIdentityCardFrontPreview(null);
      setIdentityCardBackPreview(null);
      setLicensePreview(null);
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
      <Modal show={showForm} onHide={() => setShowForm(false)} size="lg" className="tour-guide-modal">
        <Modal.Header closeButton className="bg-gradient" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <Modal.Title className="text-white d-flex align-items-center">
            <div className="bg-white bg-opacity-20 rounded-circle p-2 me-3">
              <UserPlus size={24} className="text-white" />
            </div>
            <div>
              <h4 className="mb-0">Tour Guide Application</h4>
              <small className="opacity-75">Join our community of professional guides</small>
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4" style={{ backgroundColor: '#f8f9fa' }}>
          <div className="mb-4 p-3 rounded-3 border-start border-4 border-info bg-white shadow-sm">
            <div className="d-flex align-items-start">
              <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                <Shield size={20} className="text-primary" />
              </div>
              <div>
                <h6 className="text-primary mb-1">Important Information</h6>
                <p className="mb-0 text-muted">Once approved, your account will be upgraded to Tour Guide status, unlocking professional features and opportunities.</p>
              </div>
            </div>
          </div>
          
          <Form onSubmit={handleSubmit}>
            {/* Personal Information Section */}
            <div className="bg-white rounded-3 p-4 mb-4 shadow-sm border">
              <h5 className="text-primary mb-3 d-flex align-items-center">
                <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-2">
                  <UserPlus size={18} />
                </div>
                Personal Information
              </h5>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold text-dark">Full Name *</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      required
                      className="border-2"
                      style={{ borderRadius: '10px' }}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold text-dark">Identity Number *</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.identityNumber}
                      onChange={(e) => setFormData({...formData, identityNumber: e.target.value})}
                      required
                      placeholder="ID card or passport number"
                      className="border-2"
                      style={{ borderRadius: '10px' }}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold text-dark">Phone Number *</Form.Label>
                    <Form.Control
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                      required
                      className="border-2"
                      style={{ borderRadius: '10px' }}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold text-dark">Email *</Form.Label>
                    <Form.Control
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                      className="border-2"
                      style={{ borderRadius: '10px' }}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-0">
                <Form.Label className="fw-semibold text-dark">Address</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="Your current address"
                  className="border-2"
                  style={{ borderRadius: '10px' }}
                />
              </Form.Group>
            </div>

            {/* Document Upload Section */}
            <div className="bg-white rounded-3 p-4 mb-4 shadow-sm border">
              <h5 className="text-primary mb-3 d-flex align-items-center">
                <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-2">
                  <FileText size={18} />
                </div>
                Required Documents
              </h5>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold text-dark">Identity Card Front Image *</Form.Label>
                    <div 
                      className="border-2 border-dashed rounded-3 p-4 text-center transition-all" 
                      style={{ 
                        minHeight: '160px', 
                        borderColor: identityCardFrontFile ? '#28a745' : '#e9ecef',
                        backgroundColor: identityCardFrontFile ? '#f8fff9' : '#fafbfc'
                      }}
                    >
                      {identityCardFrontPreview ? (
                        <div className="position-relative d-inline-block">
                          <Image
                            src={identityCardFrontPreview}
                            alt="Identity Card Front Preview"
                            className="img-thumbnail shadow-sm"
                            style={{ maxWidth: '200px', maxHeight: '150px', borderRadius: '12px' }}
                          />
                          <Button
                            variant="danger"
                            size="sm"
                            className="position-absolute top-0 end-0 rounded-circle shadow-sm"
                            style={{ width: '32px', height: '32px', transform: 'translate(8px, -8px)' }}
                            onClick={() => {
                              setIdentityCardFrontFile(null);
                              setIdentityCardFrontPreview(null);
                              setFormData({...formData, identityCardFrontUrl: undefined});
                            }}
                          >
                            <X size={14} />
                          </Button>
                        </div>
                      ) : (
                        <div>
                          <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3">
                            <Upload size={32} className="text-primary" />
                          </div>
                          <p className="mb-1 fw-semibold text-dark">Click to upload ID card front</p>
                          <small className="text-muted">Clear photo required • JPG, PNG formats</small>
                        </div>
                      )}
                    </div>
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={handleIdentityCardFrontChange}
                      className="mt-3 border-2"
                      style={{ borderRadius: '10px' }}
                      required
                    />
                    {identityCardFrontFile && (
                      <div className="mt-2 p-2 bg-success bg-opacity-10 rounded-2">
                        <small className="text-success d-flex align-items-center">
                          <CheckCircle size={14} className="me-1" />
                          {identityCardFrontFile.name} uploaded successfully
                        </small>
                      </div>
                    )}
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold text-dark">Identity Card Back Image *</Form.Label>
                    <div 
                      className="border-2 border-dashed rounded-3 p-4 text-center transition-all" 
                      style={{ 
                        minHeight: '160px', 
                        borderColor: identityCardBackFile ? '#28a745' : '#e9ecef',
                        backgroundColor: identityCardBackFile ? '#f8fff9' : '#fafbfc'
                      }}
                    >
                      {identityCardBackPreview ? (
                        <div className="position-relative d-inline-block">
                          <Image
                            src={identityCardBackPreview}
                            alt="Identity Card Back Preview"
                            className="img-thumbnail shadow-sm"
                            style={{ maxWidth: '200px', maxHeight: '150px', borderRadius: '12px' }}
                          />
                          <Button
                            variant="danger"
                            size="sm"
                            className="position-absolute top-0 end-0 rounded-circle shadow-sm"
                            style={{ width: '32px', height: '32px', transform: 'translate(8px, -8px)' }}
                            onClick={() => {
                              setIdentityCardBackFile(null);
                              setIdentityCardBackPreview(null);
                              setFormData({...formData, identityCardBackUrl: undefined});
                            }}
                          >
                            <X size={14} />
                          </Button>
                        </div>
                      ) : (
                        <div>
                          <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3">
                            <Upload size={32} className="text-primary" />
                          </div>
                          <p className="mb-1 fw-semibold text-dark">Click to upload ID card back</p>
                          <small className="text-muted">Clear photo required • JPG, PNG formats</small>
                        </div>
                      )}
                    </div>
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={handleIdentityCardBackChange}
                      className="mt-3 border-2"
                      style={{ borderRadius: '10px' }}
                      required
                    />
                    {identityCardBackFile && (
                      <div className="mt-2 p-2 bg-success bg-opacity-10 rounded-2">
                        <small className="text-success d-flex align-items-center">
                          <CheckCircle size={14} className="me-1" />
                          {identityCardBackFile.name} uploaded successfully
                        </small>
                      </div>
                    )}
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-0">
                <Form.Label className="fw-semibold text-dark">Tour Guide License (if any)</Form.Label>
                <div 
                  className="border-2 border-dashed rounded-3 p-4 text-center transition-all" 
                  style={{ 
                    minHeight: '160px', 
                    borderColor: licenseFile ? '#28a745' : '#e9ecef',
                    backgroundColor: licenseFile ? '#f8fff9' : '#fafbfc'
                  }}
                >
                  {licensePreview ? (
                    <div className="position-relative d-inline-block">
                      <Image
                        src={licensePreview}
                        alt="License Preview"
                        className="img-thumbnail shadow-sm"
                        style={{ maxWidth: '200px', maxHeight: '150px', borderRadius: '12px' }}
                      />
                      <Button
                        variant="danger"
                        size="sm"
                        className="position-absolute top-0 end-0 rounded-circle shadow-sm"
                        style={{ width: '32px', height: '32px', transform: 'translate(8px, -8px)' }}
                        onClick={() => {
                          setLicenseFile(null);
                          setLicensePreview(null);
                          setFormData({...formData, tourGuideLicenseUrl: undefined});
                        }}
                      >
                        <X size={14} />
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3">
                        <Upload size={32} className="text-primary" />
                      </div>
                      <p className="mb-1 fw-semibold text-dark">Click to upload license document</p>
                      <small className="text-muted">Optional • JPG, PNG formats</small>
                    </div>
                  )}
                </div>
              <Form.Control
                type="file"
                accept="image/*,.pdf"
                onChange={handleLicenseFileChange}
                className="mt-2"
              />
              {licenseFile && (
                <div className="mt-2">
                  <small className="text-success">
                    ✓ {licenseFile.name} uploaded
                  </small>
                </div>
              )}
            </Form.Group>

            {/* License Information Section */}
            <div className="bg-white rounded-3 p-4 mb-4 shadow-sm border">
              <h5 className="text-primary mb-3 d-flex align-items-center">
                <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-2">
                  <Shield size={18} />
                </div>
                License Information
              </h5>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold text-dark">License Number</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.licenseNumber}
                      onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
                      placeholder="License number if applicable"
                      className="border-2"
                      style={{ borderRadius: '10px' }}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold text-dark">Issuing Authority</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.issuingAuthority}
                      onChange={(e) => setFormData({...formData, issuingAuthority: e.target.value})}
                      placeholder="Who issued the license"
                      className="border-2"
                      style={{ borderRadius: '10px' }}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </div>

            {/* Professional Qualifications Section */}
            <div className="bg-white rounded-3 p-4 mb-4 shadow-sm border">
              <h5 className="text-primary mb-3 d-flex align-items-center">
                <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-2">
                  <FileText size={18} />
                </div>
                Professional Qualifications
              </h5>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold text-dark">Experience *</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={formData.experience}
                  onChange={(e) => setFormData({...formData, experience: e.target.value})}
                  placeholder="Describe your relevant experience, background, and why you want to become a tour guide..."
                  required
                  className="border-2"
                  style={{ borderRadius: '10px' }}
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold text-dark">Languages *</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.languages}
                      onChange={(e) => setFormData({...formData, languages: e.target.value})}
                      placeholder="e.g., English, Vietnamese, French"
                      required
                      className="border-2"
                      style={{ borderRadius: '10px' }}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold text-dark">Specializations</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.specializations}
                      onChange={(e) => setFormData({...formData, specializations: e.target.value})}
                      placeholder="e.g., Historical tours, Adventure tourism, Cultural experiences"
                      className="border-2"
                      style={{ borderRadius: '10px' }}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-0">
                <Form.Label className="fw-semibold text-dark">Additional Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={formData.additionalNotes}
                  onChange={(e) => setFormData({...formData, additionalNotes: e.target.value})}
                  placeholder="Any additional information you'd like to share..."
                  className="border-2"
                  style={{ borderRadius: '10px' }}
                />
              </Form.Group>
            </div>

            {/* Form Actions */}
            <div className="d-flex justify-content-between align-items-center pt-3 border-top">
              <small className="text-muted">
                <AlertCircle size={16} className="me-1" />
                All required fields must be completed
              </small>
              <div className="d-flex gap-3">
                <Button 
                  variant="outline-secondary" 
                  onClick={() => setShowForm(false)}
                  className="px-4"
                  style={{ borderRadius: '25px' }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="primary" 
                  disabled={submitting}
                  className="px-4 shadow-sm"
                  style={{ 
                    borderRadius: '25px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none'
                  }}
                >
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
              </div>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Application Details Modal */}
      <Modal show={showDetails} onHide={() => setShowDetails(false)} size="lg" className="tour-guide-details-modal">
        <Modal.Header closeButton className="bg-gradient border-0" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <Modal.Title className="text-white d-flex align-items-center">
            <div className="bg-white bg-opacity-20 rounded-circle p-2 me-3">
              <Eye size={24} className="text-white" />
            </div>
            <div>
              <h4 className="mb-0">Application Details</h4>
              <small className="opacity-75">Review your submission</small>
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
                    <UserPlus size={18} />
                  </div>
                  Personal Information
                </h5>
                <Row>
                  <Col md={6}>
                    <div className="mb-3">
                      <strong className="text-dark">Full Name:</strong>
                      <div className="mt-1 text-muted">{selectedRequest.fullName}</div>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="mb-3">
                      <strong className="text-dark">Identity Number:</strong>
                      <div className="mt-1 text-muted">{selectedRequest.identityNumber}</div>
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <div className="mb-3">
                      <strong className="text-dark">Phone:</strong>
                      <div className="mt-1 text-muted">{selectedRequest.phoneNumber}</div>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="mb-3">
                      <strong className="text-dark">Email:</strong>
                      <div className="mt-1 text-muted">{selectedRequest.email}</div>
                    </div>
                  </Col>
                </Row>
              </div>

              {/* Address */}
              {selectedRequest.address && (
                <div className="bg-white rounded-3 p-4 mb-4 shadow-sm border">
                  <h6 className="text-primary mb-2">Address</h6>
                  <p className="text-muted mb-0">{selectedRequest.address}</p>
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

              {/* Document Images Section */}
              {(selectedRequest.identityCardFrontUrl || selectedRequest.identityCardBackUrl || selectedRequest.tourGuideLicenseUrl) && (
                <div className="bg-white rounded-3 p-4 mb-4 shadow-sm border">
                  <h5 className="text-primary mb-3 d-flex align-items-center">
                    <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-2">
                      <FileText size={18} />
                    </div>
                    Uploaded Documents
                  </h5>
                  <Row className="g-3">
                    {selectedRequest.identityCardFrontUrl && (
                      <Col md={4}>
                        <Card className="h-100 border-0 shadow-sm">
                          <Card.Header className="bg-light border-0 py-2">
                            <small className="fw-semibold text-dark">Identity Card (Front)</small>
                          </Card.Header>
                          <Card.Body className="p-2">
                            <Image
                              src={selectedRequest.identityCardFrontUrl}
                              alt="Identity Card Front"
                              className="img-fluid rounded shadow-sm"
                              style={{ 
                                width: '100%', 
                                height: '180px', 
                                objectFit: 'cover', 
                                cursor: 'pointer',
                                transition: 'transform 0.2s'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                              onClick={() => window.open(selectedRequest.identityCardFrontUrl, '_blank')}
                            />
                            <small className="text-muted d-block mt-2 text-center">
                              <Eye size={12} className="me-1" />
                              Click to view full size
                            </small>
                          </Card.Body>
                        </Card>
                      </Col>
                    )}
                    {selectedRequest.identityCardBackUrl && (
                      <Col md={4}>
                        <Card className="h-100 border-0 shadow-sm">
                          <Card.Header className="bg-light border-0 py-2">
                            <small className="fw-semibold text-dark">Identity Card (Back)</small>
                          </Card.Header>
                          <Card.Body className="p-2">
                            <Image
                              src={selectedRequest.identityCardBackUrl}
                              alt="Identity Card Back"
                              className="img-fluid rounded shadow-sm"
                              style={{ 
                                width: '100%', 
                                height: '180px', 
                                objectFit: 'cover', 
                                cursor: 'pointer',
                                transition: 'transform 0.2s'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                              onClick={() => window.open(selectedRequest.identityCardBackUrl, '_blank')}
                            />
                            <small className="text-muted d-block mt-2 text-center">
                              <Eye size={12} className="me-1" />
                              Click to view full size
                            </small>
                          </Card.Body>
                        </Card>
                      </Col>
                    )}
                    {selectedRequest.tourGuideLicenseUrl && (
                      <Col md={4}>
                        <Card className="h-100 border-0 shadow-sm">
                          <Card.Header className="bg-light border-0 py-2">
                            <small className="fw-semibold text-dark">Tour Guide License</small>
                          </Card.Header>
                          <Card.Body className="p-2">
                            <Image
                              src={selectedRequest.tourGuideLicenseUrl}
                              alt="Tour Guide License"
                              className="img-fluid rounded shadow-sm"
                              style={{ 
                                width: '100%', 
                                height: '180px', 
                                objectFit: 'cover', 
                                cursor: 'pointer',
                                transition: 'transform 0.2s'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                              onClick={() => window.open(selectedRequest.tourGuideLicenseUrl, '_blank')}
                            />
                            <small className="text-muted d-block mt-2 text-center">
                              <Eye size={12} className="me-1" />
                              Click to view full size
                            </small>
                          </Card.Body>
                        </Card>
                      </Col>
                    )}
                  </Row>
                </div>
              )}

              {/* License Details */}
              {(selectedRequest.licenseNumber || selectedRequest.issuingAuthority) && (
                <div className="bg-white rounded-3 p-4 mb-4 shadow-sm border">
                  <h5 className="text-primary mb-3 d-flex align-items-center">
                    <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-2">
                      <Shield size={18} />
                    </div>
                    License Information
                  </h5>
                  <Row>
                    {selectedRequest.licenseNumber && (
                      <Col md={6}>
                        <div className="mb-3">
                          <strong className="text-dark">License Number:</strong>
                          <div className="mt-1 text-muted">{selectedRequest.licenseNumber}</div>
                        </div>
                      </Col>
                    )}
                    {selectedRequest.issuingAuthority && (
                      <Col md={6}>
                        <div className="mb-3">
                          <strong className="text-dark">Issuing Authority:</strong>
                          <div className="mt-1 text-muted">{selectedRequest.issuingAuthority}</div>
                        </div>
                      </Col>
                    )}
                    {selectedRequest.licenseIssueDate && (
                      <Col md={6}>
                        <div className="mb-3">
                          <strong className="text-dark">Issue Date:</strong>
                          <div className="mt-1 text-muted">{formatDate(selectedRequest.licenseIssueDate)}</div>
                        </div>
                      </Col>
                    )}
                    {selectedRequest.licenseExpiryDate && (
                      <Col md={6}>
                        <div className="mb-3">
                          <strong className="text-dark">Expiry Date:</strong>
                          <div className="mt-1 text-muted">{formatDate(selectedRequest.licenseExpiryDate)}</div>
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
                    <div className="mb-3">
                      <strong className="text-dark">Reviewed By:</strong>
                      <div className="mt-1 text-muted">{selectedRequest.reviewedByAdminName}</div>
                    </div>
                  )}
                  {selectedRequest.adminNotes && (
                    <div className="mb-0">
                      <strong className="text-dark">Review Notes:</strong>
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

              {/* Success Message */}
              {selectedRequest.status === 'Approved' && (
                <div className="bg-success bg-opacity-10 border border-success rounded-3 p-4 mb-4">
                  <div className="d-flex align-items-center text-success">
                    <div className="bg-success bg-opacity-20 rounded-circle p-2 me-3">
                      <CheckCircle size={20} />
                    </div>
                    <div>
                      <h6 className="mb-1 text-success">Congratulations!</h6>
                      <p className="mb-0">Your application has been approved. Your account has been upgraded to Tour Guide status.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 bg-light">
          <Button 
            variant="outline-primary" 
            onClick={() => setShowDetails(false)}
            className="px-4"
            style={{ borderRadius: '25px' }}
          >
            <X size={16} className="me-2" />
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default UserTourGuideApplicationPage;
