import {
  LocalParticipant,
  LocalTrackPublication,
  Participant,
  RemoteParticipant,
  Room,
  RoomEvent,
  Track,
} from 'livekit-client';
import { useCallback, useEffect, useRef, useState } from 'react';

import { ChatMessage } from '@/utils/types';

interface UseLiveKitProps {
  url: string;
  token: string;
  username: string;
  avatar: string;
  enabled: boolean;
}

interface UseLiveKitReturn {
  room: Room | null;
  isConnected: boolean;
  localParticipant: LocalParticipant | null;
  remoteParticipants: RemoteParticipant[];
  isMicrophoneEnabled: boolean;
  toggleMicrophone: () => Promise<void>;
  isCameraEnabled: boolean;
  toggleCamera: () => Promise<void>;
  isFrontCamera: boolean;
  switchCamera: () => Promise<void>;
  isScreenShareEnabled: boolean;
  toggleScreenShare: () => Promise<void>;
  messages: ChatMessage[];
  sendMessage: (text: string) => Promise<boolean>;
  cleanup: () => Promise<void>;
}

export function useLiveKit({ url, token, username, avatar, enabled }: UseLiveKitProps): UseLiveKitReturn {
  const roomRef = useRef<Room | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [localParticipant, setLocalParticipant] = useState<LocalParticipant | null>(null);
  const [remoteParticipants, setRemoteParticipants] = useState<RemoteParticipant[]>([]);
  const [isMicrophoneEnabled, setIsMicrophoneEnabled] = useState(true);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [isScreenShareEnabled, setIsScreenShareEnabled] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  // Track version to force re-render when tracks are published
  const [, setTrackVersion] = useState(0);
  const handleLocalTrackPublished = useCallback((publication: LocalTrackPublication) => {
    // When a local track is published (especially camera), trigger a re-render
    if (publication.source === Track.Source.Camera) {
      setTrackVersion((v) => v + 1);
    }
  }, []);

  const handleParticipantConnected = useCallback((participant: RemoteParticipant) => {
    setRemoteParticipants((prev) => [...prev, participant]);
  }, []);

  const handleParticipantDisconnected = useCallback((participant: RemoteParticipant) => {
    setRemoteParticipants((prev) => prev.filter((p) => p.identity !== participant.identity));
  }, []);

  const handleDataReceived = useCallback((payload: Uint8Array, participant?: Participant) => {
    try {
      const decoder = new TextDecoder();
      const data = JSON.parse(decoder.decode(payload));

      if (data.type === 'chat') {
        const message: ChatMessage = {
          id: `${Date.now()}-${participant?.identity || 'unknown'}`,
          username: data.username || participant?.identity || 'Unknown',
          avatar: data.avatar || 'default.jpg',
          text: data.text,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, message]);
      }
    } catch (error) {
      console.error('Failed to parse data message:', error);
    }
  }, []);

  const connect = useCallback(async () => {
    if (!url || !token || roomRef.current?.state === 'connected') return;

    try {
      const room = new Room();
      roomRef.current = room;

      room.on(RoomEvent.Connected, () => {
        setIsConnected(true);
        setLocalParticipant(room.localParticipant);
        setRemoteParticipants(Array.from(room.remoteParticipants.values()));
      });

      room.on(RoomEvent.Disconnected, () => {
        setIsConnected(false);
        setLocalParticipant(null);
        setRemoteParticipants([]);
      });

      room.on(RoomEvent.LocalTrackPublished, handleLocalTrackPublished);
      room.on(RoomEvent.ParticipantConnected, handleParticipantConnected);
      room.on(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected);
      room.on(RoomEvent.DataReceived, handleDataReceived);

      await room.connect(url, token);

      // Enable camera and microphone - wait for them to be enabled
      await room.localParticipant.setCameraEnabled(true);
      await room.localParticipant.setMicrophoneEnabled(true);

      // Ensure localParticipant state is updated after tracks are enabled
      setLocalParticipant(room.localParticipant);
    } catch (error) {
      console.error('Failed to connect to LiveKit room:', error);
    }
  }, [
    url,
    token,
    handleLocalTrackPublished,
    handleParticipantConnected,
    handleParticipantDisconnected,
    handleDataReceived,
  ]);

  const cleanup = useCallback(async () => {
    if (roomRef.current) {
      await roomRef.current.disconnect();
      roomRef.current = null;
    }
    setIsConnected(false);
    setLocalParticipant(null);
    setRemoteParticipants([]);
    setMessages([]);
  }, []);

  const sendMessage = useCallback(
    async (text: string): Promise<boolean> => {
      if (!roomRef.current || !isConnected) return false;

      try {
        const encoder = new TextEncoder();
        const data = encoder.encode(
          JSON.stringify({
            type: 'chat',
            username,
            avatar,
            text,
          })
        );

        await roomRef.current.localParticipant.publishData(data, {
          reliable: true,
        });

        // Add own message to the list
        const message: ChatMessage = {
          id: `${Date.now()}-local`,
          username,
          avatar,
          text,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, message]);

        return true;
      } catch (error) {
        console.error('Failed to send message:', error);
        return false;
      }
    },
    [isConnected, username, avatar]
  );

  const toggleMicrophone = useCallback(async () => {
    if (!roomRef.current?.localParticipant) return;
    const newEnabled = !isMicrophoneEnabled;
    await roomRef.current.localParticipant.setMicrophoneEnabled(newEnabled);
    setIsMicrophoneEnabled(newEnabled);
  }, [isMicrophoneEnabled]);

  const toggleCamera = useCallback(async () => {
    if (!roomRef.current?.localParticipant) return;
    const newEnabled = !isCameraEnabled;
    await roomRef.current.localParticipant.setCameraEnabled(newEnabled);
    setIsCameraEnabled(newEnabled);
  }, [isCameraEnabled]);

  const switchCamera = useCallback(async () => {
    if (!roomRef.current?.localParticipant) return;
    const cameraPub = roomRef.current.localParticipant.getTrackPublication(Track.Source.Camera);
    if (cameraPub?.track) {
      const newFacingMode = isFrontCamera ? 'environment' : 'user';
      // @ts-ignore - restartTrack accepts facingMode option
      await cameraPub.track.restartTrack({ facingMode: newFacingMode });
      setIsFrontCamera(!isFrontCamera);
    }
  }, [isFrontCamera]);

  const toggleScreenShare = useCallback(async () => {
    if (!roomRef.current?.localParticipant) return;
    const newEnabled = !isScreenShareEnabled;
    await roomRef.current.localParticipant.setScreenShareEnabled(newEnabled);
    setIsScreenShareEnabled(newEnabled);
  }, [isScreenShareEnabled]);

  useEffect(() => {
    if (enabled && url && token) {
      connect();
    }

    return () => {
      cleanup();
    };
  }, [enabled, url, token]);

  return {
    room: roomRef.current,
    isConnected,
    localParticipant,
    remoteParticipants,
    isMicrophoneEnabled,
    toggleMicrophone,
    isCameraEnabled,
    toggleCamera,
    isFrontCamera,
    switchCamera,
    isScreenShareEnabled,
    toggleScreenShare,
    messages,
    sendMessage,
    cleanup,
  };
}
