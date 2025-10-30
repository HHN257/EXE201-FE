import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Facebook, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import Logo from '../assets/LogoVietGo_WhiteBG.png';

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
              <div className="bg-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px', padding: '8px' }}>
                <img 
                  src={Logo} 
                  alt="VietGo Logo" 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'contain',
                    display: 'block',
                    margin: 'auto'
                  }}
                />
              </div>
            </div>
            <div className="d-flex gap-3">
              <a href="https://www.facebook.com/profile.php?id=61581639685084" target="_blank" rel="noopener noreferrer" className="text-white" style={{ fontSize: '1.5rem' }}>
                <Facebook />
              </a>
              <a href="https://www.instagram.com/vietgo_/" target="_blank" rel="noopener noreferrer" className="text-white" style={{ fontSize: '1.5rem' }}>
                <Instagram />
              </a>
              <a href="https://www.tiktok.com/@vietgo_goldentiger" target="_blank" rel="noopener noreferrer" className="text-white" style={{ fontSize: '1.5rem' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19.321 5.562a5.124 5.124 0 0 1-.443-.258 6.228 6.228 0 0 1-1.137-.966c-.849-.984-1.273-2.033-1.295-3.2h-.003c-.018-.93-.014-.93-.014-1.128h-3.59v12.577c0 .268-.01.535-.029.8-.177 2.284-2.05 4.1-4.358 4.1-2.388 0-4.316-1.928-4.316-4.316 0-2.388 1.928-4.316 4.316-4.316.44 0 .863.066 1.262.188v-3.649c-.42-.06-.85-.091-1.286-.091-4.142 0-7.5 3.358-7.5 7.5s3.358 7.5 7.5 7.5c4.142 0 7.5-3.358 7.5-7.5V8.424a9.448 9.448 0 0 0 5.527 1.758V6.693a5.765 5.765 0 0 1-2.134-1.131z"/>
                </svg>
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
              <span>Thu Duc City, Ho Chi Minh City</span>
            </div>
            <div className="mb-2">
              <Phone size={16} className="me-2" style={{ display: 'inline' }} />
              <span>Hotline: 0933.204.205</span>
            </div>
            <div className="mb-2">
              <Mail size={16} className="me-2" style={{ display: 'inline' }} />
              <span>goldentigervietgo@gmail.com</span>
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