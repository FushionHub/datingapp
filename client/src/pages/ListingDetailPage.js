import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getListingDetails, contactSeller } from '../services/supabaseService';
import { useAuth } from '../context/AuthContext';

const PageContainer = styled.div`
  padding: 2rem;
  max-width: 900px;
  margin: 0 auto;
`;

const ImageGallery = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;

  img {
    width: 100%;
    height: auto;
    border-radius: 8px;
  }
`;

const Details = styled.div`
  h1 {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
  }
`;

const Price = styled.p`
  font-size: 2rem;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.primary};
  margin: 0 0 1rem 0;
`;

const SellerInfo = styled.div`
  margin-top: 2rem;
  padding: 1rem;
  background-color: ${({ theme }) => theme.colors.backgroundLight};
  border-radius: 8px;
`;

const ContactButton = styled.button`
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  font-size: 1.1rem;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;

const ListingDetailPage = () => {
  const { listingId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contacting, setContacting] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      setLoading(true);
      const data = await getListingDetails(listingId);
      setListing(data);
      setLoading(false);
    };
    fetchListing();
  }, [listingId]);

  const handleContactSeller = async () => {
    setContacting(true);
    const result = await contactSeller(listing.seller.id);
    if (result.success) {
      navigate(`/chat/${result.matchId}`);
    } else {
      alert(`Error: ${result.error}`);
      setContacting(false);
    }
  };

  if (loading) {
    return <PageContainer>Loading listing details...</PageContainer>;
  }

  if (!listing) {
    return <PageContainer>Listing not found.</PageContainer>;
  }

  const isOwnListing = currentUser && currentUser.uid === listing.user_id;

  return (
    <PageContainer>
      <Link to="/marketplace">Back to Marketplace</Link>
      <Details>
        <h1>{listing.title}</h1>
        <Price>{`${listing.price} ${listing.currency}`}</Price>
        <p>{listing.description}</p>
        <p><strong>Category:</strong> {listing.category}</p>
        <p><strong>Location:</strong> {listing.location}</p>
      </Details>

      {listing.image_urls && listing.image_urls.length > 0 && (
        <ImageGallery>
          {listing.image_urls.map((url, index) => (
            <img key={index} src={url} alt={`${listing.title} - view ${index + 1}`} />
          ))}
        </ImageGallery>
      )}

      <SellerInfo>
        <h2>About the Seller</h2>
        <p><strong>Name:</strong> {listing.seller.name}</p>
        <Link to={`/profile/${listing.seller.id}`}>View Profile</Link>
        <br/>
        {!isOwnListing && (
          <ContactButton onClick={handleContactSeller} disabled={contacting}>
            {contacting ? 'Starting Chat...' : 'Contact Seller'}
          </ContactButton>
        )}
      </SellerInfo>
    </PageContainer>
  );
};

export default ListingDetailPage;
