import React, { useState } from 'react';
import styled from 'styled-components';
import AdManager from '../components/AdManager';
import SiteSettings from '../components/SiteSettings';
import UserManagement from '../components/UserManagement';
import ListingManagement from '../components/ListingManagement';

const AdminPageContainer = styled.div`
  padding: 2rem;
  max-width: 900px;
  margin: 0 auto;
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const TabButton = styled.button`
  padding: 1rem;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 1.1rem;
  color: ${({ theme, active }) => (active ? theme.colors.primary : theme.colors.text)};
  border-bottom: 2px solid ${({ theme, active }) => (active ? theme.colors.primary : 'transparent')};
`;

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('users');

  return (
    <AdminPageContainer>
      <h1>Admin Dashboard</h1>

      <TabContainer>
        <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')}>
          User Management
        </TabButton>
        <TabButton active={activeTab === 'listings'} onClick={() => setActiveTab('listings')}>
          Listing Management
        </TabButton>
        <TabButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')}>
          Site Settings
        </TabButton>
        <TabButton active={activeTab === 'ads'} onClick={() => setActiveTab('ads')}>
          Ad Management
        </TabButton>
      </TabContainer>

      <div>
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'listings' && <ListingManagement />}
        {activeTab === 'settings' && <SiteSettings />}
        {activeTab === 'ads' && <AdManager />}
      </div>
    </AdminPageContainer>
  );
};

export default AdminPage;
