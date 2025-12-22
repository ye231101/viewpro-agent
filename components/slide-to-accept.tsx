import { AntDesign } from '@expo/vector-icons';
import React, { useRef } from 'react';
import { Animated, PanResponder, StyleSheet, View } from 'react-native';

interface SlideToAcceptProps {
  onAccept: () => void;
  text?: string;
}

const SLIDER_WIDTH = 320;
const BUTTON_SIZE = 64;
const SLIDER_PADDING = 8;
const SLIDE_THRESHOLD = SLIDER_WIDTH - BUTTON_SIZE - SLIDER_PADDING * 2;

export function SlideToAccept({ onAccept, text = 'Slide to accept' }: SlideToAcceptProps) {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(1)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        // Fade out text when user starts sliding
        Animated.timing(textOpacity, {
          toValue: 0.3,
          duration: 200,
          useNativeDriver: true,
        }).start();
      },
      onPanResponderMove: (_, gestureState) => {
        const newValue = Math.max(0, Math.min(gestureState.dx, SLIDE_THRESHOLD));
        slideAnim.setValue(newValue);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx >= SLIDE_THRESHOLD * 0.8) {
          // User slid far enough, accept the call
          Animated.timing(slideAnim, {
            toValue: SLIDE_THRESHOLD,
            duration: 200,
            useNativeDriver: false,
          }).start(() => {
            onAccept();
          });
        } else {
          // Snap back to start
          Animated.parallel([
            Animated.spring(slideAnim, {
              toValue: 0,
              tension: 50,
              friction: 8,
              useNativeDriver: false,
            }),
            Animated.timing(textOpacity, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start();
        }
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      <View style={styles.sliderTrack}>
        <Animated.Text style={[styles.text, { opacity: textOpacity }]}>{text}</Animated.Text>

        <Animated.View
          style={[
            styles.sliderButton,
            {
              transform: [{ translateX: slideAnim }],
            },
          ]}
          {...panResponder.panHandlers}
        >
          <AntDesign name="phone" size={32} color="#fff" />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  sliderTrack: {
    position: 'relative',
    width: SLIDER_WIDTH + 4,
    height: BUTTON_SIZE + SLIDER_PADDING * 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderRadius: 99,
    borderWidth: 2,
    borderColor: '#22c55e',
  },
  sliderButton: {
    position: 'absolute',
    left: SLIDER_PADDING,
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#22c55e',
    borderRadius: 99,
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  text: {
    color: '#22c55e',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
