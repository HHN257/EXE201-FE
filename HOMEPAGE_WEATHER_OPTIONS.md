# HomePage Weather Widget Options

Here are three different ways you can display weather on your HomePage:

## Option 1: Current Implementation (HomePageWeather)
Uses WeatherWidget with automatic geolocation and fallback to Ho Chi Minh City.

```tsx
import HomePageWeather from '../components/HomePageWeather';

// In your HomePage render:
<section className="py-4" style={{ backgroundColor: '#f8fbff' }}>
  <Container>
    <Row className="justify-content-center">
      <Col xs={12} sm={10} md={8} lg={6} xl={5}>
        <HomePageWeather />
      </Col>
    </Row>
  </Container>
</section>
```

## Option 2: Compact Weather Banner
Horizontal banner-style weather widget.

```tsx
import WeatherBanner from '../components/WeatherBanner';

// Replace the weather section with:
<section className="py-3">
  <Container>
    <Row className="justify-content-center">
      <Col xs={12} lg={8}>
        <WeatherBanner className="mx-auto max-w-lg" />
      </Col>
    </Row>
  </Container>
</section>
```

## Option 3: Simple Weather Info in Header
Add weather info to your navigation or header area.

```tsx
import WeatherBanner from '../components/WeatherBanner';

// In your header component:
<WeatherBanner 
  className="mb-3" 
  showLocationButton={false} 
/>
```

## Option 4: Floating Weather Widget
Fixed position weather widget that doesn't take up layout space.

```tsx
// Add this CSS to your global styles:
.floating-weather {
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 1000;
  width: 280px;
}

@media (max-width: 768px) {
  .floating-weather {
    position: relative;
    top: auto;
    right: auto;
    width: 100%;
    margin-bottom: 1rem;
  }
}

// In your component:
<div className="floating-weather">
  <HomePageWeather />
</div>
```

## Option 5: Weather in Hero Section
Integrate weather directly into your Hero component.

```tsx
// In Hero.tsx, add weather info overlay:
<div className="position-absolute top-0 end-0 m-3">
  <WeatherBanner 
    className="bg-white bg-opacity-10 backdrop-blur-sm" 
    showLocationButton={false}
  />
</div>
```

Choose the option that best fits your design!