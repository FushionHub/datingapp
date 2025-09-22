import React, { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { upsertProfile } from '../services/supabaseService';

const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
`;

const ModalContent = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  padding: 2rem;
  border-radius: 8px;
  max-width: 450px;
  text-align: center;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: bold;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  margin-top: 1rem;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Input = styled.input`
    padding: 0.5rem;
    border-radius: 4px;
    border: 1px solid ${({ theme }) => theme.colors.border};
    margin-top: 1rem;
    width: 100%;
`;

const MIN_AGE = 18;

const AgeVerificationModal = ({ onVerified }) => {
  const { currentUser } = useAuth();
  const [birthDate, setBirthDate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const calculateAge = (dateString) => {
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!birthDate) {
      setError('Please enter your date of birth.');
      setLoading(false);
      return;
    }

    const age = calculateAge(birthDate);

    if (age < MIN_AGE) {
      setError(`You must be at least ${MIN_AGE} years old to use this service.`);
      setLoading(false);
      // In a real app, you might log the user out or block them here.
      alert(`You must be at least ${MIN_AGE} years old.`);
      return;
    }

    const { error: profileError } = await upsertProfile(currentUser.uid, { age: age });

    setLoading(false);

    if (profileError) {
      setError('Failed to save your age. Please try again.');
    } else {
      // Let the parent component know verification is complete
      onVerified(age);
    }
  };

  return (
    <ModalBackdrop>
      <ModalContent>
        <h2>Verify Your Age</h2>
        <p>Please enter your date of birth to continue. You must be at least {MIN_AGE} years old.</p>
        <form onSubmit={handleSubmit}>
          <Input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            max={new Date().toISOString().split("T")[0]} // User cannot select a future date
          />
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <Button type="submit" disabled={loading}>
            {loading ? 'Verifying...' : 'Submit'}
          </Button>
        </form>
      </ModalContent>
    </ModalBackdrop>
  );
};

export default AgeVerificationModal;
