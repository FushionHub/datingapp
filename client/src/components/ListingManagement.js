import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { adminGetAllListings, adminDeleteListing } from '../services/supabaseService';

const ListingManagementContainer = styled.div`
  margin-top: 2rem;
`;

const ListingTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  th, td {
    border: 1px solid ${({ theme }) => theme.colors.border};
    padding: 0.75rem;
    text-align: left;
  }

  th {
    background-color: ${({ theme }) => theme.colors.backgroundLight};
  }
`;

const DeleteButton = styled.button`
  background-color: #e53e3e;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
  }
`;

const ListingManagement = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    setLoading(true);
    const data = await adminGetAllListings();
    setListings(data);
    setLoading(false);
  };

  const handleDelete = async (listingId) => {
    if (window.confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      const result = await adminDeleteListing(listingId);
      if (result.success) {
        alert('Listing deleted successfully.');
        // Refresh the list
        setListings(listings.filter(l => l.id !== listingId));
      } else {
        alert(`Failed to delete listing: ${result.error}`);
      }
    }
  };

  if (loading) {
    return <p>Loading listings...</p>;
  }

  return (
    <ListingManagementContainer>
      <h2>Marketplace Listing Management</h2>
      <ListingTable>
        <thead>
          <tr>
            <th>Title</th>
            <th>Seller</th>
            <th>Price</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {listings.map(listing => (
            <tr key={listing.id}>
              <td>{listing.title}</td>
              <td>{listing.seller.name || 'N/A'}</td>
              <td>{`${listing.price} ${listing.currency}`}</td>
              <td>{listing.is_sold ? 'Sold' : 'Available'}</td>
              <td>
                <DeleteButton onClick={() => handleDelete(listing.id)}>
                  Delete
                </DeleteButton>
              </td>
            </tr>
          ))}
        </tbody>
      </ListingTable>
    </ListingManagementContainer>
  );
};

export default ListingManagement;
