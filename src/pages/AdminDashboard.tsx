import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Crown, Users, Shield, TrendingUp } from 'lucide-react';

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
      title: 'Tour Guide Management',
      description: 'Manage tour guides and verifications',
      icon: <Shield size={24} />,
      link: '/admin/tour-guides',
      color: 'success'
    },
    {
      title: 'System Analytics',
      description: 'Comprehensive system analytics',
      icon: <TrendingUp size={24} />,
      link: '/admin/analytics',
      color: 'warning'
    }
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
    </Container>
  );
};

export default AdminDashboard;
