# Open-Meteo Weather API Integration Guide

This guide shows you how to use the Open-Meteo weather API integration in your React application.

## Overview

The integration includes:
- **Backend API**: Weather controller that fetches data from Open-Meteo
- **Frontend Service**: API service methods to call your backend
- **React Components**: Weather display components
- **React Hooks**: Custom hooks for weather data management

## Backend Integration

Your backend already has a `WeatherController` that fetches weather data from Open-Meteo API:

```csharp
[HttpGet]
public async Task<IActionResult> GetWeather([FromQuery] decimal latitude, [FromQuery] decimal longitude)
```

The endpoint is available at: `GET /api/weather?latitude={lat}&longitude={lon}`

## Frontend API Service

The weather API service is added to your `api.ts` file:

```typescript
// Weather API interface
export interface WeatherData {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    time: string;
  };
  current_units: {
    temperature_2m: string;
    relative_humidity_2m: string;
    wind_speed_10m: string;
  };
}

// Weather API methods
export const weatherApi = {
  getWeather: (latitude: number, longitude: number): Promise<WeatherData> =>
    api.get('/weather', { params: { latitude, longitude } }).then(res => res.data),
};
```

## Components

### 1. Weather Component
Full-featured weather display with loading states and error handling:

```tsx
import Weather from '../components/Weather';

// Usage examples:
<Weather /> // Uses geolocation
<Weather latitude={21.0285} longitude={105.8542} locationName="Hanoi" />
```

### 2. WeatherWidget Component
Compact weather widget for embedding in other components:

```tsx
import WeatherWidget from '../components/WeatherWidget';

// Usage examples:
<WeatherWidget 
  latitude={10.8231} 
  longitude={106.6297} 
  locationName="Ho Chi Minh City"
  compact={true} 
/>
```

### 3. WeatherPage Component
Complete page demonstrating weather functionality with popular Vietnam locations.

## Custom Hooks

### useWeather Hook
For managing weather data in your components:

```tsx
import { useWeather } from '../hooks/useWeather';

const MyComponent = () => {
  const { weather, loading, error, refetch, fetchWeatherForLocation } = useWeather();

  // Fetch weather for specific coordinates
  const handleLocationClick = () => {
    fetchWeatherForLocation(21.0285, 105.8542); // Hanoi coordinates
  };

  if (loading) return <div>Loading weather...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!weather) return <div>No weather data</div>;

  return (
    <div>
      <h3>Temperature: {weather.current.temperature_2m}°{weather.current_units.temperature_2m}</h3>
      <p>Humidity: {weather.current.relative_humidity_2m}%</p>
      <p>Wind Speed: {weather.current.wind_speed_10m} {weather.current_units.wind_speed_10m}</p>
      <button onClick={refetch}>Refresh</button>
    </div>
  );
};
```

### useCurrentLocationWeather Hook
For getting weather based on user's current location:

```tsx
import { useCurrentLocationWeather } from '../hooks/useWeather';

const MyComponent = () => {
  const { weather, loading, error, getCurrentLocationWeather } = useCurrentLocationWeather();

  return (
    <div>
      <button onClick={getCurrentLocationWeather}>Get My Location Weather</button>
      {weather && (
        <div>Current temperature: {weather.current.temperature_2m}°C</div>
      )}
    </div>
  );
};
```

## Integration Examples

### 1. Adding Weather to Location Details

If your locations have coordinates, you can show weather information:

```tsx
// In LocationDetailPage.tsx
import WeatherWidget from '../components/WeatherWidget';

const LocationDetailPage = () => {
  const { location } = useParams();
  
  return (
    <div>
      <h1>{location.name}</h1>
      {location.latitude && location.longitude && (
        <WeatherWidget
          latitude={location.latitude}
          longitude={location.longitude}
          locationName={location.name}
          className="mb-4"
        />
      )}
      {/* Rest of location details */}
    </div>
  );
};
```

### 2. Adding Weather to Home Page

```tsx
// In HomePage.tsx
import Weather from '../components/Weather';

const HomePage = () => {
  return (
    <div>
      <h1>Welcome to Smart Travel</h1>
      <div className="weather-section">
        <h2>Current Weather</h2>
        <Weather className="max-w-md" />
      </div>
      {/* Rest of home page content */}
    </div>
  );
};
```

### 3. Weather Dashboard

```tsx
const WeatherDashboard = () => {
  const vietnamCities = [
    { name: 'Ho Chi Minh City', lat: 10.8231, lon: 106.6297 },
    { name: 'Hanoi', lat: 21.0285, lon: 105.8542 },
    { name: 'Da Nang', lat: 16.0544, lon: 108.2022 }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {vietnamCities.map(city => (
        <WeatherWidget
          key={city.name}
          latitude={city.lat}
          longitude={city.lon}
          locationName={city.name}
        />
      ))}
    </div>
  );
};
```

## Popular Vietnam Locations Coordinates

Here are some popular Vietnam destinations with their coordinates:

```typescript
const vietnamLocations = [
  { name: 'Ho Chi Minh City', lat: 10.8231, lon: 106.6297 },
  { name: 'Hanoi', lat: 21.0285, lon: 105.8542 },
  { name: 'Da Nang', lat: 16.0544, lon: 108.2022 },
  { name: 'Hoi An', lat: 15.8801, lon: 108.3380 },
  { name: 'Nha Trang', lat: 12.2388, lon: 109.1967 },
  { name: 'Hue', lat: 16.4637, lon: 107.5909 },
  { name: 'Can Tho', lat: 10.0452, lon: 105.7469 },
  { name: 'Vung Tau', lat: 10.4061, lon: 107.1360 },
  { name: 'Dalat', lat: 11.9404, lon: 108.4583 },
  { name: 'Ha Long', lat: 20.9101, lon: 107.1839 }
];
```

## Error Handling

The components include comprehensive error handling:

- **Network errors**: When the API is unavailable
- **Invalid coordinates**: When latitude/longitude are invalid
- **Geolocation errors**: When user denies location access
- **Loading states**: While fetching data

## Styling

All components use Tailwind CSS classes and are designed to be:
- **Responsive**: Work on mobile and desktop
- **Customizable**: Accept `className` props for custom styling
- **Accessible**: Include proper ARIA labels and keyboard navigation

## API Rate Limits

Open-Meteo has rate limits:
- **Free tier**: 10,000 requests per day
- **Commercial**: Higher limits available

Consider implementing caching or request throttling for production use.

## Next Steps

1. **Add weather to your existing location pages**
2. **Implement weather-based travel recommendations**
3. **Add weather alerts and notifications**
4. **Cache weather data to reduce API calls**
5. **Add extended forecast functionality**

## Troubleshooting

### Common Issues:

1. **CORS errors**: Make sure your backend allows CORS from your frontend domain
2. **Invalid coordinates**: Ensure latitude/longitude are valid numbers
3. **API timeouts**: Open-Meteo might be slow, consider adding timeout handling
4. **Geolocation blocked**: Handle cases where users block location access

### Debug Tips:

```typescript
// Enable debug logging
const weatherApi = {
  getWeather: async (latitude: number, longitude: number) => {
    console.log(`Fetching weather for: ${latitude}, ${longitude}`);
    const result = await api.get('/weather', { params: { latitude, longitude } });
    console.log('Weather response:', result.data);
    return result.data;
  }
};
```