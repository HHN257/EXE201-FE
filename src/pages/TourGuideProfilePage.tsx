import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, InputGroup } from 'react-bootstrap';
import { User, Phone, Globe, Mail, Edit3, Save, X, Star, DollarSign, FileText, Award } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import type { UpdateTourGuideDto, TourGuideDto } from '../services/api';

const TourGuideProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profile, setProfile] = useState<TourGuideDto | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    phoneNumber: '',
    email: '',
    languages: '',
    specializations: '',
    hourlyRate: 0,
    currency: 'USD',
    profileImage: '',
    isVerified: false,
    isActive: true
  });

  // Load tour guide profile on component mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        setError('');
        
        if (!user?.id) {
          setError('User information not available.');
          return;
        }
        
        const profileData = await apiService.getTourGuideByUserId(user.id);
        setProfile(profileData);
        setFormData({
          name: profileData.name || '',
          bio: profileData.bio || '',
          phoneNumber: '', // Not in TourGuideDto, will need to be added
          email: '', // Not in TourGuideDto, will need to be added
          languages: profileData.languages || '',
          specializations: profileData.specializations || '',
          hourlyRate: profileData.hourlyRate || 0,
          currency: profileData.currency || 'USD',
          profileImage: profileData.profileImage || '',
          isVerified: profileData.isVerified || false,
          isActive: true // Default to true
        });
      } catch (err) {
        setError('Failed to load profile. Please try again.');
        console.error('Error loading profile:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [user?.id]);

  const handleInputChange = (field: keyof typeof formData, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError('');
    setSuccess('');
    // Reset form data to original profile data
    if (profile) {
      setFormData({
        name: profile.name || '',
        bio: profile.bio || '',
        phoneNumber: '', // Not in TourGuideDto
        email: '', // Not in TourGuideDto
        languages: profile.languages || '',
        specializations: profile.specializations || '',
        hourlyRate: profile.hourlyRate || 0,
        currency: profile.currency || 'USD',
        profileImage: profile.profileImage || '',
        isVerified: profile.isVerified || false,
        isActive: true
      });
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError('');
      setSuccess('');

      const updateData: UpdateTourGuideDto = {
        name: formData.name,
        bio: formData.bio,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        languages: formData.languages,
        specializations: formData.specializations,
        hourlyRate: formData.hourlyRate,
        currency: formData.currency,
        profileImage: formData.profileImage,
        isVerified: formData.isVerified,
        isActive: formData.isActive
      };

      if (profile?.id) {
        const updatedProfile = await apiService.updateTourGuide(profile.id, updateData);
        setProfile(updatedProfile);
        setSuccess('Profile updated successfully!');
      }
      
      setIsEditing(false);
    } catch (err) {
      setError('Failed to update profile. Please try again.');
      console.error('Error updating profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light py-5">
      <Container>
        <Row className="justify-content-center">
          <Col md={10} lg={8}>
            <Card className="shadow border-0">
              <Card.Header className="bg-success text-white py-4">
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center">
                    <div className="bg-white bg-opacity-20 rounded-circle p-2 me-3">
                      <Award size={24} />
                    </div>
                    <div>
                      <h4 className="mb-0">Tour Guide Profile</h4>
                      <p className="mb-0 opacity-75">Manage your tour guide information</p>
                    </div>
                  </div>
                  <div className="d-flex align-items-center">
                    {profile?.isVerified && (
                      <div className="bg-white bg-opacity-20 rounded-pill px-3 py-1 me-3">
                        <Star size={16} className="me-1" />
                        <small>Verified</small>
                      </div>
                    )}
                    {!isEditing && (
                      <Button 
                        variant="light" 
                        size="sm" 
                        onClick={handleEdit}
                        className="d-flex align-items-center"
                      >
                        <Edit3 size={16} className="me-1" />
                        Edit
                      </Button>
                    )}
                  </div>
                </div>
              </Card.Header>

              <Card.Body className="p-4">
                {/* Alerts */}
                {error && (
                  <Alert variant="danger" className="mb-4">
                    {error}
                  </Alert>
                )}

                {success && (
                  <Alert variant="success" className="mb-4">
                    {success}
                  </Alert>
                )}

                <Row>
                  <Col md={6}>
                    <Form>
                      {/* Name */}
                      <Form.Group className="mb-4">
                        <Form.Label className="d-flex align-items-center">
                          <User size={18} className="me-2 text-muted" />
                          Full Name *
                        </Form.Label>
                        <Form.Control
                          type="text"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          disabled={!isEditing}
                          className={!isEditing ? 'bg-light' : ''}
                          placeholder="Enter your full name"
                          required
                        />
                      </Form.Group>

                      {/* Email */}
                      <Form.Group className="mb-4">
                        <Form.Label className="d-flex align-items-center">
                          <Mail size={18} className="me-2 text-muted" />
                          Email Address
                        </Form.Label>
                        <Form.Control
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          disabled={!isEditing}
                          className={!isEditing ? 'bg-light' : ''}
                          placeholder="Enter your email address"
                        />
                      </Form.Group>

                      {/* Phone Number */}
                      <Form.Group className="mb-4">
                        <Form.Label className="d-flex align-items-center">
                          <Phone size={18} className="me-2 text-muted" />
                          Phone Number
                        </Form.Label>
                        <Form.Control
                          type="tel"
                          value={formData.phoneNumber}
                          onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                          disabled={!isEditing}
                          className={!isEditing ? 'bg-light' : ''}
                          placeholder="Enter your phone number"
                        />
                      </Form.Group>

                      {/* Languages */}
                      <Form.Group className="mb-4">
                        <Form.Label className="d-flex align-items-center">
                          <Globe size={18} className="me-2 text-muted" />
                          Languages Spoken
                        </Form.Label>
                        <Form.Control
                          type="text"
                          value={formData.languages}
                          onChange={(e) => handleInputChange('languages', e.target.value)}
                          disabled={!isEditing}
                          className={!isEditing ? 'bg-light' : ''}
                          placeholder="e.g., English, Vietnamese, French"
                        />
                        <Form.Text className="text-muted">
                          Separate multiple languages with commas
                        </Form.Text>
                      </Form.Group>

                      {/* Specializations */}
                      <Form.Group className="mb-4">
                        <Form.Label className="d-flex align-items-center">
                          <Award size={18} className="me-2 text-muted" />
                          Specializations
                        </Form.Label>
                        <Form.Control
                          type="text"
                          value={formData.specializations}
                          onChange={(e) => handleInputChange('specializations', e.target.value)}
                          disabled={!isEditing}
                          className={!isEditing ? 'bg-light' : ''}
                          placeholder="e.g., Historical tours, Food tours, Adventure tours"
                        />
                        <Form.Text className="text-muted">
                          Separate multiple specializations with commas
                        </Form.Text>
                      </Form.Group>
                    </Form>
                  </Col>

                  <Col md={6}>
                    <Form>
                      {/* Bio */}
                      <Form.Group className="mb-4">
                        <Form.Label className="d-flex align-items-center">
                          <FileText size={18} className="me-2 text-muted" />
                          Biography
                        </Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={4}
                          value={formData.bio}
                          onChange={(e) => handleInputChange('bio', e.target.value)}
                          disabled={!isEditing}
                          className={!isEditing ? 'bg-light' : ''}
                          placeholder="Tell potential clients about yourself, your experience, and what makes you special..."
                        />
                      </Form.Group>

                      {/* Hourly Rate */}
                      <Form.Group className="mb-4">
                        <Form.Label className="d-flex align-items-center">
                          <DollarSign size={18} className="me-2 text-muted" />
                          Hourly Rate
                        </Form.Label>
                        <InputGroup>
                          <Form.Control
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.hourlyRate}
                            onChange={(e) => handleInputChange('hourlyRate', parseFloat(e.target.value) || 0)}
                            disabled={!isEditing}
                            className={!isEditing ? 'bg-light' : ''}
                            placeholder="0.00"
                          />
                          <Form.Select
                            value={formData.currency}
                            onChange={(e) => handleInputChange('currency', e.target.value)}
                            disabled={!isEditing}
                            className={!isEditing ? 'bg-light' : ''}
                          >
                            <option value="USD">USD</option>
                            <option value="VND">VND</option>
                            <option value="EUR">EUR</option>
                            <option value="GBP">GBP</option>
                          </Form.Select>
                        </InputGroup>
                      </Form.Group>

                      {/* Profile Image URL */}
                      <Form.Group className="mb-4">
                        <Form.Label>Profile Image URL</Form.Label>
                        <Form.Control
                          type="url"
                          value={formData.profileImage}
                          onChange={(e) => handleInputChange('profileImage', e.target.value)}
                          disabled={!isEditing}
                          className={!isEditing ? 'bg-light' : ''}
                          placeholder="https://example.com/your-photo.jpg"
                        />
                      </Form.Group>

                      {/* Status Information */}
                      <Row className="mb-4">
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label>Verification Status</Form.Label>
                            <Form.Control
                              type="text"
                              value={profile?.isVerified ? 'Verified' : 'Not Verified'}
                              disabled
                              className="bg-light"
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label>Rating</Form.Label>
                            <div className="d-flex align-items-center">
                              <Form.Control
                                type="text"
                                value={profile?.rating ? `${profile.rating}/5` : 'No ratings yet'}
                                disabled
                                className="bg-light"
                              />
                              <Star size={16} className="text-warning ms-2" />
                            </div>
                          </Form.Group>
                        </Col>
                      </Row>

                      {/* Total Reviews */}
                      <Form.Group className="mb-4">
                        <Form.Label>Total Reviews</Form.Label>
                        <Form.Control
                          type="text"
                          value={profile?.totalReviews || 0}
                          disabled
                          className="bg-light"
                        />
                      </Form.Group>
                    </Form>
                  </Col>
                </Row>

                {/* Action Buttons */}
                {isEditing && (
                  <div className="d-flex gap-2 pt-3 border-top">
                    <Button
                      variant="success"
                      onClick={handleSave}
                      disabled={isSaving}
                      className="d-flex align-items-center"
                    >
                      {isSaving ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={16} className="me-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline-secondary"
                      onClick={handleCancel}
                      disabled={isSaving}
                      className="d-flex align-items-center"
                    >
                      <X size={16} className="me-2" />
                      Cancel
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default TourGuideProfilePage;