import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const Card = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  overflow: hidden;
  width: 280px;
  margin: 1rem;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-5px);
  }
`;

const CardImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
`;

const CardContent = styled.div`
  padding: 1rem;
`;

const Title = styled.h3`
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
`;

const Price = styled.p`
  font-size: 1.1rem;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.primary};
  margin: 0;
`;

const ListingCard = ({ listing }) => {
  const displayImage = listing.image_urls && listing.image_urls.length > 0
    ? listing.image_urls[0]
    : 'https://via.placeholder.com/280x200';

  return (
    <Link to={`/listing/${listing.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <Card>
        <CardImage src={displayImage} alt={listing.title} />
        <CardContent>
          <Title>{listing.title}</Title>
          <Price>{`${listing.price} ${listing.currency}`}</Price>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ListingCard;
