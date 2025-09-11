// Development configuration for backend connection
export const config = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://localhost:7225/api',
  isDevelopment: import.meta.env.MODE === 'development',
  isProduction: import.meta.env.MODE === 'production',
};

// For development debugging
if (config.isDevelopment) {
  console.log('🔧 Development mode enabled');
  console.log('🌐 API Base URL:', config.API_BASE_URL);
}
