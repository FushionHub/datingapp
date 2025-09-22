import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import IncomingCallModal from './IncomingCallModal';
import { getProfile } from '../services/supabaseService';

const CallManager = () => {
  const { currentUser } = useAuth();
  const [incomingCall, setIncomingCall] = useState(null);
  const [callerInfo, setCallerInfo] = useState(null);
  const ringtoneRef = useRef(null);
  const supabaseChannelRef = useRef(null);

  useEffect(() => {
    if (!currentUser) return;

    // A user listens on a channel named after their own ID for incoming calls
    const channel = supabase.channel(`user-calls-${currentUser.uid}`);
    supabaseChannelRef.current = channel;

    channel.on('broadcast', { event: 'incoming-call' }, async ({ payload }) => {
      // An incoming call is detected
      setIncomingCall(payload);
      const profile = await getProfile(payload.callerId);
      setCallerInfo(profile);
    });

    channel.subscribe();

    return () => {
      if (supabaseChannelRef.current) {
        supabase.removeChannel(supabaseChannelRef.current);
      }
    };
  }, [currentUser]);

  useEffect(() => {
    // Play ringtone when a call comes in
    if (incomingCall && callerInfo && ringtoneRef.current) {
      ringtoneRef.current.play().catch(e => console.error("Ringtone play failed:", e));
    } else if (!incomingCall && ringtoneRef.current) {
      ringtoneRef.current.pause();
      ringtoneRef.current.currentTime = 0;
    }
  }, [incomingCall, callerInfo]);


  const handleAccept = () => {
    // Stop the ringtone
    if (ringtoneRef.current) ringtoneRef.current.pause();

    // Logic to accept the call
    // This would typically involve notifying the caller and navigating to the call page
    alert(`Accepting call from ${callerInfo.name}`);
    // Example: redirect to the call page, the VideoCall component will handle the rest
    window.location.href = `/call/${incomingCall.matchId}`;
    setIncomingCall(null);
    setCallerInfo(null);
  };

  const handleDecline = () => {
    // Stop the ringtone
    if (ringtoneRef.current) ringtoneRef.current.pause();

    // Logic to decline the call
    // This would notify the caller that the call was declined
    alert(`Declining call from ${callerInfo.name}`);
    // Here you would send a 'call-declined' signal back to the caller
    setIncomingCall(null);
    setCallerInfo(null);
  };

  if (!incomingCall || !callerInfo) {
    return null;
  }

  return (
    <>
      <audio ref={ringtoneRef} src={callerInfo.ringtone_url || '/ringtones/classic.mp3'} loop />
      <IncomingCallModal
        caller={callerInfo}
        onAccept={handleAccept}
        onDecline={handleDecline}
      />
    </>
  );
};

export default CallManager;
