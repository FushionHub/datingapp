import React, { useState, useEffect, useRef } from 'react';
import { getReels, likeReel, postReelComment } from '../services/supabaseService';
import { useAuth } from '../context/AuthContext';

const ReelsViewer = () => {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const containerRef = useRef(null);

  useEffect(() => {
    const loadReels = async () => {
      const allReels = await getReels();
      setReels(allReels);
      setLoading(false);
    };
    loadReels();
  }, []);

  const handleLike = async (reelId) => {
    await likeReel(currentUser.uid, reelId);
    // In a real app, you'd update the like count in the state
    alert('Liked reel!');
  };

  const handleComment = async (reelId) => {
    const comment = prompt('Enter your comment:');
    if (comment) {
      await postReelComment(currentUser.uid, reelId, comment);
      // In a real app, you'd refresh the comments for the reel
      alert('Comment posted!');
    }
  };

  if (loading) return <div>Loading Reels...</div>;

  return (
    <div ref={containerRef} style={{
      height: '80vh',
      width: '100%',
      maxWidth: '400px',
      margin: 'auto',
      overflowY: 'scroll',
      scrollSnapType: 'y mandatory',
      border: '1px solid black'
    }}>
      {reels.map(reel => (
        <div key={reel.id} style={{
          height: '100%',
          scrollSnapAlign: 'start',
          position: 'relative',
          backgroundColor: 'black'
        }}>
          <video src={reel.video_url} autoPlay loop muted style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          <div style={{ position: 'absolute', bottom: '20px', left: '20px', color: 'white', textShadow: '1px 1px 2px black' }}>
            <strong>{reel.author.name}</strong>
            <p>{reel.caption}</p>
          </div>
          <div style={{ position: 'absolute', bottom: '20px', right: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <button onClick={() => handleLike(reel.id)}>❤️ Like</button>
            <button onClick={() => handleComment(reel.id)}>💬 Comment</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReelsViewer;
