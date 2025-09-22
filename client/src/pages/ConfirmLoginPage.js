import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ConfirmLoginPage = () => {
  const { confirmLoginWithEmailLink, currentUser } = useAuth();
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const completeSignIn = async () => {
      const email = window.localStorage.getItem('emailForSignIn');
      if (!email) {
        setError('Could not find email for sign-in. Please try again from the login page.');
        return;
      }

      try {
        await confirmLoginWithEmailLink(email, window.location.href);
        window.localStorage.removeItem('emailForSignIn');
        // The onAuthStateChanged listener in AuthContext will handle the redirect
      } catch (err) {
        console.error(err);
        setError('Failed to sign in. The link may be invalid or expired.');
      }
    };

    completeSignIn();
  }, [confirmLoginWithEmailLink]);

  useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  return (
    <div>
      <h1>Confirming your login...</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <p>Please wait while we securely sign you in.</p>
    </div>
  );
};

export default ConfirmLoginPage;
