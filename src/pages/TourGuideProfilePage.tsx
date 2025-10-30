import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, InputGroup, Image } from 'react-bootstrap';
import { User, Globe, Edit3, Save, X, Star, DollarSign, FileText, Award, Camera, Upload } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import type { UpdateTourGuideDto, TourGuideDto } from '../services/api';

const TourGuideProfilePage: React.FC = () => {
  const { user, showError, showSuccess } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profile, setProfile] = useState<TourGuideDto | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    languages: '',
    specializations: '',
    hourlyRate: 0,
    currency: 'USD',
    profileImage: '',
    isVerified: false,
    isActive: true
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load tour guide profile on component mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        setError('');
        
        if (!user?.id) {
          const errorMessage = 'User information not available.';
          setError(errorMessage);
          showError(errorMessage, 'Authentication Error');
          return;
        }
        
        // Use the new my-profile endpoint that maps user to tour guide by email
        const profileData = await apiService.getCurrentTourGuide();
        
        setProfile(profileData);
        setFormData({
          name: profileData.name || '',
          bio: profileData.bio || '',
          languages: profileData.languages || '',
          specializations: profileData.specializations || '',
          hourlyRate: profileData.hourlyRate || 0,
          currency: profileData.currency || 'USD',
          profileImage: profileData.profileImage || '',
          isVerified: profileData.isVerified || false,
          isActive: true // Default to true
        });
      } catch (err) {
        let errorMessage = 'Failed to load profile. Please try again.';
        
        // Provide more specific error messages based on the error response
        if (err && typeof err === 'object' && 'response' in err) {
          const axiosErr = err as { response?: { status?: number; data?: { message?: string } } };
          if (axiosErr.response?.status === 404) {
            errorMessage = 'Tour guide profile not found. You may need to register as a tour guide first.';
          } else if (axiosErr.response?.status === 401) {
            errorMessage = 'Authentication expired. Please log in again.';
          } else if (axiosErr.response?.data?.message) {
            errorMessage = axiosErr.response.data.message;
          }
        }
        
        setError(errorMessage);
        showError(errorMessage, 'Profile Loading Error');
        console.error('Error loading profile:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [user?.id, showError]);

  const handleInputChange = (field: keyof typeof formData, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    // Reset form data to original profile data
    if (profile) {
      setFormData({
        name: profile.name || '',
        bio: profile.bio || '',
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

      // Validation
      if (!formData.name.trim()) {
        const errorMessage = 'Name is required.';
        setError(errorMessage);
        showError(errorMessage, 'Validation Error');
        return;
      }

      if (formData.hourlyRate < 0) {
        const errorMessage = 'Hourly rate cannot be negative.';
        setError(errorMessage);
        showError(errorMessage, 'Validation Error');
        return;
      }

      const updateData: UpdateTourGuideDto = {
        name: formData.name,
        bio: formData.bio,
        languages: formData.languages,
        specializations: formData.specializations,
        hourlyRate: formData.hourlyRate,
        currency: formData.currency,
        isVerified: formData.isVerified,
        isActive: formData.isActive
      };

      // Only include profileImage if a new image was selected
      if (selectedImage) {
        updateData.profileImage = selectedImage;
      }

      if (profile?.id) {
        const updatedProfile = await apiService.updateTourGuide(profile.id, updateData);
        setProfile(updatedProfile);
        setSelectedImage(null);
        setImagePreview(null);
        const successMessage = 'Profile updated successfully!';
        setSuccess(successMessage);
        showSuccess(successMessage, 'Profile Updated');
      } else {
        const errorMessage = 'No profile ID found. Cannot update profile.';
        setError(errorMessage);
        showError(errorMessage, 'Update Error');
        return;
      }
      
      setIsEditing(false);
    } catch (err) {
      let errorMessage = 'Failed to update profile. Please try again.';
      
      // Handle Axios errors with proper typing
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string } }; message?: string };
        if (axiosErr.response?.data?.message) {
          errorMessage = axiosErr.response.data.message;
        } else if (axiosErr.message) {
          errorMessage = axiosErr.message;
        }
      }
      
      setError(errorMessage);
      showError(errorMessage, 'Update Failed');
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
          <Col xs={12} lg={10} xl={8}>
            <Card className="shadow border-0">
              <Card.Header className="bg-success text-white py-4">
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center">
                    <div>
                      <h4 className="mb-0">Tour Guide Profile</h4>
                      <p className="mb-0 opacity-75">Manage your tour guide information</p>
                    </div>
                  </div>
                  <div className="d-flex align-items-center">
                    {profile?.isVerified && (
                      <div className="bg-black bg-opacity-20 rounded-pill px-3 py-1 me-3">
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
                {/* Profile Image Section */}
                <div className="text-center mb-4 pb-4 border-bottom">
                  <div className="position-relative d-inline-block">
                    <div 
                      className="rounded-circle overflow-hidden border-3 border-success shadow-sm"
                      style={{ width: '120px', height: '120px', cursor: isEditing ? 'pointer' : 'default' }}
                      onClick={isEditing ? handleImageClick : undefined}
                    >
                      <Image
                        src={imagePreview || profile?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || 'Guide')}&size=120&background=198754&color=fff`}
                        alt="Profile"
                        className="w-100 h-100 object-fit-cover"
                      />
                    </div>
                    {isEditing && (
                      <div className="position-absolute bottom-0 end-0">
                        <Button
                          variant="success"
                          size="sm"
                          className="rounded-circle p-2"
                          onClick={handleImageClick}
                          style={{ width: '36px', height: '36px' }}
                        >
                          <Camera size={16} />
                        </Button>
                      </div>
                    )}
                  </div>
                  {isEditing && (
                    <div className="mt-3">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="d-none"
                      />
                      <div className="d-flex gap-2 justify-content-center">
                        <Button variant="outline-success" size="sm" onClick={handleImageClick}>
                          <Upload size={14} className="me-1" />
                          Choose Image
                        </Button>
                        {(selectedImage || imagePreview) && (
                          <Button variant="outline-danger" size="sm" onClick={handleRemoveImage}>
                            <X size={14} className="me-1" />
                            Remove
                          </Button>
                        )}
                      </div>
                      <small className="text-muted d-block mt-2">
                        Click to upload a new profile image (JPG, PNG, GIF - Max 5MB)
                      </small>
                    </div>
                  )}
                </div>

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

                <Row className="g-4">
                  <Col xs={12} md={6}>
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

                  <Col xs={12} md={6}>
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

                      {/* Status Information */}
                      <Row className="mb-4 g-3">
                        <Col xs={12} sm={6}>
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
                        <Col xs={12} sm={6}>
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
                  <div className="d-flex flex-column flex-sm-row gap-2 pt-4 border-top mt-4">
                    <Button
                      variant="success"
                      onClick={handleSave}
                      disabled={isSaving}
                      className="d-flex align-items-center justify-content-center flex-fill"
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
                      className="d-flex align-items-center justify-content-center flex-fill"
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