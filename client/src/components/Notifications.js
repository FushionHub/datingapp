import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchToken, onMessageListener } from '../firebaseConfig';
import { saveFCMToken } from '../services/supabaseService';

// A simple toast notification component
const Toast = ({ title, body, onClose }) => (
  <div style={{
    position: 'fixed', top: '20px', right: '20px',
    backgroundColor: 'white', padding: '16px', zIndex: 200,
    border: '1px solid black', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
  }}>
    <h4>{title}</h4>
    <p>{body}</p>
    <button onClick={onClose}>Close</button>
  </div>
);

const Notifications = () => {
  const { currentUser } = useAuth();
  const [show, setShow] = useState(false);
  const [notification, setNotification] = useState({ title: '', body: '' });

  useEffect(() => {
    const requestPermission = async () => {
      if (currentUser) {
        const token = await fetchToken();
        if (token) {
          // Save the token to your database
          await saveFCMToken(currentUser.uid, token);
        }
      }
    };

    requestPermission();
  }, [currentUser]);

  useEffect(() => {
    onMessageListener()
      .then((payload) => {
        setShow(true);
        setNotification({
          title: payload.notification.title,
          body: payload.notification.body,
        });
        console.log(payload);
      })
      .catch((err) => console.log('failed: ', err));
  }, []);

  if (!show) {
    return null;
  }

  return (
    <Toast
      title={notification.title}
      body={notification.body}
      onClose={() => setShow(false)}
    />
  );
};

export default Notifications;
