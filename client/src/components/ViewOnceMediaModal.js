import React from 'react';
import styled from 'styled-components';

const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
`;

const ModalContent = styled.div`
  max-width: 90vw;
  max-height: 90vh;
`;

const Media = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
`;

const ViewOnceMediaModal = ({ isOpen, onClose, mediaUrl, mediaType }) => {
  if (!isOpen) return null;

  return (
    <ModalBackdrop onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        {mediaType === 'image' && <Media src={mediaUrl} alt="View-once content" />}
        {mediaType === 'video' && <Media as="video" src={mediaUrl} controls autoPlay />}
      </ModalContent>
    </ModalBackdrop>
  );
};

export default ViewOnceMediaModal;
