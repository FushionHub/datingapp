import React, { useEffect } from 'react';
import styled from 'styled-components';

const AdContainer = styled.div`
  display: block;
  margin: 1rem 0;
  text-align: center;
`;

const AdSenseAd = ({ adSlot, adFormat = 'auto', adResponsive = 'true' }) => {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }, []);

  // Note: The ad will only appear on a deployed site with a valid AdSense account and publisher ID.
  // It will likely appear as a blank space in a local development environment.
  return (
    <AdContainer>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // IMPORTANT: Replace with your real publisher ID
        data-ad-slot={adSlot} // The specific ad unit ID
        data-ad-format={adFormat}
        data-full-width-responsive={adResponsive}
      ></ins>
    </AdContainer>
  );
};

export default AdSenseAd;
