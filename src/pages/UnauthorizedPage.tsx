import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { AlertTriangle, ArrowLeft, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const UnauthorizedPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  // Get the message and attempted path from navigation state
  const message = location.state?.message || "You don't have permission to access this page.";
  const attemptedPath = location.state?.from || '';
  const isRoleIssue = location.state?.isRoleIssue || false;

  const handleLoginClick = () => {
    navigate('/login', {
      state: { from: attemptedPath, message: "Please log in to access this page." }
    });
  };

  const handleRegisterClick = () => {
    navigate('/register');
  };

  const handleDashboardClick = () => {
    navigate('/dashboard');
  };

  const handleTourGuideApplicationClick = () => {
    navigate('/user/tour-guide-application');
  };

  const handleHomeClick = () => {
    navigate('/');
  };

  return (
    <div className="min-vh-100 d-flex align-items-center bg-light">
      <Container>
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card className="shadow border-0">
              <Card.Body className="p-5 text-center">
                {/* Icon */}
                <div className="mb-4">
                  <AlertTriangle 
                    size={64} 
                    className="text-warning"
                  />
                </div>

                {/* Title */}
                <h2 className="fw-bold mb-3 text-dark">
                  Access Denied
                </h2>

                {/* Message */}
                <Alert variant={isRoleIssue ? "warning" : "info"} className="mb-4">
                  {message}
                </Alert>

                {/* Additional info based on auth status */}
                {!isAuthenticated ? (
                  <div className="mb-4">
                    <p className="text-muted mb-3">
                      You need to sign in to access this page.
                    </p>
                    <div className="d-grid gap-2 d-md-flex justify-content-md-center">
                      <Button 
                        onClick={handleLoginClick}
                        variant="primary" 
                        size="lg"
                      >
                        <LogIn size={18} className="me-2" />
                        Sign In
                      </Button>
                      <Button 
                        onClick={handleRegisterClick}
                        variant="outline-primary" 
                        size="lg"
                      >
                        Create Account
                      </Button>
                    </div>
                  </div>
                ) : isRoleIssue ? (
                  <div className="mb-4">
                    <p className="text-muted mb-3">
                      Your current role ({user?.role}) doesn't have permission to access this page.
                      {user?.role === 'User' && (
                        <span className="d-block mt-2">
                          You can apply to become a tour guide to access additional features.
                        </span>
                      )}
                    </p>
                    <div className="d-grid gap-2 d-md-flex justify-content-md-center">
                      <Button 
                        onClick={handleDashboardClick}
                        variant="primary" 
                        size="lg"
                      >
                        Go to Dashboard
                      </Button>
                      {user?.role === 'User' && (
                        <Button 
                          onClick={handleTourGuideApplicationClick}
                          variant="outline-primary" 
                          size="lg"
                        >
                          Apply as Tour Guide
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="mb-4">
                    <p className="text-muted mb-3">
                      You don't have the required permissions to access this page.
                    </p>
                    <Button 
                      onClick={handleDashboardClick}
                      variant="primary" 
                      size="lg"
                    >
                      Go to Dashboard
                    </Button>
                  </div>
                )}

                {/* Back to home */}
                <div className="border-top pt-4 mt-4">
                  <Button 
                    onClick={handleHomeClick}
                    variant="link" 
                    className="text-decoration-none"
                  >
                    <ArrowLeft size={18} className="me-2" />
                    Back to Home
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default UnauthorizedPage;