import React from 'react';
import { Container, Row, Col, Card, Button, Badge, Tab, Tabs } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Crown, Users, Shield, Database, Settings, TrendingUp, AlertCircle } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();

  const dashboardItems = [
    {
      title: 'User Management',
      description: 'Full user account administration',
      icon: <Users size={24} />,
      link: '/admin/users',
      color: 'primary'
    },
    {
      title: 'Staff Management',
      description: 'Manage staff accounts and permissions',
      icon: <Shield size={24} />,
      link: '/admin/staff',
      color: 'success'
    },
    {
      title: 'System Analytics',
      description: 'Comprehensive system analytics',
      icon: <TrendingUp size={24} />,
      link: '/admin/analytics',
      color: 'info'
    },
    {
      title: 'Database Management',
      description: 'Database administration tools',
      icon: <Database size={24} />,
      link: '/admin/database',
      color: 'warning'
    },
    {
      title: 'System Settings',
      description: 'Configure system-wide settings',
      icon: <Settings size={24} />,
      link: '/admin/settings',
      color: 'secondary'
    },
    {
      title: 'Security Center',
      description: 'Security monitoring and controls',
      icon: <AlertCircle size={24} />,
      link: '/admin/security',
      color: 'danger'
    }
  ];

  const systemStats = [
    { label: 'Total Users', value: '-', color: 'primary' },
    { label: 'Active Sessions', value: '-', color: 'success' },
    { label: 'System Uptime', value: '99.9%', color: 'info' },
    { label: 'Storage Used', value: '-', color: 'warning' }
  ];

  const recentAlerts = [
    { type: 'info', message: 'System backup completed successfully', time: '2 hours ago' },
    { type: 'warning', message: 'High CPU usage detected', time: '5 hours ago' }
  ];

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex align-items-center mb-3">
            <Crown size={32} className="me-3 text-danger" />
            <div>
              <h2 className="mb-0">Welcome back, {user?.name}!</h2>
              <p className="text-muted mb-0">Administrator Dashboard</p>
            </div>
          </div>
        </Col>
      </Row>

      {/* System Stats Cards */}
      <Row className="g-3 mb-5">
        {systemStats.map((stat, index) => (
          <Col md={6} lg={3} key={index}>
            <Card className={`border-0 shadow-sm text-${stat.color}`}>
              <Card.Body className="text-center">
                <h3 className="mb-1">{stat.value}</h3>
                <p className="text-muted mb-0 small">{stat.label}</p>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Management Tools */}
      <Row className="g-4 mb-5">
        {dashboardItems.map((item, index) => (
          <Col md={6} lg={4} key={index}>
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

      {/* Detailed Analytics */}
      <Row>
        <Col lg={8}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-light">
              <h5 className="mb-0">
                <TrendingUp size={20} className="me-2" />
                System Overview
              </h5>
            </Card.Header>
            <Card.Body>
              <Tabs defaultActiveKey="users" className="mb-3">
                <Tab eventKey="users" title="Users">
                  <div className="text-center py-4">
                    <p className="text-muted">User analytics will be displayed here.</p>
                    <Link to="/admin/users">
                      <Button variant="primary">Manage Users</Button>
                    </Link>
                  </div>
                </Tab>
                <Tab eventKey="performance" title="Performance">
                  <div className="text-center py-4">
                    <p className="text-muted">System performance metrics will be displayed here.</p>
                    <Link to="/admin/analytics">
                      <Button variant="info">View Analytics</Button>
                    </Link>
                  </div>
                </Tab>
                <Tab eventKey="security" title="Security">
                  <div className="text-center py-4">
                    <p className="text-muted">Security logs and alerts will be displayed here.</p>
                    <Link to="/admin/security">
                      <Button variant="danger">Security Center</Button>
                    </Link>
                  </div>
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4}>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-light">
              <h5 className="mb-0">
                <AlertCircle size={20} className="me-2" />
                Recent Alerts
              </h5>
            </Card.Header>
            <Card.Body>
              {recentAlerts.length > 0 ? (
                recentAlerts.map((alert, index) => (
                  <div key={index} className="border-bottom pb-2 mb-2 last:border-0 last:pb-0 last:mb-0">
                    <div className="d-flex align-items-start">
                      <Badge bg={alert.type === 'warning' ? 'warning' : 'info'} className="me-2 mt-1">
                        {alert.type}
                      </Badge>
                      <div className="flex-grow-1">
                        <p className="mb-1 small">{alert.message}</p>
                        <p className="text-muted mb-0 small">{alert.time}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted small">No recent alerts.</p>
              )}
            </Card.Body>
          </Card>

          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-light">
              <h5 className="mb-0">Quick Actions</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <Button variant="outline-danger" size="sm">
                  Emergency Shutdown
                </Button>
                <Button variant="outline-warning" size="sm">
                  Maintenance Mode
                </Button>
                <Button variant="outline-primary" size="sm">
                  Broadcast Message
                </Button>
                <Button variant="outline-success" size="sm">
                  Create Backup
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;
