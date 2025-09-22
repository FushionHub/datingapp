import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

import Signup from './components/Signup';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Verification from './components/Verification';
import ConversationsPage from './pages/ConversationsPage';
import ProfilePage from './pages/ProfilePage';
import ChatPage from './pages/ChatPage';
import SubscriptionPage from './pages/SubscriptionPage';
import WalletPage from './pages/WalletPage';
import Notifications from './components/Notifications';
import CallManager from './components/CallManager';
import PrivacySettingsPage from './pages/PrivacySettingsPage';
import ConfirmLoginPage from './pages/ConfirmLoginPage';
import EmailSettingsPage from './pages/EmailSettingsPage';
import KYCPage from './pages/KYCPage';
import AdminPage from './pages/AdminPage';
import FindFriendsPage from './pages/FindFriendsPage';
import ReelsPage from './pages/ReelsPage';
import UploadReelPage from './pages/UploadReelPage';
import MarketplacePage from './pages/MarketplacePage';
import CreateListingPage from './pages/CreateListingPage';
import ListingDetailPage from './pages/ListingDetailPage';
import CreateGroupPage from './pages/CreateGroupPage';

import { useAuth } from './context/AuthContext';
import { useSettings, SettingsProvider } from './context/SettingsContext';
import AgeVerificationModal from './components/AgeVerificationModal';

const AppContent = () => {
  const { userProfile, updateUserProfile } = useAuth();
  const { settings } = useSettings();
  const [showAgeModal, setShowAgeModal] = useState(false);

  useEffect(() => {
    if (settings) {
      document.title = settings.appName || 'App';

      let descriptionMeta = document.querySelector('meta[name="description"]');
      if (descriptionMeta) {
        descriptionMeta.setAttribute('content', settings.seoDescription || '');
      }

      // You can also add/update other meta tags like keywords
    }
  }, [settings]);

  useEffect(() => {
    // Show the modal if the user is logged in but has no age set
    if (userProfile && !userProfile.age) {
      setShowAgeModal(true);
    }
  }, [userProfile]);

  const handleAgeVerified = (age) => {
    updateUserProfile({ age });
    setShowAgeModal(false);
  };

  return (
    <>
      {showAgeModal && <AgeVerificationModal onVerified={handleAgeVerified} />}
      <Router>
        <Notifications />
        <CallManager />
        <Routes>
          {/* Public Routes */}
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/confirm-login" element={<ConfirmLoginPage />} />

          {/* Private Routes */}
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/verify" element={<ProtectedRoute><Verification /></ProtectedRoute>} />
          <Route path="/conversations" element={<ProtectedRoute><ConversationsPage /></ProtectedRoute>} />
          <Route path="/chat/:conversationType/:conversationId" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
          <Route path="/profile/:userId" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/subscriptions" element={<ProtectedRoute><SubscriptionPage /></ProtectedRoute>} />
          <Route path="/wallet" element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />
          <Route path="/settings/privacy" element={<ProtectedRoute><PrivacySettingsPage /></ProtectedRoute>} />
          <Route path="/settings/email" element={<ProtectedRoute><EmailSettingsPage /></ProtectedRoute>} />
          <Route path="/verify-identity" element={<ProtectedRoute><KYCPage /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />

          {/* Feature Routes */}
          <Route path="/find-friends" element={<ProtectedRoute><FindFriendsPage /></ProtectedRoute>} />
          <Route path="/reels" element={<ProtectedRoute><ReelsPage /></ProtectedRoute>} />
          <Route path="/reels/upload" element={<ProtectedRoute><UploadReelPage /></ProtectedRoute>} />

          {/* Marketplace Routes */}
          <Route path="/marketplace" element={<ProtectedRoute><MarketplacePage /></ProtectedRoute>} />
          <Route path="/marketplace/new" element={<ProtectedRoute><CreateListingPage /></ProtectedRoute>} />
          <Route path="/listing/:listingId" element={<ProtectedRoute><ListingDetailPage /></ProtectedRoute>} />

          {/* Group Chat Routes */}
          <Route path="/groups/new" element={<ProtectedRoute><CreateGroupPage /></ProtectedRoute>} />
        </Routes>
      </Router>
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <SettingsProvider>
          <AppContent />
        </SettingsProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
