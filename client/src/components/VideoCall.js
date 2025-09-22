import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '../supabaseClient';

// This is a simplified example. A production app would need STUN/TURN servers.
const peerConnectionConfig = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
};

const VideoCall = ({ matchId, currentUser }) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const supabaseChannelRef = useRef(null);
  const [callStatus, setCallStatus] = useState('Idle');

  useEffect(() => {
    // 1. Initialize Supabase Realtime channel
    const channel = supabase.channel(`video-call-${matchId}`, {
      config: {
        broadcast: {
          self: false, // Don't receive our own messages
        },
      },
    });
    supabaseChannelRef.current = channel;

    // 2. Set up signaling message listener
    channel.on('broadcast', { event: 'signal' }, ({ payload }) => {
      handleSignalingData(payload);
    });

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        // Now ready to start the call
        console.log('Subscribed to signaling channel.');
      }
    });

    // 3. Initialize Peer Connection and Media Streams
    initialize();

    return () => {
      // Cleanup on unmount
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      if (localVideoRef.current && localVideoRef.current.srcObject) {
        localVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
      if (supabaseChannelRef.current) {
        supabase.removeChannel(supabaseChannelRef.current);
      }
    };
  }, [matchId]);

  const initialize = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const pc = new RTCPeerConnection(peerConnectionConfig);
      peerConnectionRef.current = pc;

      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          sendSignalingData({ iceCandidate: event.candidate });
        }
      };

      pc.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };
    } catch (error) {
      console.error("Error initializing media devices.", error);
      setCallStatus('Error');
    }
  };

  const sendSignalingData = (data) => {
    supabaseChannelRef.current.send({
      type: 'broadcast',
      event: 'signal',
      payload: { ...data, senderId: currentUser.uid },
    });
  };

  const handleSignalingData = async (data) => {
    if (data.senderId === currentUser.uid) return; // Ignore our own signals

    const pc = peerConnectionRef.current;

    if (data.offer) {
      await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      sendSignalingData({ answer });
      setCallStatus('Connected');
    } else if (data.answer) {
      await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
    } else if (data.iceCandidate) {
      await pc.addIceCandidate(new RTCIceCandidate(data.iceCandidate));
    }
  };

  const startCall = async () => {
    const pc = peerConnectionRef.current;
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    sendSignalingData({ offer });
    setCallStatus('Calling...');
  };

  return (
    <div>
      <h3>Video Call</h3>
      <p>Status: {callStatus}</p>
      <div style={{ display: 'flex' }}>
        <div>
          <h4>You</h4>
          <video ref={localVideoRef} autoPlay muted style={{ width: '300px' }} />
        </div>
        <div>
          <h4>Remote</h4>
          <video ref={remoteVideoRef} autoPlay style={{ width: '300px' }} />
        </div>
      </div>
      <button onClick={startCall} disabled={callStatus !== 'Idle'}>Start Call</button>
      {/* A real app would have a hang-up button that sends a 'hangup' signal */}
    </div>
  );
};

export default VideoCall;
