import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import PublicRoute from './components/PublicRoute';
import ProtectedRoute from './components/ProtectedRoute';
import RoleBasedRoute from './components/RoleBasedRoute';
import LoadingSpinner from './components/LoadingSpinner';
import DeepLinkTester from './components/DeepLinkTester';
import { useAuth } from './contexts/AuthContext';
import HomePage from './pages/HomePage';
import EnhancedServicesPage from './pages/EnhancedServicesPage';
import DestinationsPage from './pages/DestinationsPage';
import TourGuidesPage from './pages/TourGuidesPage';
import TourGuideDetailPage from './pages/TourGuideDetailPage';
import BookingsPage from './pages/BookingsPage';
import CurrencyPage from './pages/CurrencyPage';
import AboutPage from './pages/AboutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserDashboard from './pages/UserDashboard';
import TourGuideDashboard from './pages/TourGuideDashboard';
import StaffDashboard from './pages/StaffDashboard';
import AdminDashboard from './pages/AdminDashboard';
import TourGuideVerificationPage from './pages/TourGuideVerificationPage';
import StaffVerificationPage from './pages/StaffVerificationPage';
import UserTourGuideApplicationPage from './pages/UserTourGuideApplicationPage';
import './App.css';

function App() {
  const { isLoading } = useAuth();

  // Show loading spinner while checking authentication state
  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="App">
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/services" element={<EnhancedServicesPage />} />
        <Route path="/destinations" element={<DestinationsPage />} />
        <Route path="/tour-guides" element={<TourGuidesPage />} />
        <Route path="/tour-guides/:id" element={<TourGuideDetailPage />} />
        <Route path="/bookings" element={<BookingsPage />} />
        <Route path="/currency" element={<CurrencyPage />} />
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
          path="/admin/dashboard" 
          element={
            <ProtectedRoute>
              <RoleBasedRoute allowedRoles={['Admin']}>
                <AdminDashboard />
              </RoleBasedRoute>
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
    </div>
  );
}

export default App;
