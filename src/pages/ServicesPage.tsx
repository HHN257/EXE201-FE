import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form, InputGroup } from 'react-bootstrap';
import { Search, MapPin, Star, Users } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  location: string;
  priceRange: string;
  rating: number;
  reviewCount: number;
  imageUrl: string;
}

const ServicesPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Read category from URL parameters on component mount
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    }
  }, [searchParams]);

  // Mock data
  const categories = [
    'All Services',
    'Transportation',
    'Travel & Booking',
    'Food & Dining',
    'Activities',
    'Shopping'
  ];

  const services: Service[] = [
    {
      id: '1',
      name: 'Saigon Street Food Tour',
      description: 'Discover the best local street food with our expert guides',
      category: 'Food & Dining',
      location: 'Ho Chi Minh City',
      priceRange: '$20-30',
      rating: 4.8,
      reviewCount: 124,
      imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400'
    },
    {
      id: '2',
      name: 'Motorbike Rental Service',
      description: 'Rent quality motorbikes to explore the city at your own pace',
      category: 'Transportation',
      location: 'Ho Chi Minh City',
      priceRange: '$5-10/day',
      rating: 4.6,
      reviewCount: 89,
      imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'
    },
    {
      id: '3',
      name: 'Traditional Cooking Class',
      description: 'Learn to cook authentic Vietnamese dishes',
      category: 'Activities',
      location: 'Hanoi',
      priceRange: '$25-35',
      rating: 4.9,
      reviewCount: 156,
      imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400'
    },
    {
      id: '4',
      name: 'Local Market Shopping Tour',
      description: 'Navigate local markets with insider knowledge',
      category: 'Shopping',
      location: 'Hoi An',
      priceRange: '$15-25',
      rating: 4.7,
      reviewCount: 78,
      imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400'
    },
    {
      id: '5',
      name: 'Boutique Hotel Booking',
      description: 'Book authentic Vietnamese boutique hotels and homestays',
      category: 'Travel & Booking',
      location: 'Da Nang',
      priceRange: '$30-80/night',
      rating: 4.9,
      reviewCount: 92,
      imageUrl: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400'
    }
  ];

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || selectedCategory === 'All Services' || 
                           service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-vh-100">
      {/* Hero Section */}
      <section className="bg-primary text-white py-5">
        <Container>
          <Row className="text-center">
            <Col lg={8} className="mx-auto">
              <h1 className="display-4 fw-bold mb-4">Local Services</h1>
              <p className="lead mb-0">
                Connect with trusted local service providers across Vietnam
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
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={4}>
              <Form.Select
                size="lg"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Services Grid */}
      <section className="py-5">
        <Container>
          <Row className="g-4">
            {filteredServices.map((service) => (
              <Col key={service.id} md={6} lg={4}>
                <Card className="h-100 border-0 shadow-sm">
                  <div className="position-relative overflow-hidden" style={{ height: '200px' }}>
                    <Card.Img
                      variant="top"
                      src={service.imageUrl}
                      alt={service.name}
                      className="h-100 w-100 object-fit-cover"
                      style={{ transition: 'transform 0.3s' }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    />
                    <div className="position-absolute top-0 end-0 m-3">
                      <span className="bg-white rounded-pill px-2 py-1 d-flex align-items-center small">
                        <Star size={14} className="text-warning me-1" fill="currentColor" />
                        {service.rating}
                      </span>
                    </div>
                  </div>
                  <Card.Body className="d-flex flex-column">
                    <div className="mb-2">
                      <span className="badge bg-primary mb-2">{service.category}</span>
                      <Card.Title className="h5 fw-semibold">{service.name}</Card.Title>
                      <Card.Text className="text-muted mb-3">{service.description}</Card.Text>
                    </div>
                    
                    <div className="mt-auto">
                      <div className="d-flex align-items-center text-muted small mb-2">
                        <MapPin size={14} className="me-1" />
                        <span>{service.location}</span>
                      </div>
                      <div className="d-flex align-items-center text-muted small mb-3">
                        <Users size={14} className="me-1" />
                        <span>{service.reviewCount} reviews</span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="fw-semibold text-primary">{service.priceRange}</div>
                        <Button variant="outline-primary" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {filteredServices.length === 0 && (
            <Row>
              <Col className="text-center py-5">
                <h4 className="text-muted">No services found</h4>
                <p className="text-muted">Try adjusting your search or filter criteria</p>
              </Col>
            </Row>
          )}
        </Container>
      </section>
    </div>
  );
};

export default ServicesPage;
