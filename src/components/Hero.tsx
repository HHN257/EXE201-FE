import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button} from 'react-bootstrap';

const Hero: React.FC = () => {
  const navigate = useNavigate();


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
