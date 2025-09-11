import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, InputGroup } from 'react-bootstrap';
import { Search, Star, Camera } from 'lucide-react';

interface Destination {
  id: string;
  name: string;
  description: string;
  region: string;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  highlights: string[];
}

const DestinationsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');

  // Mock data
  const regions = [
    'All Regions',
    'Northern Vietnam',
    'Central Vietnam',
    'Southern Vietnam'
  ];

  const destinations: Destination[] = [
    {
      id: '1',
      name: 'Ha Long Bay',
      description: 'UNESCO World Heritage site with stunning limestone karsts and emerald waters',
      region: 'Northern Vietnam',
      rating: 4.9,
      reviewCount: 2847,
      imageUrl: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=400',
      highlights: ['UNESCO Heritage', 'Boat Tours', 'Cave Exploration']
    },
    {
      id: '2',
      name: 'Hoi An Ancient Town',
      description: 'Charming ancient trading port with well-preserved architecture',
      region: 'Central Vietnam',
      rating: 4.8,
      reviewCount: 1924,
      imageUrl: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73d0e?w=400',
      highlights: ['Ancient Architecture', 'Lantern Festival', 'Tailor Shops']
    },
    {
      id: '3',
      name: 'Mekong Delta',
      description: 'Vast network of rivers, swamps and islands in southern Vietnam',
      region: 'Southern Vietnam',
      rating: 4.7,
      reviewCount: 1456,
      imageUrl: 'https://images.unsplash.com/photo-1593702295094-b39f55a7cecc?w=400',
      highlights: ['Floating Markets', 'River Cruises', 'Local Life']
    },
    {
      id: '4',
      name: 'Sapa Terraces',
      description: 'Breathtaking rice terraces and ethnic minority villages',
      region: 'Northern Vietnam',
      rating: 4.8,
      reviewCount: 1678,
      imageUrl: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=400',
      highlights: ['Rice Terraces', 'Trekking', 'Cultural Villages']
    },
    {
      id: '5',
      name: 'Phong Nha-Ke Bang',
      description: 'National park famous for its cave systems and underground rivers',
      region: 'Central Vietnam',
      rating: 4.6,
      reviewCount: 892,
      imageUrl: 'https://images.unsplash.com/photo-1627894483062-4b28d14b2a17?w=400',
      highlights: ['Cave Systems', 'Adventure Tours', 'National Park']
    },
    {
      id: '6',
      name: 'Phu Quoc Island',
      description: 'Tropical paradise with pristine beaches and crystal-clear waters',
      region: 'Southern Vietnam',
      rating: 4.7,
      reviewCount: 2156,
      imageUrl: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=400',
      highlights: ['Pristine Beaches', 'Water Sports', 'Seafood']
    }
  ];

  const filteredDestinations = destinations.filter(destination => {
    const matchesSearch = destination.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         destination.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = !selectedRegion || selectedRegion === 'All Regions' || 
                         destination.region === selectedRegion;
    return matchesSearch && matchesRegion;
  });

  return (
    <div className="min-vh-100">
      {/* Hero Section */}
      <section className="bg-primary text-white py-5">
        <Container>
          <Row className="text-center">
            <Col lg={8} className="mx-auto">
              <h1 className="display-4 fw-bold mb-4">Destinations</h1>
              <p className="lead mb-0">
                Discover Vietnam's most beautiful and culturally rich destinations
              </p>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Search and Filter Section */}
      <section className="py-4 bg-light">
        <Container>
          <Row className="g-3">
            <Col md={8}>
              <InputGroup size="lg">
                <InputGroup.Text>
                  <Search size={20} />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search destinations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={4}>
              <Form.Select
                size="lg"
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
              >
                {regions.map(region => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Destinations Grid */}
      <section className="py-5">
        <Container>
          <Row className="g-4">
            {filteredDestinations.map((destination) => (
              <Col key={destination.id} md={6} lg={4}>
                <Card className="h-100 border-0 shadow-sm">
                  <div className="position-relative overflow-hidden" style={{ height: '250px' }}>
                    <Card.Img
                      variant="top"
                      src={destination.imageUrl}
                      alt={destination.name}
                      className="h-100 w-100 object-fit-cover"
                      style={{ transition: 'transform 0.3s' }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    />
                    <div className="position-absolute top-0 end-0 m-3">
                      <span className="bg-white rounded-pill px-2 py-1 d-flex align-items-center small">
                        <Star size={14} className="text-warning me-1" fill="currentColor" />
                        {destination.rating}
                      </span>
                    </div>
                    <div className="position-absolute bottom-0 start-0 m-3">
                      <span className="badge bg-dark bg-opacity-75">{destination.region}</span>
                    </div>
                  </div>
                  <Card.Body className="d-flex flex-column">
                    <Card.Title className="h5 fw-semibold mb-2">{destination.name}</Card.Title>
                    <Card.Text className="text-muted mb-3 flex-grow-1">
                      {destination.description}
                    </Card.Text>
                    
                    <div className="mb-3">
                      <div className="d-flex flex-wrap gap-1">
                        {destination.highlights.map((highlight, index) => (
                          <span key={index} className="badge bg-light text-dark border">
                            {highlight}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center text-muted small">
                        <Camera size={14} className="me-1" />
                        <span>{destination.reviewCount} reviews</span>
                      </div>
                      <Button variant="outline-primary" size="sm">
                        Explore
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {filteredDestinations.length === 0 && (
            <Row>
              <Col className="text-center py-5">
                <h4 className="text-muted">No destinations found</h4>
                <p className="text-muted">Try adjusting your search or filter criteria</p>
              </Col>
            </Row>
          )}
        </Container>
      </section>
    </div>
  );
};

export default DestinationsPage;
