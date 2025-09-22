import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProfile, createOnfidoApplicant } from '../services/supabaseService';
import * as Onfido from 'onfido-sdk-ui';

const KYCPage = () => {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [onfidoInstance, setOnfidoInstance] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      const userProfile = await getProfile(currentUser.uid);
      setProfile(userProfile);
      setLoading(false);
    };
    loadProfile();
  }, [currentUser]);

  const startOnfidoVerification = async () => {
    setLoading(true);
    const data = await createOnfidoApplicant();
    if (data && data.sdkToken) {
      const onfido = Onfido.init({
        token: data.sdkToken,
        containerId: 'onfido-mount',
        onComplete: (data) => {
          console.log('Onfido verification complete:', data);
          alert('Verification submitted! We will notify you of the result.');
          // The webhook will handle the status update.
          onfido.tearDown();
        },
        steps: [
          'welcome',
          'document',
          'face',
          'complete'
        ],
      });
      setOnfidoInstance(onfido);
    } else {
      alert('Error starting verification. Please try again.');
    }
    setLoading(false);
  };

  if (loading && !profile) return <div>Loading...</div>;

  const kycStatus = profile?.kyc_status || 'not_started';

  return (
    <div className="app-container">
      <Link to="/">Back to Dashboard</Link>
      <h1>Identity Verification (KYC)</h1>

      <div className="card">
        <h3>Current Status: <span style={{ textTransform: 'capitalize', fontWeight: 'bold' }}>{kycStatus.replace('_', ' ')}</span></h3>

        {kycStatus === 'approved' && (
          <p style={{ color: 'green' }}>Your identity has been successfully verified. Thank you!</p>
        )}

        {kycStatus === 'pending' && (
          <p>Your identity verification is currently under review. This can take up to 48 hours.</p>
        )}

        {(kycStatus === 'not_started' || kycStatus === 'rejected') && (
          <div>
            {kycStatus === 'rejected' && <p style={{color: 'red'}}>Your previous submission was rejected. Please try again.</p>}
            <p>To get full access to all features, please complete our identity verification process powered by Onfido.</p>
            <button onClick={startOnfidoVerification} disabled={loading}>
              {loading ? 'Initializing...' : 'Start Verification'}
            </button>
          </div>
        )}
      </div>

      {/* Onfido SDK will mount its UI in this div */}
      <div id="onfido-mount" style={{marginTop: '20px'}}></div>
    </div>
  );
};

export default KYCPage;
