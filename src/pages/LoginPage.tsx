import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the redirect info from navigation state
  const redirectFrom = location.state?.from;
  const unauthorizedMessage = location.state?.message;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { redirectTo } = await login(email, password);
      // If user was redirected here from a protected route, redirect back there
      // Otherwise, redirect to the default dashboard
      navigate(redirectFrom || redirectTo);
    } catch {
      setError('Invalid email or password. Please try again.');
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
                  <p className="text-muted">Welcome back! Please sign in to your account.</p>
                </div>

                {/* Unauthorized Access Alert */}
                {unauthorizedMessage && (
                  <Alert variant="warning" className="mb-4">
                    <strong>Access Restricted:</strong> {unauthorizedMessage}
                  </Alert>
                )}

                {/* Error Alert */}
                {error && (
                  <Alert variant="danger" className="mb-4">
                    {error}
                  </Alert>
                )}

                {/* Login Form */}
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email Address</Form.Label>
                    <div className="position-relative">
                      <Form.Control
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="ps-5"
                      />
                      <Mail 
                        size={18} 
                        className="position-absolute text-muted"
                        style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                      />
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Password</Form.Label>
                    <div className="position-relative">
                      <Form.Control
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="ps-5 pe-5"
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
                    </div>
                  </Form.Group>

                  <Button
                    type="submit"
                    className="w-100 mb-4"
                    variant="primary"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </Form>

                {/* Register Link */}
                <div className="text-center">
                  <p className="mb-0">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-decoration-none fw-semibold">
                      Sign up here
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

export default LoginPage;
