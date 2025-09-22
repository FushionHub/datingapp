import React from 'react';

const IncomingCallModal = ({ caller, onAccept, onDecline }) => {
  return (
    <div style={{
      position: 'fixed', top: '20px', right: '20px',
      backgroundColor: 'white', padding: '20px', zIndex: 1000,
      border: '1px solid black', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
    }}>
      <h3>Incoming Call...</h3>
      <p>
        <strong>{caller.name}</strong> is calling you.
      </p>
      <img
        src={caller.photos && caller.photos.length > 0 ? caller.photos[0] : 'https://via.placeholder.com/100'}
        alt={caller.name}
        style={{ width: '100px', height: '100px', borderRadius: '50%' }}
      />
      <div style={{ marginTop: '20px' }}>
        <button onClick={onAccept} style={{ backgroundColor: 'green', color: 'white', marginRight: '10px' }}>
          Accept
        </button>
        <button onClick={onDecline} style={{ backgroundColor: 'red', color: 'white' }}>
          Decline
        </button>
      </div>
    </div>
  );
};

export default IncomingCallModal;
