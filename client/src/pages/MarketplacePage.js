import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { getListings } from '../services/supabaseService';
import ListingCard from '../components/ListingCard';

const PageContainer = styled.div`
  padding: 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const ListingsGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
`;

const CreateButton = styled(Link)`
  padding: 0.75rem 1.5rem;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  text-decoration: none;
  border-radius: 4px;
`;

const MarketplacePage = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      const data = await getListings();
      setListings(data);
      setLoading(false);
    };
    fetchListings();
  }, []);

  if (loading) {
    return <PageContainer>Loading listings...</PageContainer>;
  }

  return (
    <PageContainer>
      <Header>
        <h1>Marketplace</h1>
        <CreateButton to="/marketplace/new">Create New Listing</CreateButton>
      </Header>
      <ListingsGrid>
        {listings.length > 0 ? (
          listings.map(listing => <ListingCard key={listing.id} listing={listing} />)
        ) : (
          <p>No listings found. Be the first to create one!</p>
        )}
      </ListingsGrid>
    </PageContainer>
  );
};

export default MarketplacePage;
