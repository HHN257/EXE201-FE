import React from 'react';
import { Container, Row, Col, Card, Button, Table, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Users, FileText, AlertTriangle, Settings, BarChart3 } from 'lucide-react';

const StaffDashboard: React.FC = () => {
  const { user } = useAuth();

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
    },
    {
      title: 'Reports',
      description: 'View system reports and analytics',
      icon: <BarChart3 size={24} />,
      link: '/staff/reports',
      color: 'success'
    }
  ];

  const pendingTasks = [
    { type: 'Verification', count: 0, priority: 'high' },
    { type: 'User Reports', count: 0, priority: 'medium' },
    { type: 'Content Reviews', count: 0, priority: 'low' }
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

      <Row className="g-4 mb-5">
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
              <h5 className="mb-0">
                <AlertTriangle size={20} className="me-2" />
                Pending Tasks
              </h5>
            </Card.Header>
            <Card.Body>
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
                        <Button variant="outline-primary" size="sm" disabled={task.count === 0}>
                          Review
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              {pendingTasks.every(task => task.count === 0) && (
                <div className="text-center py-3 text-muted">
                  <p>No pending tasks at the moment.</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4}>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-light">
              <h5 className="mb-0">System Stats</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between mb-2">
                <span>Total Users:</span>
                <span className="fw-bold text-primary">-</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Active Tour Guides:</span>
                <span className="fw-bold text-success">-</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Pending Verifications:</span>
                <span className="fw-bold text-warning">0</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>Total Bookings:</span>
                <span className="fw-bold text-info">-</span>
              </div>
            </Card.Body>
          </Card>

          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-light">
              <h5 className="mb-0">
                <Settings size={20} className="me-2" />
                Quick Actions
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <Button variant="outline-primary" size="sm">
                  System Settings
                </Button>
                <Button variant="outline-secondary" size="sm">
                  Backup Data
                </Button>
                <Button variant="outline-info" size="sm">
                  Generate Report
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default StaffDashboard;
