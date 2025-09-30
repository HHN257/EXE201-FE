import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Hero from '../components/Hero';
import HomePageWeather from '../components/HomePageWeather';
import { Star, MapPin, Users, Clock, ArrowRight } from 'lucide-react';
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import type { Location, Category } from '../types';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [popularLocations, setPopularLocations] = useState<Location[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        try {
          const locations = await apiService.getAllLocations(1, 6);
          setPopularLocations(locations);
        } catch (error) {
          console.log('Using mock location data due to API error:', error);
          setPopularLocations([
            {
              id: 1,
              name: 'Ha Long Bay',
              address: 'Quang Ninh Province, Vietnam',
              placeType: 'tourist_attraction',
              rating: 4.8,
              userReview: 'UNESCO World Heritage site with stunning limestone karsts',
              isActive: true,
              createdAt: '2024-01-01T00:00:00Z'
            },
            {
              id: 2,
              name: 'Hoi An Ancient Town',
              address: 'Hoi An, Quang Nam Province, Vietnam',
              placeType: 'tourist_attraction',
              rating: 4.7,
              userReview: 'Charming ancient town with lantern-lit streets',
              isActive: true,
              createdAt: '2024-01-01T00:00:00Z'
            },
            {
              id: 3,
              name: 'Sapa Rice Terraces',
              address: 'Sapa, Lao Cai Province, Vietnam',
              placeType: 'tourist_attraction',
              rating: 4.6,
              userReview: 'Breathtaking mountain landscapes and ethnic culture',
              isActive: true,
              createdAt: '2024-01-01T00:00:00Z'
            }
          ]);
        }

        setCategories([
          { id: '1', name: 'Food & Dining', description: 'Local restaurants and street food', iconUrl: '🍜' },
          { id: '2', name: 'Transportation', description: 'Taxis, motorbikes, and tours', iconUrl: '🚗' },
          { id: '3', name: 'Accommodation', description: 'Hotels, hostels, and homestays', iconUrl: '🏨' },
          { id: '4', name: 'Activities', description: 'Tours, adventures, and experiences', iconUrl: '🎯' },
          { id: '5', name: 'Shopping', description: 'Markets, malls, and souvenirs', iconUrl: '🛍️' },
          { id: '6', name: 'Health & Wellness', description: 'Spas, clinics, and wellness centers', iconUrl: '💆' }
        ]);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      <Hero />

      {/* Weather Widget Section */}
      <section className="py-4 bg-gradient-to-r from-blue-50 to-cyan-50" style={{ backgroundColor: '#f8fbff' }}>
        <Container>
          <Row className="justify-content-center">
            <Col xs={12} sm={10} md={8} lg={6} xl={5}>
              <HomePageWeather />
            </Col>
          </Row>
        </Container>
      </section>

      {/* Categories Section */}
      <section className="py-5 bg-white">
        <Container>
          <Row>
            <Col lg={8} className="mx-auto text-center mb-5">
              <h2 className="display-5 fw-bold mb-4">
                What Are You Looking For?
              </h2>
              <p className="lead text-muted">
                Discover authentic Vietnamese experiences through our carefully curated categories
              </p>
            </Col>
          </Row>

          <Row className="g-4">
            {categories.map((category) => (
              <Col key={category.id} xs={6} md={4} lg={2}>
                <Card 
                  className="card-custom h-100 text-center border-0" 
                  style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
                  onClick={() => navigate('/services')}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '';
                  }}
                >
                  <Card.Body className="p-4">
                    <div className="fs-1 mb-3">{category.iconUrl}</div>
                    <Card.Title className="h6 fw-semibold text-dark">{category.name}</Card.Title>
                    <Card.Text className="text-muted small">{category.description}</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Popular Destinations */}
      <section className="py-5">
        <Container>
          <Row className="align-items-center mb-5">
            <Col>
              <h2 className="display-5 fw-bold mb-3">
                Popular Destinations
              </h2>
              <p className="lead text-muted">
                Explore Vietnam's most beloved locations
              </p>
            </Col>
            <Col xs="auto">
              <Button 
                variant="outline-primary" 
                className="d-flex align-items-center"
                onClick={() => navigate('/destinations')}
              >
                View All
                <ArrowRight size={16} className="ms-2" />
              </Button>
            </Col>
          </Row>

          <Row className="g-4">
            {popularLocations.map((location) => (
              <Col key={location.id} md={6} lg={4}>
                <Card 
                  className="card-custom h-100 border-0" 
                  style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
                  onClick={() => navigate(`/destinations/${location.id}`)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '';
                  }}
                >
                  <div className="position-relative overflow-hidden" style={{ height: '200px' }}>
                    <Card.Img
                      variant="top"
                      src={`https://images.unsplash.com/photo-1528127269322-539801943592?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80`}
                      alt={location.name}
                      className="h-100 w-100 object-fit-cover"
                      style={{ transition: 'transform 0.3s' }}
                    />
                    <div className="position-absolute top-0 end-0 m-3">
                      <span className="bg-white rounded-pill px-2 py-1 d-flex align-items-center small">
                        <Star size={14} className="text-warning me-1" fill="currentColor" />
                        {location.rating || 0}
                      </span>
                    </div>
                  </div>
                  <Card.Body>
                    <Card.Title className="h5 fw-semibold text-dark">{location.name}</Card.Title>
                    <Card.Text className="text-muted mb-3">{location.userReview || 'No description available'}</Card.Text>
                    <div className="d-flex align-items-center text-muted small mb-2">
                      <MapPin size={14} className="me-1" />
                      <span>{location.address}</span>
                    </div>
                    <div className="text-muted small">
                      {location.placeType}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Why Choose SmartTravel */}
      <section className="py-5 bg-white">
        <Container>
          <Row>
            <Col lg={8} className="mx-auto text-center mb-5">
              <h2 className="display-5 fw-bold mb-4">
                Why Choose SmartTravel?
              </h2>
              <p className="lead text-muted">
                We're not just another travel platform. We're your local connection to authentic Vietnam.
              </p>
            </Col>
          </Row>

          <Row className="g-4">
            <Col md={4} className="text-center">
              <div 
                className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4"
                style={{ width: '80px', height: '80px', backgroundColor: '#e0f2fe' }}
              >
                <Users size={32} style={{ color: '#2563eb' }} />
              </div>
              <h4 className="h5 fw-semibold mb-3">Local Experts</h4>
              <p className="text-muted">
                Connect with verified local tour guides and service providers who know Vietnam inside out.
              </p>
            </Col>

            <Col md={4} className="text-center">
              <div 
                className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4"
                style={{ width: '80px', height: '80px', backgroundColor: '#dcfce7' }}
              >
                <Star size={32} style={{ color: '#10b981' }} />
              </div>
              <h4 className="h5 fw-semibold mb-3">Verified Reviews</h4>
              <p className="text-muted">
                Make informed decisions with authentic reviews from fellow travelers and locals.
              </p>
            </Col>

            <Col md={4} className="text-center">
              <div 
                className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4"
                style={{ width: '80px', height: '80px', backgroundColor: '#f3e8ff' }}
              >
                <Clock size={32} style={{ color: '#8b5cf6' }} />
              </div>
              <h4 className="h5 fw-semibold mb-3">24/7 Support</h4>
              <p className="text-muted">
                Get help whenever you need it with our round-the-clock customer support team.
              </p>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Call to Action - Only show when not authenticated */}
      {!isAuthenticated && (
        <section className="py-4 hero-section">
          <div className="hero-overlay"></div>
          <Container className="position-relative text-center text-white" style={{ zIndex: 2 }}>
            <Row>
              <Col lg={8} className="mx-auto">
                <h2 className="h2 fw-bold mb-3">
                  Ready to Explore Vietnam?
                </h2>
                <p className="mb-4" style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '1.1rem' }}>
                  Join thousands of travelers who have discovered authentic Vietnam with VietGo
                </p>
                <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center" style={{ zIndex: 3, position: 'relative' }}>
                  <Button 
                    size="lg" 
                    className="bg-white text-primary fw-semibold border-0"
                    style={{ transition: 'transform 0.2s, box-shadow 0.2s', zIndex: 4, position: 'relative' }}
                    onClick={() => navigate('/register')}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(255,255,255,0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '';
                    }}
                  >
                    Sign Up for Free
                  </Button>
                  <Button 
                    variant="outline-light" 
                    size="lg" 
                    className="fw-semibold"
                    style={{ transition: 'transform 0.2s, background-color 0.2s', zIndex: 4, position: 'relative' }}
                    onClick={() => navigate('/destinations')}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    Explore Destinations
                  </Button>
                </div>
              </Col>
            </Row>
          </Container>
        </section>
      )}
    </div>
  );
};

export default HomePage;
