import React from 'react';
import { Container, Row, Col, Card, Button, Tab, Tabs } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserCheck, Calendar, Star, DollarSign, TrendingUp, Bell } from 'lucide-react';

const TourGuideDashboard: React.FC = () => {
  const { user } = useAuth();

  const dashboardItems = [
    {
      title: 'My Profile',
      description: 'Manage your tour guide profile',
      icon: <UserCheck size={24} />,
      link: '/profile',
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
    },
    {
      title: 'Reviews',
      description: 'View customer reviews and ratings',
      icon: <Star size={24} />,
      link: '/guide-reviews',
      color: 'warning'
    },
    {
      title: 'Earnings',
      description: 'Track your earnings and payments',
      icon: <DollarSign size={24} />,
      link: '/earnings',
      color: 'info'
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

      <Row>
        <Col lg={8}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-light">
              <h5 className="mb-0">
                <TrendingUp size={20} className="me-2" />
                Performance Overview
              </h5>
            </Card.Header>
            <Card.Body>
              <Tabs defaultActiveKey="bookings" className="mb-3">
                <Tab eventKey="bookings" title="Bookings">
                  <div className="text-center py-4">
                    <p className="text-muted">No bookings data available yet.</p>
                    <Link to="/guide-bookings">
                      <Button variant="primary">View All Bookings</Button>
                    </Link>
                  </div>
                </Tab>
                <Tab eventKey="earnings" title="Earnings">
                  <div className="text-center py-4">
                    <p className="text-muted">No earnings data available yet.</p>
                    <Link to="/earnings">
                      <Button variant="success">View Earnings</Button>
                    </Link>
                  </div>
                </Tab>
                <Tab eventKey="reviews" title="Reviews">
                  <div className="text-center py-4">
                    <p className="text-muted">No reviews available yet.</p>
                    <Link to="/guide-reviews">
                      <Button variant="warning">View Reviews</Button>
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
              <h5 className="mb-0">Quick Stats</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between mb-2">
                <span>Total Tours:</span>
                <span className="fw-bold text-primary">0</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Average Rating:</span>
                <span className="fw-bold text-warning">0.0</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Total Earnings:</span>
                <span className="fw-bold text-success">$0</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>Active Since:</span>
                <span className="fw-bold">
                  {user?.createdAt ? new Date(user.createdAt).getFullYear() : 'N/A'}
                </span>
              </div>
            </Card.Body>
          </Card>

          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-light">
              <h5 className="mb-0">
                <Bell size={20} className="me-2" />
                Notifications
              </h5>
            </Card.Header>
            <Card.Body>
              <p className="text-muted small">No new notifications.</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default TourGuideDashboard;
