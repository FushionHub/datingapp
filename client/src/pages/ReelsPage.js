import React from 'react';
import { Link } from 'react-router-dom';
import ReelsViewer from '../components/ReelsViewer';

const ReelsPage = () => {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px' }}>
        <Link to="/">Back to Dashboard</Link>
        <h1>Reels</h1>
        <Link to="/reels/upload">Upload Reel</Link>
      </div>
      <ReelsViewer />
    </div>
  );
};

export default ReelsPage;
