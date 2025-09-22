import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { getMessages, sendMessage, sendMediaMessage, getProfile, getGroupDetails, sendIncomingCallSignal, editMessage, markMessageAsViewed } from '../services/supabaseService';
import OutgoingCallModal from '../components/OutgoingCallModal';

// This is the new ViewOnceMessage component, embedded here.
const ViewOnceMessage = ({ message }) => {
  const [hasViewed, setHasViewed] = useState(message.is_viewed);
  const [showContent, setShowContent] = useState(false);
  const { currentUser } = useAuth();

  const handleView = async () => {
    // Only allow the recipient to view the message
    if (message.sender_id !== currentUser.uid) {
      setShowContent(true);
      if (!hasViewed) {
        setHasViewed(true);
        // Assuming markMessageAsViewed is a function that updates the database
        await markMessageAsViewed(message.id);
      }
    }
  };

  if (message.sender_id === currentUser.uid) {
    // Sender always sees the content, with a note if it's been viewed
    return (
      <div style={{ position: 'relative' }}>
        {message.message_type === 'image' && <img src={message.media_url} alt="chat" style={{ maxWidth: '200px' }} />}
        {message.message_type === 'video' && <video src={message.media_url} controls style={{ maxWidth: '200px' }} />}
        {message.message_type === 'audio' && <audio src={message.media_url} controls />}
        {message.is_viewed && <div style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(0,0,0,0.5)', color: 'white', padding: '2px 5px', borderRadius: '3px' }}>Viewed</div>}
      </div>
    );
  }

  // Recipient's view
  return (
    <div>
      {showContent ? (
        <>
          {message.message_type === 'image' && <img src={message.media_url} alt="chat" style={{ maxWidth: '200px' }} />}
          {message.message_type === 'video' && <video src={message.media_url} controls style={{ maxWidth: '200px' }} />}
          {message.message_type === 'audio' && <audio src={message.media_url} controls />}
        </>
      ) : (
        <button onClick={handleView}>Tap to view once</button>
      )}
    </div>
  );
};

const ChatPage = () => {
  const { conversationType, conversationId } = useParams();
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [editingMessage, setEditingMessage] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [loading, setLoading] = useState(true);
  const [conversationInfo, setConversationInfo] = useState(null);
  const [isCalling, setIsCalling] = useState(false);
  const [isViewOnce, setIsViewOnce] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const fetchConversationData = async () => {
      setLoading(true);

      // Fetch conversation metadata (group name or other user's profile)
      if (conversationType === 'group') {
        const groupInfo = await getGroupDetails(conversationId);
        setConversationInfo({ name: groupInfo.name, members: groupInfo.members });
      } else {
        const { data: matchData } = await supabase.from('matches').select('user1_id, user2_id').eq('id', conversationId).single();
        if (matchData) {
          const otherUserId = matchData.user1_id === currentUser.uid ? matchData.user2_id : matchData.user1_id;
          const profile = await getProfile(otherUserId);
          setConversationInfo({ name: profile.name, otherUser: profile });
        }
      }

      // Fetch initial messages
      const initialMessages = await getMessages(conversationId, conversationType);
      setMessages(initialMessages);
      setLoading(false);
    };

    fetchConversationData();

    // Set up real-time subscription
    const channelName = `chat-${conversationType}-${conversationId}`;
    const channel = supabase.channel(channelName);
    const idColumn = conversationType === 'private' ? 'match_id' : 'group_id';

    channel
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `${idColumn}=eq.${conversationId}` }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const fetchNewMessage = async () => {
            const { data } = await supabase.from('messages').select(`*, sender:profiles(name, photos)`).eq('id', payload.new.id).single();
            setMessages((prevMessages) => [...prevMessages, data]);
          };
          fetchNewMessage();
        }
        if (payload.eventType === 'UPDATE') {
          setMessages(prevMessages =>
            prevMessages.map(msg => msg.id === payload.new.id ? { ...msg, ...payload.new } : msg)
          );
        }
      })
      .on('broadcast', { event: 'call-accepted' }, ({ payload }) => {
        if (payload.callerId === currentUser.uid) {
          setIsCalling(false);
          navigate(`/call/${conversationId}`);
        }
      })
      .on('broadcast', { event: 'call-declined' }, ({ payload }) => {
        if (payload.callerId === currentUser.uid) {
          setIsCalling(false);
          alert('Call declined.');
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, conversationType, currentUser.uid, navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;
    await sendMessage(conversationId, conversationType, currentUser.uid, newMessage);
    setNewMessage('');
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const messageType = file.type.startsWith('image') ? 'image' : file.type.startsWith('video') ? 'video' : 'audio';
    await sendMediaMessage(conversationId, conversationType, currentUser.uid, file, messageType, isViewOnce);
    setIsViewOnce(false);
    e.target.value = null;
  };

  const handleStartCall = async () => {
    if (conversationType === 'private' && conversationInfo.otherUser) {
        setIsCalling(true);
        await sendIncomingCallSignal(currentUser.uid, conversationInfo.otherUser.id, conversationId);
    } else {
        alert("Video calls are only supported in private chats for now.");
    }
  };

  const handleEditClick = (message) => {
    setEditingMessage(message);
    setEditingText(message.text_content);
  };

  const handleSaveEdit = async () => {
    if (!editingMessage || editingText.trim() === '') return;
    await editMessage(editingMessage.id, editingText);
    setEditingMessage(null);
    setEditingText('');
  };

  if (loading || !conversationInfo) return <div>Loading chat...</div>;

  return (
    <div>
      {isCalling && conversationInfo.otherUser && <OutgoingCallModal callee={conversationInfo.otherUser} onCancel={() => setIsCalling(false)} />}
      <Link to="/conversations">Back to Conversations</Link>
      {conversationType === 'private' && <button onClick={handleStartCall} style={{float: 'right'}}>Start Video Call</button>}
      <h2>{conversationInfo.name}</h2>
      <div style={{ height: '400px', overflowY: 'scroll', border: '1px solid #ccc', padding: '10px' }}>
        {messages.map(msg => (
          <div key={msg.id} style={{ textAlign: msg.sender_id === currentUser.uid ? 'right' : 'left', marginBottom: '10px' }}>
            <p><strong>{msg.sender.name}</strong></p>
            {editingMessage && editingMessage.id === msg.id ? (
              <div>
                <input type="text" value={editingText} onChange={(e) => setEditingText(e.target.value)} />
                <button onClick={handleSaveEdit}>Save</button>
                <button onClick={() => setEditingMessage(null)}>Cancel</button>
              </div>
            ) : (
              <>
                {msg.is_view_once ? (
                  <ViewOnceMessage message={msg} />
                ) : (
                  <>
                    {msg.message_type === 'text' && <p>{msg.text_content} {msg.is_edited && <em>(edited)</em>}</p>}
                    {msg.message_type === 'image' && <img src={msg.media_url} alt="chat" style={{ maxWidth: '200px' }} />}
                    {msg.message_type === 'video' && <video src={msg.media_url} controls style={{ maxWidth: '200px' }} />}
                    {msg.message_type === 'audio' && <audio src={msg.media_url} controls />}
                  </>
                )}
                {msg.sender_id === currentUser.uid && msg.message_type === 'text' && (
                  <button onClick={() => handleEditClick(msg)}>Edit</button>
                )}
              </>
            )}
            <small>{new Date(msg.created_at).toLocaleTimeString()}</small>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage}>
        <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." />
        <button type="submit">Send</button>
      </form>
      <div>
        <input type="file" id="file-upload" onChange={handleFileUpload} style={{ display: 'none' }} />
        <label htmlFor="file-upload" style={{ cursor: 'pointer', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }}>Attach File</label>
        <label style={{ marginLeft: '10px' }}>
          <input type="checkbox" checked={isViewOnce} onChange={(e) => setIsViewOnce(e.target.checked)} />
          Send as View-Once
        </label>
      </div>
    </div>
  );
};

export default ChatPage;
