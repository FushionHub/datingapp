import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createListing, uploadListingImage } from '../services/supabaseService';

const PageContainer = styled.div`
  padding: 2rem;
  max-width: 700px;
  margin: 0 auto;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
`;

const TextArea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  min-height: 150px;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;

  &:disabled {
    opacity: 0.5;
  }
`;

const CreateListingPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [images, setImages] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !price || !currentUser) {
      setError('Title and price are required.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      // 1. Upload images
      const imageUrls = [];
      for (const image of images) {
        const url = await uploadListingImage(image, currentUser.uid);
        if (url) {
          imageUrls.push(url);
        } else {
          throw new Error('Image upload failed.');
        }
      }

      // 2. Create listing object
      const listingData = {
        user_id: currentUser.uid,
        title,
        description,
        price: parseFloat(price),
        currency: 'NGN', // Or make this selectable
        category,
        location,
        image_urls: imageUrls,
      };

      // 3. Save listing to database
      const newListing = await createListing(listingData);
      if (newListing) {
        alert('Listing created successfully!');
        navigate(`/listing/${newListing.id}`);
      } else {
        throw new Error('Failed to create listing in the database.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <h1>Create a New Listing</h1>
      <Form onSubmit={handleSubmit}>
        <Input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <TextArea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <Input type="number" placeholder="Price (NGN)" value={price} onChange={(e) => setPrice(e.target.value)} required />
        <Input type="text" placeholder="Category (e.g., Electronics, Furniture)" value={category} onChange={(e) => setCategory(e.target.value)} />
        <Input type="text" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
        <div>
          <label>Images (up to 5):</label>
          <Input type="file" multiple accept="image/*" onChange={(e) => setImages(Array.from(e.target.files).slice(0, 5))} />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <Button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Listing'}
        </Button>
      </Form>
    </PageContainer>
  );
};

export default CreateListingPage;
