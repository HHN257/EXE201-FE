import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Spinner, Alert, Button } from 'react-bootstrap';
import CurrencyConverter from '../components/CurrencyConverter';
import { currencyService } from '../services/api';
import type { CurrencyRate } from '../services/api';

const CurrencyPage: React.FC = () => {
  const [rates, setRates] = useState<CurrencyRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    loadRates();
  }, []);

  const loadRates = async (realTime = false) => {
    setLoading(true);
    setError(null);
    
    try {
      const ratesData = await currencyService.getRates(realTime, 'USD');
      setRates(ratesData);
      setLastUpdated(new Date());
    } catch (err) {
      let errorMessage = 'Failed to load currency rates';
      if (err && typeof err === 'object' && 'response' in err) {
        const response = (err as { response?: { data?: { message?: string } } }).response;
        if (response?.data?.message) {
          errorMessage = response.data.message;
        }
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatRate = (rate: number) => {
    return rate.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    });
  };

  return (
    <Container className="py-5">
      <Row>
        <Col lg={8} className="mx-auto">
          <div className="text-center mb-5">
            <h1 className="display-4 fw-bold text-primary mb-3">Currency Exchange</h1>
            <p className="lead text-muted">
              Convert currencies and view exchange rates for your travels in Vietnam
            </p>
          </div>

          {/* Currency Converter */}
          <CurrencyConverter />

          {/* Exchange Rates Table */}
          <Card className="mt-5 shadow-sm">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h4 className="mb-0">Current Exchange Rates</h4>
              <div>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => loadRates(false)}
                  disabled={loading}
                  className="me-2"
                >
                  Refresh Cached
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => loadRates(true)}
                  disabled={loading}
                >
                  Get Real-time
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              
              {loading ? (
                <div className="text-center py-4">
                  <Spinner animation="border" />
                  <p className="mt-2 text-muted">Loading exchange rates...</p>
                </div>
              ) : (
                <>
                  {lastUpdated && (
                    <p className="text-muted mb-3">
                      Last updated: {lastUpdated.toLocaleString()}
                    </p>
                  )}
                  
                  <div className="table-responsive">
                    <Table striped hover>
                      <thead className="table-dark">
                        <tr>
                          <th>From</th>
                          <th>To</th>
                          <th>Rate</th>
                          <th>Last Updated</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rates.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="text-center text-muted py-4">
                              No exchange rates available
                            </td>
                          </tr>
                        ) : (
                          rates.map((rate, index) => (
                            <tr key={index}>
                              <td>
                                <strong>{rate.fromCurrency}</strong>
                              </td>
                              <td>
                                <strong>{rate.toCurrency}</strong>
                              </td>
                              <td className="fw-semibold">
                                {formatRate(rate.rate)}
                              </td>
                              <td className="text-muted">
                                {new Date(rate.lastUpdated).toLocaleString()}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </Table>
                  </div>
                </>
              )}
            </Card.Body>
          </Card>

          {/* Information Card */}
          <Card className="mt-4 border-0 bg-light">
            <Card.Body>
              <Row>
                <Col md={6}>
                  <h5 className="fw-bold mb-3">💡 Currency Tips for Vietnam</h5>
                  <ul className="list-unstyled">
                    <li className="mb-2">• Vietnamese Dong (VND) is the official currency</li>
                    <li className="mb-2">• USD is widely accepted in tourist areas</li>
                    <li className="mb-2">• ATMs are available in major cities</li>
                    <li className="mb-2">• Credit cards accepted in hotels and restaurants</li>
                  </ul>
                </Col>
                <Col md={6}>
                  <h5 className="fw-bold mb-3">📊 Rate Information</h5>
                  <ul className="list-unstyled">
                    <li className="mb-2">• Cached rates update every hour</li>
                    <li className="mb-2">• Real-time rates are more accurate</li>
                    <li className="mb-2">• Rates may vary at local exchanges</li>
                    <li className="mb-2">• Check with your bank for fees</li>
                  </ul>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CurrencyPage;
