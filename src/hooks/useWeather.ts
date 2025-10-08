import { useState, useEffect, useCallback } from 'react';
import { weatherApi } from '../services/api';
import type { WeatherData } from '../services/api';

interface UseWeatherResult {
  weather: WeatherData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  fetchWeatherForLocation: (lat: number, lon: number) => void;
}

export const useWeather = (
  initialLatitude?: number,
  initialLongitude?: number
): UseWeatherResult => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<{lat: number, lon: number} | null>(
    initialLatitude && initialLongitude 
      ? { lat: initialLatitude, lon: initialLongitude }
      : null
  );

  const fetchWeather = useCallback(async (lat: number, lon: number) => {
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
  }, []);

  const fetchWeatherForLocation = useCallback((lat: number, lon: number) => {
    setCoordinates({ lat, lon });
    fetchWeather(lat, lon);
  }, [fetchWeather]);

  const refetch = useCallback(() => {
    if (coordinates) {
      fetchWeather(coordinates.lat, coordinates.lon);
    }
  }, [coordinates, fetchWeather]);

  useEffect(() => {
    if (coordinates) {
      fetchWeather(coordinates.lat, coordinates.lon);
    }
  }, [coordinates, fetchWeather]);

  return {
    weather,
    loading,
    error,
    refetch,
    fetchWeatherForLocation
  };
};

// Hook for getting user's current location weather
export const useCurrentLocationWeather = (): UseWeatherResult & {
  getCurrentLocationWeather: () => void;
} => {
  const [coordinates, setCoordinates] = useState<{lat: number, lon: number} | null>(null);
  const { weather, loading, error, refetch, fetchWeatherForLocation } = useWeather(
    coordinates?.lat,
    coordinates?.lon
  );

  const getCurrentLocationWeather = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          setCoordinates({ lat, lon });
          fetchWeatherForLocation(lat, lon);
        },
        (error) => {
          console.error('Geolocation error:', error);
        }
      );
    }
  }, [fetchWeatherForLocation]);

  return {
    weather,
    loading,
    error,
    refetch,
    fetchWeatherForLocation,
    getCurrentLocationWeather
  };
};