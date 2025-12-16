import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, ViewStyle } from 'react-native';

interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  trackColor?: { false: string; true: string };
  thumbColor?: { false: string; true: string };
  disabled?: boolean;
  style?: ViewStyle;
}

export function Switch({
  value,
  onValueChange,
  trackColor = { false: '#fecaca', true: '#86efac' },
  thumbColor = { false: '#ef4444', true: '#22c55e' },
  disabled = false,
  style,
}: SwitchProps) {
  const translateX = useRef(new Animated.Value(value ? 16 : 0)).current;

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: value ? 16 : 0,
      useNativeDriver: true,
      bounciness: 4,
      speed: 20,
    }).start();
  }, [value, translateX]);

  const handlePress = () => {
    if (!disabled) {
      onValueChange(!value);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      hitSlop={8}
      style={[
        styles.track,
        {
          backgroundColor: value ? trackColor.true : trackColor.false,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.thumb,
          {
            backgroundColor: value ? thumbColor.true : thumbColor.false,
            transform: [{ translateX }],
          },
        ]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: 40,
    height: 16,
    justifyContent: 'center',
    borderRadius: 12,
  },
  thumb: {
    width: 24,
    height: 24,
    borderRadius: 99,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
});
