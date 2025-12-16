import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Switch } from '@/components/switch';
import { toast } from '@/components/toast';
import { useAuth } from '@/hooks/use-auth';
import { globals } from '@/styles';
import { userApi } from '@/utils/api';

export default function HomeScreen() {
  const { user, logout, updateUser, isLoading } = useAuth();

  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    getPermission();
  }, []);

  // Request Android permissions
  const getPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          PermissionsAndroid.PERMISSIONS.CAMERA,
        ]);
      } catch (error) {
        console.error('Error requesting permissions:', error);
      }
    }
  };

  const handleToggle = async (value: boolean) => {
    if (isToggling) return;

    setIsToggling(true);
    try {
      if (value) {
        await userApi.setAvailable();
        updateUser({ ...user!, status: 'available' });
      } else {
        await userApi.setUnavailable();
        updateUser({ ...user!, status: 'unavailable' });
      }
    } catch (error) {
      console.error('Failed to change availability status:', error);
      toast.error({ message: 'Failed to change availability status' });
    } finally {
      setIsToggling(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <SafeAreaView style={globals.container}>
      <View style={styles.content}>
        <View style={styles.topSection}>
          <Text style={styles.title}>Status</Text>

          <View style={styles.switchContainer}>
            <View style={styles.switchRow}>
              <View
                style={[styles.statusDot, { backgroundColor: user?.status === 'available' ? '#22c55e' : '#ef4444' }]}
              />
              <Text style={[styles.switchLabel]}>{user?.status === 'available' ? 'Available' : 'Unavailable'}</Text>
              <Switch
                trackColor={{ false: '#fecaca', true: '#86efac' }}
                thumbColor={{ false: '#ef4444', true: '#22c55e' }}
                onValueChange={handleToggle}
                value={user?.status === 'available'}
              />
            </View>
          </View>

          <TouchableOpacity
            style={{
              width: '100%',
              height: 50,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#000',
              borderRadius: 8,
            }}
            onPress={() => router.push('/video')}
          >
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>TEST VIDEO CALL</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.button, { opacity: isLoading ? 0.6 : 1 }]}
          onPress={handleLogout}
          disabled={isLoading}
        >
          {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>LOG OUT</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
  },
  topSection: {
    flex: 1,
  },
  title: {
    marginBottom: 20,
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  switchContainer: {
    padding: 20,
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 16,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  switchLabel: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
  },
  statusText: {
    fontSize: 16,
  },
  button: {
    width: '100%',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
