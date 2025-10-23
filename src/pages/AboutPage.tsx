import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Users, Heart, Globe, Award } from 'lucide-react';
import uyen from '../assets/uyen.jpg';
import nam from '../assets/nam.jpg';
import thu from '../assets/thu.jpg';
import trang from '../assets/trang.jpg';
import thong from '../assets/thong.jpg';

import vnImage from '../assets/vnLs3.jpg';
import uyen from '../assets/uyen.jpg';
import nam from '../assets/nam.jpg';
import thu from '../assets/thu.jpg';
import trang from '../assets/trang.jpg';
import thong from '../assets/thong.jpg';

const AboutPage: React.FC = () => {
  const features = [
    {
      icon: <Users size={40} className="text-primary" />,
      title: 'Local Expertise',
      description: 'Connect with verified local guides and service providers who know Vietnam inside out.'
    },
    {
      icon: <Heart size={40} className="text-danger" />,
      title: 'Authentic Experiences',
      description: 'Discover the real Vietnam through authentic experiences curated by locals.'
    },
    {
      icon: <Globe size={40} className="text-success" />,
      title: 'Sustainable Travel',
      description: 'Support local communities and practice responsible tourism that benefits everyone.'
    },
    {
      icon: <Award size={40} className="text-warning" />,
      title: 'Quality Assured',
      description: 'All our partners are verified and reviewed to ensure the highest quality experiences.'
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Happy Travelers' },
    { number: '500+', label: 'Local Partners' },
    { number: '50+', label: 'Destinations' },
    { number: '4.8/5', label: 'Average Rating' }
  ];

  const team = [
    {
      name: 'Hà Phương Uyên',
      role: 'Founder & CEO',
      image: uyen,
      description: 'Travel enthusiast with 15 years of experience in Vietnam tourism industry.'
    },
    {
      name: 'Hồ Ngọc Anh Thư',
      role: 'Head of Operations',
      image: thu, 
      description: 'Expert in local partnerships and community development across Vietnam.'
    },
    {
      name: 'Phan Nguyễn Khánh Trang',
      role: 'Technology Director',
      image: trang,
      description: 'Tech innovator focused on creating seamless travel experiences through technology.'
    },
    {
      name: 'Hoàng Hữu Nam',
      role: 'Technology Director',
      image: nam,
      description: 'Tech innovator focused on creating seamless travel experiences through technology.'
    },
    {
      name: 'Nguyễn Minh Thông',
      role: 'Technology Director',
      image: thong,
      description: 'Tech innovator focused on creating seamless travel experiences through technology.'
    }
  ];

  return (
    <div className="min-vh-100">
      {/* Hero Section */}
      <section className="bg-primary text-white py-5">
        <Container>
          <Row className="text-center">
            <Col lg={8} className="mx-auto">
              <h1 className="display-4 fw-bold mb-4">About Viet Go</h1>
              <p className="lead mb-0">
                Connecting travelers with authentic Vietnam through local expertise and genuine experiences
              </p>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Mission Section */}
      <section className="py-5">
        <Container>
          <Row className="align-items-center">
            <Col lg={6}>
              <h2 className="display-5 fw-bold mb-4">Our Mission</h2>
              <p className="lead text-muted mb-4">
                Viet Go was born from a simple belief: the best way to experience Vietnam is through the eyes of locals who call it home.
              </p>
              <p className="mb-4">
                We bridge the gap between curious travelers and passionate locals, creating meaningful connections that enrich both visitors' experiences and local communities. Our platform empowers local guides, service providers, and artisans while offering travelers authentic, personalized experiences they can't find anywhere else.
              </p>
              <p className="mb-0">
                Whether you're seeking hidden street food gems in Ho Chi Minh City, wanting to learn traditional cooking in Hanoi, or planning an adventure trek in Sapa, Viet Go connects you with verified local experts who share our passion for authentic Vietnamese culture.
              </p>
            </Col>
            <Col lg={6}>
              <img
                src={vnImage}
                alt="Vietnam landscape"
                className="img-fluid rounded shadow"
              />
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section className="py-5 bg-light">
        <Container>
          <Row className="text-center mb-5">
            <Col lg={8} className="mx-auto">
              <h2 className="display-5 fw-bold mb-4">Why Choose Viet Go?</h2>
              <p className="lead text-muted">
                We're not just a booking platform – we're your local connection to authentic Vietnam
              </p>
            </Col>
          </Row>
          <Row className="g-4">
            {features.map((feature, index) => (
              <Col key={index} md={6} lg={3}>
                <Card className="h-100 border-0 shadow-sm text-center">
                  <Card.Body className="p-4">
                    <div className="mb-3">
                      {feature.icon}
                    </div>
                    <h5 className="fw-semibold mb-3">{feature.title}</h5>
                    <p className="text-muted mb-0">{feature.description}</p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Stats Section */}
      <section className="py-5 bg-primary text-white">
        <Container>
          <Row className="text-center">
            {stats.map((stat, index) => (
              <Col key={index} md={3} className="mb-4 mb-md-0">
                <h2 className="display-4 fw-bold mb-2">{stat.number}</h2>
                <p className="lead mb-0">{stat.label}</p>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Team Section */}
      <section className="py-5">
        <Container>
          <Row className="text-center mb-5">
            <Col lg={8} className="mx-auto">
              <h2 className="display-5 fw-bold mb-4">Meet Our Team</h2>
              <p className="lead text-muted">
                Passionate locals dedicated to sharing the beauty of Vietnam with the world
              </p>
            </Col>
          </Row>
          <Row className="g-4">
            {team.map((member, index) => (
              <Col key={index} md={4}>
                <Card className="h-100 border-0 shadow-sm text-center">
                  <Card.Body className="p-4">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="rounded-circle mb-3"
                      style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                    />
                    <h5 className="fw-semibold mb-1">{member.name}</h5>
                    <p className="text-primary fw-semibold mb-3">{member.role}</p>
                    <p className="text-muted">{member.description}</p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Values Section */}
      <section className="py-5 bg-light">
        <Container>
          <Row className="text-center mb-5">
            <Col lg={8} className="mx-auto">
              <h2 className="display-5 fw-bold mb-4">Our Values</h2>
            </Col>
          </Row>
          <Row className="g-4">
            <Col md={4}>
              <div className="text-center">
                <h5 className="fw-semibold mb-3">Authenticity</h5>
                <p className="text-muted">
                  We believe in genuine experiences that showcase the real Vietnam, not tourist facades.
                </p>
              </div>
            </Col>
            <Col md={4}>
              <div className="text-center">
                <h5 className="fw-semibold mb-3">Community</h5>
                <p className="text-muted">
                  Supporting local communities and creating economic opportunities for Vietnamese families.
                </p>
              </div>
            </Col>
            <Col md={4}>
              <div className="text-center">
                <h5 className="fw-semibold mb-3">Sustainability</h5>
                <p className="text-muted">
                  Promoting responsible tourism that preserves Vietnam's natural beauty and cultural heritage.
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default AboutPage;
