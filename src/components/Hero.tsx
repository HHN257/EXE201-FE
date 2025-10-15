import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';
import hero1 from '../assets/vnLs.jpg';
import hero2 from '../assets/vnLs2.jpg';
import hero3 from '../assets/vnLs3.jpg';

const Hero: React.FC = () => {
  const navigate = useNavigate();

  // Slideshow images using local Vietnam images
  const heroImages = [
    hero1, // Ha Long Bay with limestone karsts and traditional boat
    hero2, // Beautiful rice terraces
    hero3  // Stunning terraced fields landscape
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Auto-advance slideshow
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % heroImages.length
      );
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, [heroImages.length]);

  return (
    <section className="hero-section position-relative py-5">
      <div className="hero-overlay"></div>
      
      {/* Slideshow Images */}
      {heroImages.map((image, index) => (
        <div
          key={index}
          className={`hero-slide ${index === currentImageIndex ? 'active' : ''}`}
          style={{
            backgroundImage: `url(${image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: index === currentImageIndex ? 1 : 0,
            transition: 'opacity 1s ease-in-out',
            zIndex: 0
          }}
        />
      ))}

      {/* Slideshow Indicators */}
      <div className="slideshow-indicators position-absolute" style={{ bottom: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 3 }}>
        {heroImages.map((_, index) => (
          <button
            key={index}
            className={`indicator ${index === currentImageIndex ? 'active' : ''}`}
            onClick={() => setCurrentImageIndex(index)}
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              border: '2px solid white',
              backgroundColor: index === currentImageIndex ? 'white' : 'transparent',
              margin: '0 5px',
              cursor: 'pointer',
              transition: 'background-color 0.3s ease'
            }}
          />
        ))}
      </div>

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
                onClick={() => navigate('/destinations?placeType=museum')}
              >
                🏛️ Historical Sites
              </Button>
              <Button 
                variant="outline-light" 
                className="rounded-pill px-4 py-2"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', borderColor: 'rgba(255, 255, 255, 0.3)', zIndex: 4, position: 'relative' }}
                onClick={() => navigate('/destinations?placeType=restaurant')}
              >
                🍜 Local Food
              </Button>
              <Button 
                variant="outline-light" 
                className="rounded-pill px-4 py-2"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', borderColor: 'rgba(255, 255, 255, 0.3)', zIndex: 4, position: 'relative' }}
                onClick={() => navigate('/destinations?placeType=beach')}
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
