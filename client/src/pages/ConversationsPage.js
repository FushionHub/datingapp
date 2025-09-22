import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMatches, getGroupsForUser } from '../services/supabaseService';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const PageContainer = styled.div`
  padding: 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const CreateGroupButton = styled(Link)`
  padding: 0.75rem 1.5rem;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  text-decoration: none;
  border-radius: 4px;
`;

const ConversationList = styled.ul`
  list-style: none;
  padding: 0;
`;

const ConversationItem = styled.li`
  display: flex;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:hover {
    background-color: ${({ theme }) => theme.colors.backgroundLight};
  }
`;

const Avatar = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 1rem;
`;

const ConversationsPage = () => {
  const { currentUser } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    const loadConversations = async () => {
      setLoading(true);
      const [matchesData, groupsData] = await Promise.all([
        getMatches(currentUser.uid),
        getGroupsForUser(currentUser.uid)
      ]);

      const privateChats = matchesData.map(match => ({
        id: match.match_id,
        type: 'private',
        name: match.other_user.name,
        avatar: match.other_user.photo || 'https://via.placeholder.com/50'
      }));

      const groupChats = groupsData.map(group => ({
        id: group.id,
        type: 'group',
        name: group.name,
        avatar: group.avatar_url || 'https://via.placeholder.com/50'
      }));

      // We can add sorting logic here later, e.g., by last message timestamp
      setConversations([...privateChats, ...groupChats]);
      setLoading(false);
    };

    loadConversations();
  }, [currentUser]);

  if (loading) {
    return <PageContainer>Loading conversations...</PageContainer>;
  }

  return (
    <PageContainer>
      <Header>
        <h2>Conversations</h2>
        <CreateGroupButton to="/groups/new">Create Group</CreateGroupButton>
      </Header>

      {conversations.length > 0 ? (
        <ConversationList>
          {conversations.map(convo => (
            <Link to={`/chat/${convo.type}/${convo.id}`} key={`${convo.type}-${convo.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <ConversationItem>
                <Avatar src={convo.avatar} alt={convo.name} />
                <span>{convo.name}</span>
              </ConversationItem>
            </Link>
          ))}
        </ConversationList>
      ) : (
        <p>You have no conversations yet. Find a match or create a group!</p>
      )}
    </PageContainer>
  );
};

export default ConversationsPage;
