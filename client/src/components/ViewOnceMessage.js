import React, { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { markMessageAsViewed } from '../services/supabaseService';
import ViewOnceMediaModal from './ViewOnceMediaModal';

const ViewOnceWrapper = styled.div`
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 18px;
  background-color: #eee;
  color: #333;
  cursor: pointer;

  &.opened {
    background-color: #f5f5f5;
    color: #aaa;
    cursor: not-allowed;
  }
`;

const ViewOnceMessage = ({ message }) => {
  const { currentUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Local state to immediately reflect that the message was opened
  const [isOpened, setIsOpened] = useState(message.is_viewed);

  const isSender = message.sender_id === currentUser.uid;

  const handleViewClick = async () => {
    if (isSender || isOpened) return; // Sender can't open, can't re-open

    // Mark as viewed on the backend
    await markMessageAsViewed(message.id);
    setIsOpened(true);
    setIsModalOpen(true);
  };

  const getButtonText = () => {
    if (isSender) {
        return `You sent a view-once ${message.message_type}`;
    }
    if (isOpened) {
        return `Opened ${message.message_type}`;
    }
    return `Tap to view ${message.message_type}`;
  }

  return (
    <>
      <ViewOnceMediaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mediaUrl={message.media_url}
        mediaType={message.message_type}
      />
      <ViewOnceWrapper
        onClick={handleViewClick}
        className={(isSender || isOpened) ? 'opened' : ''}
      >
        {getButtonText()}
      </ViewOnceWrapper>
    </>
  );
};

export default ViewOnceMessage;
