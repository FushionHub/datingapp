import React from 'react';
import { likeUser } from '../services/supabaseService';

const UserProfileCard = ({ profile }) => {

  const handleLike = async () => {
    const result = await likeUser(profile.id);
    if (result) {
      if (result.matched) {
        alert(`It's a match!`);
      } else {
        alert(`You liked ${profile.name}!`);
      }
    } else {
      alert('There was an error liking this user.');
    }
  };

  const cardStyle = {
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-bg-secondary)',
    borderRadius: '8px',
    padding: '16px',
    margin: '16px',
    maxWidth: '300px',
    textAlign: 'center'
  };

  const imageStyle = {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
    borderRadius: '4px'
  };

  return (
    <div style={cardStyle}>
      <img
        src={profile.photos && profile.photos.length > 0 ? profile.photos[0] : 'https://via.placeholder.com/150'}
        alt={profile.name}
        style={imageStyle}
      />
      <h3>{profile.name}, {profile.age}</h3>
      <p>{profile.bio}</p>
      <p><strong>Interests:</strong> {profile.interests ? profile.interests.join(', ') : 'N/A'}</p>
      {profile.is_verified && <p style={{ color: 'green' }}>Verified ✔</p>}
      <button onClick={handleLike}>Like</button>
      <a href={`/profile/${profile.id}`} style={{marginLeft: '8px'}}>View Profile</a>
    </div>
  );
};

export default UserProfileCard;
