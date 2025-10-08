import React from 'react';
import { useCurrentLocationWeather } from '../hooks/useWeather';

interface WeatherBannerProps {
  className?: string;
  showLocationButton?: boolean;
}

const WeatherBanner: React.FC<WeatherBannerProps> = ({ 
  className = '',
  showLocationButton = true 
}) => {
  const { weather, loading, error, getCurrentLocationWeather } = useCurrentLocationWeather();

  const getWeatherIcon = (temp?: number) => {
    if (!temp) return '🌤️';
    if (temp >= 30) return '☀️';
    if (temp >= 20) return '⛅';
    if (temp >= 10) return '☁️';
    return '🌧️';
  };

  if (loading) {
    return (
      <div className={`bg-gradient-to-r from-blue-400 to-blue-500 text-white p-3 rounded-lg ${className}`}>
        <div className="flex items-center justify-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
          <span className="text-sm">Getting weather...</span>
        </div>
      </div>
    );
  }

  if (error && !weather) {
    return (
      <div className={`bg-gradient-to-r from-gray-400 to-gray-500 text-white p-3 rounded-lg ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg">🌤️</span>
            <span className="text-sm">Weather unavailable</span>
          </div>
          {showLocationButton && (
            <button
              onClick={getCurrentLocationWeather}
              className="text-xs bg-white bg-opacity-20 hover:bg-opacity-30 px-2 py-1 rounded transition-colors"
            >
              Get Weather
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!weather) {
    return (
      <div className={`bg-gradient-to-r from-blue-400 to-blue-500 text-white p-3 rounded-lg ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg">🌤️</span>
            <span className="text-sm">Perfect weather for traveling!</span>
          </div>
          {showLocationButton && (
            <button
              onClick={getCurrentLocationWeather}
              className="text-xs bg-white bg-opacity-20 hover:bg-opacity-30 px-2 py-1 rounded transition-colors"
            >
              Get My Weather
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-r from-blue-400 to-blue-500 text-white p-3 rounded-lg ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-xl">{getWeatherIcon(weather.current.temperature_2m)}</span>
          <div>
            <div className="font-semibold">
              {Math.round(weather.current.temperature_2m)}°{weather.current_units.temperature_2m}
            </div>
            <div className="text-xs opacity-90">
              Your Location • {weather.current.relative_humidity_2m}% humidity
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs opacity-90">
            Wind: {Math.round(weather.current.wind_speed_10m * 10) / 10} {weather.current_units.wind_speed_10m}
          </div>
          <div className="text-xs opacity-75">
            {new Date(weather.current.time).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherBanner;