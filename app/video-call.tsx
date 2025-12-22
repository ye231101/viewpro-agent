import { AntDesign } from '@expo/vector-icons';
import { AudioSession, VideoTrack } from '@livekit/react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { Track } from 'livekit-client';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { toast } from '@/components/toast';
import { useAuth } from '@/hooks/use-auth';
import { useLiveKit } from '@/hooks/use-livekit';
import { globals } from '@/styles';
import { livekitApi } from '@/utils/api';
import { AVATAR_URL, LIVEKIT_URL } from '@/utils/constants';
import { ChatMessage } from '@/utils/types';

export default function VideoCallScreen() {
  const params = useLocalSearchParams<{ roomName?: string }>();
  const roomName = params.roomName || '';

  const { user } = useAuth();

  const [token, setToken] = useState('');
  const [chatMessage, setChatMessage] = useState('');
  const messagesListRef = useRef<FlatList<ChatMessage>>(null);
  const keyboardOffset = useRef(new Animated.Value(0)).current;

  const username = user?.username || `user-${Math.floor(Math.random() * 100000)}`;

  const {
    isConnected,
    localParticipant,
    isMicrophoneEnabled,
    toggleMicrophone,
    switchCamera,
    isScreenShareEnabled,
    toggleScreenShare,
    messages,
    sendMessage,
    cleanup,
  } = useLiveKit({
    url: LIVEKIT_URL,
    token,
    username: user?.username || 'Anonymous',
    avatar: user?.avatar || 'default.jpg',
    enabled: !!token,
  });

  useEffect(() => {
    const start = async () => {
      await AudioSession.startAudioSession();
    };
    start();

    return () => {
      AudioSession.stopAudioSession();
    };
  }, []);

  // Keyboard listeners
  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (event) => {
        Animated.timing(keyboardOffset, {
          toValue: event.endCoordinates.height,
          duration: Platform.OS === 'ios' ? event.duration : 250,
          useNativeDriver: false,
        }).start();
      }
    );

    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      (event) => {
        Animated.timing(keyboardOffset, {
          toValue: 0,
          duration: Platform.OS === 'ios' ? event?.duration || 250 : 250,
          useNativeDriver: false,
        }).start();
      }
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  useEffect(() => {
    fetchToken();
    return () => {
      cleanup();
    };
  }, []);

  const fetchToken = async () => {
    try {
      const response = await livekitApi.getToken(roomName, username);
      const tokenFromApi = response.data?.token || '';
      setToken(tokenFromApi);
    } catch (error) {
      console.error('Failed to fetch LiveKit token:', error);
      toast.error({ message: 'Failed to connect to video' });
    }
  };

  const handleLeave = async () => {
    await cleanup();
    router.replace('/home');
  };

  const handleToggleMute = async () => {
    await toggleMicrophone();
  };

  const handleFlipCamera = async () => {
    await switchCamera();
  };

  const handleScreenShare = async () => {
    await toggleScreenShare();
  };

  const handleAddUser = () => {
    toast.info({ message: 'Add user not implemented yet' });
  };

  const handleSendMessage = async () => {
    if (chatMessage.trim() && isConnected) {
      const success = await sendMessage(chatMessage);
      if (success) {
        setChatMessage('');
        Keyboard.dismiss();
      }
    }
  };

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        messagesListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <View style={styles.messageContainer}>
      <Image source={{ uri: AVATAR_URL + item.avatar }} style={styles.messageAvatar} contentFit="cover" />
      <View style={styles.messageContent}>
        <Text style={styles.messageUsername}>{item.username}</Text>
        <Text style={styles.messageText}>{item.text}</Text>
      </View>
    </View>
  );

  // Get local video track reference for preview
  const cameraPublication = localParticipant?.getTrackPublication(Track.Source.Camera);
  const localTrackRef =
    localParticipant && cameraPublication && cameraPublication.track
      ? {
          participant: localParticipant,
          publication: cameraPublication,
          source: Track.Source.Camera,
        }
      : undefined;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={globals.container}>
        {/* Full Screen Local Video */}
        {localTrackRef && Platform.OS !== 'web' && <VideoTrack style={globals.container} trackRef={localTrackRef} />}

        <SafeAreaView style={StyleSheet.absoluteFillObject} edges={['top']}>
          {/* Overlay Controls */}
          <View style={styles.controlsContainer}>
            <TouchableOpacity style={[styles.controlButton, styles.endCallButton]} onPress={handleLeave}>
              <AntDesign name="close" size={24} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlButton, !isMicrophoneEnabled && styles.controlButtonActive]}
              onPress={handleToggleMute}
            >
              <AntDesign name={isMicrophoneEnabled ? 'audio' : 'audio-muted'} size={24} color="white" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.controlButton} onPress={handleFlipCamera}>
              <AntDesign name="retweet" size={24} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlButton, isScreenShareEnabled && styles.controlButtonActive]}
              onPress={handleScreenShare}
            >
              <AntDesign name="laptop" size={24} color="white" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.controlButton} onPress={handleAddUser}>
              <AntDesign name="plus" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Status indicator at center */}
          {!isConnected && (
            <View style={styles.centerContainer}>
              <View style={styles.statusContainer}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Connecting...</Text>
              </View>
            </View>
          )}

          {/* Chat Messages */}
          <Animated.View
            style={[
              styles.messagesWrapper,
              {
                transform: [{ translateY: Animated.multiply(keyboardOffset, -1) }],
              },
            ]}
          >
            <FlatList
              ref={messagesListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.messagesList}
            />
          </Animated.View>
        </SafeAreaView>

        {/* Chat Input at bottom - animated to move with keyboard */}
        <Animated.View
          style={[
            styles.chatInputWrapper,
            {
              transform: [{ translateY: Animated.multiply(keyboardOffset, -1) }],
            },
          ]}
        >
          <SafeAreaView edges={['bottom']}>
            <View style={styles.chatInputContainer}>
              <TextInput
                style={styles.chatInput}
                placeholder="Type a message..."
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                value={chatMessage}
                onChangeText={setChatMessage}
                onSubmitEditing={handleSendMessage}
                returnKeyType="send"
              />
              <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
                <AntDesign name="send" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  controlsContainer: {
    position: 'absolute',
    top: 60,
    right: 16,
    gap: 16,
  },
  controlButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    width: 50,
    height: 50,
    borderRadius: 99,
    alignItems: 'center',
    justifyContent: 'center',
  },
  endCallButton: {
    backgroundColor: '#ef4444',
  },
  controlButtonActive: {
    backgroundColor: 'rgba(239, 68, 68, 0.8)',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 99,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 99,
    backgroundColor: '#f59e0b',
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
  },
  chatInputWrapper: {
    position: 'absolute',
    bottom: 8,
    left: 16,
    right: 16,
  },
  chatInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chatInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 99,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    color: '#fff',
    fontSize: 16,
  },
  sendButton: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 99,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  messagesWrapper: {
    position: 'absolute',
    top: 60,
    bottom: 80,
    left: 16,
    right: 80,
    marginBottom: 16,
  },
  messagesList: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    gap: 8,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  messageAvatar: {
    width: 50,
    height: 50,
    borderRadius: 99,
  },
  messageContent: {
    flex: 1,
  },
  messageUsername: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  messageText: {
    color: '#fff',
    fontSize: 18,
  },
});
