import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, Settings, Shield, Crown, UserCheck, Calendar } from 'lucide-react';
import { Navbar, Nav, Container, Button, Dropdown, Image } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import Logo from '../assets/VietGo_Word.png';

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
          </Navbar.Brand>

          {/* Right side actions */}
          <div className="d-flex align-items-center gap-3">
            {/* Auth section */}
            {isAuthenticated ? (
              <Dropdown align="end">
                <Dropdown.Toggle variant="link" className="text-dark text-decoration-none border-0 bg-transparent">
                  <div className="d-flex align-items-center gap-2">
                    {getRoleIcon(user?.role || 'user')}
                    <span>{user?.name || 'User'}</span>
                    <div className="rounded-circle overflow-hidden border" style={{ width: '40px', height: '40px' }}>
                      <Image
                        src={user?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&size=40&background=0d6efd&color=fff`}
                        alt="Profile"
                        className="w-100 h-100 object-fit-cover"
                      />
                    </div>
                  </div>
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item as={Link} to={getRoleBasedDashboard()}>
                    <Settings size={16} className="me-2" />
                    Dashboard
                  </Dropdown.Item>
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
          <Nav className="justify-content-center py-2">
            <Nav.Link as={Link} to="/destinations" className="text-white mx-2 fw-medium">Destinations</Nav.Link>
            <Nav.Link as={Link} to="/services" className="text-white mx-2 fw-medium">Services</Nav.Link>
            <Nav.Link as={Link} to="/tour-guides" className="text-white mx-2 fw-medium">Tour Guides</Nav.Link>
            <Nav.Link as={Link} to="/plans" className="text-white mx-2 fw-medium">Plans</Nav.Link>
            <Nav.Link as={Link} to="/currency" className="text-white mx-2 fw-medium">Currency</Nav.Link>
            <Nav.Link as={Link} to="/about" className="text-white mx-2 fw-medium">About</Nav.Link>
          </Nav>
        </Container>
      </div>
    </div>
  );
};

export default Header;
