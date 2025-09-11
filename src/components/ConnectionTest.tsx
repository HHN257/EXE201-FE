import { useState } from 'react';
import { Card, Button, Alert, Badge } from 'react-bootstrap';
import { apiService } from '../services/api';

const ConnectionTest = () => {
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const testConnection = async () => {
    setStatus('testing');
    setMessage('');

    try {
      // Test if the backend is reachable by making a simple request
      // Since we don't have a health endpoint, we'll test the auth endpoint with invalid data
      // This should return a 400 Bad Request, confirming the connection works
      await apiService.login({ email: '', password: '' });
    } catch (error: unknown) {
      // Check if we got a proper HTTP response (even if it's an error)
      const axiosError = error as { response?: { status: number }; request?: unknown };
      if (axiosError.response) {
        setStatus('success');
        setMessage(`Backend connected! Server responded with status ${axiosError.response.status}`);
      } else if (axiosError.request) {
        setStatus('error');
        setMessage('Cannot connect to backend. Make sure the server is running on https://localhost:7225');
      } else {
        setStatus('error');
        setMessage('Network error occurred');
      }
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'testing':
        return <Badge bg="warning">Testing...</Badge>;
      case 'success':
        return <Badge bg="success">Connected</Badge>;
      case 'error':
        return <Badge bg="danger">Error</Badge>;
      default:
        return <Badge bg="secondary">Not tested</Badge>;
    }
  };

  return (
    <Card className="mb-4">
      <Card.Header>
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Backend Connection Test</h5>
          {getStatusBadge()}
        </div>
      </Card.Header>
      <Card.Body>
        <p className="mb-3">
          Test the connection to the SmartTravel backend API running on https://localhost:7225
        </p>
        
        <Button 
          onClick={testConnection} 
          disabled={status === 'testing'}
          variant="primary"
          className="mb-3"
        >
          {status === 'testing' ? 'Testing Connection...' : 'Test Connection'}
        </Button>

        {message && (
          <Alert variant={status === 'success' ? 'success' : 'danger'}>
            {message}
          </Alert>
        )}

        <div className="mt-3">
          <h6>Backend Requirements:</h6>
          <ul className="list-unstyled">
            <li>✓ .NET backend should be running</li>
            <li>✓ API available at https://localhost:7225</li>
            <li>✓ CORS configured for localhost:5173</li>
            <li>✓ JWT authentication enabled</li>
          </ul>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ConnectionTest;
