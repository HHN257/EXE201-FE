import React from 'react';
import { Card } from 'react-bootstrap';
import { useWeather } from '../hooks/useWeather';

interface WeatherWidgetProps {
  latitude: number;
  longitude: number;
  locationName?: string;
  compact?: boolean;
  className?: string;
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  latitude,
  longitude,
  locationName,
  compact = false,
  className = ''
}) => {
  const { weather, loading, error } = useWeather(latitude, longitude);

  if (loading) {
    return (
      <Card className={`shadow-sm ${className}`}>
        <Card.Body className="p-4">
          <div className="d-flex align-items-center">
            <div 
              className="rounded-circle bg-light me-3" 
              style={{ width: '40px', height: '40px' }}
            ></div>
            <div className="flex-grow-1">
              <div className="bg-light rounded mb-2" style={{ height: '16px', width: '75%' }}></div>
              <div className="bg-light rounded" style={{ height: '12px', width: '50%' }}></div>
            </div>
          </div>
        </Card.Body>
      </Card>
    );
  }

  if (error || !weather) {
    return (
      <Card className={`border-danger bg-danger bg-opacity-10 ${className}`}>
        <Card.Body className="p-4">
          <p className="text-danger small mb-0">Weather unavailable</p>
        </Card.Body>
      </Card>
    );
  }

  const getWeatherIcon = (temp: number) => {
    if (temp >= 30) return '☀️';
    if (temp >= 20) return '⛅';
    if (temp >= 10) return '☁️';
    return '🌧️';
  };

  if (compact) {
    return (
      <Card className={`shadow-sm ${className}`}>
        <Card.Body className="p-3">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <span className="fs-5 me-2">{getWeatherIcon(weather.current.temperature_2m)}</span>
              <div>
                <div className="fw-semibold text-dark">
                  {Math.round(weather.current.temperature_2m)}°{weather.current_units.temperature_2m}
                </div>
                {locationName && (
                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>{locationName}</div>
                )}
              </div>
            </div>
            <div className="text-muted" style={{ fontSize: '0.75rem' }}>
              {weather.current.relative_humidity_2m}% RH
            </div>
          </div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card 
      className={`text-white shadow ${className}`}
      style={{
        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
        border: 'none'
      }}
    >
      <Card.Body className="p-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            {locationName && (
              <h6 className="fw-semibold mb-1" style={{ fontSize: '0.9rem' }}>{locationName}</h6>
            )}
            <div className="d-flex align-items-center">
              <span className="fs-1 me-2">{getWeatherIcon(weather.current.temperature_2m)}</span>
              <span className="fs-1 fw-bold">
                {Math.round(weather.current.temperature_2m)}°{weather.current_units.temperature_2m}
              </span>
            </div>
          </div>
        </div>
        
        <div className="row g-2">
          <div className="col-6">
            <div className="d-flex align-items-center">
              <span className="me-1">💧</span>
              <small>{weather.current.relative_humidity_2m}{weather.current_units.relative_humidity_2m}</small>
            </div>
          </div>
          <div className="col-6">
            <div className="d-flex align-items-center">
              <span className="me-1">💨</span>
              <small>{Math.round(weather.current.wind_speed_10m * 10) / 10} {weather.current_units.wind_speed_10m}</small>
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default WeatherWidget;