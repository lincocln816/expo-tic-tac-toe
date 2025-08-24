import React, { useState } from 'react';
import { StyleSheet, View, Text, SafeAreaView, TouchableOpacity, Dimensions, Platform } from 'react-native';
import Board from './components/Board';
import AppButton from './components/AppButton';
import { getBestMove, getRandomMove, checkWinner } from './utils/ai';
import ConfettiCannon from 'react-native-confetti-cannon';
import { Feather } from '@expo/vector-icons';

export type Player = 'X' | 'O';
export type Cell = Player | '';
export type BoardType = Cell[][];

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Responsive dimensions
const isSmallDevice = screenWidth < 375;
const isLargeDevice = screenWidth > 414;

const emptyBoard: BoardType = [
  ['', '', ''],
  ['', '', ''],
  ['', '', ''],
];

const COMPANY_NAME = "Welcome! EQL Games, Inc";

type GameMode = 'AI' | 'PVP';
type AIDifficulty = 'Easy' | 'Hard';

const lightTheme = {
  background: '#f7fafd',
  boardBackground: '#fff',
  squareBackground: '#f0f4ff',
  text: '#333',
  x: '#4F8EF7',
  o: '#2ecc71',
  button: '#4F8EF7',
  buttonText: '#fff',
};
const darkTheme = {
  background: '#181a20',
  boardBackground: '#23262f',
  squareBackground: '#23262f',
  text: '#fff',
  x: '#6fa8ff',
  o: '#6fffbf',
  button: '#23262f',
  buttonText: '#fff',
};

interface Score {
  X: number;
  O: number;
  draw: number;
}

export default function App() {
  const [board, setBoard] = useState<BoardType>(emptyBoard);
  const [isPlayerTurn, setIsPlayerTurn] = useState<boolean>(true);
  const [status, setStatus] = useState<string>('Your turn');
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [showCompany, setShowCompany] = useState<boolean>(false);
  const [gameMode, setGameMode] = useState<GameMode | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X');
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [aiDifficulty, setAIDifficulty] = useState<AIDifficulty>('Hard');
  const [score, setScore] = useState<Score>({ X: 0, O: 0, draw: 0 });
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [history, setHistory] = useState<BoardType[]>([emptyBoard]);

  const themeObj = theme === 'light' ? lightTheme : darkTheme;

  // Floating theme icon in top right
  const ThemeIcon = () => (
    <TouchableOpacity
      style={styles.themeIconButton}
      onPress={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      accessibilityLabel="Switch theme"
    >
      {theme === 'light' ? (
        <Feather name="moon" size={isSmallDevice ? 24 : 28} color={themeObj.x} />
      ) : (
        <Feather name="sun" size={isSmallDevice ? 24 : 28} color={themeObj.x} />
      )}
    </TouchableOpacity>
  );

  // Mode selection screen
  if (!gameMode) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeObj.background }]}>
        <ThemeIcon />
        <View style={styles.centeredContent}>
          <Text style={[styles.title, { color: themeObj.x }]}>Tic-Tac-Toe</Text>
          <Text style={[styles.status, { color: themeObj.text }]}>Choose Game Mode</Text>
          <TouchableOpacity style={[styles.modeButton, { backgroundColor: themeObj.button }]} onPress={() => setGameMode('AI')}>
            <Text style={[styles.modeButtonText, { color: themeObj.buttonText }]}>Person vs AI</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.modeButton, { backgroundColor: themeObj.button }]} onPress={() => setGameMode('PVP')}>
            <Text style={[styles.modeButtonText, { color: themeObj.buttonText }]}>Person vs Person</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // AI difficulty selection (only for AI mode)
  const renderAIDifficulty = () => (
    <View style={styles.difficultyRow}>
      <Text style={[styles.difficultyLabel, { color: themeObj.text }]}>AI Difficulty:</Text>
      {(['Easy', 'Hard'] as AIDifficulty[]).map(level => (
        <TouchableOpacity
          key={level}
          style={[
            styles.difficultyButton,
            aiDifficulty === level && { backgroundColor: themeObj.button },
          ]}
          onPress={() => setAIDifficulty(level)}
        >
          <Text
            style={[
              styles.difficultyButtonText,
              aiDifficulty === level
                ? { color: themeObj.buttonText }
                : { color: themeObj.x },
            ]}
          >
            {level}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const handlePress = (row: number, col: number) => {
    if (board[row][col] !== '' || gameOver) return;
    setHistory(prev => [...prev, board.map(r => [...r]) as BoardType]);
    const newBoard = board.map(r => [...r]) as BoardType;

    if (gameMode === 'AI') {
      if (!isPlayerTurn) return;
      newBoard[row][col] = 'X';
      setBoard(newBoard);

      const winner = checkWinner(newBoard);
      if (winner) {
        handleGameEnd(winner);
        return;
      }

      setIsPlayerTurn(false);
      setStatus("AI's turn");

      setTimeout(() => {
        let aiMove: [number, number];
        if (aiDifficulty === 'Hard') {
          aiMove = getBestMove(newBoard, 'O');
        } else {
          aiMove = getRandomMove(newBoard);
        }
        const [aiRow, aiCol] = aiMove;
        if (aiRow !== -1) {
          newBoard[aiRow][aiCol] = 'O';
        }
        setBoard([...newBoard]);
        setHistory(prev => [...prev, [...newBoard]]);

        const winnerAfterAI = checkWinner(newBoard);
        if (winnerAfterAI) {
          handleGameEnd(winnerAfterAI);
        } else {
          setIsPlayerTurn(true);
          setStatus('Your turn');
        }
      }, 500);
    } else if (gameMode === 'PVP') {
      newBoard[row][col] = currentPlayer;
      setBoard(newBoard);

      const winner = checkWinner(newBoard);
      if (winner) {
        handleGameEnd(winner);
        return;
      }

      const nextPlayer = currentPlayer === 'X' ? 'O' : 'X';
      setCurrentPlayer(nextPlayer);
      setStatus(`Turn: ${nextPlayer}`);
    }
  };

  const handleGameEnd = (winner: Player | 'draw') => {
    setStatus(winner === 'draw' ? "It's a draw!" : `Winner: ${winner}`);
    setGameOver(true);
    setShowCompany(winner === 'X');
    setScore(prev => ({
      ...prev,
      [winner]: prev[winner] + 1,
    }));
    if (winner === 'X') setShowConfetti(true);
  };

  const handleRestart = () => {
    setBoard(emptyBoard);
    setIsPlayerTurn(true);
    setStatus(gameMode === 'AI' ? 'Your turn' : 'Turn: X');
    setGameOver(false);
    setShowCompany(false);
    setCurrentPlayer('X');
    setShowConfetti(false);
    setHistory([emptyBoard]);
  };

  const handleChangeMode = () => {
    setGameMode(null);
    handleRestart();
  };

  const handleUndo = () => {
    if (history.length === 0 || gameOver) return;
    const prevHistory = [...history];
    const prevBoard = prevHistory.pop()!;
    setBoard(prevBoard);
    setHistory(prevHistory);
    setGameOver(false);
    setShowConfetti(false);
    if (gameMode === 'PVP') {
      setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
      setStatus(`Turn: ${currentPlayer === 'X' ? 'O' : 'X'}`);
    } else {
      setIsPlayerTurn(true);
      setStatus('Your turn');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeObj.background }]}>
      <ThemeIcon />
      <View style={styles.centeredContent}>
        <Text style={[styles.title, { color: themeObj.x }]}>Tic-Tac-Toe</Text>
        {showCompany && <Text style={[styles.company, { color: themeObj.o }]}>{COMPANY_NAME}</Text>}
        <Text style={[styles.status, { color: themeObj.text }]}>{status}</Text>
        {gameMode === 'AI' && renderAIDifficulty()}
        <Scoreboard score={score} theme={themeObj} />
        {showConfetti && (
          <>
            <Text style={[styles.festivalText, { color: '#e67e22' }]}>🎉 Congratulations! 🎉</Text>
            <ConfettiCannon
              count={200}
              origin={{ x: -10, y: 0 }}
              autoStart={true}
              fadeOut={true}
              explosionSpeed={350}
              fallSpeed={3000}
            />
          </>
        )}
        <Board board={board} onPress={handlePress} theme={themeObj} />
        <View style={styles.buttonRow}>
          <AppButton
            title="RESTART"
            onPress={handleRestart}
            backgroundColor={themeObj.button}
            textColor={themeObj.buttonText}
          />
          <AppButton
            title="UNDO"
            onPress={handleUndo}
            backgroundColor={themeObj.button}
            textColor={themeObj.buttonText}
            disabled={history.length === 0}
          />
          <AppButton
            title="CHANGE MODE"
            onPress={handleChangeMode}
            backgroundColor="#aaa"
            textColor="#fff"
          />
        </View>
        <Text style={[styles.modeLabel, { color: themeObj.text }]}>
          Mode: {gameMode === 'AI' ? 'Person vs AI' : 'Person vs Person'}
        </Text>
      </View>
    </SafeAreaView>
  );
}

// Scoreboard component
const Scoreboard: React.FC<{ score: { X: number; O: number; draw: number }, theme: any }> = ({ score, theme }) => (
  <View style={styles.scoreboard}>
    <Text style={[styles.scoreText, { color: theme.x }]}>X: {score.X}</Text>
    <Text style={[styles.scoreText, { color: theme.o }]}>O: {score.O}</Text>
    <Text style={[styles.scoreText, { color: theme.text }]}>Draw: {score.draw}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 25 : 0,
  },
  themeIconButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 20 : 35,
    right: 20,
    zIndex: 10,
    padding: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  title: { 
    fontSize: isSmallDevice ? 28 : isLargeDevice ? 40 : 36, 
    fontWeight: 'bold', 
    marginBottom: 10, 
    letterSpacing: 2,
    textAlign: 'center',
  },
  company: { 
    fontSize: isSmallDevice ? 18 : 22, 
    fontWeight: '600', 
    marginBottom: 8,
    textAlign: 'center',
  },
  status: { 
    fontSize: isSmallDevice ? 16 : 20, 
    marginBottom: 16,
    textAlign: 'center',
  },
  buttonRow: { 
    flexDirection: 'row', 
    marginTop: 24,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  modeLabel: { 
    marginTop: 20, 
    fontSize: isSmallDevice ? 14 : 16,
    textAlign: 'center',
  },
  modeButton: {
    paddingVertical: isSmallDevice ? 12 : 16,
    paddingHorizontal: isSmallDevice ? 24 : 32,
    borderRadius: 16,
    marginVertical: 10,
    minWidth: isSmallDevice ? 180 : 220,
    alignItems: 'center',
  },
  modeButtonText: {
    fontSize: isSmallDevice ? 16 : 20,
    fontWeight: '600',
    letterSpacing: 1,
  },
  festivalText: {
    fontSize: isSmallDevice ? 25 : 35,
    marginBottom: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  scoreboard: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
    marginTop: 10,
    flexWrap: 'wrap',
  },
  scoreText: {
    fontSize: isSmallDevice ? 16 : 18,
    fontWeight: 'bold',
    marginHorizontal: isSmallDevice ? 8 : 12,
  },
  difficultyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  difficultyLabel: {
    fontSize: isSmallDevice ? 14 : 16,
    marginRight: 10,
  },
  difficultyButton: {
    backgroundColor: '#e0e7ff',
    paddingVertical: 6,
    paddingHorizontal: isSmallDevice ? 12 : 16,
    borderRadius: 12,
    marginHorizontal: 4,
    marginVertical: 4,
  },
  difficultyButtonText: {
    fontWeight: 'bold',
    fontSize: isSmallDevice ? 14 : 16,
  },
});