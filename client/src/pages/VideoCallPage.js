import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import VideoCall from '../components/VideoCall';

const VideoCallPage = () => {
  const { matchId } = useParams();
  const { currentUser } = useAuth();

  return (
    <div>
      <h1>Video Call</h1>
      <Link to="/matches">Back to Matches</Link>
      <VideoCall matchId={matchId} currentUser={currentUser} />
    </div>
  );
};

export default VideoCallPage;
