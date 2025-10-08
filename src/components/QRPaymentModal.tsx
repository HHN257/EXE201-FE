import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { QrCode, ExternalLink, Copy, CheckCircle, CreditCard, AlertCircle } from 'lucide-react';
import QRCodeGenerator from 'qrcode';
import { createPaymentChecker } from '../services/paymentChecker';
import type { PaymentResult, Plan } from '../types';

interface QRPaymentModalProps {
  show: boolean;
  onHide: () => void;
  paymentResult: PaymentResult | null;
  selectedPlan: Plan | null;
}

const QRPaymentModal: React.FC<QRPaymentModalProps> = ({
  show,
  onHide,
  paymentResult,
  selectedPlan
}) => {
  const [copied, setCopied] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null);
  const paymentChecker = useRef(createPaymentChecker(
    () => {
      setCheckingPayment(false);
      setPaymentSuccess(true);
      // Auto-close after 3 seconds and redirect to home page
      setTimeout(() => {
        onHide();
        window.location.href = '/';
      }, 3000);
    },
    (error: string) => {
      setCheckingPayment(false);
      setErrorMessage(error);
    }
  ));

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  useEffect(() => {
    const checker = paymentChecker.current;
    return () => {
      // Clean up payment checker when component unmounts
      if (checker) {
        checker.stopChecking();
      }
    };
  }, []);

  useEffect(() => {
    // Reset states when modal is closed
    if (!show) {
      setCheckingPayment(false);
      setPaymentSuccess(false);
      setErrorMessage(null);
      setQrCodeImage(null);
      const checker = paymentChecker.current;
      if (checker) {
        checker.stopChecking();
      }
    }
  }, [show]);

  // Generate QR code image from the data string
  useEffect(() => {
    const generateQRCode = async () => {
      if (paymentResult?.qrCode) {
        try {
          // Generate QR code image from the data string
          const qrImageUrl = await QRCodeGenerator.toDataURL(paymentResult.qrCode, {
            width: 250,
            margin: 1,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            }
          });
          setQrCodeImage(qrImageUrl);
        } catch (error) {
          console.error('Error generating QR code:', error);
          setQrCodeImage(null);
        }
      } else {
        setQrCodeImage(null);
      }
    };

    generateQRCode();
  }, [paymentResult?.qrCode]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const openPaymentLink = () => {
    if (paymentResult?.checkoutUrl) {
      window.open(paymentResult.checkoutUrl, '_blank');
    }
  };

  const handlePaymentCheck = () => {
    if (checkingPayment || paymentSuccess) return;
    
    setCheckingPayment(true);
    setErrorMessage(null);
    
    if (paymentChecker.current) {
      paymentChecker.current.startChecking();
    }
  };

  // Add debugging to check what's in paymentResult
  console.log('Payment Result:', paymentResult);
  console.log('QR Code Data:', paymentResult?.qrCode);
  console.log('QR Code Image:', qrCodeImage);

  return (
    <Modal show={show} onHide={onHide} size="lg" centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center">
          <CreditCard size={24} className="me-2 text-primary" />
          Complete Your Payment
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {selectedPlan && paymentResult && (
          <div>
            {/* Plan Summary */}
            <Alert variant="info" className="mb-4">
              <Row>
                <Col sm={6}>
                  <strong>Plan:</strong> {selectedPlan.name}
                </Col>
                <Col sm={6}>
                  <strong>Amount:</strong> {formatPrice(selectedPlan.price)}
                </Col>
                {paymentResult.orderCode && (
                  <>
                    <Col sm={6} className="mt-2">
                      <strong>Order Code:</strong> {paymentResult.orderCode}
                    </Col>
                    <Col sm={6} className="mt-2">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => copyToClipboard(paymentResult.orderCode?.toString() || '')}
                        className="d-flex align-items-center"
                      >
                        {copied ? (
                          <>
                            <CheckCircle size={16} className="me-1" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy size={16} className="me-1" />
                            Copy
                          </>
                        )}
                      </Button>
                    </Col>
                  </>
                )}
              </Row>
            </Alert>

            <Row className="g-4">
              {/* QR Code Section */}
              <Col md={6}>
                <div className="text-center">
                  <h5 className="mb-3">Scan QR Code</h5>
                  <div className="qr-code-container mb-3">
                    {qrCodeImage ? (
                      <img 
                        src={qrCodeImage} 
                        alt="Payment QR Code" 
                        className="img-fluid"
                        style={{ 
                          maxWidth: '250px', 
                          height: 'auto',
                          border: '1px solid #ddd',
                          borderRadius: '8px',
                          padding: '10px',
                          backgroundColor: 'white'
                        }}
                      />
                    ) : paymentResult?.qrCode ? (
                      // Show loading while generating QR code
                      <div 
                        className="d-flex flex-column align-items-center justify-content-center bg-light border rounded"
                        style={{ 
                          width: '250px', 
                          height: '250px', 
                          margin: '0 auto'
                        }}
                      >
                        <Spinner animation="border" size="sm" className="mb-2" />
                        <span className="text-muted">Generating QR Code...</span>
                      </div>
                    ) : (
                      // Fallback UI when no QR code data
                      <div 
                        className="d-flex flex-column align-items-center justify-content-center bg-light border rounded"
                        style={{ 
                          width: '250px', 
                          height: '250px', 
                          margin: '0 auto'
                        }}
                      >
                        <QrCode size={48} className="text-muted mb-2" />
                        <span className="text-muted">QR Code not available</span>
                        <small className="text-muted mt-1 text-center">Use payment link below</small>
                      </div>
                    )}
                  </div>
                  <p className="text-muted small">
                    Scan this QR code with your banking app to complete payment
                  </p>
                </div>
              </Col>

              {/* Payment Instructions */}
              <Col md={qrCodeImage || paymentResult?.qrCode ? 6 : 12}>
                <h5 className="mb-3">Payment Instructions</h5>
                <div className="list-group list-group-flush">
                  <div className="list-group-item border-0 px-0">
                    <span className="badge bg-primary rounded-pill me-2">1</span>
                    Open your banking app or e-wallet
                  </div>
                  <div className="list-group-item border-0 px-0">
                    <span className="badge bg-primary rounded-pill me-2">2</span>
                    {qrCodeImage || paymentResult?.qrCode ? 
                      'Scan the QR code above' : 
                      'Use the payment link below'
                    }
                  </div>
                  <div className="list-group-item border-0 px-0">
                    <span className="badge bg-primary rounded-pill me-2">3</span>
                    Complete the payment process
                  </div>
                  <div className="list-group-item border-0 px-0">
                    <span className="badge bg-primary rounded-pill me-2">4</span>
                    Wait for confirmation (usually instant)
                  </div>
                </div>

                {/* Alternative Payment Link */}
                {paymentResult.checkoutUrl && (
                  <div className="mt-4">
                    <Button
                      variant="outline-primary"
                      onClick={openPaymentLink}
                      className="w-100 d-flex align-items-center justify-content-center"
                    >
                      <ExternalLink size={16} className="me-2" />
                      Open Payment Page
                    </Button>
                    <p className="text-muted mt-2 small text-center">
                      Alternative: Click to open payment page in new window
                    </p>
                  </div>
                )}

                {/* Payment Status Check */}
                <div className="mt-4">
                  <Button
                    variant="success"
                    onClick={handlePaymentCheck}
                    disabled={checkingPayment}
                    className="w-100 d-flex align-items-center justify-content-center"
                  >
                    {checkingPayment ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Checking Payment Status...
                      </>
                    ) : (
                      'I\'ve Completed Payment'
                    )}
                  </Button>
                </div>
              </Col>
            </Row>

            {/* Payment Status Messages */}
            {paymentSuccess && (
              <Alert variant="success" className="mt-4">
                <CheckCircle size={20} className="me-2" />
                <strong>Payment Successful!</strong> Redirecting to dashboard...
              </Alert>
            )}

            {errorMessage && (
              <Alert variant="danger" className="mt-4">
                <AlertCircle size={20} className="me-2" />
                <strong>Error:</strong> {errorMessage}
              </Alert>
            )}

            {!paymentSuccess && !errorMessage && (
              <Alert variant="warning" className="mt-4 mb-0">
                <strong>Important:</strong> Please do not close this window until payment is completed. 
                You will be automatically redirected once payment is confirmed.
              </Alert>
            )}
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        {paymentSuccess ? (
          <Button variant="success" disabled className="w-100">
            <CheckCircle size={16} className="me-2" />
            Payment Confirmed - Redirecting...
          </Button>
        ) : (
          <>
            <Button 
              variant="secondary" 
              onClick={onHide}
              disabled={checkingPayment}
            >
              {checkingPayment ? 'Checking Payment...' : 'Cancel Payment'}
            </Button>
            {errorMessage && (
              <Button 
                variant="primary" 
                onClick={handlePaymentCheck}
                disabled={checkingPayment}
              >
                Try Again
              </Button>
            )}
          </>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default QRPaymentModal;