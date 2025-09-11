import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Globe, User, LogOut } from 'lucide-react';
import { Navbar, Nav, Container, Button, Dropdown } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const [language, setLanguage] = useState('EN');
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
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
            {/* Language Selector */}
            <div className="d-flex align-items-center gap-1">
              <Globe size={16} className="text-secondary" />
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="form-select form-select-sm border-0"
                style={{ width: 'auto' }}
              >
                <option value="EN">EN</option>
                <option value="VI">VI</option>
              </select>
            </div>

            {/* Auth section */}
            {isAuthenticated ? (
              <Dropdown align="end">
                <Dropdown.Toggle variant="link" className="text-dark text-decoration-none border-0 bg-transparent">
                  <div className="d-flex align-items-center gap-2">
                    <User size={16} />
                    <span>{user?.name || 'User'}</span>  {/* Changed from fullName to name */}
                  </div>
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item>Profile</Dropdown.Item>
                  <Dropdown.Item as={Link} to="/bookings">My Bookings</Dropdown.Item>
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
