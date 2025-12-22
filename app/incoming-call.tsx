import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SlideToAccept } from '@/components/slide-to-accept';
import { globals } from '@/styles';
import { ringtone } from '@/utils/ringtone';

export default function IncomingCallScreen() {
  const params = useLocalSearchParams<{ callerName?: string; roomName?: string }>();
  const callerName = params.callerName || 'Client';
  const roomName = params.roomName || '';

  const handleAccept = () => {
    ringtone.stop();

    router.replace({
      pathname: '/video-call',
      params: {
        roomName: roomName,
      },
    });
  };

  return (
    <SafeAreaView style={[globals.container, globals.bgBlack]}>
      <View style={styles.content}>
        <View style={styles.callerInfo}>
          <Image source={require('@/assets/images/default-avatar.jpg')} style={styles.avatar} contentFit="cover" />
          <Text style={styles.callerName}>{callerName}</Text>
          <Text style={styles.callerStatus}>Incoming call...</Text>
        </View>

        <SlideToAccept onAccept={handleAccept} text="Slide to answer" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 60,
  },
  callerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 99,
    marginBottom: 32,
  },
  callerName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  callerStatus: {
    fontSize: 18,
    color: '#9ca3af',
  },
});
