import React, { useState } from 'react';
import Weather from '../components/Weather';

const WeatherPage: React.FC = () => {
  const [customLocation, setCustomLocation] = useState({
    latitude: '',
    longitude: '',
    name: ''
  });

  const [showCustomWeather, setShowCustomWeather] = useState(false);

  const handleCustomLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customLocation.latitude && customLocation.longitude) {
      setShowCustomWeather(true);
    }
  };

  const popularLocations = [
    { name: 'Ho Chi Minh City', lat: 10.8231, lon: 106.6297 },
    { name: 'Hanoi', lat: 21.0285, lon: 105.8542 },
    { name: 'Da Nang', lat: 16.0544, lon: 108.2022 },
    { name: 'Hoi An', lat: 15.8801, lon: 108.3380 },
    { name: 'Nha Trang', lat: 12.2388, lon: 109.1967 },
    { name: 'Hue', lat: 16.4637, lon: 107.5909 }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Weather Information</h1>
          <p className="text-gray-600">Get current weather conditions for any location</p>
        </div>

        {/* Current Location Weather */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Current Location</h2>
          <Weather className="max-w-md mx-auto" />
        </div>

        {/* Custom Location Input */}
        <div className="max-w-md mx-auto mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">Custom Location</h2>
          <form onSubmit={handleCustomLocationSubmit} className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-4">
              <label htmlFor="locationName" className="block text-sm font-medium text-gray-700 mb-2">
                Location Name
              </label>
              <input
                type="text"
                id="locationName"
                value={customLocation.name}
                onChange={(e) => setCustomLocation({...customLocation, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter location name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-2">
                  Latitude
                </label>
                <input
                  type="number"
                  id="latitude"
                  step="any"
                  value={customLocation.latitude}
                  onChange={(e) => setCustomLocation({...customLocation, latitude: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 10.8231"
                  required
                />
              </div>
              <div>
                <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-2">
                  Longitude
                </label>
                <input
                  type="number"
                  id="longitude"
                  step="any"
                  value={customLocation.longitude}
                  onChange={(e) => setCustomLocation({...customLocation, longitude: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 106.6297"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              Get Weather
            </button>
          </form>

          {showCustomWeather && customLocation.latitude && customLocation.longitude && (
            <div className="mt-6">
              <Weather
                latitude={parseFloat(customLocation.latitude)}
                longitude={parseFloat(customLocation.longitude)}
                locationName={customLocation.name || 'Custom Location'}
              />
            </div>
          )}
        </div>

        {/* Popular Locations */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Popular Vietnam Destinations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularLocations.map((location, index) => (
              <Weather
                key={index}
                latitude={location.lat}
                longitude={location.lon}
                locationName={location.name}
                className="h-fit"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherPage;