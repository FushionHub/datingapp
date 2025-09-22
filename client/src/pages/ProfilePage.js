import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getProfile,
  getReceivedGifts,
  getFollowerCount,
  getFollowingCount,
  isFollowing,
  followUser,
  unfollowUser,
  blockUser,
  getRingtones,
  updateRingtonePreference
} from '../services/supabaseService';
import CreatePostForm from '../components/CreatePostForm';
import Timeline from '../components/Timeline';
import GiftModal from '../components/GiftModal';
import ReportModal from '../components/ReportModal';
import TransferModal from '../components/TransferModal';

const ProfilePage = () => {
  const { userId } = useParams();
  const { currentUser } = useAuth();
  // ... (all the existing state hooks)
  const [profile, setProfile] = useState(null);
  const [gifts, setGifts] = useState([]);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowingUser, setIsFollowingUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [ringtones, setRingtones] = useState([]);
  const [selectedRingtone, setSelectedRingtone] = useState('');

  useEffect(() => {
    // ... (existing useEffect logic)
    setIsOwnProfile(currentUser.uid === userId);

    const fetchProfileData = async () => {
      setLoading(true);
      const userProfile = await getProfile(userId);
      setProfile(userProfile);
      setSelectedRingtone(userProfile.ringtone_id || '');

      const availableRingtones = await getRingtones();
      setRingtones(availableRingtones);

      const receivedGifts = await getReceivedGifts(userId);
      setGifts(receivedGifts);
      const followers = await getFollowerCount(userId);
      setFollowerCount(followers);
      const following = await getFollowingCount(userId);
      setFollowingCount(following);
      if (currentUser.uid !== userId) {
        const followingStatus = await isFollowing(currentUser.uid, userId);
        setIsFollowingUser(followingStatus);
      }
      setLoading(false);
    };

    fetchProfileData();
  }, [userId, currentUser]);

  // ... (all the existing handler functions)
  const handleFollow = async () => {
    await followUser(currentUser.uid, userId);
    setIsFollowingUser(true);
    setFollowerCount(followerCount + 1);
  };

  const handleUnfollow = async () => {
    await unfollowUser(currentUser.uid, userId);
    setIsFollowingUser(false);
    setFollowerCount(followerCount - 1);
  };

  const handleBlock = async () => {
    if (window.confirm(`Are you sure you want to block ${profile.name}? This action cannot be undone.`)) {
      await blockUser(currentUser.uid, userId);
      alert(`${profile.name} has been blocked.`);
      window.location.href = '/';
    }
  };

  const handlePostCreated = () => {
    window.location.reload();
  };

  const handleRingtoneChange = async (e) => {
    const ringtoneId = e.target.value;
    setSelectedRingtone(ringtoneId);
    await updateRingtonePreference(currentUser.uid, ringtoneId);
    alert('Ringtone updated!');
  };


  if (loading) return <div>Loading profile...</div>;
  if (!profile) return <div>Profile not found.</div>;

  return (
    <div className="app-container">
      {showGiftModal && <GiftModal receiverId={userId} onClose={() => setShowGiftModal(false)} />}
      {showReportModal && <ReportModal reportedId={userId} onClose={() => setShowReportModal(false)} />}
      {showTransferModal && <TransferModal receiverId={userId} onClose={() => setShowTransferModal(false)} />}
      <Link to="/">Back to Dashboard</Link>

      <div className="card" style={{ textAlign: 'center', marginTop: '20px' }}>
        <img
          src={profile.photos && profile.photos.length > 0 ? profile.photos[0] : 'https://via.placeholder.com/150'}
          alt={profile.name}
          style={{ width: '150px', height: '150px', borderRadius: '50%' }}
        />
        <h1>{profile.name} {profile.is_verified && <span style={{ color: 'green' }}>✔</span>}</h1>
        <p>Followers: {followerCount} | Following: {followingCount}</p>
        <p>KYC Status: <span style={{fontWeight: 'bold'}}>{profile.kyc_status}</span></p>
        {profile.kyc_status !== 'approved' && <Link to="/verify-identity">Verify Your Identity</Link>}
        <p>Profile Score: {profile.profile_score || 0}</p>
        <p>Tier: {profile.subscription_tier}</p>
        <p>Age: {profile.age}</p>
        <p>Bio: {profile.bio}</p>
        <p>Interests: {profile.interests ? profile.interests.join(', ') : ''}</p>
        {!isOwnProfile ? (
          <div>
            {isFollowingUser ? (
              <button onClick={handleUnfollow}>Unfollow</button>
            ) : (
              <button onClick={handleFollow}>Follow</button>
            )}
            <button onClick={() => setShowGiftModal(true)} style={{marginLeft: '8px'}}>Send Gift</button>
            <button onClick={() => setShowTransferModal(true)} style={{marginLeft: '8px'}}>Transfer Funds</button>
            <button onClick={handleBlock} style={{marginLeft: '8px', backgroundColor: '#f44336', color: 'white'}}>Block</button>
            <button onClick={() => setShowReportModal(true)} style={{marginLeft: '8px'}}>Report</button>
          </div>
        ) : (
          <div className="card" style={{marginTop: '20px'}}>
            <h3>Settings</h3>
            <label htmlFor="ringtone-select">Call Ringtone: </label>
            <select id="ringtone-select" value={selectedRingtone} onChange={handleRingtoneChange}>
              {ringtones.map(ringtone => (
                <option key={ringtone.id} value={ringtone.id}>{ringtone.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="card">
        <h3>Gifts Received</h3>
        {gifts.length > 0 ? (
          <ul>
            {gifts.map(gift => (
              <li key={gift.id}>
                Received a {gift.gift.name} from {gift.sender.name}
              </li>
            ))}
          </ul>
        ) : (
          <p>No gifts received yet.</p>
        )}
      </div>

      <div className="card">
        <h2>Timeline</h2>
        {isOwnProfile && <CreatePostForm onPostCreated={handlePostCreated} />}
        <Timeline userId={userId} />
      </div>
    </div>
  );
};

export default ProfilePage;
