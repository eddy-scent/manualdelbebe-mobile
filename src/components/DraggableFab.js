import React, { useRef, useState } from 'react';
import { Animated, Image, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const DR_MANUEL_IMG = require('../../imagenes/drmanuel.jpg');

export default function DraggableFab({ onPress, defaultRight = 20, defaultBottom = 90 }) {
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const [dragging, setDragging] = useState(false);

  const pan = Gesture.Pan()
    .onStart(() => {
      setDragging(true);
    })
    .onUpdate((event) => {
      translateX.setValue(event.translationX);
      translateY.setValue(event.translationY);
    })
    .onEnd(() => {
      setDragging(false);
      Animated.spring(translateX, { toValue: 0, useNativeDriver: false, damping: 15, stiffness: 150 }).start();
      Animated.spring(translateY, { toValue: 0, useNativeDriver: false, damping: 15, stiffness: 150 }).start();
    })
    .minDistance(8)
    .activeOffsetX([-15, 15])
    .activeOffsetY([-15, 15]);

  const tap = Gesture.Tap()
    .onEnd(() => {
      if (!dragging) {
        onPress();
      }
    });

  const composed = Gesture.Race(pan, tap);

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={[styles.fabButton, { right: defaultRight, bottom: defaultBottom, transform: [{ translateX }, { translateY }] }]}>
        <Image source={DR_MANUEL_IMG} style={styles.fabImage} />
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  fabButton: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EB5D8B',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EB5D8B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
  },
  fabImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    resizeMode: 'cover',
  },
});