import React, { useState, useEffect } from 'react';
import { weatherApi } from '../services/api';
import type { WeatherData } from '../services/api';

interface WeatherProps {
  latitude?: number;
  longitude?: number;
  locationName?: string;
  className?: string;
}

const Weather: React.FC<WeatherProps> = ({ 
  latitude, 
  longitude, 
  locationName = 'Current Location',
  className = ''
}) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async (lat: number, lon: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await weatherApi.getWeather(lat, lon);
      setWeather(data);
    } catch (err) {
      setError('Failed to fetch weather data');
      console.error('Weather API error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          setError('Unable to get your location');
          console.error('Geolocation error:', error);
        }
      );
    } else {
      setError('Geolocation is not supported by this browser');
    }
  };

  useEffect(() => {
    if (latitude && longitude) {
      fetchWeather(latitude, longitude);
    }
  }, [latitude, longitude]);

  const handleRefresh = () => {
    if (latitude && longitude) {
      fetchWeather(latitude, longitude);
    } else {
      getCurrentLocation();
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
          >
            Try Again
          </button>
          {!latitude && !longitude && (
            <button
              onClick={getCurrentLocation}
              className="ml-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors"
            >
              Use My Location
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!weather && !latitude && !longitude) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="text-center">
          <div className="text-gray-600 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
          </div>
          <p className="text-gray-600 mb-4">Weather information not available</p>
          <button
            onClick={getCurrentLocation}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
          >
            Get Weather for My Location
          </button>
        </div>
      </div>
    );
  }

  if (!weather) return null;

  const getWeatherIcon = (temp: number) => {
    if (temp >= 30) return '☀️';
    if (temp >= 20) return '⛅';
    if (temp >= 10) return '☁️';
    return '🌧️';
  };

  return (
    <div className={`bg-gradient-to-br from-blue-400 to-blue-600 text-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">{locationName}</h3>
          <p className="text-blue-100 text-sm">
            {new Date(weather.current.time).toLocaleString()}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="text-blue-100 hover:text-white transition-colors"
          title="Refresh weather"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <span className="text-3xl mr-3">
            {getWeatherIcon(weather.current.temperature_2m)}
          </span>
          <div>
            <div className="text-3xl font-bold">
              {Math.round(weather.current.temperature_2m)}°{weather.current_units.temperature_2m}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
          </svg>
          <span>Humidity: {weather.current.relative_humidity_2m}{weather.current_units.relative_humidity_2m}</span>
        </div>
        <div className="flex items-center">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011 1v8a1 1 0 01-1 1H7a1 1 0 01-1-1V2a1 1 0 011-1z" />
          </svg>
          <span>Wind: {Math.round(weather.current.wind_speed_10m * 10) / 10} {weather.current_units.wind_speed_10m}</span>
        </div>
      </div>
    </div>
  );
};

export default Weather;