import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Mail, Lock, User, Phone, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    nationality: '',
    preferredLanguage: 'EN',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const validateField = (name: string, value: string) => {
    const errors: {[key: string]: string} = {};
    
    switch (name) {
      case 'name':
        if (!value.trim()) {
          errors.name = 'Full name is required';
        }
        break;
      case 'email':
        if (!value.trim()) {
          errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          errors.email = 'Please enter a valid email address';
        }
        break;
      case 'phoneNumber':
        if (!value.trim()) {
          errors.phoneNumber = 'Phone number is required';
        }
        break;
      case 'nationality':
        if (!value) {
          errors.nationality = 'Please select your nationality';
        }
        break;
      case 'password':
        if (!value) {
          errors.password = 'Password is required';
        } else if (value.length < 6) {
          errors.password = 'Password must be at least 6 characters long';
        }
        break;
      case 'confirmPassword':
        if (!value) {
          errors.confirmPassword = 'Please confirm your password';
        } else if (value !== formData.password) {
          errors.confirmPassword = 'Passwords do not match';
        }
        break;
    }
    
    return errors;
  };

  const handleChange = (e: { target: { name: string; value: string } }) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear the error for this field when user starts typing
    if (error) {
      setError('');
    }

    // Clear field-specific error
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // Real-time validation for confirmPassword
    if (name === 'confirmPassword' && value && value !== formData.password) {
      setFieldErrors(prev => ({
        ...prev,
        confirmPassword: 'Passwords do not match'
      }));
    } else if (name === 'password' && formData.confirmPassword && value !== formData.confirmPassword) {
      setFieldErrors(prev => ({
        ...prev,
        confirmPassword: 'Passwords do not match'
      }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(e);
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleChange(e);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    // Validate all fields
    const allErrors: {[key: string]: string} = {};
    
    Object.keys(formData).forEach(field => {
      const fieldError = validateField(field, formData[field as keyof typeof formData]);
      Object.assign(allErrors, fieldError);
    });

    if (Object.keys(allErrors).length > 0) {
      setFieldErrors(allErrors);
      setError('Please fix the errors below');
      return;
    }

    setIsLoading(true);

    try {
      await register({
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        nationality: formData.nationality,
        preferredLanguage: formData.preferredLanguage,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      });
      navigate('/');
    } catch (err) {
      let errorMessage = 'Registration failed. Please try again.';
      if (err && typeof err === 'object' && 'response' in err) {
        const response = (err as { response?: { data?: { message?: string } } }).response;
        if (response?.data?.message) {
          errorMessage = response.data.message;
        }
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center bg-light">
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={5} xl={4}>
            <Card className="shadow border-0">
              <Card.Body className="p-5">
                {/* Logo */}
                <div className="text-center mb-4">
                  <Link to="/" className="text-decoration-none">
                    <h2 className="fw-bold" style={{ color: '#2563eb' }}>
                      SmartTravel
                    </h2>
                  </Link>
                  <p className="text-muted">Create your account to start exploring Vietnam.</p>
                </div>

                {/* Error Alert */}
                {error && (
                  <Alert variant="danger" className="mb-4">
                    {error}
                  </Alert>
                )}

                {/* Register Form */}
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Full Name</Form.Label>
                    <div className="position-relative">
                      <Form.Control
                        type="text"
                        name="name"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="ps-5"
                        isInvalid={!!fieldErrors.name}
                      />
                      <User 
                        size={18} 
                        className="position-absolute text-muted"
                        style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                      />
                      {fieldErrors.name && (
                        <Form.Control.Feedback type="invalid">
                          {fieldErrors.name}
                        </Form.Control.Feedback>
                      )}
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Email Address</Form.Label>
                    <div className="position-relative">
                      <Form.Control
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="ps-5"
                        isInvalid={!!fieldErrors.email}
                      />
                      <Mail 
                        size={18} 
                        className="position-absolute text-muted"
                        style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                      />
                      {fieldErrors.email && (
                        <Form.Control.Feedback type="invalid">
                          {fieldErrors.email}
                        </Form.Control.Feedback>
                      )}
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Phone Number</Form.Label>
                    <div className="position-relative">
                      <Form.Control
                        type="tel"
                        name="phoneNumber"
                        placeholder="Enter your phone number"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        required
                        className="ps-5"
                        isInvalid={!!fieldErrors.phoneNumber}
                      />
                      <Phone 
                        size={18} 
                        className="position-absolute text-muted"
                        style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                      />
                      {fieldErrors.phoneNumber && (
                        <Form.Control.Feedback type="invalid">
                          {fieldErrors.phoneNumber}
                        </Form.Control.Feedback>
                      )}
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Nationality</Form.Label>
                    <Form.Select
                      name="nationality"
                      value={formData.nationality}
                      onChange={handleSelectChange}
                      required
                      isInvalid={!!fieldErrors.nationality}
                    >
                      <option value="">Select your nationality</option>
                      <option value="Vietnamese">Vietnamese</option>
                      <option value="American">American</option>
                      <option value="British">British</option>
                      <option value="Australian">Australian</option>
                      <option value="Canadian">Canadian</option>
                      <option value="French">French</option>
                      <option value="German">German</option>
                      <option value="Japanese">Japanese</option>
                      <option value="Korean">Korean</option>
                      <option value="Chinese">Chinese</option>
                      <option value="Other">Other</option>
                    </Form.Select>
                    {fieldErrors.nationality && (
                      <Form.Control.Feedback type="invalid">
                        {fieldErrors.nationality}
                      </Form.Control.Feedback>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Preferred Language</Form.Label>
                    <Form.Select
                      name="preferredLanguage"
                      value={formData.preferredLanguage}
                      onChange={handleSelectChange}
                      required
                    >
                      <option value="EN">English</option>
                      <option value="VI">Vietnamese</option>
                      <option value="FR">French</option>
                      <option value="DE">German</option>
                      <option value="JA">Japanese</option>
                      <option value="KO">Korean</option>
                      <option value="ZH">Chinese</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Password</Form.Label>
                    <div className="position-relative">
                      <Form.Control
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        className="ps-5 pe-5"
                        isInvalid={!!fieldErrors.password}
                      />
                      <Lock 
                        size={18} 
                        className="position-absolute text-muted"
                        style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                      />
                      <button
                        type="button"
                        className="btn btn-link position-absolute text-muted p-0"
                        style={{ right: '12px', top: '50%', transform: 'translateY(-50%)' }}
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                      {fieldErrors.password && (
                        <Form.Control.Feedback type="invalid">
                          {fieldErrors.password}
                        </Form.Control.Feedback>
                      )}
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Confirm Password</Form.Label>
                    <div className="position-relative">
                      <Form.Control
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
                        className="ps-5 pe-5"
                        isInvalid={!!fieldErrors.confirmPassword}
                      />
                      <Lock 
                        size={18} 
                        className="position-absolute text-muted"
                        style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                      />
                      <button
                        type="button"
                        className="btn btn-link position-absolute text-muted p-0"
                        style={{ right: '12px', top: '50%', transform: 'translateY(-50%)' }}
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                      {fieldErrors.confirmPassword && (
                        <Form.Control.Feedback type="invalid">
                          {fieldErrors.confirmPassword}
                        </Form.Control.Feedback>
                      )}
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Check 
                      type="checkbox" 
                      id="terms-agreement" 
                      label="I agree to the Terms of Service and Privacy Policy"
                      required
                    />
                  </Form.Group>

                  <Button
                    type="submit"
                    className="w-100 mb-3"
                    variant="primary"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </Form>

                {/* Divider */}
                <div className="text-center mb-3">
                  <small className="text-muted">or</small>
                </div>

                {/* Social Login */}
                <Button variant="outline-secondary" className="w-100 mb-3">
                  Continue with Google
                </Button>

                {/* Login Link */}
                <div className="text-center">
                  <p className="mb-0">
                    Already have an account?{' '}
                    <Link to="/login" className="text-decoration-none fw-semibold">
                      Sign in here
                    </Link>
                  </p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default RegisterPage;
