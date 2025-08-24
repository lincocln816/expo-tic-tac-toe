import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Square from './Square';
import type { BoardType } from '../App';

const { width: screenWidth } = Dimensions.get('window');
const isSmallDevice = screenWidth < 375;

interface BoardProps {
  board: BoardType;
  onPress: (row: number, col: number) => void;
  theme: any;
}

const Board: React.FC<BoardProps> = ({ board, onPress, theme }) => (
  <View style={[styles.board, { backgroundColor: theme.boardBackground }]}>
    {board.map((row, rowIndex) => (
      <View key={rowIndex} style={styles.row}>
        {row.map((cell, colIndex) => (
          <Square
            key={colIndex}
            value={cell}
            onPress={() => onPress(rowIndex, colIndex)}
            theme={theme}
          />
        ))}
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  board: {
    borderRadius: isSmallDevice ? 16 : 24,
    padding: isSmallDevice ? 6 : 8,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    marginBottom: 16,
  },
  row: { flexDirection: 'row' },
});

export default Board;