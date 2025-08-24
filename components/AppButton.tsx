import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');
const isSmallDevice = screenWidth < 375;

interface AppButtonProps {
  title: string;
  onPress: () => void;
  backgroundColor: string;
  textColor: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

const AppButton: React.FC<AppButtonProps> = ({
  title,
  onPress,
  backgroundColor,
  textColor,
  style,
  textStyle,
  disabled = false,
}) => (
  <TouchableOpacity
    style={[
      styles.button,
      { backgroundColor: backgroundColor, opacity: disabled ? 0.6 : 1 },
      style,
    ]}
    onPress={onPress}
    activeOpacity={0.7}
    disabled={disabled}
  >
    <Text style={[styles.buttonText, { color: textColor }, textStyle]}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    minWidth: isSmallDevice ? 80 : 100,
    paddingVertical: isSmallDevice ? 10 : 12,
    paddingHorizontal: isSmallDevice ? 14 : 18,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: isSmallDevice ? 4 : 8,
    marginVertical: 4,
  },
  buttonText: {
    fontSize: isSmallDevice ? 14 : 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});

export default AppButton;