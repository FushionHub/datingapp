import React from 'react';

const OutgoingCallModal = ({ callee, onCancel }) => {
  return (
    <div style={{
      position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
      backgroundColor: 'white', padding: '20px', zIndex: 1000,
      border: '1px solid black', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
    }}>
      <h3>Calling {callee.name}...</h3>
      <img
        src={callee.photos && callee.photos.length > 0 ? callee.photos[0] : 'https://via.placeholder.com/100'}
        alt={callee.name}
        style={{ width: '100px', height: '100px', borderRadius: '50%' }}
      />
      <div style={{ marginTop: '20px' }}>
        <button onClick={onCancel} style={{ backgroundColor: 'red', color: 'white' }}>
          Cancel Call
        </button>
      </div>
    </div>
  );
};

export default OutgoingCallModal;
