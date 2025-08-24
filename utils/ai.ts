import type { BoardType, Player, Cell } from '../App';

// Returns 'X', 'O', 'draw', or null
export function checkWinner(board: BoardType): Player | 'draw' | null {
  // Rows, columns, diagonals
  for (let i = 0; i < 3; i++) {
    if (board[i][0] && board[i][0] === board[i][1] && board[i][1] === board[i][2])
      return board[i][0] as Player;
    if (board[0][i] && board[0][i] === board[1][i] && board[1][i] === board[2][i])
      return board[0][i] as Player;
  }
  if (board[0][0] && board[0][0] === board[1][1] && board[1][1] === board[2][2])
    return board[0][0] as Player;
  if (board[0][2] && board[0][2] === board[1][1] && board[1][1] === board[2][0])
    return board[0][2] as Player;

  // Draw
  if (board.flat().every(cell => cell)) return 'draw';

  return null;
}

// Minimax AI
export function getBestMove(board: BoardType, aiPlayer: Player): [number, number] {
  let bestScore = -Infinity;
  let move: [number, number] = [-1, -1];
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (!board[i][j]) {
        board[i][j] = aiPlayer;
        let score = minimax(board, 0, false, aiPlayer);
        board[i][j] = '';
        if (score > bestScore) {
          bestScore = score;
          move = [i, j];
        }
      }
    }
  }
  return move;
}

function minimax(
  board: BoardType,
  depth: number,
  isMaximizing: boolean,
  aiPlayer: Player
): number {
  const humanPlayer: Player = aiPlayer === 'X' ? 'O' : 'X';
  const winner = checkWinner(board);
  if (winner === aiPlayer) return 10 - depth;
  if (winner === humanPlayer) return depth - 10;
  if (winner === 'draw') return 0;

  if (isMaximizing) {
    let best = -Infinity;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (!board[i][j]) {
          board[i][j] = aiPlayer;
          best = Math.max(best, minimax(board, depth + 1, false, aiPlayer));
          board[i][j] = '';
        }
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (!board[i][j]) {
          board[i][j] = humanPlayer;
          best = Math.min(best, minimax(board, depth + 1, true, aiPlayer));
          board[i][j] = '';
        }
      }
    }
    return best;
  }
}

export function getRandomMove(board: BoardType): [number, number] {
  const empty: [number, number][] = [];
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (!board[i][j]) empty.push([i, j]);
    }
  }
  if (empty.length === 0) return [-1, -1];
  return empty[Math.floor(Math.random() * empty.length)];
}