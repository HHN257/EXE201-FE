import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, Image } from 'react-bootstrap';
import { User, Phone, Globe, Flag, Mail, Edit3, Save, X, Camera, Upload } from 'lucide-react';
import { apiService } from '../services/api';
import type { UpdateProfileRequest } from '../services/api';
import type { User as UserType } from '../types';

const ProfilePage: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profile, setProfile] = useState<UserType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    nationality: '',
    preferredLanguage: ''
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load user profile on component mount
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      setError('');
      const profileData = await apiService.getCurrentUser();
      setProfile(profileData);
      setFormData({
        name: profileData.name || '',
        phoneNumber: profileData.phoneNumber || '',
        nationality: profileData.nationality || '',
        preferredLanguage: profileData.preferredLanguage || ''
      });
    } catch (err) {
      setError('Failed to load profile. Please try again.');
      console.error('Error loading profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
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
        phoneNumber: profile.phoneNumber || '',
        nationality: profile.nationality || '',
        preferredLanguage: profile.preferredLanguage || ''
      });
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError('');
      setSuccess('');

      const updateData: UpdateProfileRequest = {};
      
      // Only include fields that have changed
      if (formData.name !== profile?.name) updateData.name = formData.name;
      if (formData.phoneNumber !== profile?.phoneNumber) updateData.phoneNumber = formData.phoneNumber;
      if (formData.nationality !== profile?.nationality) updateData.nationality = formData.nationality;
      if (formData.preferredLanguage !== profile?.preferredLanguage) updateData.preferredLanguage = formData.preferredLanguage;
      if (selectedImage) updateData.profileImage = selectedImage;

      // Only make API call if there are changes
      if (Object.keys(updateData).length > 0) {
        const updatedProfile = await apiService.updateProfile(updateData);
        setProfile(updatedProfile);
        setSelectedImage(null);
        setImagePreview(null);
        
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
          <Col md={8} lg={6}>
            <Card className="shadow border-0">
              <Card.Header className="bg-primary text-white py-4">
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center">
                    <div>
                      <h4 className="mb-0">My Profile</h4>
                      <p className="mb-0 opacity-75">Manage your account information</p>
                    </div>
                  </div>
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
              </Card.Header>

              <Card.Body className="p-4">
                {/* Profile Image Section */}
                <div className="text-center mb-4 pb-4 border-bottom">
                  <div className="position-relative d-inline-block">
                    <div 
                      className="rounded-circle overflow-hidden border-3 border-light shadow-sm"
                      style={{ width: '120px', height: '120px', cursor: isEditing ? 'pointer' : 'default' }}
                      onClick={isEditing ? handleImageClick : undefined}
                    >
                      <Image
                        src={imagePreview || profile?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || 'User')}&size=120&background=0d6efd&color=fff`}
                        alt="Profile"
                        className="w-100 h-100 object-fit-cover"
                      />
                    </div>
                    {isEditing && (
                      <div className="position-absolute bottom-0 end-0">
                        <Button
                          variant="primary"
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
                        <Button variant="outline-primary" size="sm" onClick={handleImageClick}>
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

                <Form>
                  {/* Email (Read-only) */}
                  <Form.Group className="mb-4">
                    <Form.Label className="d-flex align-items-center">
                      <Mail size={18} className="me-2 text-muted" />
                      Email Address
                    </Form.Label>
                    <Form.Control
                      type="email"
                      value={profile?.email || ''}
                      disabled
                      className="bg-light"
                    />
                    <Form.Text className="text-muted">
                      Email cannot be changed. Contact support if you need to update your email.
                    </Form.Text>
                  </Form.Group>

                  {/* Name */}
                  <Form.Group className="mb-4">
                    <Form.Label className="d-flex align-items-center">
                      <User size={18} className="me-2 text-muted" />
                      Full Name
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      disabled={!isEditing}
                      className={!isEditing ? 'bg-light' : ''}
                      placeholder="Enter your full name"
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

                  {/* Nationality */}
                  <Form.Group className="mb-4">
                    <Form.Label className="d-flex align-items-center">
                      <Flag size={18} className="me-2 text-muted" />
                      Nationality
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.nationality}
                      onChange={(e) => handleInputChange('nationality', e.target.value)}
                      disabled={!isEditing}
                      className={!isEditing ? 'bg-light' : ''}
                      placeholder="Enter your nationality"
                    />
                  </Form.Group>

                  {/* Preferred Language */}
                  <Form.Group className="mb-4">
                    <Form.Label className="d-flex align-items-center">
                      <Globe size={18} className="me-2 text-muted" />
                      Preferred Language
                    </Form.Label>
                    <Form.Select
                      value={formData.preferredLanguage}
                      onChange={(e) => handleInputChange('preferredLanguage', e.target.value)}
                      disabled={!isEditing}
                      className={!isEditing ? 'bg-light' : ''}
                    >
                      <option value="">Select a language</option>
                      <option value="en">English</option>
                      <option value="vi">Vietnamese</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="es">Spanish</option>
                      <option value="ja">Japanese</option>
                      <option value="ko">Korean</option>
                      <option value="zh">Chinese</option>
                    </Form.Select>
                  </Form.Group>

                  {/* Account Info */}
                  <Row className="mb-4">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Role</Form.Label>
                        <Form.Control
                          type="text"
                          value={profile?.role || ''}
                          disabled
                          className="bg-light"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Member Since</Form.Label>
                        <Form.Control
                          type="text"
                          value={profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : ''}
                          disabled
                          className="bg-light"
                        />
                      </Form.Group>
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
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ProfilePage;