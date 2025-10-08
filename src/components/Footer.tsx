import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import Logo from '../assets/Logo.png';

const Footer: React.FC = () => {
  return (
    <footer style={{ backgroundColor: '#29499c' }} className="text-white py-5">
      <Container>
        <Row className="g-4">
          {/* Company Info */}
          <Col lg={3} md={6}>
            <div className="mb-3">
              <h5 className="text-uppercase fw-bold mb-3" style={{ borderBottom: '2px solid white', paddingBottom: '8px', display: 'inline-block' }}>
                Connect With Us
              </h5>
            </div>
            <div className="d-flex align-items-center mb-4">
              <div className="bg-white rounded-circle p-3" style={{ width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img 
                  src={Logo} 
                  alt="VietGo Logo" 
                  style={{ maxWidth: '50px', maxHeight: '50px', objectFit: 'contain' }}
                />
              </div>
            </div>
            <div className="d-flex gap-3">
              <a href="#" className="text-white" style={{ fontSize: '1.5rem' }}>
                <Facebook />
              </a>
              <a href="#" className="text-white" style={{ fontSize: '1.5rem' }}>
                <Instagram />
              </a>
              <a href="#" className="text-white" style={{ fontSize: '1.5rem' }}>
                <Twitter />
              </a>
            </div>
          </Col>

          {/* Company Details */}
          <Col lg={3} md={6}>
            <div className="mb-3">
              <h5 className="text-uppercase fw-bold mb-3" style={{ borderBottom: '2px solid white', paddingBottom: '8px', display: 'inline-block' }}>
                Co., Ltd VietGo
              </h5>
            </div>
            <div className="mb-2">
              <MapPin size={16} className="me-2" style={{ display: 'inline' }} />
              <span>Vinhomes Grand Park, Thu Duc City, Ho Chi Minh City</span>
            </div>
            <div className="mb-2">
              <Phone size={16} className="me-2" style={{ display: 'inline' }} />
              <span>Hotline: 0933.204.205</span>
            </div>
            <div className="mb-2">
              <Mail size={16} className="me-2" style={{ display: 'inline' }} />
              <span>vietgo@gmail.com</span>
            </div>
          </Col>

          {/* About Us */}
          <Col lg={3} md={6}>
            <div className="mb-3">
              <h5 className="text-uppercase fw-bold mb-3" style={{ borderBottom: '2px solid white', paddingBottom: '8px', display: 'inline-block' }}>
                About Us
              </h5>
            </div>
            <ul className="list-unstyled">
              <li className="mb-2">
                <a href="/about" className="text-white text-decoration-none">VietGo</a>
              </li>
              <li className="mb-2">
                <a href="/about" className="text-white text-decoration-none">Our Story</a>
              </li>
              <li className="mb-2">
                <a href="/about" className="text-white text-decoration-none">Our Team</a>
              </li>
              <li className="mb-2">
                <a href="/about" className="text-white text-decoration-none">Values and Commitment</a>
              </li>
            </ul>
          </Col>

          {/* Newsletter */}
          <Col lg={3} md={6}>
            <div className="mb-3">
              <h5 className="text-uppercase fw-bold mb-3" style={{ borderBottom: '2px solid white', paddingBottom: '8px', display: 'inline-block' }}>
                More Information
              </h5>
            </div>
            <p className="mb-3">
              Leave your email to receive new ideas and useful information, offers from VietGo
            </p>
            <div className="d-flex">
              <input
                type="email"
                className="form-control me-2"
                placeholder="Enter your email"
                style={{ borderRadius: '4px' }}
              />
              <button 
                className="btn btn-light px-3"
                style={{ borderRadius: '4px', whiteSpace: 'nowrap' }}
              >
                Subscribe
              </button>
            </div>
          </Col>
        </Row>

        {/* Bottom Section */}
        <hr className="my-4" style={{ borderColor: 'rgba(255,255,255,0.3)' }} />
        <Row>
          <Col className="text-center">
            <p className="mb-0 small">
              Use of this website indicates your compliance with our privacy policy, terms and conditions
            </p>
            <p className="mb-0 small mt-2">
              © 2024 VietGo. All rights reserved.
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;