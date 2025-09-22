import React, { useState } from 'react';
import { reportUser } from '../services/supabaseService';
import { useAuth } from '../context/AuthContext';

const ReportModal = ({ reportedId, onClose }) => {
  const { currentUser } = useAuth();
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (reason.trim() === '') {
      setError('Please provide a reason for the report.');
      return;
    }
    setLoading(true);
    setError('');
    const result = await reportUser(currentUser.uid, reportedId, reason);
    setLoading(false);
    if (result) {
      alert('Report submitted successfully. Our team will review it.');
      onClose();
    } else {
      setError('Failed to submit report. Please try again.');
    }
  };

  return (
    <div style={{
      position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
      backgroundColor: 'white', padding: '20px', zIndex: 100, border: '1px solid black', borderRadius: '8px'
    }}>
      <h2>Report User</h2>
      <form onSubmit={handleSubmit}>
        <p>Please provide a reason for reporting this user:</p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
          style={{ width: '100%', minHeight: '100px' }}
        />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <div style={{ marginTop: '16px' }}>
          <button type="submit" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Report'}
          </button>
          <button onClick={onClose} style={{ marginLeft: '8px' }}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default ReportModal;
