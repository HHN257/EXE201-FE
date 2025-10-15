import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, InputGroup, Spinner, Alert } from 'react-bootstrap';
import { Search, Users } from 'lucide-react';
import TourGuideCard from '../components/TourGuideCard';
import BookingModal from '../components/BookingModal';
import { tourGuideService } from '../services/api';
import type { TourGuideDto } from '../services/api';

const TourGuidesPage: React.FC = () => {
  const [tourGuides, setTourGuides] = useState<TourGuideDto[]>([]);
  const [filteredGuides, setFilteredGuides] = useState<TourGuideDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTourGuide, setSelectedTourGuide] = useState<TourGuideDto | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [filters, setFilters] = useState({
    minRating: 0,
    maxRate: '',
    language: '',
    specialization: '',
    verifiedOnly: false
  });

  useEffect(() => {
    loadTourGuides();
  }, []);

  useEffect(() => {
    let filtered = [...tourGuides];

    // Text search
    if (searchTerm) {
      filtered = filtered.filter(guide =>
        guide.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guide.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guide.specializations?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guide.languages?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Rating filter
    if (filters.minRating > 0) {
      filtered = filtered.filter(guide => 
        guide.rating && guide.rating >= filters.minRating
      );
    }

    // Rate filter
    if (filters.maxRate) {
      const maxRate = parseFloat(filters.maxRate);
      filtered = filtered.filter(guide => 
        !guide.hourlyRate || guide.hourlyRate <= maxRate
      );
    }

    // Language filter
    if (filters.language) {
      filtered = filtered.filter(guide =>
        guide.languages?.toLowerCase().includes(filters.language.toLowerCase())
      );
    }

    // Specialization filter
    if (filters.specialization) {
      filtered = filtered.filter(guide =>
        guide.specializations?.toLowerCase().includes(filters.specialization.toLowerCase())
      );
    }

    // Verified only
    if (filters.verifiedOnly) {
      filtered = filtered.filter(guide => guide.isVerified);
    }

    setFilteredGuides(filtered);
  }, [tourGuides, searchTerm, filters]);

  const loadTourGuides = async () => {
    try {
      setLoading(true);
      const guides = await tourGuideService.getAll();
      setTourGuides(guides);
    } catch {
      setError('Failed to load tour guides. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBookTourGuide = (tourGuide: TourGuideDto) => {
    setSelectedTourGuide(tourGuide);
    setShowBookingModal(true);
  };

  const handleBookingSuccess = () => {
    // You might want to show a success message or redirect
    console.log('Booking successful!');
  };

  const clearFilters = () => {
    setFilters({
      minRating: 0,
      maxRate: '',
      language: '',
      specialization: '',
      verifiedOnly: false
    });
    setSearchTerm('');
  };

  const getUniqueLanguages = () => {
    const languages = new Set<string>();
    tourGuides.forEach(guide => {
      if (guide.languages) {
        guide.languages.split(',').forEach(lang => 
          languages.add(lang.trim())
        );
      }
    });
    return Array.from(languages);
  };

  const getUniqueSpecializations = () => {
    const specializations = new Set<string>();
    tourGuides.forEach(guide => {
      if (guide.specializations) {
        guide.specializations.split(',').forEach(spec => 
          specializations.add(spec.trim())
        );
      }
    });
    return Array.from(specializations);
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
        <p className="mt-2 text-muted">Loading tour guides...</p>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold text-primary mb-3">Tour Guides</h1>
        <p className="lead text-muted">
          Discover experienced local guides to make your Vietnam journey unforgettable
        </p>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Top 3 Tour Guides Section */}
      {tourGuides.length > 0 && (
        <div className="mb-5">
          <div className="text-center mb-4">
            <h2 className="h3 fw-bold text-primary mb-2">🌟 Top Rated Tour Guides</h2>
            <p className="text-muted">Meet our highest-rated and most experienced guides</p>
          </div>
          <Row className="g-4 justify-content-center">
            {tourGuides
              .filter(guide => guide.rating && guide.rating > 0)
              .sort((a, b) => (b.rating || 0) - (a.rating || 0))
              .slice(0, 3)
              .map((guide, index) => (
                <Col key={guide.id} lg={4} md={6}>
                  <Card className="h-100 border-0 shadow-lg position-relative">
                    {/* Top Rank Badge */}
                    <div className="position-absolute top-0 start-0 z-3 m-3">
                      <span className={`badge ${index === 0 ? 'bg-warning' : index === 1 ? 'bg-secondary' : 'bg-dark'} text-dark fw-bold px-3 py-2 rounded-pill`}>
                        #{index + 1} {index === 0 ? '👑' : index === 1 ? '🥈' : '🥉'}
                      </span>
                    </div>
                    <TourGuideCard 
                      tourGuide={guide} 
                      onBook={handleBookTourGuide}
                    />
                  </Card>
                </Col>
              ))
            }
          </Row>
          <hr className="my-5" />
        </div>
      )}

      {/* Search and Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text>
                  <Search size={16} />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search by name, specialization, or language..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            
            <Col md={2}>
              <Form.Select
                value={filters.minRating}
                onChange={(e) => setFilters(prev => ({ ...prev, minRating: Number(e.target.value) }))}
              >
                <option value={0}>Any Rating</option>
                <option value={4}>4+ Stars</option>
                <option value={4.5}>4.5+ Stars</option>
                <option value={5}>5 Stars</option>
              </Form.Select>
            </Col>

            <Col md={2}>
              <Form.Control
                type="number"
                placeholder="Max $/hour"
                value={filters.maxRate}
                onChange={(e) => setFilters(prev => ({ ...prev, maxRate: e.target.value }))}
              />
            </Col>

            <Col md={2}>
              <Button
                variant="outline-secondary"
                onClick={clearFilters}
                className="w-100"
              >
                Clear Filters
              </Button>
            </Col>
          </Row>

          <Row className="g-3 mt-2">
            <Col md={3}>
              <Form.Select
                value={filters.language}
                onChange={(e) => setFilters(prev => ({ ...prev, language: e.target.value }))}
              >
                <option value="">Any Language</option>
                {getUniqueLanguages().map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </Form.Select>
            </Col>

            <Col md={3}>
              <Form.Select
                value={filters.specialization}
                onChange={(e) => setFilters(prev => ({ ...prev, specialization: e.target.value }))}
              >
                <option value="">Any Specialization</option>
                {getUniqueSpecializations().map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </Form.Select>
            </Col>

            <Col md={3}>
              <Form.Check
                type="checkbox"
                label="Verified guides only"
                checked={filters.verifiedOnly}
                onChange={(e) => setFilters(prev => ({ ...prev, verifiedOnly: e.target.checked }))}
              />
            </Col>

            <Col md={3}>
              <div className="text-muted small">
                {filteredGuides.length} of {tourGuides.length} guides
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tour Guides Grid */}
      {filteredGuides.length === 0 ? (
        <Card className="text-center py-5">
          <Card.Body>
            <Users size={48} className="text-muted mb-3" />
            <h5>No tour guides found</h5>
            <p className="text-muted">Try adjusting your search criteria or filters.</p>
            <Button variant="primary" onClick={clearFilters}>
              Clear All Filters
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Row className="g-4">
          {filteredGuides.map((guide) => (
            <Col key={guide.id} lg={4} md={6}>
              <TourGuideCard 
                tourGuide={guide} 
                onBook={handleBookTourGuide}
              />
            </Col>
          ))}
        </Row>
      )}

      {/* Booking Modal */}
      <BookingModal
        show={showBookingModal}
        onHide={() => setShowBookingModal(false)}
        tourGuide={selectedTourGuide}
        onBookingSuccess={handleBookingSuccess}
      />
    </Container>
  );
};

export default TourGuidesPage;
