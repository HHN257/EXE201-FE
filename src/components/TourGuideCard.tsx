import React from 'react';
import { Card, Badge, Button, Row, Col } from 'react-bootstrap';
import { Star, Clock, Users, Verified } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { TourGuideDto } from '../services/api';

interface TourGuideCardProps {
  tourGuide: TourGuideDto;
  onBook?: (tourGuide: TourGuideDto) => void;
}

const TourGuideCard: React.FC<TourGuideCardProps> = ({ tourGuide, onBook }) => {
  const formatRate = (rate?: number, currency?: string) => {
    if (!rate) return 'Contact for pricing';
    
    const currencyCode = currency || 'VND';
    
    if (currencyCode === 'VND') {
      return `${rate.toLocaleString('vi-VN')} VND/hour`;
    } else if (currencyCode === 'USD') {
      return `$${rate}/hour`;
    } else {
      return `${rate.toLocaleString()} ${currencyCode}/hour`;
    }
  };

  const getSpecializationBadges = () => {
    if (!tourGuide.specializations) return [];
    return tourGuide.specializations.split(',').map(s => s.trim()).slice(0, 3);
  };

  const getLanguages = () => {
    if (!tourGuide.languages) return 'English';
    return tourGuide.languages.split(',').map(l => l.trim()).join(', ');
  };

  return (
    <Card className="h-100 shadow-sm hover-shadow-lg transition-all">
      <div className="position-relative">
        <Card.Img 
          variant="top" 
          src={tourGuide.profileImage || 'https://via.placeholder.com/300x200?text=Tour+Guide'} 
          height={200}
          style={{ objectFit: 'cover' }}
          alt={tourGuide.name}
        />
        {tourGuide.isVerified && (
          <Badge 
            bg="success" 
            className="position-absolute top-0 start-0 m-2 d-flex align-items-center gap-1"
          >
            <Verified size={14} />
            Verified
          </Badge>
        )}
      </div>
      
      <Card.Body className="d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <Card.Title className="h5 mb-0">{tourGuide.name}</Card.Title>
          <div className="d-flex align-items-center text-warning">
            <Star size={16} fill="currentColor" />
            <span className="ms-1 fw-semibold">
              {tourGuide.rating ? tourGuide.rating.toFixed(1) : 'New'}
            </span>
            <small className="text-muted ms-1">
              ({tourGuide.totalReviews} reviews)
            </small>
          </div>
        </div>

        {tourGuide.bio && (
          <Card.Text className="text-muted small mb-3 flex-grow-1">
            {tourGuide.bio.length > 100 
              ? `${tourGuide.bio.substring(0, 100)}...` 
              : tourGuide.bio
            }
          </Card.Text>
        )}

        <div className="mb-3">
          <Row className="g-2 text-sm">
            <Col xs={12}>
              <div className="d-flex align-items-center text-muted mb-1">
                <Users size={14} className="me-2" />
                <span>Languages: {getLanguages()}</span>
              </div>
            </Col>
            <Col xs={12}>
              <div className="d-flex align-items-center text-muted">
                <Clock size={14} className="me-2" />
                <span className="fw-semibold text-primary">
                  {formatRate(tourGuide.hourlyRate, tourGuide.currency)}
                </span>
              </div>
            </Col>
          </Row>
        </div>

        {getSpecializationBadges().length > 0 && (
          <div className="mb-3">
            {getSpecializationBadges().map((spec, index) => (
              <Badge key={index} bg="light" text="dark" className="me-1 mb-1">
                {spec}
              </Badge>
            ))}
          </div>
        )}

        <div className="mt-auto">
          <Row className="g-2">
            <Col>
              <Link
                to={`/tour-guides/${tourGuide.id}`}
                className="btn btn-outline-primary btn-sm w-100"
              >
                View Profile
              </Link>
            </Col>
            <Col>
              <Button
                variant="primary"
                size="sm"
                className="w-100"
                onClick={() => onBook?.(tourGuide)}
              >
                Book Now
              </Button>
            </Col>
          </Row>
        </div>
      </Card.Body>
    </Card>
  );
};

export default TourGuideCard;
