import { registerGlobals } from '@livekit/react-native';
import { router, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import { ToastProvider } from '@/components/toast';
import { useAuth } from '@/hooks/use-auth';
import { persistor, store } from '@/store';
import { global } from '@/styles';

registerGlobals();

export default function RootLayout() {
  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingView />} persistor={persistor}>
        <SafeAreaProvider>
          <MainLayout />
          <StatusBar style="auto" />
          <ToastProvider />
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  );
}

function MainLayout() {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/home');
    } else {
      router.replace('/login');
    }
  }, [isAuthenticated]);

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="home" options={{ headerShown: false }} />
      <Stack.Screen name="video" options={{ headerShown: false }} />
    </Stack>
  );
}

function LoadingView() {
  return (
    <View style={[global.container, global.justifyCenter, global.alignCenter]}>
      <ActivityIndicator size="large" color="#000" />
    </View>
  );
}
