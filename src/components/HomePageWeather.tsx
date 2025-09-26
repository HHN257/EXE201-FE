import React, { useState, useEffect } from 'react';
import WeatherWidget from './WeatherWidget';

interface HomePageWeatherProps {
  className?: string;
}

const HomePageWeather: React.FC<HomePageWeatherProps> = ({ className = '' }) => {
  const [location, setLocation] = useState<{
    lat: number;
    lon: number;
    name: string;
  }>({
    lat: 10.8231, // Ho Chi Minh City as default
    lon: 106.6297,
    name: 'Ho Chi Minh City, Vietnam'
  });
  
  const [isUsingUserLocation, setIsUsingUserLocation] = useState(false);

  useEffect(() => {
    // Try to get user's location on component mount
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            name: 'Your Location'
          });
          setIsUsingUserLocation(true);
        },
        (error) => {
          console.log('Geolocation not available, using default location:', error.message);
          // Keep the default Ho Chi Minh City location
        },
        {
          timeout: 5000, // 5 second timeout
          enableHighAccuracy: false
        }
      );
    }
  }, []);

  return (
    <div className={className}>
      <div className="text-center mb-3">
        <h5 className="fw-semibold text-muted mb-1">
          {isUsingUserLocation ? 'Weather at Your Location' : 'Current Weather'}
        </h5>
        {!isUsingUserLocation && (
          <p className="text-muted small mb-0">
            Enable location for personalized weather
          </p>
        )}
      </div>
      <div style={{ maxWidth: '400px' }} className="mx-auto">
        <WeatherWidget
          latitude={location.lat}
          longitude={location.lon}
          locationName={location.name}
        />
      </div>
    </div>
  );
};

export default HomePageWeather;