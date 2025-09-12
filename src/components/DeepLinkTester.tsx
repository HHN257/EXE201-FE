import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Alert, Form } from 'react-bootstrap';
import { isMobile, handleDeepLink } from '../utils/deepLinkUtils';

const DeepLinkTester: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [customDeepLink, setCustomDeepLink] = useState('');
  const [customFallback, setCustomFallback] = useState('');

  const addTestResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testBasicDeepLinks = () => {
    addTestResult('Testing basic deep links...');
    addTestResult(`Device detected as: ${isMobile() ? 'Mobile' : 'Desktop'}`);
    addTestResult(`User Agent: ${navigator.userAgent}`);
    
    // Test Grab
    try {
      handleDeepLink('grab://open', 'https://grab.com');
      addTestResult('✅ Grab deep link executed');
    } catch (error) {
      addTestResult(`❌ Grab deep link failed: ${error}`);
    }
  };

  const testCustomDeepLink = () => {
    if (!customDeepLink || !customFallback) {
      addTestResult('❌ Please enter both deep link and fallback URL');
      return;
    }

    try {
      handleDeepLink(customDeepLink, customFallback);
      addTestResult(`✅ Custom deep link executed: ${customDeepLink}`);
    } catch (error) {
      addTestResult(`❌ Custom deep link failed: ${error}`);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const testAllServices = () => {
    addTestResult('Testing all service deep links...');
    
    const tests = [
      // Original services
      { name: 'Grab', deepLink: 'grab://open', fallback: 'https://grab.com' },
      { name: 'Booking.com', deepLink: 'booking://open', fallback: 'https://booking.com' },
      { name: 'Traveloka', deepLink: 'traveloka://open', fallback: 'https://traveloka.com' },
      
      // New Vietnamese services
      { name: 'Klook', deepLink: 'klook://open', fallback: 'https://klook.com' },
      { name: 'BusMap', deepLink: 'busmap://open', fallback: 'https://busmap.vn' },
      { name: 'Be', deepLink: 'be://open', fallback: 'https://be.com.vn' },
      { name: 'XanhSM', deepLink: 'xanhsm://open', fallback: 'https://xanhsm.com' },
      { name: 'FutaBus', deepLink: 'futabus://open', fallback: 'https://futabus.vn' },
      { name: 'GrabFood', deepLink: 'grab://food', fallback: 'https://food.grab.com' },
      { name: 'ShopeeFood', deepLink: 'shopeefood://open', fallback: 'https://shopeefood.vn' },
      { name: 'BeFood', deepLink: 'be://food', fallback: 'https://be.com.vn/befood' },
      { name: 'CGV', deepLink: 'cgv://open', fallback: 'https://cgv.vn' },
      { name: 'Lotte Cinema', deepLink: 'lottecinema://open', fallback: 'https://lottecinemavn.com' }
    ];

    tests.forEach((test, index) => {
      setTimeout(() => {
        try {
          handleDeepLink(test.deepLink, test.fallback);
          addTestResult(`✅ ${test.name} deep link executed`);
        } catch (error) {
          addTestResult(`❌ ${test.name} failed: ${error}`);
        }
      }, index * 500); // Reduced delay for more services
    });
  };

  return (
    <Container className="py-5">
      <Row>
        <Col lg={8} className="mx-auto">
          <Card>
            <Card.Header>
              <h3 className="mb-0">Deep Link Tester</h3>
            </Card.Header>
            <Card.Body>
              <Alert variant="info">
                <strong>Device Info:</strong><br/>
                Type: {isMobile() ? 'Mobile' : 'Desktop'}<br/>
                User Agent: {navigator.userAgent.substring(0, 100)}...
              </Alert>

              <div className="mb-4">
                <h5>Automated Tests</h5>
                <div className="d-flex gap-2 flex-wrap">
                  <Button variant="primary" onClick={testBasicDeepLinks}>
                    Test Basic Deep Links
                  </Button>
                  <Button variant="success" onClick={testAllServices}>
                    Test All Services
                  </Button>
                  <Button variant="secondary" onClick={clearResults}>
                    Clear Results
                  </Button>
                </div>
              </div>

              <div className="mb-4">
                <h5>Custom Deep Link Test</h5>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Label>Deep Link URL</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="e.g., grab://booking?pickup=A&destination=B"
                      value={customDeepLink}
                      onChange={(e) => setCustomDeepLink(e.target.value)}
                    />
                  </Col>
                  <Col md={6}>
                    <Form.Label>Fallback URL</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="e.g., https://grab.com"
                      value={customFallback}
                      onChange={(e) => setCustomFallback(e.target.value)}
                    />
                  </Col>
                  <Col xs={12}>
                    <Button variant="warning" onClick={testCustomDeepLink}>
                      Test Custom Deep Link
                    </Button>
                  </Col>
                </Row>
              </div>

              <div className="mb-4">
                <h5>Quick Tests - Transportation</h5>
                <div className="d-flex gap-2 flex-wrap mb-3">
                  <Button 
                    size="sm" 
                    variant="outline-primary"
                    onClick={() => {
                      handleDeepLink('grab://booking?pickup=Current Location&destination=Airport', 'https://grab.com');
                      addTestResult('Testing Grab ride booking');
                    }}
                  >
                    Grab Ride
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline-primary"
                    onClick={() => {
                      handleDeepLink('be://book?pickup=Current Location&destination=Airport', 'https://be.com.vn');
                      addTestResult('Testing Be ride booking');
                    }}
                  >
                    Be Ride
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline-primary"
                    onClick={() => {
                      handleDeepLink('busmap://route?from=District 1&to=Airport', 'https://busmap.vn');
                      addTestResult('Testing BusMap route planning');
                    }}
                  >
                    BusMap Route
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline-primary"
                    onClick={() => {
                      handleDeepLink('xanhsm://book?pickup=Current Location&destination=Nearby', 'https://xanhsm.com');
                      addTestResult('Testing XanhSM booking');
                    }}
                  >
                    XanhSM
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline-primary"
                    onClick={() => {
                      handleDeepLink('futabus://book?from=Ho Chi Minh City&to=Da Lat&date=2024-01-01', 'https://futabus.vn');
                      addTestResult('Testing FutaBus booking');
                    }}
                  >
                    FutaBus
                  </Button>
                </div>
                
                <h5>Quick Tests - Accommodation</h5>
                <div className="d-flex gap-2 flex-wrap mb-3">
                  <Button 
                    size="sm" 
                    variant="outline-success"
                    onClick={() => {
                      handleDeepLink('booking://hotels?city=Ho Chi Minh City&checkin=2024-01-01&checkout=2024-01-02', 'https://booking.com');
                      addTestResult('Testing Booking.com hotels');
                    }}
                  >
                    Booking Hotels
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline-success"
                    onClick={() => {
                      handleDeepLink('traveloka://hotel?city=Ho Chi Minh City&checkin=2024-01-01&checkout=2024-01-02', 'https://traveloka.com');
                      addTestResult('Testing Traveloka hotels');
                    }}
                  >
                    Traveloka Hotels
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline-success"
                    onClick={() => {
                      handleDeepLink('klook://activities?city=Ho Chi Minh City', 'https://klook.com');
                      addTestResult('Testing Klook activities');
                    }}
                  >
                    Klook Activities
                  </Button>
                </div>

                <h5>Quick Tests - Food & Entertainment</h5>
                <div className="d-flex gap-2 flex-wrap mb-3">
                  <Button 
                    size="sm" 
                    variant="outline-info"
                    onClick={() => {
                      handleDeepLink('grab://food', 'https://food.grab.com');
                      addTestResult('Testing GrabFood');
                    }}
                  >
                    GrabFood
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline-info"
                    onClick={() => {
                      handleDeepLink('shopeefood://restaurants', 'https://shopeefood.vn');
                      addTestResult('Testing ShopeeFood');
                    }}
                  >
                    ShopeeFood
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline-info"
                    onClick={() => {
                      handleDeepLink('be://food', 'https://be.com.vn/befood');
                      addTestResult('Testing BeFood');
                    }}
                  >
                    BeFood
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline-warning"
                    onClick={() => {
                      handleDeepLink('cgv://movies', 'https://cgv.vn');
                      addTestResult('Testing CGV movies');
                    }}
                  >
                    CGV Movies
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline-warning"
                    onClick={() => {
                      handleDeepLink('lottecinema://movies', 'https://lottecinemavn.com');
                      addTestResult('Testing Lotte Cinema');
                    }}
                  >
                    Lotte Cinema
                  </Button>
                </div>
              </div>

              <div>
                <h5>Test Results</h5>
                <div 
                  style={{ 
                    maxHeight: '300px', 
                    overflowY: 'auto', 
                    backgroundColor: '#f8f9fa', 
                    padding: '1rem',
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                    fontSize: '0.875rem'
                  }}
                >
                  {testResults.length === 0 ? (
                    <p className="text-muted mb-0">No test results yet. Run some tests above!</p>
                  ) : (
                    testResults.map((result, index) => (
                      <div key={index} className="mb-1">
                        {result}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default DeepLinkTester;