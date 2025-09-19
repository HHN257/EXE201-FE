import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, InputGroup, Badge, Modal, Table } from 'react-bootstrap';
import { Search, MapPin, Star, ExternalLink, Smartphone, DollarSign } from 'lucide-react';
import { handleDeepLink, isMobile } from '../utils/deepLinkUtils';
import './ServicesPage.css';

// Import local images for apps
import beImage from '../assets/be.jpg';
import bookingImage from '../assets/Booking.png';
import busMapImage from '../assets/busmap.png';
import cgvImage from '../assets/cgv.jpg';
import grabImage from '../assets/Grab.png';
import grabFoodImage from '../assets/grabfood.png';
import klookImage from '../assets/klook.png';
import lotteImage from '../assets/lotte.jpg';
import shopeeFoodImage from '../assets/shopeefood.jpg';
import travelokaImage from '../assets/traveloka.webp';

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
  isApp?: boolean; // New field to distinguish app services
  deepLinks?: {
    app: () => string;
    webFallback: () => string;
  };
}

interface PricingInfo {
  appId: string;
  appName: string;
  pricingDetails: {
    service: string;
    price: string;
    description?: string;
  }[];
}

const pricingData: PricingInfo[] = [
  {
    appId: 'app1',
    appName: 'Grab App',
    pricingDetails: [
      { service: 'GrabBike (2-4km)', price: '$0.8 - $1.4', description: 'HCM/HN area' },
      { service: 'GrabCar 4 seats (2-4km)', price: '$1.6 - $2.8' },
      { service: 'GrabCar 7 seats (2-4km)', price: '$2.4 - $3.6' },
      { service: 'Long distance (10km)', price: '$4.8 - $7.2', description: 'GrabCar 4 seats' }
    ]
  },
  {
    appId: 'app2',
    appName: 'GrabFood App',
    pricingDetails: [
      { service: 'Local dishes (nearby)', price: '$1.6 - $2.8', description: 'Simple orders' },
      { service: 'Average meal', price: '$4 - $6', description: 'Mid-range restaurants' },
      { service: 'Western food (far distance)', price: '$8 - $12', description: 'Premium + delivery fees' }
    ]
  },
  {
    appId: 'app3',
    appName: 'Booking.com App',
    pricingDetails: [
      { service: '3-star hotel (Ho Chi Minh)', price: '$30 - $40', description: 'Per night' },
      { service: '3-star hotel (Da Nang)', price: '$28', description: 'Per night' },
      { service: '4-star hotel (Ho Chi Minh)', price: '$83', description: 'Per night' },
      { service: '4-star hotel (Da Nang)', price: '$54', description: 'Per night' }
    ]
  },
  {
    appId: 'app4',
    appName: 'Traveloka App',
    pricingDetails: [
      { service: 'Standard hotel (3-4 star)', price: '$30 - $60', description: 'Per night, city center' },
      { service: 'Premium hotel (good location)', price: '$80 - $150+', description: 'Per night, great views' },
      { service: 'Domestic flights', price: '$30 - $50', description: 'One way, varies by route & timing' }
    ]
  },
  {
    appId: 'app5',
    appName: 'Klook App',
    pricingDetails: [
      { service: 'City attractions entry', price: '$5 - $20', description: 'Standard tourist spots' },
      { service: 'Half-day tours', price: '$20 - $50', description: 'Cable car, outdoor activities' },
      { service: 'Full-day experiences', price: '$50 - $80+', description: 'Large tourist areas' },
      { service: 'Klook Pass (multiple activities)', price: '$30 - $100+', description: 'Varies by package & duration' }
    ]
  },
  {
    appId: 'app6',
    appName: 'CGV App',
    pricingDetails: [
      { service: 'Weekday standard', price: '$2.80', description: 'Regular showings' },
      { service: 'Average ticket', price: '$3.40', description: 'Standard pricing' },
      { service: 'Weekend/holidays', price: '$4.80', description: 'Peak times' }
    ]
  },
  {
    appId: 'app7',
    appName: 'BE App',
    pricingDetails: [
      { service: 'beCar 7 seats', price: '$1.30', description: 'Starting fee' },
      { service: 'beTaxi 4 seats', price: '$1.30', description: 'Starting fee' },
      { service: 'beDelivery minimum', price: '$0.60', description: 'Base delivery fee' }
    ]
  },
  {
    appId: 'app8',
    appName: 'ShopeeFood App',
    pricingDetails: [
      { service: 'Small order (simple food)', price: '$2.0 - $3.2', description: 'Including delivery fees' },
      { service: 'Average order', price: '$6.0 - $10.0', description: 'Main dish + sides + delivery' },
      { service: 'Large order (premium/far)', price: '$12.0 - $16.0', description: 'Multiple items or distant restaurants' }
    ]
  },
  {
    appId: 'app9',
    appName: 'Bus Map App',
    pricingDetails: [
      { service: 'City bus (subsidized)', price: '$0.20 - $0.40', description: 'Local routes by distance' },
      { service: 'Medium distance (5-7 hours)', price: '$8 - $15', description: 'Inter-city buses' },
      { service: 'Long distance (HN-HCM)', price: '$25 - $40+', description: 'Sleeper buses, premium quality' }
    ]
  },
  {
    appId: 'app10',
    appName: 'Lotte Cinema App',
    pricingDetails: [
      { service: '2D standard (weekdays)', price: '$2.6 - $4.0', description: 'Mon-Thu, adults' },
      { service: '2D weekend/holidays', price: '$2.8 - $4.8', description: 'Peak times' },
      { service: 'Student/U22 discount', price: '$1.8 - $3.2', description: 'Special rates' },
      { service: '3D standard (weekdays)', price: '$3.4 - $5.2', description: 'Mon-Thu, adults' },
      { service: '3D weekend/holidays', price: '$4.2 - $6.8', description: 'Peak times' }
    ]
  }
];

const EnhancedServicesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [selectedAppPricing, setSelectedAppPricing] = useState<PricingInfo | null>(null);

  const handleShowPricing = (appId: string) => {
    const pricingInfo = pricingData.find(p => p.appId === appId);
    if (pricingInfo) {
      setSelectedAppPricing(pricingInfo);
      setShowPricingModal(true);
    }
  };

  // Updated categories for app services only
  const categories = [
    'All Apps',
    'Transportation',
    'Food & Dining',
    'Travel & Booking',
    'Entertainment',
    'Utilities'
  ];

  const services: Service[] = [
    // App Services Only
    {
      id: '2',
      name: 'Grab Transportation',
      description: 'Convenient ride-hailing service for all your transportation needs',
      category: 'Transportation',
      location: 'Nationwide',
      priceRange: '$2-20',
      rating: 4.6,
      reviewCount: 5420,
      imageUrl: grabImage
    },
    {
      id: '3',
      name: 'GrabFood Delivery',
      description: 'Food delivery from your favorite restaurants',
      category: 'Food & Dining',
      location: 'Major Cities',
      priceRange: '$3-25',
      rating: 4.7,
      reviewCount: 3280,
      imageUrl: grabFoodImage
    },
    {
      id: '4',
      name: 'Booking.com Hotels',
      description: 'Find and book the perfect accommodation for your stay',
      category: 'Accommodation',
      location: 'Worldwide',
      priceRange: '$15-200',
      rating: 4.4,
      reviewCount: 8900,
      imageUrl: bookingImage
    },
    {
      id: '5',
      name: 'CGV Cinemas',
      description: 'Premium movie experience with latest blockbusters',
      category: 'Activities',
      location: 'Major Cities',
      priceRange: '$5-12',
      rating: 4.3,
      reviewCount: 890,
      imageUrl: cgvImage
    },
    {
      id: '6',
      name: 'Futa Bus Lines',
      description: 'Comfortable long-distance bus travel across Vietnam',
      category: 'Transportation',
      location: 'Nationwide',
      priceRange: '$8-25',
      rating: 4.2,
      reviewCount: 670,
      imageUrl: 'https://via.placeholder.com/300x200?text=Futa+Bus'
    },
    {
      id: '7',
      name: 'Klook Travel Activities',
      description: 'Book amazing travel experiences and activities',
      category: 'Entertainment',
      location: 'Asia Pacific',
      priceRange: '$10-100',
      rating: 4.6,
      reviewCount: 2340,
      imageUrl: klookImage
    },
    {
      id: '8',
      name: 'ShopeeFood Delivery',
      description: 'Fast food delivery with great deals and promotions',
      category: 'Food & Dining',
      location: 'Major Cities',
      priceRange: '$3-20',
      rating: 4.4,
      reviewCount: 2890,
      imageUrl: shopeeFoodImage
    },
    {
      id: '9',
      name: 'Traveloka Booking',
      description: 'Complete travel booking platform for flights and hotels',
      category: 'Transportation',
      location: 'Southeast Asia',
      priceRange: '$20-300',
      rating: 4.5,
      reviewCount: 4560,
      imageUrl: travelokaImage
    },
    {
      id: '10',
      name: 'Mai Linh Express',
      description: 'Reliable bus transportation with modern fleet',
      category: 'Transportation',
      location: 'Nationwide',
      priceRange: '$6-22',
      rating: 4.1,
      reviewCount: 450,
      imageUrl: 'https://via.placeholder.com/300x200?text=Mai+Linh'
    },
    {
      id: '11',
      name: 'Lotte Cinema',
      description: 'Premium cinema experience with international films',
      category: 'Activities',
      location: 'Major Cities',
      priceRange: '$7-15',
      rating: 4.4,
      reviewCount: 1240,
      imageUrl: 'https://via.placeholder.com/300x200?text=Lotte+Cinema'
    },
    // App Services
    {
      id: 'app1',
      name: 'Grab App',
      description: 'Ride-hailing, food delivery, and more',
      category: 'Transportation',
      location: 'Nationwide',
      priceRange: 'Free',
      rating: 4.5,
      reviewCount: 12000,
      imageUrl: grabImage,
      isApp: true,
      deepLinks: {
        app: () => 'grab://open',
        webFallback: () => 'https://grab.com',
      }
    },
    {
      id: 'app2',
      name: 'GrabFood App',
      description: 'Food delivery from your favorite restaurants',
      category: 'Food & Dining',
      location: 'Major Cities',
      priceRange: 'Free',
      rating: 4.7,
      reviewCount: 8500,
      imageUrl: grabFoodImage,
      isApp: true,
      deepLinks: {
        app: () => 'grab://food',
        webFallback: () => 'https://food.grab.com',
      }
    },
    {
      id: 'app3',
      name: 'Booking.com App',
      description: 'Hotel and accommodation booking worldwide',
      category: 'Travel & Booking',
      location: 'Worldwide',
      priceRange: 'Free',
      rating: 4.4,
      reviewCount: 15000,
      imageUrl: bookingImage,
      isApp: true,
      deepLinks: {
        app: () => 'booking://open',
        webFallback: () => 'https://www.booking.com',
      }
    },
    {
      id: 'app4',
      name: 'Traveloka App',
      description: 'Flights, hotels, and travel packages',
      category: 'Travel & Booking',
      location: 'Southeast Asia',
      priceRange: 'Free',
      rating: 4.5,
      reviewCount: 9200,
      imageUrl: travelokaImage,
      isApp: true,
      deepLinks: {
        app: () => 'traveloka://open',
        webFallback: () => 'https://www.traveloka.com',
      }
    },
    {
      id: 'app5',
      name: 'Klook App',
      description: 'Activities, tours, and attractions booking',
      category: 'Travel & Booking',
      location: 'Asia Pacific',
      priceRange: 'Free',
      rating: 4.6,
      reviewCount: 6800,
      imageUrl: klookImage,
      isApp: true,
      deepLinks: {
        app: () => 'klook://open',
        webFallback: () => 'https://www.klook.com',
      }
    },
    {
      id: 'app6',
      name: 'CGV App',
      description: 'Movie tickets and cinema booking',
      category: 'Entertainment',
      location: 'Major Cities',
      priceRange: 'Free',
      rating: 4.3,
      reviewCount: 3400,
      imageUrl: cgvImage,
      isApp: true,
      deepLinks: {
        app: () => 'cgv://open',
        webFallback: () => 'https://www.cgv.vn',
      }
    },
    {
      id: 'app7',
      name: 'BE App',
      description: 'Food delivery and logistics services',
      category: 'Transportation',
      location: 'Vietnam',
      priceRange: 'Free',
      rating: 4.2,
      reviewCount: 2100,
      imageUrl: beImage,
      isApp: true,
      deepLinks: {
        app: () => 'be://open',
        webFallback: () => 'https://be.com.vn',
      }
    },
    {
      id: 'app8',
      name: 'ShopeeFood App',
      description: 'Fast food delivery with great deals',
      category: 'Food & Dining',
      location: 'Major Cities',
      priceRange: 'Free',
      rating: 4.4,
      reviewCount: 5600,
      imageUrl: shopeeFoodImage,
      isApp: true,
      deepLinks: {
        app: () => 'shopeefood://open',
        webFallback: () => 'https://shopeefood.vn',
      }
    },
    {
      id: 'app9',
      name: 'Bus Map App',
      description: 'Public bus routes and schedules',
      category: 'Utilities',
      location: 'Vietnam',
      priceRange: 'Free',
      rating: 4.1,
      reviewCount: 890,
      imageUrl: busMapImage,
      isApp: true,
      deepLinks: {
        app: () => 'busmap://open',
        webFallback: () => 'https://busmap.vn',
      }
    },
    {
      id: 'app10',
      name: 'Lotte Cinema App',
      description: 'Premium cinema experience with international films',
      category: 'Entertainment',
      location: 'Major Cities',
      priceRange: 'Free',
      rating: 4.4,
      reviewCount: 1240,
      imageUrl: lotteImage,
      isApp: true,
      deepLinks: {
        app: () => 'lottecinema://open',
        webFallback: () => 'https://www.lottecinemavn.com/LCHS/index.aspx',
      }
    }
  ];

  const filteredServices = services.filter(service => {
    // Only show app services
    if (!service.isApp) return false;
    
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || selectedCategory === 'All Apps' || 
                           service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <Container className="py-5">
      {/* Header */}
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold mb-4">Travel Apps</h1>
        <p className="lead text-muted">
          Download and connect with popular travel and service apps in Vietnam
        </p>
      </div>

      {/* Search and Filter */}
      <Row className="mb-4">
        <Col md={8}>
          <InputGroup>
            <InputGroup.Text>
              <Search size={20} />
            </InputGroup.Text>
            <Form.Control
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for services..."
            />
          </InputGroup>
        </Col>
        <Col md={4}>
          <Form.Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Form.Select>
        </Col>
      </Row>

      {/* Unified Services Grid */}
      <Row className="g-4">
        {filteredServices.length > 0 ? (
          filteredServices.map((service) => (
            <Col key={service.id} md={6} lg={4}>
              <Card className="h-100 shadow-sm">
                <Card.Img variant="top" src={service.imageUrl} style={{ height: '200px', objectFit: 'cover' }} />
                <Card.Body className="d-flex flex-column">
                  <Card.Title className="h5 mb-2">{service.name}</Card.Title>
                  <Card.Text className="text-muted mb-3">{service.description}</Card.Text>
                  
                  <div className="mt-auto">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div className="d-flex align-items-center">
                        <Star size={16} className="text-warning me-1" fill="currentColor" />
                        <span className="fw-semibold">{service.rating}</span>
                        <span className="text-muted ms-1">({service.reviewCount})</span>
                      </div>
                      <Badge bg="secondary">{service.priceRange}</Badge>
                    </div>
                    
                    <div className="d-flex align-items-center text-muted mb-3">
                      <MapPin size={14} className="me-1" />
                      <small>{service.location}</small>
                    </div>
                    
                    <div className="d-grid gap-2">
                      <Button
                        variant="info"
                        size="sm"
                        onClick={() => handleShowPricing(service.id)}
                        className="d-flex align-items-center justify-content-center"
                      >
                        <DollarSign size={16} className="me-2" />
                        View Pricing
                      </Button>
                      {isMobile() ? (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleDeepLink(service.deepLinks!.app(), service.deepLinks!.webFallback())}
                          className="d-flex align-items-center justify-content-center"
                        >
                          <Smartphone size={16} className="me-2" />
                          Open App
                        </Button>
                      ) : (
                        <Button
                          variant="outline-primary"
                          size="sm"
                          href={service.deepLinks!.webFallback()}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="d-flex align-items-center justify-content-center"
                        >
                          <ExternalLink size={16} className="me-2" />
                          Visit Website
                        </Button>
                      )}
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : (
          <Col className="text-center py-5">
            <h4 className="text-muted">No apps found</h4>
            <p className="text-muted">Try adjusting your search or category filters.</p>
          </Col>
        )}
      </Row>

      {/* Pricing Modal */}
      <Modal show={showPricingModal} onHide={() => setShowPricingModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <DollarSign className="me-2" />
            {selectedAppPricing?.appName} - Pricing Information
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedAppPricing && (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Price Range</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {selectedAppPricing.pricingDetails.map((detail, index) => (
                  <tr key={index}>
                    <td className="fw-semibold">{detail.service}</td>
                    <td className="text-success fw-bold">{detail.price}</td>
                    <td className="text-muted">{detail.description || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
          <div className="text-muted small mt-3">
            <strong>Note:</strong> Prices are estimates and may vary based on location, time, demand, and other factors. 
            Please check the app for current pricing.
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPricingModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default EnhancedServicesPage;