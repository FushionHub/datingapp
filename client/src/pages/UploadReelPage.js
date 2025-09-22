import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { uploadReel } from '../services/supabaseService';

const UploadReelPage = () => {
  const { currentUser } = useAuth();
  const [videoFile, setVideoFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setVideoFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!videoFile) {
      setError('Please select a video file.');
      return;
    }
    setLoading(true);
    setError('');
    const result = await uploadReel(currentUser.uid, videoFile, caption);
    setLoading(false);
    if (result.success) {
      alert('Reel uploaded successfully!');
      navigate('/reels');
    } else {
      setError(result.error || 'Failed to upload reel.');
    }
  };

  return (
    <div>
      <Link to="/reels">Back to Reels</Link>
      <h1>Upload a New Reel</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Video File:
            <input type="file" accept="video/*" onChange={handleFileChange} required />
          </label>
        </div>
        <div style={{ margin: '16px 0' }}>
          <label>
            Caption:
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a caption..."
            />
          </label>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Uploading...' : 'Upload Reel'}
        </button>
      </form>
    </div>
  );
};

export default UploadReelPage;
