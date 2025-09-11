import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Alert, Spinner, Row, Col, Badge } from 'react-bootstrap';
import { currencyService } from '../services/api';
import type { CurrencyRate } from '../services/api';

interface ConversionHistory {
  id: string;
  from: string;
  to: string;
  amount: number;
  result: number;
  timestamp: Date;
  realTime: boolean;
}

const CurrencyConverter: React.FC = () => {
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('VND');
  const [amount, setAmount] = useState<number>(1);
  const [result, setResult] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [useRealTime, setUseRealTime] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rates, setRates] = useState<CurrencyRate[]>([]);
  const [history, setHistory] = useState<ConversionHistory[]>([]);

  // Popular currencies
  const popularCurrencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'VND', name: 'Vietnamese Dong', symbol: '₫' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
    { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
    { code: 'THB', name: 'Thai Baht', symbol: '฿' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  ];

  // Load currency rates on component mount
  useEffect(() => {
    loadRates();
  }, []);

  const loadRates = async () => {
    try {
      const ratesData = await currencyService.getRates(false, 'USD');
      setRates(ratesData);
    } catch (err) {
      console.error('Error loading rates:', err);
    }
  };

  const handleConvert = async () => {
    if (!amount || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const conversionResult = await currencyService.convert(
        fromCurrency,
        toCurrency,
        amount,
        useRealTime
      );
      
      setResult(conversionResult);

      // Add to history
      const historyItem: ConversionHistory = {
        id: Date.now().toString(),
        from: fromCurrency,
        to: toCurrency,
        amount,
        result: conversionResult,
        timestamp: new Date(),
        realTime: useRealTime,
      };
      
      setHistory(prev => [historyItem, ...prev.slice(0, 9)]); // Keep last 10 conversions
    } catch (err) {
      let errorMessage = 'Conversion failed. Please try again.';
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

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setResult(null);
  };

  const formatCurrency = (value: number, currencyCode: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: currencyCode === 'VND' ? 0 : 2,
      maximumFractionDigits: currencyCode === 'VND' ? 0 : 2,
    }).format(value);
  };

  const getCurrentRate = () => {
    const rate = rates.find(r => 
      (r.fromCurrency === fromCurrency && r.toCurrency === toCurrency) ||
      (r.fromCurrency === toCurrency && r.toCurrency === fromCurrency)
    );
    
    if (rate) {
      if (rate.fromCurrency === fromCurrency) {
        return rate.rate;
      } else {
        return 1 / rate.rate;
      }
    }
    return null;
  };

  const currentRate = getCurrentRate();

  return (
    <div className="currency-converter">
      <Card className="shadow-sm">
        <Card.Header className="bg-primary text-white">
          <h4 className="mb-0">
            💱 Currency Converter
          </h4>
          <small>Convert between different currencies with real-time rates</small>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Form>
            <Row className="mb-3">
              <Col md={5}>
                <Form.Group>
                  <Form.Label>From</Form.Label>
                  <Form.Select
                    value={fromCurrency}
                    onChange={(e) => setFromCurrency(e.target.value)}
                  >
                    {popularCurrencies.map(currency => (
                      <option key={currency.code} value={currency.code}>
                        {currency.code} - {currency.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col md={2} className="d-flex align-items-end">
                <Button
                  variant="outline-secondary"
                  onClick={swapCurrencies}
                  className="w-100 mb-3"
                  title="Swap currencies"
                >
                  ⇄
                </Button>
              </Col>
              
              <Col md={5}>
                <Form.Group>
                  <Form.Label>To</Form.Label>
                  <Form.Select
                    value={toCurrency}
                    onChange={(e) => setToCurrency(e.target.value)}
                  >
                    {popularCurrencies.map(currency => (
                      <option key={currency.code} value={currency.code}>
                        {currency.code} - {currency.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Amount</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    placeholder="Enter amount"
                  />
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Result</Form.Label>
                  <Form.Control
                    type="text"
                    value={result ? formatCurrency(result, toCurrency) : ''}
                    readOnly
                    placeholder="Conversion result"
                    className="bg-light"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col>
                <Form.Check
                  type="checkbox"
                  label="Use real-time rates (may be slower)"
                  checked={useRealTime}
                  onChange={(e) => setUseRealTime(e.target.checked)}
                />
              </Col>
            </Row>

            {currentRate && !useRealTime && (
              <div className="mb-3">
                <small className="text-muted">
                  Current rate: 1 {fromCurrency} = {currentRate.toFixed(6)} {toCurrency}
                </small>
              </div>
            )}

            <Button
              variant="primary"
              onClick={handleConvert}
              disabled={loading || !amount}
              className="w-100"
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Converting...
                </>
              ) : (
                'Convert'
              )}
            </Button>
          </Form>
        </Card.Body>
      </Card>

      {/* Conversion History */}
      {history.length > 0 && (
        <Card className="mt-4 shadow-sm">
          <Card.Header>
            <h5 className="mb-0">Recent Conversions</h5>
          </Card.Header>
          <Card.Body>
            <div className="conversion-history">
              {history.map((item) => (
                <div key={item.id} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                  <div>
                    <span className="fw-semibold">
                      {formatCurrency(item.amount, item.from)} → {formatCurrency(item.result, item.to)}
                    </span>
                    <br />
                    <small className="text-muted">
                      {item.timestamp.toLocaleString()}
                    </small>
                  </div>
                  <div>
                    {item.realTime && <Badge bg="success" className="ms-2">Real-time</Badge>}
                  </div>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default CurrencyConverter;
