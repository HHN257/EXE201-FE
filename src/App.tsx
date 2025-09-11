import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import PublicRoute from './components/PublicRoute';
import LoadingSpinner from './components/LoadingSpinner';
import { useAuth } from './contexts/AuthContext';
import HomePage from './pages/HomePage';
import ServicesPage from './pages/ServicesPage';
import DestinationsPage from './pages/DestinationsPage';
import TourGuidesPage from './pages/TourGuidesPage';
import TourGuideDetailPage from './pages/TourGuideDetailPage';
import BookingsPage from './pages/BookingsPage';
import CurrencyPage from './pages/CurrencyPage';
import AboutPage from './pages/AboutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
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
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/destinations" element={<DestinationsPage />} />
        <Route path="/tour-guides" element={<TourGuidesPage />} />
        <Route path="/tour-guides/:id" element={<TourGuideDetailPage />} />
        <Route path="/bookings" element={<BookingsPage />} />
        <Route path="/currency" element={<CurrencyPage />} />
        <Route path="/about" element={<AboutPage />} />
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
      </Routes>
    </div>
  );
}

export default App;
