import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

const Verification = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleVerification = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // In a real application, you would use the camera to get a live image.
      // For this placeholder, we will simulate this by using a fake base64 image.
      // This allows us to test the backend function.
      // TODO: Replace this with actual camera capture logic.
      const fakeLiveImageBase64 = "R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs="; // A 1x1 black pixel GIF

      const { data, error } = await supabase.functions.invoke('verify-face', {
        body: { liveImage: fakeLiveImageBase64 },
      });

      if (error) {
        throw error;
      }

      setResult(data);

    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Profile Verification</h2>
      <p>Click the button below to start the face verification process.</p>
      <p>
        (Note: This is a placeholder. In a real app, this would open your camera.)
      </p>
      <button onClick={handleVerification} disabled={loading}>
        {loading ? 'Verifying...' : 'Start Verification'}
      </button>

      {result && (
        <div>
          <h3>Verification Result:</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}

      {error && (
        <div>
          <h3 style={{color: 'red'}}>Error:</h3>
          <p style={{color: 'red'}}>{error}</p>
        </div>
      )}
    </div>
  );
};

export default Verification;
