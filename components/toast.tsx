import { StyleSheet } from 'react-native';
import Toast, { BaseToast, ErrorToast, InfoToast, SuccessToast } from 'react-native-toast-message';

/**
 * Toast configuration with custom styling
 */
const toastConfig = {
  success: (props: any) => (
    <SuccessToast
      {...props}
      style={styles.successToast}
      contentContainerStyle={styles.contentContainer}
      text1Style={styles.text1}
      text2Style={styles.text2}
      text2NumberOfLines={2}
    />
  ),
  error: (props: any) => (
    <ErrorToast
      {...props}
      style={styles.errorToast}
      contentContainerStyle={styles.contentContainer}
      text1Style={styles.text1}
      text2Style={styles.text2}
      text2NumberOfLines={2}
    />
  ),
  info: (props: any) => (
    <InfoToast
      {...props}
      style={styles.infoToast}
      contentContainerStyle={styles.contentContainer}
      text1Style={styles.text1}
      text2Style={styles.text2}
      text2NumberOfLines={2}
    />
  ),
  warning: (props: any) => (
    <BaseToast
      {...props}
      style={styles.warningToast}
      contentContainerStyle={styles.contentContainer}
      text1Style={styles.text1}
      text2Style={styles.text2}
      text2NumberOfLines={2}
    />
  ),
};

const styles = StyleSheet.create({
  successToast: {
    borderLeftColor: '#22c55e',
    borderLeftWidth: 5,
  },
  errorToast: {
    borderLeftColor: '#ef4444',
    borderLeftWidth: 5,
  },
  infoToast: {
    borderLeftColor: '#3b82f6',
    borderLeftWidth: 5,
  },
  warningToast: {
    borderLeftColor: '#f59e0b',
    borderLeftWidth: 5,
  },
  contentContainer: {
    paddingHorizontal: 15,
  },
  text1: {
    fontSize: 16,
    fontWeight: '600',
  },
  text2: {
    fontSize: 14,
    fontWeight: '400',
  },
});

/**
 * ToastContainer component to be rendered at the root level
 */
export function ToastContainer() {
  return <Toast config={toastConfig} />;
}

// Toast options interface
export interface ToastOptions {
  title?: string;
  message?: string;
  duration?: number;
}

// Toast utility functions
export const toast = {
  success: ({ title = 'Success', message, duration = 3000 }: ToastOptions) => {
    Toast.show({
      type: 'success',
      text1: title,
      text2: message,
      visibilityTime: duration,
      position: 'top',
    });
  },

  error: ({ title = 'Error', message, duration = 3000 }: ToastOptions) => {
    Toast.show({
      type: 'error',
      text1: title,
      text2: message,
      visibilityTime: duration,
      position: 'top',
    });
  },

  info: ({ title = 'Info', message, duration = 3000 }: ToastOptions) => {
    Toast.show({
      type: 'info',
      text1: title,
      text2: message,
      visibilityTime: duration,
      position: 'top',
    });
  },

  warning: ({ title = 'Warning', message, duration = 3000 }: ToastOptions) => {
    Toast.show({
      type: 'warning',
      text1: title,
      text2: message,
      visibilityTime: duration,
      position: 'top',
    });
  },

  hide: () => {
    Toast.hide();
  },
};

/**
 * Custom hook for showing toast notifications (for backwards compatibility)
 *
 * @example
 * const toast = useToast();
 * toast.success({ title: 'Success!', message: 'Operation completed' });
 * toast.error({ title: 'Error!', message: 'Something went wrong' });
 */
export function useToast() {
  return toast;
}
