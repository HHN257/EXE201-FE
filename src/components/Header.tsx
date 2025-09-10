import React, { useState } from 'react';
import { Globe } from 'lucide-react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';

const Header: React.FC = () => {
  const [language, setLanguage] = useState('EN');

  return (
    <Navbar bg="white" expand="lg" className="shadow-sm border-bottom sticky-top">
      <Container fluid className="px-3 px-lg-5">
        {/* Logo */}
        <Navbar.Brand href="#" className="fw-bold fs-3" style={{ color: '#2563eb' }}>
          SmartTravel
        </Navbar.Brand>

        {/* Desktop Navigation */}
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="#" className="text-dark">Destinations</Nav.Link>
            <Nav.Link href="#" className="text-dark">Services</Nav.Link>
            <Nav.Link href="#" className="text-dark">Tour Guides</Nav.Link>
            <Nav.Link href="#" className="text-dark">About</Nav.Link>
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

            {/* Auth buttons */}
            <Button variant="link" className="text-dark text-decoration-none">
              Sign In
            </Button>
            <Button className="btn-primary-custom">
              Sign Up
            </Button>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
