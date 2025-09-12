import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, InputGroup, Nav, Tab } from 'react-bootstrap';
import { Search, MapPin, Star, Users, ExternalLink, Smartphone } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { externalServices, handleDeepLink, isMobile } from '../utils/deepLinkUtils';
import './ServicesPage.css';

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

const EnhancedServicesPage: React.FC = () => {
  const { t } = useTranslation(['services', 'common', 'navigation']);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [activeTab, setActiveTab] = useState('local');

  // Mock data for local services
  const categories = [
    t('services:categories.allServices'),
    t('services:categories.transportation'),
    t('services:categories.accommodation'),
    t('services:categories.foodDining'),
    t('services:categories.activities'),
    t('services:categories.shopping')
  ];

  const localServices: Service[] = [
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
    }
  ];

  const filteredServices = localServices.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || selectedCategory === t('services:categories.allServices') || 
                           service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleExternalServiceClick = (serviceDeepLinks: Record<string, (...args: any[]) => string>) => {
    const deepLinkUrl = serviceDeepLinks.app();
    const fallbackUrl = serviceDeepLinks.webFallback();
    
    handleDeepLink(deepLinkUrl, fallbackUrl);
  };

  const renderLocalServices = () => (
    <>
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
                  placeholder={t('services:searchLocalPlaceholder')}
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

      {/* Local Services Grid */}
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
                          {t('services:actions.viewDetails')}
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
                <h4 className="text-muted">{t('services:descriptions.noResults')}</h4>
                <p className="text-muted">{t('services:descriptions.noResultsDescription')}</p>
              </Col>
            </Row>
          )}
        </Container>
      </section>
    </>
  );

  const renderExternalServices = () => {
    // Group services by category
    const servicesByCategory = externalServices.reduce((acc, service) => {
      if (!acc[service.category]) {
        acc[service.category] = [];
      }
      acc[service.category].push(service);
      return acc;
    }, {} as Record<string, typeof externalServices>);

    return (
      <section className="py-5">
        <Container>
          <Row className="mb-4">
            <Col>
              <h3 className="mb-3">{t('services:descriptions.popularApps')}</h3>
              <p className="text-muted">
                {isMobile() 
                  ? t('services:descriptions.mobileDescription')
                  : t('services:descriptions.desktopDescription')
                }
              </p>
            </Col>
          </Row>
          
          {Object.entries(servicesByCategory).map(([category, services]) => (
            <div key={category} className="mb-5">
              <h4 className="mb-3 text-primary">{category}</h4>
              <Row className="g-4">
                {services.map((service, index) => (
                  <Col key={index} md={6} lg={4}>
                    <Card className="h-100 border-0 shadow-sm hover-card external-service-card">
                      <Card.Body className="text-center p-4">
                        <div className="mb-3">
                          <img 
                            src={service.logo} 
                            alt={service.name}
                            className="service-logo"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                        <Card.Title className="h5 fw-semibold mb-2">{service.name}</Card.Title>
                        <Card.Text className="text-muted mb-3">{service.description}</Card.Text>
                        <span className="badge bg-secondary mb-3">{service.category}</span>
                        
                        <div className="d-grid gap-2">
                          <Button 
                            variant="primary"
                            onClick={() => handleExternalServiceClick(service.deepLinks)}
                            className="d-flex align-items-center justify-content-center gap-2"
                          >
                            {isMobile() ? (
                              <>
                                <Smartphone size={16} />
                                {t('services:actions.openApp')}
                              </>
                            ) : (
                              <>
                                <ExternalLink size={16} />
                                {t('services:actions.visitWebsite')}
                              </>
                            )}
                          </Button>
                          
                          {/* Quick action buttons based on service */}
                          {service.name === 'Grab' && (
                            <div className="d-flex gap-2">
                              <Button 
                                variant="outline-primary" 
                                size="sm"
                                onClick={() => handleDeepLink(
                                  service.deepLinks.ride('Current Location', 'Airport'),
                                  'https://grab.com'
                                )}
                              >
                                Book Ride
                              </Button>
                              <Button 
                                variant="outline-primary" 
                                size="sm"
                                onClick={() => handleDeepLink(
                                  service.deepLinks.food(),
                                  'https://grab.com'
                                )}
                              >
                                Order Food
                              </Button>
                            </div>
                          )}
                          
                          {service.name === 'Booking.com' && (
                            <Button 
                              variant="outline-primary" 
                              size="sm"
                              onClick={() => handleDeepLink(
                                service.deepLinks.hotels('Ho Chi Minh City', '2024-01-01', '2024-01-02'),
                                'https://www.booking.com'
                              )}
                            >
                              Find Hotels
                            </Button>
                          )}
                          
                          {service.name === 'Traveloka' && (
                            <div className="d-flex gap-2">
                              <Button 
                                variant="outline-primary" 
                                size="sm"
                                onClick={() => handleDeepLink(
                                  service.deepLinks.flights('SGN', 'HAN', '2024-01-01'),
                                  'https://www.traveloka.com'
                                )}
                              >
                                Book Flight
                              </Button>
                              <Button 
                                variant="outline-primary" 
                                size="sm"
                                onClick={() => handleDeepLink(
                                  service.deepLinks.hotels('Ho Chi Minh City', '2024-01-01', '2024-01-02'),
                                  'https://www.traveloka.com'
                                )}
                              >
                                Book Hotel
                              </Button>
                            </div>
                          )}

                          {service.name === 'Klook' && (
                            <Button 
                              variant="outline-primary" 
                              size="sm"
                              onClick={() => handleDeepLink(
                                service.deepLinks.activities('Ho Chi Minh City'),
                                'https://www.klook.com'
                              )}
                            >
                              Find Activities
                            </Button>
                          )}

                          {service.name === 'BusMap' && (
                            <Button 
                              variant="outline-primary" 
                              size="sm"
                              onClick={() => handleDeepLink(
                                service.deepLinks.route('District 1', 'Airport'),
                                'https://busmap.vn'
                              )}
                            >
                              Plan Route
                            </Button>
                          )}

                          {service.name === 'Be' && (
                            <Button 
                              variant="outline-primary" 
                              size="sm"
                              onClick={() => handleDeepLink(
                                service.deepLinks.ride('Current Location', 'Airport'),
                                'https://be.com.vn'
                              )}
                            >
                              Book Ride
                            </Button>
                          )}

                          {service.name === 'XanhSM' && (
                            <Button 
                              variant="outline-primary" 
                              size="sm"
                              onClick={() => handleDeepLink(
                                service.deepLinks.ride('Current Location', 'Nearby'),
                                'https://xanhsm.com'
                              )}
                            >
                              Book XanhSM
                            </Button>
                          )}

                          {service.name === 'Futa Bus Lines' && (
                            <Button 
                              variant="outline-primary" 
                              size="sm"
                              onClick={() => handleDeepLink(
                                service.deepLinks.booking('Ho Chi Minh City', 'Da Lat', '2024-01-01'),
                                'https://futabus.vn'
                              )}
                            >
                              Book Bus
                            </Button>
                          )}

                          {(service.name === 'GrabFood' || service.name === 'ShopeeFood' || service.name === 'BeFood') && (
                            <Button 
                              variant="outline-primary" 
                              size="sm"
                              onClick={() => handleDeepLink(
                                service.deepLinks.restaurant(),
                                service.deepLinks.webFallback()
                              )}
                            >
                              Order Food
                            </Button>
                          )}

                          {(service.name === 'CGV Cinemas' || service.name === 'Lotte Cinema') && (
                            <div className="d-flex gap-2">
                              <Button 
                                variant="outline-primary" 
                                size="sm"
                                onClick={() => handleDeepLink(
                                  service.deepLinks.movies(),
                                  service.deepLinks.webFallback()
                                )}
                              >
                                Show Movies
                              </Button>
                              <Button 
                                variant="outline-primary" 
                                size="sm"
                                onClick={() => handleDeepLink(
                                  service.deepLinks.booking(),
                                  service.deepLinks.webFallback()
                                )}
                              >
                                Book Tickets
                              </Button>
                            </div>
                          )}
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          ))}
        </Container>
      </section>
    );
  };

  return (
    <div className="min-vh-100">
      {/* Hero Section */}
      <section className="bg-primary text-white py-5">
        <Container>
          <Row className="text-center">
            <Col lg={8} className="mx-auto">
              <h1 className="display-4 fw-bold mb-4">{t('services:title')}</h1>
              <p className="lead mb-0">
                {t('services:subtitle')}
              </p>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Navigation Tabs */}
      <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'local')}>
        <section className="bg-light border-bottom">
          <Container>
            <Nav variant="tabs" className="border-0">
              <Nav.Item>
                <Nav.Link eventKey="local" className="text-dark fw-semibold">
                  {t('navigation:localServices')}
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="external" className="text-dark fw-semibold">
                  {t('navigation:travelApps')}
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Container>
        </section>

        <Tab.Content>
          <Tab.Pane eventKey="local">
            {renderLocalServices()}
          </Tab.Pane>
          <Tab.Pane eventKey="external">
            {renderExternalServices()}
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </div>
  );
};

export default EnhancedServicesPage;