import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, Settings, Shield, Crown, UserCheck, Calendar, Star } from 'lucide-react';
import { Navbar, Nav, Container, Button, Dropdown, Image } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { subscriptionAPI } from '../services/api';
import type { Subscription } from '../types';
import Logo from '../assets/VietGo_Word.png';

const Header: React.FC = () => {
  const { isAuthenticated, user, logout, getRoleBasedDashboard } = useAuth();
  const navigate = useNavigate();
  const [userSubscription, setUserSubscription] = useState<Subscription | null>(null);

  // Fetch user subscription when authenticated
  useEffect(() => {
    const fetchSubscription = async () => {
      if (isAuthenticated) {
        try {
          const subscription = await subscriptionAPI.getMySubscription();
          setUserSubscription(subscription);
        } catch (error) {
          console.log('No active subscription found');
          setUserSubscription(null);
        }
      } else {
        setUserSubscription(null);
      }
    };

    fetchSubscription();
  }, [isAuthenticated]);

  // Check if user has active subscription
  const hasActiveSubscription = (): boolean => {
    if (!userSubscription) return false;
    return userSubscription.status === 'Active' || userSubscription.status === 1;
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getRoleIcon = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return <Crown size={16} className="text-danger" />;
      case 'staff':
        return <Shield size={16} className="text-warning" />;
      case 'tourguide':
        return <UserCheck size={16} className="text-success" />;
      default:
        return <User size={16} />;
    }
  };


  return (
    <div className="shadow-sm border-bottom sticky-top" style={{ backgroundColor: 'white' }}>
      {/* Top Row: Logo and Auth */}
      <Navbar expand="lg" className="border-0" style={{ backgroundColor: 'white' }}>
        <Container fluid className="px-3 px-lg-5">
          {/* Logo */}
          <Navbar.Brand as={Link} to="/" className="d-flex align-items-center fw-bold fs-3" style={{ color: '#29499c' }}>
            <img 
              src={Logo} 
              alt="VietGo Logo" 
              style={{ height: '40px', width: 'auto', marginRight: '12px' }}
            />
            <span className="fs-6 fw-normal" style={{ color: '#29499c' }}>
              OPEN THE WEB, EMBRACE VIETNAM
            </span>
            {/* Premium Badge for Subscribed Users */}
            {hasActiveSubscription() && (
              <span 
                className="badge bg-warning text-dark ms-3 d-flex align-items-center"
                style={{ fontSize: '0.7rem', padding: '4px 8px' }}
                title={`Premium Member - ${userSubscription?.planName}`}
              >
                <Crown size={12} className="me-1" />
                PREMIUM
              </span>
            )}
          </Navbar.Brand>

          {/* Right side actions */}
          <div className="d-flex align-items-center gap-3">
            {/* Auth section */}
            {isAuthenticated ? (
              <Dropdown align="end">
                <Dropdown.Toggle variant="link" className="text-dark text-decoration-none border-0 bg-transparent">
                  <div className="d-flex align-items-center gap-2">
                    {getRoleIcon(user?.role || 'user')}
                    <div className="d-flex flex-column align-items-start">
                      <div className="d-flex align-items-center gap-2">
                        <span>{user?.name || 'User'}</span>
                        {hasActiveSubscription() && (
                          <span title="Premium Member">
                            <Crown size={14} className="text-warning" />
                          </span>
                        )}
                      </div>
                      {hasActiveSubscription() && (
                        <small className="text-warning fw-bold" style={{ fontSize: '0.7rem', lineHeight: '1' }}>
                          Premium
                        </small>
                      )}
                    </div>
                    <div className="rounded-circle overflow-hidden position-relative" style={{ width: '40px', height: '40px' }}>
                      <Image
                        src={user?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&size=40&background=0d6efd&color=fff`}
                        alt="Profile"
                        className="w-100 h-100 object-fit-cover"
                        style={{ border: hasActiveSubscription() ? '2px solid #fbbf24' : '1px solid #dee2e6' }}
                      />
                      {hasActiveSubscription() && (
                        <div 
                          className="position-absolute bottom-0 end-0 rounded-circle bg-warning d-flex align-items-center justify-content-center"
                          style={{ width: '16px', height: '16px', transform: 'translate(25%, 25%)' }}
                        >
                          <Crown size={8} className="text-dark" />
                        </div>
                      )}
                    </div>
                  </div>
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item as={Link} to={getRoleBasedDashboard()}>
                    <Settings size={16} className="me-2" />
                    Dashboard
                  </Dropdown.Item>
                  {hasActiveSubscription() ? (
                    <Dropdown.Item as={Link} to="/plans">
                      <Star size={16} className="me-2 text-warning" />
                      <span className="text-warning fw-semibold">Manage Premium</span>
                    </Dropdown.Item>
                  ) : (
                    <Dropdown.Item as={Link} to="/plans">
                      <Star size={16} className="me-2" />
                      Upgrade to Premium
                    </Dropdown.Item>
                  )}
                  {user?.role?.toLowerCase() === 'tourguide' ? (
                    <>
                      <Dropdown.Item as={Link} to="/profile">
                        <User size={16} className="me-2" />
                        Personal Profile
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/guide/profile">
                        <UserCheck size={16} className="me-2" />
                        Tour Guide Profile
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/guide-bookings">
                        <Calendar size={16} className="me-2" />
                        My Tour Bookings
                      </Dropdown.Item>
                    </>
                  ) : (
                    <>
                      <Dropdown.Item as={Link} to="/profile">
                        <User size={16} className="me-2" />
                        Profile
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/bookings">
                        <Calendar size={16} className="me-2" />
                        My Bookings
                      </Dropdown.Item>
                    </>
                  )}
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout}>
                    <LogOut size={16} className="me-2" />
                    Sign Out
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="link" className="text-dark text-decoration-none">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="btn-primary-custom">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </Container>
      </Navbar>

      {/* Second Row: Navigation Tabs */}
      <div className="border-top" style={{ backgroundColor: '#29499c' }}>
        <Container fluid className="px-3 px-lg-5">
          <Nav className="justify-content-center py-3">
            <Nav.Link as={Link} to="/destinations" className="text-white mx-3 fw-medium px-3 py-2">Destinations</Nav.Link>
            <Nav.Link as={Link} to="/services" className="text-white mx-3 fw-medium px-3 py-2">Services</Nav.Link>
            <Nav.Link as={Link} to="/tour-guides" className="text-white mx-3 fw-medium px-3 py-2">Tour Guides</Nav.Link>
            <Nav.Link as={Link} to="/plans" className="text-white mx-3 fw-medium px-3 py-2">Plans</Nav.Link>
            <Nav.Link as={Link} to="/currency" className="text-white mx-3 fw-medium px-3 py-2">Currency</Nav.Link>
            <Nav.Link as={Link} to="/about" className="text-white mx-3 fw-medium px-3 py-2">About</Nav.Link>
          </Nav>
        </Container>
      </div>
    </div>
  );
};

export default Header;
