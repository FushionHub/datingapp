import React, { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import BoostPostModal from './BoostPostModal'; // Import the modal
import { boostPost } from '../services/supabaseService'; // Import the service

const PostContainer = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  background-color: ${({ theme }) => theme.colors.background};
`;

const PostHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
`;

const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 0.75rem;
`;

const AuthorInfo = styled.div`
  strong {
    display: block;
  }
  p {
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 0.8rem;
    margin: 0;
  }
`;

const PostContent = styled.p`
  margin: 0 0 1rem 0;
`;

const PostImage = styled.img`
  max-width: 100%;
  border-radius: 8px;
`;

const PostFooter = styled.div`
  margin-top: 1rem;
  padding-top: 0.5rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const BoostButton = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;

  &:disabled {
    background-color: ${({ theme }) => theme.colors.textSecondary};
    cursor: not-allowed;
  }
`;

const BoostedLabel = styled.span`
  color: ${({ theme }) => theme.colors.primary};
  font-weight: bold;
  font-size: 0.9rem;
`;

const Post = ({ post: initialPost }) => {
  const { currentUser } = useAuth();
  // Use state for the post so we can update it after boosting
  const [post, setPost] = useState(initialPost);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBoosting, setIsBoosting] = useState(false);

  const isOwnPost = currentUser && currentUser.uid === post.user_id;

  const handleConfirmBoost = async () => {
    setIsBoosting(true);
    const result = await boostPost(post.id);
    setIsBoosting(false);

    if (result.success) {
      alert('Post boosted successfully!');
      // Optimistically update the UI. A full solution might involve refetching the timeline.
      const boost_expires_at = new Date();
      boost_expires_at.setDate(boost_expires_at.getDate() + 7);
      setPost({ ...post, is_boosted: true, boost_expires_at: boost_expires_at.toISOString() });
      setIsModalOpen(false);
    } else {
      alert(`Failed to boost post: ${result.error}`);
    }
  };

  return (
    <>
      <BoostPostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmBoost}
        loading={isBoosting}
      />
      <PostContainer>
        <PostHeader>
          <Avatar
            src={post.author.photos && post.author.photos.length > 0 ? post.author.photos[0] : 'https://via.placeholder.com/40'}
            alt={post.author.name}
          />
          <AuthorInfo>
            <strong>{post.author.name}</strong>
            <p>{new Date(post.created_at).toLocaleString()}</p>
          </AuthorInfo>
        </PostHeader>
        {post.text_content && <PostContent>{post.text_content}</PostContent>}
        {post.image_url && (
          <PostImage
            src={post.image_url}
            alt="Post content"
          />
        )}

        {isOwnPost && (
          <PostFooter>
            {post.is_boosted ? (
              <BoostedLabel>
                Boosted until {new Date(post.boost_expires_at).toLocaleDateString()}
              </BoostedLabel>
            ) : (
              <BoostButton onClick={() => setIsModalOpen(true)}>
                Boost Post
              </BoostButton>
            )}
          </PostFooter>
        )}
      </PostContainer>
    </>
  );
};

export default Post;
