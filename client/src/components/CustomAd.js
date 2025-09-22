import React from 'react';
import styled from 'styled-components';

const AdWrapper = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
`;

const AdHeader = styled.h4`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const AdTitle = styled.h3`
  margin: 0 0 0.5rem 0;
`;

const AdContent = styled.p`
  margin: 0 0 1rem 0;
`;

const AdImage = styled.img`
  max-width: 100%;
  height: auto;
  border-radius: 8px;
`;

const CustomAd = ({ ad }) => {
  if (!ad) return null;

  return (
    <AdWrapper>
      <AdHeader>Sponsored</AdHeader>
      <AdTitle>{ad.title}</AdTitle>
      {ad.content && <AdContent>{ad.content}</AdContent>}
      {ad.image_url && <AdImage src={ad.image_url} alt={ad.title} />}
    </AdWrapper>
  );
};

export default CustomAd;
