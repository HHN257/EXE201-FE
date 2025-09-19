import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Spinner, Badge, Table, Tab, Tabs } from 'react-bootstrap';
import { BarChart3, Users, UserCheck, Calendar, DollarSign, TrendingUp, TrendingDown, Activity, Star, MapPin } from 'lucide-react';
import { config } from '../config';

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalTourGuides: number;
  verifiedTourGuides: number;
  totalBookings: number;
  totalRevenue: number;
  recentGrowth: {
    users: number;
    bookings: number;
    revenue: number;
  };
}

interface UserAnalytics {
  usersByRole: { role: string; count: number; percentage: number }[];
  usersByStatus: { status: string; count: number; percentage: number }[];
  userGrowthTrend: { month: string; newUsers: number; totalUsers: number }[];
  topCountries: { country: string; count: number }[];
}

interface BookingAnalytics {
  bookingsByStatus: { status: string; count: number; revenue: number }[];
  bookingsTrend: { month: string; bookings: number; revenue: number }[];
  topServices: { service: string; bookings: number; revenue: number }[];
  averageBookingValue: number;
}

interface TourGuideAnalytics {
  verificationStats: { status: string; count: number }[];
  topRatedGuides: { name: string; rating: number; totalReviews: number; totalBookings: number }[];
  guidesByLocation: { location: string; count: number }[];
  averageRating: number;
}

const AdminAnalytics: React.FC = () => {
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics | null>(null);
  const [bookingAnalytics, setBookingAnalytics] = useState<BookingAnalytics | null>(null);
  const [tourGuideAnalytics, setTourGuideAnalytics] = useState<TourGuideAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<{ type: 'success' | 'danger' | 'warning'; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        // Since we don't have dedicated analytics endpoints, we'll fetch from existing endpoints
        // and create analytics from that data
        const [usersResponse, bookingsResponse, tourGuidesResponse, verificationsResponse] = await Promise.all([
          fetch(`${config.API_BASE_URL}/admin/users`, {
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
          }),
          fetch(`${config.API_BASE_URL}/tourguidebookings`, {
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
          }),
          fetch(`${config.API_BASE_URL}/tourguides`, {
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
          }),
          fetch(`${config.API_BASE_URL}/tourguideVerification/admin/all`, {
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
          })
        ]);

        if (usersResponse.ok && bookingsResponse.ok && tourGuidesResponse.ok && verificationsResponse.ok) {
          const users = await usersResponse.json();
          const bookings = await bookingsResponse.json();
          const tourGuides = await tourGuidesResponse.json();
          const verifications = await verificationsResponse.json();

          // Process the data to create analytics
          processAnalyticsData(users, bookings, tourGuides, verifications);
        } else {
          setAlert({ type: 'danger', message: 'Failed to fetch analytics data' });
        }
      } catch (error) {
        setAlert({ type: 'danger', message: 'Error fetching analytics data' });
        console.error('Error fetching analytics data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const processAnalyticsData = (users: Array<any>, bookings: Array<any>, tourGuides: Array<any>, verifications: Array<any>) => {
    // System Stats
    const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.totalPrice || booking.amount || 0), 0);
    setSystemStats({
      totalUsers: users.length,
      activeUsers: users.filter(u => u.isActive).length,
      totalTourGuides: tourGuides.length,
      verifiedTourGuides: tourGuides.filter(tg => tg.isVerified).length,
      totalBookings: bookings.length,
      totalRevenue,
      recentGrowth: {
        users: 12, // Placeholder - would calculate from recent data
        bookings: 8,
        revenue: 15
      }
    });

    // User Analytics
    const usersByRole = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});

    const usersByStatus = {
      Active: users.filter(u => u.isActive).length,
      Inactive: users.filter(u => !u.isActive).length
    };

    const topCountries = users.reduce((acc, user) => {
      if (user.nationality) {
        acc[user.nationality] = (acc[user.nationality] || 0) + 1;
      }
      return acc;
    }, {});

    setUserAnalytics({
      usersByRole: Object.entries(usersByRole).map(([role, count]) => ({
        role,
        count: count as number,
        percentage: Math.round(((count as number) / users.length) * 100)
      })),
      usersByStatus: Object.entries(usersByStatus).map(([status, count]) => ({
        status,
        count: count as number,
        percentage: Math.round(((count as number) / users.length) * 100)
      })),
      userGrowthTrend: [], // Would implement with historical data
      topCountries: Object.entries(topCountries)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 5)
        .map(([country, count]) => ({ country, count: count as number }))
    });

    // Booking Analytics
    const bookingsByStatus = bookings.reduce((acc, booking) => {
      const status = booking.status;
      if (!acc[status]) {
        acc[status] = { count: 0, revenue: 0 };
      }
      acc[status].count++;
      acc[status].revenue += booking.totalPrice || booking.amount || 0;
      return acc;
    }, {});

    const averageBookingValue = bookings.length > 0 ? totalRevenue / bookings.length : 0;

    setBookingAnalytics({
      bookingsByStatus: Object.entries(bookingsByStatus).map(([status, data]) => ({
        status,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        count: (data as any).count,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        revenue: (data as any).revenue
      })),
      bookingsTrend: [], // Would implement with historical data
      topServices: [], // Would need service data
      averageBookingValue
    });

    // Tour Guide Analytics
    const verificationStats = verifications.reduce((acc, verification) => {
      acc[verification.status] = (acc[verification.status] || 0) + 1;
      return acc;
    }, {});

    const topRatedGuides = tourGuides
      .filter(guide => guide.rating && guide.rating > 0)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 10)
      .map(guide => ({
        name: guide.name,
        rating: guide.rating || 0,
        totalReviews: guide.totalReviews || 0,
        totalBookings: bookings.filter(b => b.tourGuideId === guide.id).length
      }));

    const averageRating = tourGuides.length > 0 
      ? tourGuides.reduce((sum, guide) => sum + (guide.rating || 0), 0) / tourGuides.filter(g => g.rating).length
      : 0;

    setTourGuideAnalytics({
      verificationStats: Object.entries(verificationStats).map(([status, count]) => ({
        status,
        count: count as number
      })),
      topRatedGuides,
      guidesByLocation: [], // Would need location data
      averageRating
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? <TrendingUp size={16} className="text-success" /> : <TrendingDown size={16} className="text-danger" />;
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed': case 'approved': case 'active': return 'success';
      case 'pending': case 'underreview': return 'warning';
      case 'cancelled': case 'rejected': case 'inactive': return 'danger';
      case 'completed': return 'info';
      default: return 'secondary';
    }
  };

  const renderOverview = () => (
    <>
      {/* Main Statistics Cards */}
      <Row className="g-4 mb-5">
        <Col md={6} lg={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <Users size={32} className="text-primary mb-3" />
              <h3 className="mb-1">{systemStats?.totalUsers.toLocaleString()}</h3>
              <p className="text-muted mb-2">Total Users</p>
              <div className="d-flex align-items-center justify-content-center">
                {getGrowthIcon(systemStats?.recentGrowth.users || 0)}
                <span className="ms-1 small">{systemStats?.recentGrowth.users}% this month</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <UserCheck size={32} className="text-info mb-3" />
              <h3 className="mb-1">{systemStats?.totalTourGuides.toLocaleString()}</h3>
              <p className="text-muted mb-2">Tour Guides</p>
              <div className="small">
                <Badge bg="success" className="me-1">{systemStats?.verifiedTourGuides}</Badge>
                verified
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <Calendar size={32} className="text-warning mb-3" />
              <h3 className="mb-1">{systemStats?.totalBookings.toLocaleString()}</h3>
              <p className="text-muted mb-2">Total Bookings</p>
              <div className="d-flex align-items-center justify-content-center">
                {getGrowthIcon(systemStats?.recentGrowth.bookings || 0)}
                <span className="ms-1 small">{systemStats?.recentGrowth.bookings}% this month</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <DollarSign size={32} className="text-success mb-3" />
              <h3 className="mb-1">{formatCurrency(systemStats?.totalRevenue || 0)}</h3>
              <p className="text-muted mb-2">Total Revenue</p>
              <div className="d-flex align-items-center justify-content-center">
                {getGrowthIcon(systemStats?.recentGrowth.revenue || 0)}
                <span className="ms-1 small">{systemStats?.recentGrowth.revenue}% this month</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Stats Grid */}
      <Row className="g-4">
        <Col md={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-light">
              <h5 className="mb-0">
                <Activity size={20} className="me-2" />
                System Health
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span>Active Users</span>
                <div>
                  <Badge bg="success">{systemStats?.activeUsers}</Badge>
                  <span className="text-muted ms-2">
                    / {systemStats?.totalUsers}
                  </span>
                </div>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span>Verified Tour Guides</span>
                <div>
                  <Badge bg="info">{systemStats?.verifiedTourGuides}</Badge>
                  <span className="text-muted ms-2">
                    / {systemStats?.totalTourGuides}
                  </span>
                </div>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span>Average Booking Value</span>
                <Badge bg="primary">
                  {formatCurrency(bookingAnalytics?.averageBookingValue || 0)}
                </Badge>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-light">
              <h5 className="mb-0">
                <Star size={20} className="me-2" />
                Quality Metrics
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span>Average Guide Rating</span>
                <div className="d-flex align-items-center">
                  <Star size={16} className="text-warning me-1" />
                  <Badge bg="warning">{tourGuideAnalytics?.averageRating.toFixed(1)}</Badge>
                </div>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span>Verification Rate</span>
                <Badge bg="success">
                  {systemStats && systemStats.totalTourGuides > 0 
                    ? Math.round((systemStats.verifiedTourGuides / systemStats.totalTourGuides) * 100)
                    : 0}%
                </Badge>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span>User Retention</span>
                <Badge bg="info">
                  {systemStats && systemStats.totalUsers > 0 
                    ? Math.round((systemStats.activeUsers / systemStats.totalUsers) * 100)
                    : 0}%
                </Badge>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );

  const renderUserAnalytics = () => (
    <Row className="g-4">
      <Col md={6}>
        <Card className="border-0 shadow-sm">
          <Card.Header className="bg-light">
            <h5 className="mb-0">Users by Role</h5>
          </Card.Header>
          <Card.Body>
            {userAnalytics?.usersByRole.map((item) => (
              <div key={item.role} className="d-flex justify-content-between align-items-center mb-2">
                <span>{item.role}</span>
                <div>
                  <Badge bg="primary" className="me-2">{item.count}</Badge>
                  <span className="text-muted small">{item.percentage}%</span>
                </div>
              </div>
            ))}
          </Card.Body>
        </Card>
      </Col>
      <Col md={6}>
        <Card className="border-0 shadow-sm">
          <Card.Header className="bg-light">
            <h5 className="mb-0">Top Countries</h5>
          </Card.Header>
          <Card.Body>
            {userAnalytics?.topCountries.map((item) => (
              <div key={item.country} className="d-flex justify-content-between align-items-center mb-2">
                <div className="d-flex align-items-center">
                  <MapPin size={16} className="me-2 text-muted" />
                  <span>{item.country}</span>
                </div>
                <Badge bg="info">{item.count}</Badge>
              </div>
            ))}
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );

  const renderBookingAnalytics = () => (
    <Row className="g-4">
      <Col md={8}>
        <Card className="border-0 shadow-sm">
          <Card.Header className="bg-light">
            <h5 className="mb-0">Bookings by Status</h5>
          </Card.Header>
          <Card.Body>
            <Table responsive>
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Count</th>
                  <th>Revenue</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                {bookingAnalytics?.bookingsByStatus.map((item) => (
                  <tr key={item.status}>
                    <td>
                      <Badge bg={getStatusBadgeVariant(item.status)}>
                        {item.status}
                      </Badge>
                    </td>
                    <td>{item.count}</td>
                    <td>{formatCurrency(item.revenue)}</td>
                    <td>
                      {Math.round((item.count / (systemStats?.totalBookings || 1)) * 100)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </Col>
      <Col md={4}>
        <Card className="border-0 shadow-sm">
          <Card.Header className="bg-light">
            <h5 className="mb-0">Revenue Metrics</h5>
          </Card.Header>
          <Card.Body>
            <div className="text-center mb-3">
              <h4 className="text-primary">{formatCurrency(systemStats?.totalRevenue || 0)}</h4>
              <p className="text-muted mb-0">Total Revenue</p>
            </div>
            <div className="text-center mb-3">
              <h4 className="text-success">{formatCurrency(bookingAnalytics?.averageBookingValue || 0)}</h4>
              <p className="text-muted mb-0">Average Booking Value</p>
            </div>
            <div className="text-center">
              <h4 className="text-info">{systemStats?.totalBookings}</h4>
              <p className="text-muted mb-0">Total Bookings</p>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );

  const renderTourGuideAnalytics = () => (
    <Row className="g-4">
      <Col md={6}>
        <Card className="border-0 shadow-sm">
          <Card.Header className="bg-light">
            <h5 className="mb-0">Verification Status</h5>
          </Card.Header>
          <Card.Body>
            {tourGuideAnalytics?.verificationStats.map((item) => (
              <div key={item.status} className="d-flex justify-content-between align-items-center mb-2">
                <span>{item.status}</span>
                <Badge bg={getStatusBadgeVariant(item.status)}>{item.count}</Badge>
              </div>
            ))}
          </Card.Body>
        </Card>
      </Col>
      <Col md={6}>
        <Card className="border-0 shadow-sm">
          <Card.Header className="bg-light">
            <h5 className="mb-0">Top Rated Tour Guides</h5>
          </Card.Header>
          <Card.Body style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {tourGuideAnalytics?.topRatedGuides.map((guide, index) => (
              <div key={guide.name} className="d-flex justify-content-between align-items-center mb-2 p-2 bg-light rounded">
                <div>
                  <strong>#{index + 1} {guide.name}</strong><br />
                  <small className="text-muted">{guide.totalBookings} bookings • {guide.totalReviews} reviews</small>
                </div>
                <div className="d-flex align-items-center">
                  <Star size={16} className="text-warning me-1" />
                  <Badge bg="warning">{guide.rating.toFixed(1)}</Badge>
                </div>
              </div>
            ))}
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );

  if (loading) {
    return (
      <Container fluid className="py-4">
        <div className="text-center py-5">
          <Spinner animation="border" />
          <p className="mt-2 text-muted">Loading analytics data...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {alert && (
        <Alert 
          variant={alert.type} 
          onClose={() => setAlert(null)} 
          dismissible
          className="mb-4"
        >
          {alert.message}
        </Alert>
      )}

      <Row className="mb-4">
        <Col>
          <div className="d-flex align-items-center mb-3">
            <BarChart3 size={32} className="me-3 text-primary" />
            <div>
              <h2 className="mb-0">Analytics Dashboard</h2>
              <p className="text-muted mb-0">Comprehensive system analytics and insights</p>
            </div>
          </div>
        </Col>
      </Row>

      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'overview')} className="mb-4">
        <Tab eventKey="overview" title="Overview">
          {renderOverview()}
        </Tab>
        <Tab eventKey="users" title="Users">
          {renderUserAnalytics()}
        </Tab>
        <Tab eventKey="bookings" title="Bookings">
          {renderBookingAnalytics()}
        </Tab>
        <Tab eventKey="tourguides" title="Tour Guides">
          {renderTourGuideAnalytics()}
        </Tab>
      </Tabs>
    </Container>
  );
};

export default AdminAnalytics;