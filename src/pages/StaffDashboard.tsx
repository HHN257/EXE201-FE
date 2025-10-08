import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { verificationService } from '../services/api';
import { Shield, Users, FileText, AlertTriangle, RefreshCw } from 'lucide-react';
import type { TourGuideVerificationRequest } from '../types';

const StaffDashboard: React.FC = () => {
  const { user } = useAuth();

  // Add CSS animation for spinning refresh icon
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  const [verificationRequests, setVerificationRequests] = useState<TourGuideVerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch pending verification requests
  useEffect(() => {
    const fetchVerificationRequests = async () => {
      try {
        setLoading(true);
        // Fetch requests with "Pending" status
        const requests = await verificationService.getAllRequests({ 
          status: 'Pending' 
        });
        setVerificationRequests(requests);
      } catch (err) {
        console.error('Error fetching verification requests:', err);
        setError('Failed to load verification requests');
        setVerificationRequests([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchVerificationRequests();
  }, []);

  const handleRefresh = async () => {
    try {
      setLoading(true);
      const requests = await verificationService.getAllRequests({ 
        status: 'Pending' 
      });
      setVerificationRequests(requests);
      setError(null);
    } catch (err) {
      console.error('Error refreshing verification requests:', err);
      setError('Failed to refresh verification requests');
    } finally {
      setLoading(false);
    }
  };

  const dashboardItems = [
    {
      title: 'User Management',
      description: 'Manage user accounts and permissions',
      icon: <Users size={24} />,
      link: '/staff/users',
      color: 'primary'
    },
    {
      title: 'Tour Guide Verification',
      description: 'Review and verify tour guide applications',
      icon: <Shield size={24} />,
      link: '/staff/verification',
      color: 'warning'
    },
    {
      title: 'Location Management',
      description: 'Manage destinations and places',
      icon: <FileText size={24} />,
      link: '/staff/locations',
      color: 'info'
    }
  ];

  const pendingTasks = [
    { 
      type: 'Tour Guide Verification', 
      count: verificationRequests.length, 
      priority: 'high' as const,
      link: '/staff/verification'
    }
  ];

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex align-items-center mb-3">
            <Shield size={32} className="me-3 text-warning" />
            <div>
              <h2 className="mb-0">Welcome back, {user?.name}!</h2>
              <p className="text-muted mb-0">Staff Dashboard</p>
            </div>
          </div>
        </Col>
      </Row>

      <Row className="g-3 mb-5">
        {dashboardItems.map((item, index) => (
          <Col md={6} lg={3} key={index}>
            <Card className="h-100 shadow-sm border-0 hover-card">
              <Card.Body className="d-flex flex-column">
                <div className={`text-${item.color} mb-3`}>
                  {item.icon}
                </div>
                <Card.Title className="h6">{item.title}</Card.Title>
                <Card.Text className="text-muted flex-grow-1 small">
                  {item.description}
                </Card.Text>
                <Link to={item.link} className="mt-auto">
                  <Button variant={item.color} size="sm" className="w-100">
                    Access
                  </Button>
                </Link>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Row>
        <Col lg={8}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-light">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <AlertTriangle size={20} className="me-2" />
                  Pending Tasks
                </h5>
                <Button 
                  variant="outline-secondary" 
                  size="sm"
                  onClick={handleRefresh}
                  disabled={loading}
                  title="Refresh pending tasks"
                >
                  <RefreshCw 
                    size={16} 
                    style={{
                      animation: loading ? 'spin 1s linear infinite' : 'none'
                    }}
                  />
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center py-4">
                  <Spinner animation="border" size="sm" className="me-2" />
                  <span>Loading pending tasks...</span>
                </div>
              ) : error ? (
                <div className="text-center py-3 text-danger">
                  <p>{error}</p>
                </div>
              ) : (
                <>
                  <Table responsive className="mb-0">
                    <thead>
                      <tr>
                        <th>Task Type</th>
                        <th>Count</th>
                        <th>Priority</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingTasks.map((task, index) => (
                        <tr key={index}>
                          <td>{task.type}</td>
                          <td>
                            <Badge bg={task.count > 0 ? 'danger' : 'secondary'}>
                              {task.count}
                            </Badge>
                          </td>
                          <td>
                            <Badge bg={
                              task.priority === 'high' ? 'danger' :
                              task.priority === 'medium' ? 'warning' : 'secondary'
                            }>
                              {task.priority}
                            </Badge>
                          </td>
                          <td>
                            {task.count > 0 ? (
                              <Link to={task.link}>
                                <Button variant="outline-primary" size="sm">
                                  Review ({task.count})
                                </Button>
                              </Link>
                            ) : (
                              <Button variant="outline-secondary" size="sm" disabled>
                                No Items
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                  {pendingTasks.every(task => task.count === 0) && !loading && (
                    <div className="text-center py-3 text-muted">
                      <p>No pending tasks at the moment.</p>
                    </div>
                  )}
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={4}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-light">
              <h5 className="mb-0">
                <Shield size={20} className="me-2" />
                Recent Verification Requests
              </h5>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center py-3">
                  <Spinner animation="border" size="sm" />
                </div>
              ) : verificationRequests.length > 0 ? (
                <div className="list-group list-group-flush">
                  {verificationRequests.slice(0, 5).map((request) => (
                    <div key={request.id} className="list-group-item border-0 px-0">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="mb-1">{request.fullName}</h6>
                          <p className="mb-1 small text-muted">
                            {request.applicantRole} Application
                          </p>
                          <small className="text-muted">
                            {new Date(request.createdAt).toLocaleDateString()}
                          </small>
                        </div>
                        <Badge bg="warning">Pending</Badge>
                      </div>
                    </div>
                  ))}
                  {verificationRequests.length > 5 && (
                    <div className="text-center pt-2">
                      <Link to="/staff/verification">
                        <Button variant="outline-primary" size="sm">
                          View All ({verificationRequests.length})
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-3 text-muted">
                  <Shield size={48} className="mb-2 text-muted" />
                  <p>No pending verification requests</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default StaffDashboard;
