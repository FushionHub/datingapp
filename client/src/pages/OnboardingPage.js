import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { upsertProfile } from '../services/supabaseService';

const interestsList = [
  'Travel', 'Movies', 'Music', 'Foodie', 'Gaming', 'Reading', 'Hiking',
  'Cooking', 'Dancing', 'Art', 'Photography', 'Sports', 'Fitness', 'Yoga',
];

const OnboardingPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    username: '',
    gender: '',
    preferences: [],
    interests: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleNext = () => {
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Basic username validation: only letters, numbers, and underscores
    if (name === 'username' && value && !/^[a-zA-Z0-9_]+$/.test(value)) {
        setError('Username can only contain letters, numbers, and underscores.');
        return;
    }
    setError('');
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMultiSelectChange = (name, value) => {
    setFormData((prev) => {
      const currentValues = prev[name];
      if (currentValues.includes(value)) {
        return { ...prev, [name]: currentValues.filter((item) => item !== value) };
      } else {
        return { ...prev, [name]: [...currentValues, value] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (interests.length === 0) {
      setError('Please select at least one interest.');
      return;
    }
    setLoading(true);
    setError('');
    const profileData = {
      ...formData,
      onboarding_complete: true,
    };

    const result = await upsertProfile(currentUser.uid, profileData);

    setLoading(false);

    if (result.error) {
        if (result.error.message.includes('duplicate key value violates unique constraint "profiles_username_key"')) {
            setError('This username is already taken. Please choose another one.');
            setStep(3); // Go back to the username step
        } else {
            setError('An error occurred. Please try again.');
        }
    } else {
        navigate('/'); // Redirect to dashboard after successful onboarding
    }
  };

  const { username, gender, preferences, interests } = formData;

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
      <h1>Welcome to EpicDate!</h1>
      <p>Let's get your profile set up.</p>
      {error && <p style={{color: 'red'}}>{error}</p>}

      {step === 1 && (
        <div>
          <h2>Step 1: What's your gender?</h2>
          <div><label><input type="radio" name="gender" value="Man" checked={gender === 'Man'} onChange={handleChange} /> Man</label></div>
          <div><label><input type="radio" name="gender" value="Woman" checked={gender === 'Woman'} onChange={handleChange} /> Woman</label></div>
          <div><label><input type="radio" name="gender" value="Non-binary" checked={gender === 'Non-binary'} onChange={handleChange} /> Non-binary</label></div>
          <button onClick={handleNext} disabled={!gender}>Next</button>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2>Step 2: Who are you interested in?</h2>
          <div><label><input type="checkbox" checked={preferences.includes('Men')} onChange={() => handleMultiSelectChange('preferences', 'Men')} /> Men</label></div>
          <div><label><input type="checkbox" checked={preferences.includes('Women')} onChange={() => handleMultiSelectChange('preferences', 'Women')} /> Women</label></div>
          <div><label><input type="checkbox" checked={preferences.includes('Everyone')} onChange={() => handleMultiSelectChange('preferences', 'Everyone')} /> Everyone</label></div>
          <button onClick={handleBack}>Back</button>
          <button onClick={handleNext} disabled={preferences.length === 0}>Next</button>
        </div>
      )}

      {step === 3 && (
        <div>
            <h2>Step 3: Choose a unique username</h2>
            <input
                type="text"
                name="username"
                value={username}
                onChange={handleChange}
                placeholder="e.g., epic_user_123"
                required
                minLength="3"
            />
            <div style={{ marginTop: '20px' }}>
                <button onClick={handleBack}>Back</button>
                <button onClick={handleNext} disabled={!username || username.length < 3}>Next</button>
            </div>
        </div>
      )}

      {step === 4 && (
        <div>
          <h2>Step 4: What are your interests?</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {interestsList.map((interest) => (
              <button
                key={interest}
                onClick={() => handleMultiSelectChange('interests', interest)}
                style={{
                  padding: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  backgroundColor: interests.includes(interest) ? '#FF69B4' : 'white',
                  color: interests.includes(interest) ? 'white' : 'black',
                }}
              >
                {interest}
              </button>
            ))}
          </div>
          <div style={{ marginTop: '20px' }}>
            <button onClick={handleBack}>Back</button>
            <button onClick={handleSubmit} disabled={loading || interests.length === 0}>
              {loading ? 'Saving...' : 'Finish'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnboardingPage;
