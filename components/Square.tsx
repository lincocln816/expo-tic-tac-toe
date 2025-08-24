import React, { useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import type { Cell } from '../App';

const { width: screenWidth } = Dimensions.get('window');
const isSmallDevice = screenWidth < 375;
const squareSize = isSmallDevice ? 70 : 90;

interface SquareProps {
  value: Cell;
  onPress: () => void;
  theme: any;
}

const Square: React.FC<SquareProps> = ({ value, onPress, theme }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.92,
      useNativeDriver: true,
      speed: 50,
      bounciness: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 10,
    }).start();
    onPress();
  };

  return (
    <Animated.View style={[
      styles.square, 
      { 
        backgroundColor: theme.squareBackground, 
        shadowColor: theme.x,
        transform: [{ scale }]
      }
    ]}>
      <TouchableOpacity
        style={styles.touchable}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.text,
          { color: value === 'X' ? theme.x : value === 'O' ? theme.o : theme.text }
        ]}>
          {value}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  square: {
    width: squareSize,
    height: squareSize,
    margin: isSmallDevice ? 4 : 6,
    borderRadius: isSmallDevice ? 12 : 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  touchable: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: isSmallDevice ? 12 : 18,
  },
  text: {
    fontSize: isSmallDevice ? 42 : 54,
    fontWeight: 'bold',
  },
});

export default Square;