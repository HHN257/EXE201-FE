import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, Settings, Shield, Crown, UserCheck } from 'lucide-react';
import { Navbar, Nav, Container, Button, Dropdown, Badge } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { getUserDisplayName } from '../utils/roleUtils';

const Header: React.FC = () => {
  const { isAuthenticated, user, logout, getRoleBasedDashboard } = useAuth();
  const navigate = useNavigate();

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

  const getRoleBadgeColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'danger';
      case 'staff':
        return 'warning';
      case 'tourguide':
        return 'success';
      default:
        return 'secondary';
    }
  };

  return (
    <Navbar bg="white" expand="lg" className="shadow-sm border-bottom sticky-top">
      <Container fluid className="px-3 px-lg-5">
        {/* Logo */}
        <Navbar.Brand as={Link} to="/" className="fw-bold fs-3" style={{ color: '#2563eb' }}>
          SmartTravel
        </Navbar.Brand>

        {/* Desktop Navigation */}
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/destinations" className="text-dark">Destinations</Nav.Link>
            <Nav.Link as={Link} to="/services" className="text-dark">Services</Nav.Link>
            <Nav.Link as={Link} to="/tour-guides" className="text-dark">Tour Guides</Nav.Link>
            <Nav.Link as={Link} to="/currency" className="text-dark">Currency</Nav.Link>
            <Nav.Link as={Link} to="/about" className="text-dark">About</Nav.Link>
          </Nav>

          {/* Right side actions */}
          <div className="d-flex align-items-center gap-3">
            {/* Auth section */}
            {isAuthenticated ? (
              <Dropdown align="end">
                <Dropdown.Toggle variant="link" className="text-dark text-decoration-none border-0 bg-transparent">
                  <div className="d-flex align-items-center gap-2">
                    {getRoleIcon(user?.role || 'user')}
                    <span>{user?.name || 'User'}</span>
                    <Badge bg={getRoleBadgeColor(user?.role || 'user')} className="ms-1">
                      {getUserDisplayName(user?.role || 'user')}
                    </Badge>
                  </div>
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item as={Link} to={getRoleBasedDashboard()}>
                    <Settings size={16} className="me-2" />
                    Dashboard
                  </Dropdown.Item>
                  <Dropdown.Item>Profile</Dropdown.Item>
                  {(user?.role?.toLowerCase() === 'user' || user?.role?.toLowerCase() === 'tourguide') && (
                    <Dropdown.Item as={Link} to="/bookings">My Bookings</Dropdown.Item>
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
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
