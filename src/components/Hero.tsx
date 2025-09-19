import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin } from 'lucide-react';
import { Container, Row, Col, Form, Button, InputGroup } from 'react-bootstrap';

const Hero: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() || location.trim()) {
      // Navigate to destinations page with search parameters
      const searchParams = new URLSearchParams();
      if (searchQuery.trim()) searchParams.set('search', searchQuery.trim());
      if (location.trim()) searchParams.set('location', location.trim());
      navigate(`/destinations?${searchParams.toString()}`);
    } else {
      navigate('/destinations');
    }
  };

  return (
    <section className="hero-section position-relative py-5">
      <div className="hero-overlay"></div>
      <div className="hero-bg"></div>

      <Container className="position-relative py-5" style={{ zIndex: 2 }}>
        <Row className="text-center">
          <Col>
            <h1 className="display-3 fw-bold mb-4">
              Discover Vietnam
              <span className="d-block accent-color">Like a Local</span>
            </h1>
            <p className="lead mb-5 text-white-50" style={{ maxWidth: '800px', margin: '0 auto' }}>
              Connect with local services, find expert tour guides, and explore hidden gems 
              across beautiful Vietnam with personalized recommendations.
            </p>

            {/* Search Form */}
            <Form onSubmit={handleSearch} className="mb-5" style={{ maxWidth: '1000px', margin: '0 auto', zIndex: 3, position: 'relative' }}>
              <div className="bg-white rounded-3 shadow-lg p-4">
                <Row className="g-3">
                  <Col md={4}>
                    <InputGroup>
                      <InputGroup.Text className="bg-transparent border-0">
                        <Search size={20} className="text-secondary" />
                      </InputGroup.Text>
                      <Form.Control
                        type="text"
                        placeholder="What are you looking for?"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="border-0 form-control-lg"
                        style={{ boxShadow: 'none' }}
                      />
                    </InputGroup>
                  </Col>
                  
                  <Col md={4}>
                    <InputGroup>
                      <InputGroup.Text className="bg-transparent border-0">
                        <MapPin size={20} className="text-secondary" />
                      </InputGroup.Text>
                      <Form.Control
                        type="text"
                        placeholder="Where in Vietnam?"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="border-0 form-control-lg"
                        style={{ boxShadow: 'none' }}
                      />
                    </InputGroup>
                  </Col>

                  <Col md={4}>
                    <Button
                      type="submit"
                      className="bg-accent border-0 w-100 py-3 fw-medium d-flex align-items-center justify-content-center"
                    >
                      <Search size={20} className="me-2" />
                      Search
                    </Button>
                  </Col>
                </Row>
              </div>
            </Form>

            {/* Quick Action Buttons */}
            <div className="d-flex flex-wrap justify-content-center gap-3" style={{ zIndex: 3, position: 'relative' }}>
              <Button 
                variant="outline-light" 
                className="rounded-pill px-4 py-2"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', borderColor: 'rgba(255, 255, 255, 0.3)', zIndex: 4, position: 'relative' }}
                onClick={() => navigate('/destinations?search=historical')}
              >
                🏛️ Historical Sites
              </Button>
              <Button 
                variant="outline-light" 
                className="rounded-pill px-4 py-2"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', borderColor: 'rgba(255, 255, 255, 0.3)', zIndex: 4, position: 'relative' }}
                onClick={() => navigate('/destinations?search=food')}
              >
                🍜 Local Food
              </Button>
              <Button 
                variant="outline-light" 
                className="rounded-pill px-4 py-2"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', borderColor: 'rgba(255, 255, 255, 0.3)', zIndex: 4, position: 'relative' }}
                onClick={() => navigate('/destinations?search=beach')}
              >
                🏖️ Beaches
              </Button>
              <Button 
                variant="outline-light" 
                className="rounded-pill px-4 py-2"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', borderColor: 'rgba(255, 255, 255, 0.3)', zIndex: 4, position: 'relative' }}
                onClick={() => navigate('/services?search=transportation')}
              >
                🚗 Transportation
              </Button>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Hero;
