import React, { useContext, useState, useEffect } from 'react';
import { auth } from '../firebaseConfig';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  TwitterAuthProvider, // Import TwitterAuthProvider
  signInWithPopup,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink
} from 'firebase/auth';
import { getProfile, upsertProfile } from '../services/supabaseService';

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

/**
 * Provides authentication and user profile context to the application.
 * Manages Firebase authentication state and fetches the corresponding user profile from Supabase.
 */
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Signs up a new user with email and password.
   * @param {string} email
   * @param {string} password
   * @returns {Promise<UserCredential>}
   */
  function signup(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  /**
   * Logs in a user with email and password.
   * @param {string} email
   * @param {string} password
   * @returns {Promise<UserCredential>}
   */
  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  /**
   * Logs in a user with their Google account.
   * @returns {Promise<UserCredential>}
   */
  function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  }

  /**
   * Logs in a user with their Twitter account.
   * Note: Requires Twitter to be enabled as a sign-in method in Firebase.
   * @returns {Promise<UserCredential>}
   */
  function loginWithTwitter() {
    const provider = new TwitterAuthProvider();
    return signInWithPopup(auth, provider);
  }

  /**
   * Sends a passwordless sign-in link to the user's email.
   * @param {string} email
   * @param {object} actionCodeSettings - The URL configuration for the link.
   * @returns {Promise<void>}
   */
  function loginWithEmailLink(email, actionCodeSettings) {
    return sendSignInLinkToEmail(auth, email, actionCodeSettings);
  }

  /**
   * Confirms a user's identity using a sign-in link from their email.
   * @param {string} email
   * @param {string} url - The full sign-in link URL.
   * @returns {Promise<UserCredential>}
   */
  function confirmLoginWithEmailLink(email, url) {
      if (isSignInWithEmailLink(auth, url)) {
          return signInWithEmailLink(auth, email, url);
      }
      return Promise.reject(new Error("Invalid sign-in link."));
  }

  /**
   * Logs out the current user.
   * @returns {Promise<void>}
   */
  function logout() {
    setUserProfile(null); // Clear profile on logout
    return signOut(auth);
  }

  // Effect to listen for Firebase auth state changes and update the user context.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async user => {
      setCurrentUser(user);
      if (user) {
        // If user is logged in, fetch their Supabase profile
        const profile = await getProfile(user.uid);
        setUserProfile(profile);
      } else {
        // If user is logged out, clear the profile
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const updateUserProfile = async (updates) => {
    if (!currentUser) throw new Error("No user logged in to update profile.");

    // Call the service to persist changes to the database
    const { data, error } = await upsertProfile(currentUser.uid, updates);

    if (error) {
      // Handle the error appropriately in a real app (e.g., show a toast notification)
      console.error("Failed to update profile:", error);
      return { error };
    }

    // If successful, update the local state with the returned profile data
    setUserProfile(data);
    return { data };
  };

  const value = {
    currentUser,
    userProfile, // Expose profile in context
    updateUserProfile, // Expose the update function
    signup,
    login,
    loginWithGoogle,
    loginWithTwitter, // Expose Twitter login function
    loginWithEmailLink,
    confirmLoginWithEmailLink,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
