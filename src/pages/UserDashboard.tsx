import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SubscriptionCard from '../components/SubscriptionCard';
import { User, Calendar } from 'lucide-react';

const UserDashboard: React.FC = () => {
  const { user } = useAuth();

  const dashboardItems = [
    {
      title: 'Become a Tour Guide',
      description: 'Apply to join our tour guide community',
      icon: <User size={24} />,
      link: '/user/tour-guide-application',
      color: 'warning'
    },
    {
      title: 'My Bookings',
      description: 'View and manage your tour bookings',
      icon: <Calendar size={24} />,
      link: '/bookings',
      color: 'primary'
    }
  ];

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex align-items-center mb-3">
            <User size={32} className="me-3 text-primary" />
            <div>
              <h2 className="mb-0">Welcome back, {user?.name}!</h2>
              <p className="text-muted mb-0">User Dashboard</p>
            </div>
          </div>
        </Col>
      </Row>

      <Row className="g-4">
        {dashboardItems.map((item, index) => (
          <Col md={6} lg={4} key={index}>
            <Card className="h-100 shadow-sm border-0 hover-card">
              <Card.Body className="d-flex flex-column">
                <div className={`text-${item.color} mb-3`}>
                  {item.icon}
                </div>
                <Card.Title className="h5">{item.title}</Card.Title>
                <Card.Text className="text-muted flex-grow-1">
                  {item.description}
                </Card.Text>
                <Link to={item.link} className="mt-auto">
                  <Button variant={item.color} size="sm" className="w-100">
                    Go to {item.title}
                  </Button>
                </Link>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Row className="mt-5">
        <Col>
          <SubscriptionCard />
        </Col>
      </Row>
    </Container>
  );
};

export default UserDashboard;
