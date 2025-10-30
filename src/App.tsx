import { Routes, Route } from 'react-router-dom';
import { Toast, ToastContainer } from 'react-bootstrap';
import { AlertCircle, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import PublicRoute from './components/PublicRoute';
import ProtectedRoute from './components/ProtectedRoute';
import RoleBasedRoute from './components/RoleBasedRoute';
import LoadingSpinner from './components/LoadingSpinner';
import DeepLinkTester from './components/DeepLinkTester';
import SimpleChatbotButton from './components/SimpleChatbotButton';
import { useAuth } from './contexts/AuthContext';
import type { NotificationType } from './contexts/AuthContext';
import HomePage from './pages/HomePage';
import EnhancedServicesPage from './pages/EnhancedServicesPage';
import DestinationsPage from './pages/NewDestinationsPage';
import LocationDetailPage from './pages/LocationDetailPage';
import TourGuidesPage from './pages/TourGuidesPage';
import TourGuideDetailPage from './pages/TourGuideDetailPage';
import BookingsPage from './pages/BookingsPage';
import CurrencyPage from './pages/CurrencyPage';
import AboutPage from './pages/AboutPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import UserDashboard from './pages/UserDashboard';
import TourGuideDashboard from './pages/TourGuideDashboard';
import TourGuideProfilePage from './pages/TourGuideProfilePage';
import StaffDashboard from './pages/StaffDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminUserManagement from './pages/AdminUserManagement';
import AdminTourGuideManagement from './pages/AdminTourGuideManagement';
import AdminBookingsManagement from './pages/AdminBookingsManagement';
import AdminAnalytics from './pages/AdminAnalytics';
import TourGuideVerificationPage from './pages/TourGuideVerificationPage';
import StaffVerificationPage from './pages/StaffVerificationPage';
import UserTourGuideApplicationPage from './pages/UserTourGuideApplicationPage';
import LocationManagement from './pages/LocationManagement';
import PlansPage from './pages/PlansPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import GuideBookingsPage from './pages/GuideBookingsPage';
import './App.css';

// Helper functions for notifications
const getIconByType = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return <CheckCircle size={20} className="text-success" />;
    case 'error':
      return <AlertCircle size={20} className="text-danger" />;
    case 'warning':
      return <AlertTriangle size={20} className="text-warning" />;
    case 'info':
    default:
      return <Info size={20} className="text-info" />;
  }
};

const getBackgroundClass = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return 'bg-success text-white';
    case 'error':
      return 'bg-danger text-white';
    case 'warning':
      return 'bg-warning text-dark';
    case 'info':
    default:
      return 'bg-info text-white';
  }
};

function App() {
  const { isLoading, notifications, removeNotification } = useAuth();

  // Show loading spinner while checking authentication state
  if (isLoading) {
    return <LoadingSpinner />;
  }  return (
    <div className="App">
      <ScrollToTop />
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/services" element={<EnhancedServicesPage />} />
        <Route path="/destinations" element={<DestinationsPage />} />
        <Route path="/destinations/:id" element={<LocationDetailPage />} />
        <Route path="/tour-guides" element={<TourGuidesPage />} />
        <Route path="/tour-guides/:id" element={<TourGuideDetailPage />} />
        <Route path="/bookings" element={<BookingsPage />} />
        <Route path="/currency" element={<CurrencyPage />} />
        <Route path="/plans" element={<PlansPage />} />
        <Route path="/payment-success" element={<PaymentSuccessPage />} />
        <Route path="/payment-failed" element={<PaymentSuccessPage />} />
        <Route path="/about" element={<AboutPage />} />
        
        {/* Development Testing Route */}
        <Route path="/test-deeplinks" element={<DeepLinkTester />} />
        
        {/* Authentication Routes */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          } 
        />
        
        {/* Unauthorized Access Route */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Role-based Dashboard Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['User']}>
                <UserDashboard />
              </RoleBasedRoute>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/guide/dashboard" 
          element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['TourGuide']}>
                <TourGuideDashboard />
              </RoleBasedRoute>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/guide/profile" 
          element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['TourGuide']}>
                <TourGuideProfilePage />
              </RoleBasedRoute>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/guide-bookings" 
          element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['TourGuide']}>
                <GuideBookingsPage />
              </RoleBasedRoute>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/staff/dashboard" 
          element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['Staff']}>
                <StaffDashboard />
              </RoleBasedRoute>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/staff/locations" 
          element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['Staff', 'Admin']}>
                <LocationManagement />
              </RoleBasedRoute>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['Admin']}>
                <AdminDashboard />
              </RoleBasedRoute>
            </ProtectedRoute>
          } 
        />

        {/* Admin Management Routes */}
        <Route 
          path="/admin/users" 
          element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['Admin', 'Staff']}>
                <AdminUserManagement />
              </RoleBasedRoute>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/tour-guides" 
          element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['Admin', 'Staff']}>
                <AdminTourGuideManagement />
              </RoleBasedRoute>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/bookings" 
          element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['Admin', 'Staff']}>
                <AdminBookingsManagement />
              </RoleBasedRoute>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/analytics" 
          element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['Admin']}>
                <AdminAnalytics />
              </RoleBasedRoute>
            </ProtectedRoute>
          } 
        />

        {/* User Profile Route - Available to all authenticated users */}
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } 
        />

        {/* Verification Routes */}
        <Route 
          path="/guide/verification" 
          element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['TourGuide']}>
                <TourGuideVerificationPage />
              </RoleBasedRoute>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/staff/verification" 
          element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['Staff', 'Admin']}>
                <StaffVerificationPage />
              </RoleBasedRoute>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/user/tour-guide-application" 
          element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['User']}>
                <UserTourGuideApplicationPage />
              </RoleBasedRoute>
            </ProtectedRoute>
          } 
        />
      </Routes>
      
      {/* Chatbot floating button - available on all pages */}
      <SimpleChatbotButton />
      
      {/* Footer - available on all pages */}
      <Footer />

      {/* Global Notification System */}
      {notifications.length > 0 && (
        <ToastContainer 
          className="position-fixed p-3 top-0 end-0"
          style={{ 
            zIndex: 9999,
            maxHeight: '100vh',
            overflowY: 'auto'
          }}
        >
          {notifications.map((notification) => (
            <Toast 
              key={notification.id}
              className={`mb-2 shadow-lg border-0 ${getBackgroundClass(notification.type)}`}
              onClose={() => removeNotification(notification.id)}
              show={true}
              autohide={notification.autoClose}
              delay={notification.duration}
              style={{ minWidth: '300px' }}
            >
              <Toast.Header className={`${getBackgroundClass(notification.type)} border-0`}>
                <div className="d-flex align-items-center">
                  {getIconByType(notification.type)}
                  <strong className="ms-2 me-auto">
                    {notification.title}
                  </strong>
                </div>
              </Toast.Header>
              {notification.message && (
                <Toast.Body className="py-2">
                  {notification.message}
                </Toast.Body>
              )}
            </Toast>
          ))}
        </ToastContainer>
      )}
    </div>
  );
}

export default App;
