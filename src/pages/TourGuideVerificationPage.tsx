import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Modal, Badge, Table, Image } from 'react-bootstrap';
import { FileText, Upload, Shield, AlertCircle, CheckCircle, Clock, Eye, X } from 'lucide-react';
import { verificationService } from '../services/api';
import type { VerificationStatus, TourGuideVerificationRequest, CreateVerificationRequest } from '../types';

const TourGuideVerificationPage: React.FC = () => {
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
    fullName: '',
    identityNumber: '',
    phoneNumber: '',
    email: '',
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
    languages: '',
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

  useEffect(() => {
    loadData();
  }, []);

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

  const loadData = async () => {
    try {
      setLoading(true);
      const [statusData, requestsData] = await Promise.all([
        verificationService.getMyStatus(),
        verificationService.getMyRequests()
      ]);
      setStatus(statusData);
      setRequests(requestsData);
    } catch {
      setError('Failed to load verification data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await verificationService.submit(formData);
      setSuccess('Verification request submitted successfully!');
      setShowForm(false);
      loadData();
      // Reset form
      setFormData({
        fullName: '',
        identityNumber: '',
        phoneNumber: '',
        email: '',
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
        languages: '',
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
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to submit verification request');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (requestStatus: string) => {
    switch (requestStatus) {
      case 'Pending':
        return <Badge bg="warning"><Clock size={14} className="me-1" />Pending</Badge>;
      case 'UnderReview':
        return <Badge bg="info"><Eye size={14} className="me-1" />Under Review</Badge>;
      case 'Approved':
        return <Badge bg="success"><CheckCircle size={14} className="me-1" />Approved</Badge>;
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
            <Shield size={32} className="me-3 text-success" />
            <div>
              <h2 className="mb-0">Tour Guide Verification</h2>
              <p className="text-muted mb-0">Manage your verification status and requests</p>
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
              <h5 className="mb-0">Verification Status</h5>
            </Card.Header>
            <Card.Body>
              {status && (
                <Row>
                  <Col md={6}>
                    <div className="mb-3">
                      <strong>Current Status:</strong>
                      <div className="mt-1">
                        {status.isVerified ? (
                          <Badge bg="success" className="fs-6">
                            <CheckCircle size={16} className="me-1" />
                            Verified Tour Guide
                          </Badge>
                        ) : (
                          <Badge bg="secondary" className="fs-6">
                            <AlertCircle size={16} className="me-1" />
                            Not Verified
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="mb-3">
                      <strong>Latest Request Status:</strong>
                      <div className="mt-1">
                        {status.latestRequestStatus ? (
                          getStatusBadge(status.latestRequestStatus)
                        ) : (
                          <span className="text-muted">No requests submitted</span>
                        )}
                      </div>
                    </div>
                  </Col>
                </Row>
              )}
              
              {status?.canSubmitNewRequest && (
                <div className="mt-3">
                  <Button 
                    variant="primary" 
                    onClick={() => setShowForm(true)}
                    disabled={submitting}
                  >
                    <FileText size={16} className="me-2" />
                    Submit New Verification Request
                  </Button>
                </div>
              )}

              {status?.hasPendingRequest && (
                <Alert variant="info" className="mt-3 mb-0">
                  <Clock size={16} className="me-2" />
                  You have a pending verification request. Please wait for review to complete.
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Verification Requests History */}
      <Row>
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-light">
              <h5 className="mb-0">Verification Requests History</h5>
            </Card.Header>
            <Card.Body>
              {requests.length > 0 ? (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Request Date</th>
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
                  <p>No verification requests found.</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Verification Request Form Modal */}
      <Modal show={showForm} onHide={() => setShowForm(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FileText size={20} className="me-2" />
            Submit Verification Request
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="info" className="mb-4">
            <strong>Important:</strong> Please upload clear, high-quality images of your identity documents. 
            Both front and back of your ID card are required for verification.
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
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Identity Card Front Image *</Form.Label>
                  <div className="border-2 border-dashed rounded p-3 text-center" style={{ minHeight: '120px', borderColor: identityCardFrontFile ? '#28a745' : '#dee2e6' }}>
                    {identityCardFrontPreview ? (
                      <div className="position-relative d-inline-block">
                        <Image
                          src={identityCardFrontPreview}
                          alt="Identity Card Front Preview"
                          className="img-thumbnail"
                          style={{ maxWidth: '200px', maxHeight: '150px' }}
                        />
                        <Button
                          variant="danger"
                          size="sm"
                          className="position-absolute top-0 end-0 rounded-circle p-1"
                          style={{ width: '30px', height: '30px' }}
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
                        <Upload size={32} className="text-muted mb-2" />
                        <p className="mb-0">Click to upload ID card front</p>
                        <small className="text-muted">Clear photo required</small>
                      </div>
                    )}
                  </div>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={handleIdentityCardFrontChange}
                    className="mt-2"
                    required
                  />
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
                  <Form.Label>Identity Card Back Image *</Form.Label>
                  <div className="border-2 border-dashed rounded p-3 text-center" style={{ minHeight: '120px', borderColor: identityCardBackFile ? '#28a745' : '#dee2e6' }}>
                    {identityCardBackPreview ? (
                      <div className="position-relative d-inline-block">
                        <Image
                          src={identityCardBackPreview}
                          alt="Identity Card Back Preview"
                          className="img-thumbnail"
                          style={{ maxWidth: '200px', maxHeight: '150px' }}
                        />
                        <Button
                          variant="danger"
                          size="sm"
                          className="position-absolute top-0 end-0 rounded-circle p-1"
                          style={{ width: '30px', height: '30px' }}
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
                        <Upload size={32} className="text-muted mb-2" />
                        <p className="mb-0">Click to upload ID card back</p>
                        <small className="text-muted">Clear photo required</small>
                      </div>
                    )}
                  </div>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={handleIdentityCardBackChange}
                    className="mt-2"
                    required
                  />
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
              <div className="border-2 border-dashed rounded p-3 text-center" style={{ minHeight: '120px', borderColor: licenseFile ? '#28a745' : '#dee2e6' }}>
                {licensePreview ? (
                  <div className="position-relative d-inline-block">
                    <Image
                      src={licensePreview}
                      alt="License Preview"
                      className="img-thumbnail"
                      style={{ maxWidth: '200px', maxHeight: '150px' }}
                    />
                    <Button
                      variant="danger"
                      size="sm"
                      className="position-absolute top-0 end-0 rounded-circle p-1"
                      style={{ width: '30px', height: '30px' }}
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
                    <Upload size={32} className="text-muted mb-2" />
                    <p className="mb-0">Click to upload license document</p>
                    <small className="text-muted">Image or PDF format accepted</small>
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

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>License Number</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
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
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>License Issue Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.licenseIssueDate}
                    onChange={(e) => setFormData({...formData, licenseIssueDate: e.target.value})}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>License Expiry Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.licenseExpiryDate}
                    onChange={(e) => setFormData({...formData, licenseExpiryDate: e.target.value})}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Experience</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.experience}
                onChange={(e) => setFormData({...formData, experience: e.target.value})}
                placeholder="Describe your tour guide experience..."
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Languages</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.languages}
                    onChange={(e) => setFormData({...formData, languages: e.target.value})}
                    placeholder="e.g., English, Vietnamese, French"
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
                    placeholder="e.g., Historical tours, Adventure tourism"
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
                placeholder="Any additional information..."
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
                    Submitting...
                  </>
                ) : (
                  <>
                    <Upload size={16} className="me-2" />
                    Submit Request
                  </>
                )}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Request Details Modal */}
      <Modal show={showDetails} onHide={() => setShowDetails(false)} size="lg">
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

              {/* Document Images Section */}
              {(selectedRequest.identityCardFrontUrl || selectedRequest.identityCardBackUrl || selectedRequest.tourGuideLicenseUrl) && (
                <div className="mb-4">
                  <strong>Uploaded Documents:</strong>
                  <Row className="mt-2 g-3">
                    {selectedRequest.identityCardFrontUrl && (
                      <Col md={4}>
                        <div className="text-center">
                          <p className="mb-2 fw-semibold">Identity Card (Front)</p>
                          <Image
                            src={selectedRequest.identityCardFrontUrl}
                            alt="Identity Card Front"
                            className="img-thumbnail w-100"
                            style={{ maxHeight: '200px', objectFit: 'cover', cursor: 'pointer' }}
                            onClick={() => window.open(selectedRequest.identityCardFrontUrl, '_blank')}
                          />
                          <small className="text-muted d-block mt-1">Click to view full size</small>
                        </div>
                      </Col>
                    )}
                    {selectedRequest.identityCardBackUrl && (
                      <Col md={4}>
                        <div className="text-center">
                          <p className="mb-2 fw-semibold">Identity Card (Back)</p>
                          <Image
                            src={selectedRequest.identityCardBackUrl}
                            alt="Identity Card Back"
                            className="img-thumbnail w-100"
                            style={{ maxHeight: '200px', objectFit: 'cover', cursor: 'pointer' }}
                            onClick={() => window.open(selectedRequest.identityCardBackUrl, '_blank')}
                          />
                          <small className="text-muted d-block mt-1">Click to view full size</small>
                        </div>
                      </Col>
                    )}
                    {selectedRequest.tourGuideLicenseUrl && (
                      <Col md={4}>
                        <div className="text-center">
                          <p className="mb-2 fw-semibold">Tour Guide License</p>
                          <Image
                            src={selectedRequest.tourGuideLicenseUrl}
                            alt="Tour Guide License"
                            className="img-thumbnail w-100"
                            style={{ maxHeight: '200px', objectFit: 'cover', cursor: 'pointer' }}
                            onClick={() => window.open(selectedRequest.tourGuideLicenseUrl, '_blank')}
                          />
                          <small className="text-muted d-block mt-1">Click to view full size</small>
                        </div>
                      </Col>
                    )}
                  </Row>
                </div>
              )}

              {/* License Details */}
              {(selectedRequest.licenseNumber || selectedRequest.issuingAuthority) && (
                <div className="mb-3">
                  <strong>License Information:</strong>
                  <div className="mt-1">
                    {selectedRequest.licenseNumber && (
                      <div><strong>License Number:</strong> {selectedRequest.licenseNumber}</div>
                    )}
                    {selectedRequest.issuingAuthority && (
                      <div><strong>Issuing Authority:</strong> {selectedRequest.issuingAuthority}</div>
                    )}
                    {selectedRequest.licenseIssueDate && (
                      <div><strong>Issue Date:</strong> {formatDate(selectedRequest.licenseIssueDate)}</div>
                    )}
                    {selectedRequest.licenseExpiryDate && (
                      <div><strong>Expiry Date:</strong> {formatDate(selectedRequest.licenseExpiryDate)}</div>
                    )}
                  </div>
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
                  <strong>Admin Notes:</strong>
                  <div className="mt-1">{selectedRequest.adminNotes}</div>
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

export default TourGuideVerificationPage;
