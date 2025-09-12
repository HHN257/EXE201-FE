// Deep link utilities for external services
export interface DeepLinkService {
  name: string;
  logo: string;
  description: string;
  category: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  deepLinks: Record<string, (...args: any[]) => string>;
}

// Check if mobile device
export const isMobile = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Handle deep link with fallback
export const handleDeepLink = (deepLinkUrl: string, fallbackUrl: string): void => {
  if (isMobile()) {
    // Try to open the app
    const startTime = Date.now();
    
    // Create a hidden iframe to trigger the deep link
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = deepLinkUrl;
    document.body.appendChild(iframe);
    
    // Check if app opened (if user returns quickly, app didn't open)
    setTimeout(() => {
      const endTime = Date.now();
      document.body.removeChild(iframe);
      
      // If user didn't leave the page, app probably isn't installed
      if (endTime - startTime < 2000) {
        window.open(fallbackUrl, '_blank');
      }
    }, 1000);
  } else {
    // On desktop, open web version
    window.open(fallbackUrl, '_blank');
  }
};

// Grab service configuration
export const grabService: DeepLinkService = {
  name: 'Grab',
  logo: 'https://cdn.worldvectorlogo.com/logos/grab-1.svg',
  description: 'Ride-hailing, food delivery, and more',
  category: 'Transportation',
  deepLinks: {
    app: () => 'grab://open',
    ride: (pickup: string, destination: string) => 
      `grab://booking?pickup=${encodeURIComponent(pickup)}&destination=${encodeURIComponent(destination)}`,
    food: (restaurantId?: string) => 
      restaurantId ? `grab://food/restaurant/${restaurantId}` : 'grab://food',
    webFallback: () => 'https://grab.com',
  }
};

// Booking.com service configuration
export const bookingService: DeepLinkService = {
  name: 'Booking.com',
  logo: 'https://cf.bstatic.com/static/img/booking_logo_knowledge_graph/booking_logo_knowledge_graph.png',
  description: 'Hotel and accommodation booking',
  category: 'Accommodation',
  deepLinks: {
    app: () => 'booking://open',
    hotels: (city: string, checkin: string, checkout: string, guests: number = 2) =>
      `booking://hotels?city=${encodeURIComponent(city)}&checkin=${checkin}&checkout=${checkout}&guests=${guests}`,
    hotel: (hotelId: string) => `booking://hotel/${hotelId}`,
    webFallback: () => 'https://www.booking.com',
  }
};

// Traveloka service configuration
export const travelokaService: DeepLinkService = {
  name: 'Traveloka',
  logo: 'https://logos-world.net/wp-content/uploads/2021/02/Traveloka-Logo.png',
  description: 'Flights, hotels, and travel packages',
  category: 'Travel & Booking',
  deepLinks: {
    app: () => 'traveloka://open',
    flights: (from: string, to: string, departure: string, returnDate?: string) =>
      `traveloka://flight?from=${from}&to=${to}&departure=${departure}${returnDate ? `&return=${returnDate}` : ''}`,
    hotels: (city: string, checkin: string, checkout: string) =>
      `traveloka://hotel?city=${encodeURIComponent(city)}&checkin=${checkin}&checkout=${checkout}`,
    webFallback: () => 'https://www.traveloka.com',
  }
};

// Klook service configuration
export const klookService: DeepLinkService = {
  name: 'Klook',
  logo: 'https://res.klook.com/images/fl_lossy.progressive,q_65/c_fill,w_1200,h_630/w_80,x_15,y_15,g_south_west,l_Klook_water_br_trans_yhcmh3/activities/tsah6naw5n7rlapgkc8r/klook-logo.jpg',
  description: 'Activities, tours, and attractions booking',
  category: 'Travel & Booking',
  deepLinks: {
    app: () => 'klook://open',
    activities: (city: string) => `klook://activities?city=${encodeURIComponent(city)}`,
    webFallback: () => 'https://www.klook.com',
  }
};

// BusMap service configuration
export const busMapService: DeepLinkService = {
  name: 'BusMap',
  logo: 'https://play-lh.googleusercontent.com/8ddSd_0eFXrr1b8fMGhz8pZoGkN0VfKukhOnj0U7tq_kZQEjuY7q7RQP9z3Vx2_qD3U',
  description: 'Public transportation and bus routes',
  category: 'Transportation',
  deepLinks: {
    app: () => 'busmap://open',
    route: (from: string, to: string) => `busmap://route?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
    webFallback: () => 'https://busmap.vn',
  }
};

// Be (BeApp) service configuration
export const beService: DeepLinkService = {
  name: 'Be',
  logo: 'https://static.be.com.vn/web-static/img/logo_be.png',
  description: 'Ride-hailing and delivery services',
  category: 'Transportation',
  deepLinks: {
    app: () => 'be://open',
    ride: (pickup: string, destination: string) => 
      `be://book?pickup=${encodeURIComponent(pickup)}&destination=${encodeURIComponent(destination)}`,
    webFallback: () => 'https://be.com.vn',
  }
};

// XanhSM service configuration
export const xanhSMService: DeepLinkService = {
  name: 'XanhSM',
  logo: 'https://play-lh.googleusercontent.com/YourLogoHere', // Replace with actual logo
  description: 'Electric motorcycle taxi service',
  category: 'Transportation',
  deepLinks: {
    app: () => 'xanhsm://open',
    ride: (pickup: string, destination: string) => 
      `xanhsm://book?pickup=${encodeURIComponent(pickup)}&destination=${encodeURIComponent(destination)}`,
    webFallback: () => 'https://xanhsm.com', // Replace with actual website
  }
};

// FutaBus service configuration
export const futaBusService: DeepLinkService = {
  name: 'Futa Bus Lines',
  logo: 'https://futabus.vn/images/logo.png',
  description: 'Long-distance bus ticket booking',
  category: 'Transportation',
  deepLinks: {
    app: () => 'futabus://open',
    booking: (from: string, to: string, date: string) => 
      `futabus://book?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${date}`,
    webFallback: () => 'https://futabus.vn',
  }
};

// GrabFood service configuration
export const grabFoodService: DeepLinkService = {
  name: 'GrabFood',
  logo: 'https://images.deliveryhero.io/image/foodpanda/chains/cg_fp_chain_f5lwpz.png',
  description: 'Food delivery service',
  category: 'Food & Delivery',
  deepLinks: {
    app: () => 'grab://food',
    restaurant: (restaurantId?: string) => 
      restaurantId ? `grab://food/restaurant/${restaurantId}` : 'grab://food',
    webFallback: () => 'https://food.grab.com',
  }
};

// ShopeeFood service configuration
export const shopeeFoodService: DeepLinkService = {
  name: 'ShopeeFood',
  logo: 'https://cf.shopee.vn/file/6ca82ac47f2a7a0d9a1ce6d4b48da45f',
  description: 'Food delivery and restaurant booking',
  category: 'Food & Delivery',
  deepLinks: {
    app: () => 'shopeefood://open',
    restaurant: (restaurantId?: string) => 
      restaurantId ? `shopeefood://restaurant/${restaurantId}` : 'shopeefood://restaurants',
    webFallback: () => 'https://shopeefood.vn',
  }
};

// BeFood service configuration
export const beFoodService: DeepLinkService = {
  name: 'BeFood',
  logo: 'https://static.be.com.vn/web-static/img/logo_befood.png',
  description: 'Food delivery service by Be',
  category: 'Food & Delivery',
  deepLinks: {
    app: () => 'be://food',
    restaurant: (restaurantId?: string) => 
      restaurantId ? `be://food/restaurant/${restaurantId}` : 'be://food',
    webFallback: () => 'https://be.com.vn/befood',
  }
};

// CGV Cinemas service configuration
export const cgvService: DeepLinkService = {
  name: 'CGV Cinemas',
  logo: 'https://www.cgv.vn/skin/frontend/cgv/default/images/cgv-logo.png',
  description: 'Movie tickets and cinema booking',
  category: 'Entertainment',
  deepLinks: {
    app: () => 'cgv://open',
    movies: () => 'cgv://movies',
    booking: (movieId?: string) => 
      movieId ? `cgv://booking/${movieId}` : 'cgv://movies',
    webFallback: () => 'https://www.cgv.vn',
  }
};

// Lotte Cinema service configuration
export const lotteCinemaService: DeepLinkService = {
  name: 'Lotte Cinema',
  logo: 'https://www.lottecinemavn.com/skin/frontend/lotte/default/images/logo.png',
  description: 'Movie tickets and premium cinema experience',
  category: 'Entertainment',
  deepLinks: {
    app: () => 'lottecinema://open',
    movies: () => 'lottecinema://movies',
    booking: (movieId?: string) => 
      movieId ? `lottecinema://booking/${movieId}` : 'lottecinema://movies',
    webFallback: () => 'https://www.lottecinemavn.com',
  }
};

export const externalServices = [
  grabService, 
  bookingService, 
  travelokaService,
  klookService,
  busMapService,
  beService,
  xanhSMService,
  futaBusService,
  grabFoodService,
  shopeeFoodService,
  beFoodService,
  cgvService,
  lotteCinemaService
];