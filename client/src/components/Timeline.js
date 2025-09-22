import React, { useState, useEffect } from 'react';
import { getTimeline, getAdvertisements } from '../services/supabaseService';
import Post from './Post';
import CustomAd from './CustomAd'; // Import the new CustomAd component

const Timeline = ({ userId }) => {
  const [feedItems, setFeedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeed = async () => {
      setLoading(true);

      // Fetch posts and ads in parallel
      const [postsData, adsData] = await Promise.all([
        getTimeline(userId),
        getAdvertisements() // This will only return active ads for non-admins due to RLS
      ]);

      // Add a 'type' property to each item for rendering
      const posts = postsData.map(p => ({ ...p, type: 'post' }));
      const ads = adsData.map(a => ({ ...a, type: 'ad' }));

      // Separate boosted posts from regular posts
      const boostedPosts = postsData.filter(p => p.is_boosted && new Date(p.boost_expires_at) > new Date());
      const regularPosts = postsData.filter(p => !p.is_boosted || new Date(p.boost_expires_at) <= new Date());

      // Sort each group by creation date
      boostedPosts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      regularPosts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      // Add type property
      const typedBoosted = boostedPosts.map(p => ({ ...p, type: 'post' }));
      const typedRegular = regularPosts.map(p => ({ ...p, type: 'post' }));
      const typedAds = adsData.map(a => ({ ...a, type: 'ad' }));

      // Construct the final feed
      // Start with boosted posts
      const finalFeed = [...typedBoosted];

      // Interleave regular posts and ads
      let adIndex = 0;
      for (let i = 0; i < typedRegular.length; i++) {
        finalFeed.push(typedRegular[i]);
        // Add an ad after every 4th regular post
        if ((i + 1) % 4 === 0 && adIndex < typedAds.length) {
          finalFeed.push(typedAds[adIndex]);
          adIndex++;
        }
      }

      // Add any remaining ads to the end
      while (adIndex < typedAds.length) {
        finalFeed.push(typedAds[adIndex++]);
      }

      setFeedItems(finalFeed);
      setLoading(false);
    };

    fetchFeed();
  }, [userId]);

  if (loading) {
    return <p>Loading timeline...</p>;
  }

  return (
    <div>
      {feedItems.length > 0 ? (
        feedItems.map((item) => {
          if (item.type === 'post') {
            return <Post key={`post-${item.id}`} post={item} />;
          } else if (item.type === 'ad') {
            return <CustomAd key={`ad-${item.id}`} ad={item} />;
          }
          return null;
        })
      ) : (
        <p>This user hasn't posted anything yet.</p>
      )}
    </div>
  );
};

export default Timeline;
