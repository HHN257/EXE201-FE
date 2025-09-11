import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, InputGroup, Badge } from 'react-bootstrap';
import { Search, MapPin, Star, Languages, DollarSign } from 'lucide-react';

interface TourGuide {
  id: string;
  name: string;
  bio: string;
  location: string;
  languages: string[];
  specialties: string[];
  rating: number;
  reviewCount: number;
  pricePerHour: number;
  avatar: string;
  experience: string;
  isAvailable: boolean;
}

const TourGuidesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');

  // Mock data
  const locations = [
    'All Locations',
    'Ho Chi Minh City',
    'Hanoi',
    'Hoi An',
    'Da Nang',
    'Nha Trang',
    'Sapa'
  ];

  const languages = [
    'All Languages',
    'English',
    'French',
    'German',
    'Japanese',
    'Korean',
    'Chinese'
  ];

  const tourGuides: TourGuide[] = [
    {
      id: '1',
      name: 'Nguyen Van Duc',
      bio: 'Passionate local guide with 8 years of experience showing visitors the hidden gems of Ho Chi Minh City.',
      location: 'Ho Chi Minh City',
      languages: ['English', 'French'],
      specialties: ['Street Food', 'History', 'Culture'],
      rating: 4.9,
      reviewCount: 187,
      pricePerHour: 15,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      experience: '8 years',
      isAvailable: true
    },
    {
      id: '2',
      name: 'Tran Thi Mai',
      bio: 'Expert in Vietnamese cuisine and cooking traditions. I love sharing the authentic flavors of Vietnam with travelers.',
      location: 'Hanoi',
      languages: ['English', 'Japanese'],
      specialties: ['Cuisine', 'Cooking Classes', 'Markets'],
      rating: 4.8,
      reviewCount: 143,
      pricePerHour: 18,
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b547?w=150',
      experience: '6 years',
      isAvailable: true
    },
    {
      id: '3',
      name: 'Le Minh Khang',
      bio: 'Adventure enthusiast specializing in trekking and outdoor activities in northern Vietnam.',
      location: 'Sapa',
      languages: ['English', 'German'],
      specialties: ['Trekking', 'Adventure', 'Nature'],
      rating: 4.7,
      reviewCount: 89,
      pricePerHour: 12,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      experience: '5 years',
      isAvailable: false
    },
    {
      id: '4',
      name: 'Pham Thi Linh',
      bio: 'Cultural expert with deep knowledge of Vietnamese traditions, art, and ancient history.',
      location: 'Hoi An',
      languages: ['English', 'Korean', 'Chinese'],
      specialties: ['Culture', 'Art', 'History'],
      rating: 4.9,
      reviewCount: 201,
      pricePerHour: 20,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      experience: '10 years',
      isAvailable: true
    }
  ];

  const filteredGuides = tourGuides.filter(guide => {
    const matchesSearch = guide.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guide.bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guide.specialties.some(specialty => 
                           specialty.toLowerCase().includes(searchTerm.toLowerCase())
                         );
    const matchesLocation = !selectedLocation || selectedLocation === 'All Locations' || 
                           guide.location === selectedLocation;
    const matchesLanguage = !selectedLanguage || selectedLanguage === 'All Languages' ||
                           guide.languages.includes(selectedLanguage);
    return matchesSearch && matchesLocation && matchesLanguage;
  });

  return (
    <div className="min-vh-100">
      {/* Hero Section */}
      <section className="bg-primary text-white py-5">
        <Container>
          <Row className="text-center">
            <Col lg={8} className="mx-auto">
              <h1 className="display-4 fw-bold mb-4">Tour Guides</h1>
              <p className="lead mb-0">
                Connect with local experts who will make your Vietnam journey unforgettable
              </p>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Search and Filter Section */}
      <section className="py-4 bg-light">
        <Container>
          <Row className="g-3">
            <Col md={6}>
              <InputGroup size="lg">
                <InputGroup.Text>
                  <Search size={20} />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search guides, specialties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Select
                size="lg"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
              >
                {locations.map(location => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select
                size="lg"
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
              >
                {languages.map(language => (
                  <option key={language} value={language}>
                    {language}
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Tour Guides Grid */}
      <section className="py-5">
        <Container>
          <Row className="g-4">
            {filteredGuides.map((guide) => (
              <Col key={guide.id} md={6} lg={4}>
                <Card className={`h-100 border-0 shadow-sm ${!guide.isAvailable ? 'opacity-75' : ''}`}>
                  <Card.Body className="d-flex flex-column">
                    <div className="d-flex align-items-center mb-3">
                      <img
                        src={guide.avatar}
                        alt={guide.name}
                        className="rounded-circle me-3"
                        style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                      />
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center justify-content-between">
                          <h5 className="fw-semibold mb-1">{guide.name}</h5>
                          {!guide.isAvailable && (
                            <Badge bg="secondary">Unavailable</Badge>
                          )}
                        </div>
                        <div className="d-flex align-items-center text-muted small">
                          <MapPin size={14} className="me-1" />
                          <span>{guide.location}</span>
                        </div>
                        <div className="d-flex align-items-center">
                          <Star size={14} className="text-warning me-1" fill="currentColor" />
                          <span className="fw-semibold">{guide.rating}</span>
                          <span className="text-muted ms-1">({guide.reviewCount})</span>
                        </div>
                      </div>
                    </div>

                    <Card.Text className="text-muted mb-3 flex-grow-1">
                      {guide.bio}
                    </Card.Text>

                    <div className="mb-3">
                      <div className="small text-muted mb-2">
                        <Languages size={14} className="me-1" />
                        Languages:
                      </div>
                      <div className="d-flex flex-wrap gap-1 mb-2">
                        {guide.languages.map((language, index) => (
                          <Badge key={index} bg="light" text="dark">
                            {language}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="small text-muted mb-2">Specialties:</div>
                      <div className="d-flex flex-wrap gap-1">
                        {guide.specialties.map((specialty, index) => (
                          <Badge key={index} bg="primary" bg-opacity="25" text="primary">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mt-auto">
                      <div className="d-flex align-items-center">
                        <DollarSign size={16} className="text-success" />
                        <span className="fw-semibold">${guide.pricePerHour}/hour</span>
                      </div>
                      <Button 
                        variant={guide.isAvailable ? "primary" : "outline-secondary"} 
                        size="sm"
                        disabled={!guide.isAvailable}
                      >
                        {guide.isAvailable ? 'Book Now' : 'Unavailable'}
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {filteredGuides.length === 0 && (
            <Row>
              <Col className="text-center py-5">
                <h4 className="text-muted">No tour guides found</h4>
                <p className="text-muted">Try adjusting your search or filter criteria</p>
              </Col>
            </Row>
          )}
        </Container>
      </section>
    </div>
  );
};

export default TourGuidesPage;
