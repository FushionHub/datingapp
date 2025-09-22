import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import {
  getAdvertisements,
  createAdvertisement,
  updateAdvertisement,
  uploadAdImage,
} from '../services/supabaseService';

const AdManagerContainer = styled.div`
  margin-top: 2rem;
  padding: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
`;

const AdForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;

  input, textarea, button {
    padding: 0.5rem;
    border-radius: 4px;
    border: 1px solid ${({ theme }) => theme.colors.border};
  }

  button {
    background-color: ${({ theme }) => theme.colors.primary};
    color: white;
    cursor: pointer;
  }
`;

const AdList = styled.ul`
  list-style: none;
  padding: 0;
`;

const AdListItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &.inactive {
    opacity: 0.5;
  }
`;

const AdManager = () => {
  const { currentUser } = useAuth();
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetInterests, setTargetInterests] = useState('');
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    setLoading(true);
    const data = await getAdvertisements();
    setAds(data);
    setLoading(false);
  };

  const handleCreateAd = async (e) => {
    e.preventDefault();
    if (!title || !currentUser) return;

    let imageUrl = null;
    if (imageFile) {
      imageUrl = await uploadAdImage(imageFile);
      if (!imageUrl) {
        alert('Failed to upload image.');
        return;
      }
    }

    const newAd = {
      user_id: currentUser.uid,
      title,
      content,
      image_url: imageUrl,
      target_interests: targetInterests.split(',').map(s => s.trim()).filter(Boolean),
    };

    const created = await createAdvertisement(newAd);
    if (created) {
      setAds([created, ...ads]);
      // Reset form
      setTitle('');
      setContent('');
      setTargetInterests('');
      setImageFile(null);
      e.target.reset();
    } else {
      alert('Failed to create advertisement.');
    }
  };

  const handleToggleActive = async (adId, currentStatus) => {
    const updated = await updateAdvertisement(adId, { is_active: !currentStatus });
    if (updated) {
      setAds(ads.map(ad => (ad.id === adId ? updated : ad)));
    } else {
      alert('Failed to update ad status.');
    }
  };

  if (loading) {
    return <p>Loading advertisements...</p>;
  }

  return (
    <AdManagerContainer>
      <h2>Create New Advertisement</h2>
      <AdForm onSubmit={handleCreateAd}>
        <input
          type="text"
          placeholder="Ad Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Ad Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <input
          type="text"
          placeholder="Target Interests (comma-separated, e.g., sports, music)"
          value={targetInterests}
          onChange={(e) => setTargetInterests(e.target.value)}
        />
        <label>
          Ad Image:
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
          />
        </label>
        <button type="submit">Create Ad</button>
      </AdForm>

      <h2>Existing Advertisements</h2>
      <AdList>
        {ads.map(ad => (
          <AdListItem key={ad.id} className={!ad.is_active ? 'inactive' : ''}>
            <div>
              <strong>{ad.title}</strong>
              <p>{ad.content}</p>
            </div>
            <button onClick={() => handleToggleActive(ad.id, ad.is_active)}>
              {ad.is_active ? 'Deactivate' : 'Activate'}
            </button>
          </AdListItem>
        ))}
      </AdList>
    </AdManagerContainer>
  );
};

export default AdManager;
