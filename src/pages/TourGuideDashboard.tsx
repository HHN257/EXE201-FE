import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserCheck, Calendar } from 'lucide-react';

const TourGuideDashboard: React.FC = () => {
  const { user } = useAuth();

  const dashboardItems = [
    {
      title: 'My Profile',
      description: 'Manage your tour guide profile',
      icon: <UserCheck size={24} />,
      link: '/guide/profile',
      color: 'primary'
    },
    {
      title: 'Verification',
      description: 'Manage verification status',
      icon: <UserCheck size={24} />,
      link: '/guide/verification',
      color: 'warning'
    },
    {
      title: 'My Bookings',
      description: 'View and manage tour bookings',
      icon: <Calendar size={24} />,
      link: '/guide-bookings',
      color: 'success'
    }
  ];

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex align-items-center mb-3">
            <UserCheck size={32} className="me-3 text-success" />
            <div>
              <h2 className="mb-0">Welcome back, {user?.name}!</h2>
              <p className="text-muted mb-0">Tour Guide Dashboard</p>
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
                    Manage
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

export default TourGuideDashboard;
