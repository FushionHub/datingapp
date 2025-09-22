import React, { useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const LoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
`;

const LoginForm = styled.form`
  display: flex;
  flex-direction: column;
  width: 300px;
`;

const Input = styled.input`
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const Button = styled.button`
  padding: 10px;
  background-color: ${({ theme }) => theme.primary};
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:disabled {
    background-color: #ccc;
  }
`;

const GoogleButton = styled(Button)`
  background-color: #4285F4;
  margin-top: 10px;
`;

const TwitterButton = styled(Button)`
  background-color: #1DA1F2;
  margin-top: 10px;
`;

const Error = styled.p`
  color: red;
`;

const Message = styled.p`
  color: green;
`;

export default function Login() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const emailLinkRef = useRef();
  const { login, loginWithGoogle, loginWithTwitter, loginWithEmailLink } = useAuth();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setError('');
      setLoading(true);
      await login(emailRef.current.value, passwordRef.current.value);
      navigate('/');
    } catch {
      setError('Failed to log in. Check your email and password.');
    }

    setLoading(false);
  }

  async function handleTwitterLogin() {
    try {
      setError('');
      setLoading(true);
      await loginWithTwitter();
      navigate('/');
    } catch (e) {
      console.error(e);
      setError('Failed to log in with Twitter.');
    }
    setLoading(false);
  }

  async function handleEmailLinkSubmit(e) {
    e.preventDefault();
    const actionCodeSettings = {
      url: `${window.location.origin}/confirm-login`,
      handleCodeInApp: true,
    };

    try {
      setMessage('');
      setError('');
      setLoading(true);
      await loginWithEmailLink(emailLinkRef.current.value, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', emailLinkRef.current.value);
      setMessage('Check your email for the sign-in link!');
    } catch (e) {
      console.error(e);
      setError('Failed to send sign-in link.');
    }
    setLoading(false);
  }

  async function handleGoogleLogin() {
    try {
      setError('');
      setLoading(true);
      await loginWithGoogle();
      navigate('/');
    } catch (e) {
      console.error(e);
      setError('Failed to log in with Google.');
    }
    setLoading(false);
  }

  return (
    <LoginContainer>
      <h2>Log In</h2>
      {error && <Error>{error}</Error>}
      {message && <Message>{message}</Message>}
      <LoginForm onSubmit={handleSubmit}>
        <label>Email</label>
        <Input type="email" ref={emailRef} required />
        <label>Password</label>
        <Input type="password" ref={passwordRef} required />
        <Button disabled={loading} type="submit">
          Log In
        </Button>
      </LoginForm>
      <div style={{marginTop: '20px'}}>
        Or sign in with a link:
        <LoginForm onSubmit={handleEmailLinkSubmit}>
           <Input type="email" placeholder="Enter your email" ref={emailLinkRef} required />
           <Button disabled={loading} type="submit">Send Sign-In Link</Button>
        </LoginForm>
      </div>
      <hr />
      <GoogleButton disabled={loading} onClick={handleGoogleLogin}>
        Sign In with Google
      </GoogleButton>
      <TwitterButton disabled={loading} onClick={handleTwitterLogin}>
        Sign In with Twitter
      </TwitterButton>
      <div>
        Need an account? <Link to="/signup">Sign Up</Link>
      </div>
    </LoginContainer>
  );
}
