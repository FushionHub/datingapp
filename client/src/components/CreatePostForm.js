import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { createPost, uploadPostImage } from '../services/supabaseService';

const CreatePostForm = ({ onPostCreated }) => {
  const { currentUser } = useAuth();
  const [textContent, setTextContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!textContent && !imageFile) {
      setError('A post must have either text or an image.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let imageUrl = null;
      if (imageFile) {
        imageUrl = await uploadPostImage(currentUser.uid, imageFile);
        if (!imageUrl) {
          throw new Error('Image upload failed.');
        }
      }

      await createPost(currentUser.uid, textContent, imageUrl);

      // Reset form and notify parent component
      setTextContent('');
      setImageFile(null);
      if (onPostCreated) {
        onPostCreated();
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ border: '1px solid #eee', padding: '16px', borderRadius: '8px' }}>
      <h4>Create a New Post</h4>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <textarea
        placeholder="What's on your mind?"
        value={textContent}
        onChange={(e) => setTextContent(e.target.value)}
        style={{ width: '100%', minHeight: '80px', marginBottom: '8px' }}
      />
      <label>
        Add an image:
        <input type="file" accept="image/*" onChange={handleImageChange} style={{ marginBottom: '8px' }} />
      </label>
      <button type="submit" disabled={loading}>
        {loading ? 'Posting...' : 'Create Post'}
      </button>
    </form>
  );
};

export default CreatePostForm;
