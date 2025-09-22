import React, { useState, useEffect } from 'react';
import { getGiftTypes, sendGift, transferFunds } from '../services/supabaseService';

const GiftModal = ({ receiverId, onClose }) => {
  const [giftTypes, setGiftTypes] = useState([]);
  const [selectedGift, setSelectedGift] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mode, setMode] = useState('gift'); // 'gift' or 'transfer'
  const [amount, setAmount] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchGifts = async () => {
      const gifts = await getGiftTypes();
      setGiftTypes(gifts);
      setLoading(false);
    };
    fetchGifts();
  }, []);

  const handleSendGift = async () => {
    if (!selectedGift) {
      setError('Please select a gift.');
      return;
    }
    setLoading(true);
    setError('');
    // Note: The original `sendGift` function seems to be missing from the latest schema.
    // Assuming a similar RPC function `send_gift` exists.
    const result = await sendGift(receiverId, selectedGift.id);
    setLoading(false);
    if (result && result.success) {
      setSuccess('Gift sent successfully!');
      setTimeout(() => onClose(), 2000);
    } else {
      setError(result.error || 'Failed to send gift. You may have insufficient funds.');
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const numericAmount = parseFloat(amount);

    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Please enter a valid amount.');
      return;
    }

    setLoading(true);
    const result = await transferFunds(receiverId, numericAmount, 'NGN'); // Assuming NGN
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(result.message || 'Transfer successful!');
      setAmount('');
      setTimeout(() => onClose(), 2000);
    }
  };

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <button onClick={() => setMode('gift')} style={mode === 'gift' ? activeTabStyle : tabStyle}>Send Gift</button>
          <button onClick={() => setMode('transfer')} style={mode === 'transfer' ? activeTabStyle : tabStyle}>Transfer Funds</button>
        </div>

        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
        {success && <p style={{ color: 'green', textAlign: 'center' }}>{success}</p>}

        {mode === 'gift' && (
          <div>
            <h2>Send a Gift</h2>
            {loading ? <p>Loading gifts...</p> : (
              <div style={{ display: 'flex', gap: '10px', margin: '20px 0', flexWrap: 'wrap' }}>
                {giftTypes.map(gift => (
                  <div
                    key={gift.id}
                    onClick={() => setSelectedGift(gift)}
                    style={{
                      border: selectedGift && selectedGift.id === gift.id ? '2px solid #8A2BE2' : '1px solid #ccc',
                      padding: '10px', cursor: 'pointer', borderRadius: '5px'
                    }}
                  >
                    <p>{gift.name}</p>
                    <p>Cost: {gift.cost} NGN</p>
                  </div>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
               <button onClick={onClose} disabled={loading}>Cancel</button>
               <button onClick={handleSendGift} disabled={loading || !selectedGift}>
                {loading ? 'Sending...' : 'Send Gift'}
              </button>
            </div>
          </div>
        )}

        {mode === 'transfer' && (
          <div>
            <h2>Transfer Funds</h2>
            <form onSubmit={handleTransfer}>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount (e.g., 500)"
                style={{ width: '100%', padding: '10px', boxSizing: 'border-box', marginBottom: '10px' }}
                required
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                <button type="button" onClick={onClose} disabled={loading}>Cancel</button>
                <button type="submit" disabled={loading}>
                  {loading ? 'Sending...' : 'Transfer Funds'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

// Basic styles - can be moved to a separate CSS file or styled-components
const modalOverlayStyle = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  display: 'flex', justifyContent: 'center', alignItems: 'center',
  zIndex: 1000,
};

const modalContentStyle = {
  backgroundColor: 'white', padding: '20px', borderRadius: '8px',
  width: '90%', maxWidth: '500px', color: 'black',
};

const tabStyle = {
  padding: '10px 20px',
  cursor: 'pointer',
  border: '1px solid #ccc',
  backgroundColor: '#f0f0f0',
  borderBottom: 'none',
};

const activeTabStyle = {
  ...tabStyle,
  backgroundColor: 'white',
  borderBottom: '1px solid white',
};

export default GiftModal;
