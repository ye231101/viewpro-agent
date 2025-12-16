import { StyleSheet } from 'react-native';

export const colors = {
  white: '#fff',
  black: '#000',
  red: '#ef4444',
  green: '#22c55e',
  blue: '#3b82f6',
  yellow: '#f59e0b',
};

export const globals = StyleSheet.create({
  container: {
    flex: 1,
  },
  justifyCenter: {
    justifyContent: 'center',
  },
  alignCenter: {
    alignItems: 'center',
  },
  bgWhite: {
    backgroundColor: colors.white,
  },
  bgBlack: {
    backgroundColor: colors.black,
  },
  bgRed: {
    backgroundColor: colors.red,
  },
  bgGreen: {
    backgroundColor: colors.green,
  },
  bgBlue: {
    backgroundColor: colors.blue,
  },
  textWhite: {
    color: colors.white,
  },
  textBlack: {
    color: colors.black,
  },
  textRed: {
    color: colors.red,
  },
  textGreen: {
    color: colors.green,
  },
  textBlue: {
    color: colors.blue,
  },
});
