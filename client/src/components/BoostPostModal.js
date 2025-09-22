import React from 'react';
import styled from 'styled-components';

const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  padding: 2rem;
  border-radius: 8px;
  max-width: 400px;
  text-align: center;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: bold;
`;

const ConfirmButton = styled(Button)`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
`;

const CancelButton = styled(Button)`
  background-color: ${({ theme }) => theme.colors.border};
`;

const BOOST_COST = 100; // Should match the Edge Function constant

const BoostPostModal = ({ isOpen, onClose, onConfirm, loading }) => {
  if (!isOpen) return null;

  return (
    <ModalBackdrop onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <h2>Boost this Post?</h2>
        <p>
          Boosting this post will make it more visible to other users for 7 days.
        </p>
        <p>
          The cost is <strong>{BOOST_COST} NGN</strong> from your wallet.
        </p>
        <ButtonGroup>
          <CancelButton onClick={onClose} disabled={loading}>
            Cancel
          </CancelButton>
          <ConfirmButton onClick={onConfirm} disabled={loading}>
            {loading ? 'Boosting...' : 'Confirm & Pay'}
          </ConfirmButton>
        </ButtonGroup>
      </ModalContent>
    </ModalBackdrop>
  );
};

export default BoostPostModal;
