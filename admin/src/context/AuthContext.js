import React, { useContext, useState, useEffect } from 'react';
import { auth as firebaseAuth } from '../firebaseConfig'; // Use the admin app's own firebase config
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { supabase } from '../supabaseClient';

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  async function login(email, password) {
    const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
    if (userCredential.user) {
        // After successful Firebase login, check if they are an admin in our DB
        const { data, error } = await supabase
            .from('admins')
            .select('*, role:admin_roles(role_name)')
            .eq('id', userCredential.user.uid)
            .single();

        if (error || !data) {
            await signOut(firebaseAuth); // Log them out of Firebase if not an admin
            throw new Error('You do not have permission to access the admin panel.');
        }

        // If they are an admin, the onAuthStateChanged listener will set the user
        // and we can set their admin status.
        return { ...userCredential.user, adminData: data };
    }
  }

  function logout() {
    setIsAdmin(false);
    return signOut(firebaseAuth);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
      if (user) {
        // Verify admin status on every auth state change for security
        const { data, error } = await supabase
            .from('admins')
            .select('*, role:admin_roles(role_name)')
            .eq('id', user.uid)
            .single();

        if (!error && data) {
            setCurrentUser({ ...user, adminData: data });
            setIsAdmin(true);
        } else {
            setCurrentUser(null);
            setIsAdmin(false);
        }
      } else {
        setCurrentUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    isAdmin,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
