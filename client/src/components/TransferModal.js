import React, { useState } from 'react';
import { transferFunds } from '../services/supabaseService';

const TransferModal = ({ receiverId, onClose }) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const numericAmount = parseFloat(amount);

    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Please enter a valid amount.');
      return;
    }

    setLoading(true);
    // Assuming NGN currency for now
    const result = await transferFunds(receiverId, numericAmount, 'NGN');
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess('Transfer successful!');
      setAmount('');
      // Optionally, close the modal after a delay
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  };

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        <h2>Transfer Funds</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'green' }}>{success}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount (NGN)"
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            required
          />
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
            <button type="button" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" disabled={loading}>
              {loading ? 'Sending...' : 'Send Funds'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
};

const modalContentStyle = {
  backgroundColor: 'white',
  padding: '20px',
  borderRadius: '8px',
  width: '90%',
  maxWidth: '400px',
  color: 'black', // Explicitly set text color for the modal content
};

export default TransferModal;
