import { BOARD_SIZE, CENTER, CORNERS, PLAYER_O, PLAYER_X, STATUS, WIN_LINES } from './constants';

export const toIndex = (row, col) => row * BOARD_SIZE + col;

export const toRowCol = (index) => ({
  row: Math.floor(index / BOARD_SIZE),
  col: index % BOARD_SIZE,
});

export const otherPlayer = (player) => (player === PLAYER_X ? PLAYER_O : PLAYER_X);

const isOnBoard = (n) => Number.isInteger(n) && n >= 0 && n < BOARD_SIZE;

export function buildBoard(moves) {
  const board = Array(BOARD_SIZE * BOARD_SIZE).fill(null);
  moves.forEach(({ player, row, col }) => {
    board[toIndex(row, col)] = player;
  });
  return board;
}

export function findWinner(board) {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], cells: line };
    }
  }
  return null;
}

// The move list is the single source of truth. Board, turn and result are
// always rebuilt from it, which keeps undo simple and the history accurate.
export function getGameState(moves) {
  const board = buildBoard(moves);
  const currentPlayer = moves.length % 2 === 0 ? PLAYER_X : PLAYER_O;
  const result = findWinner(board);

  if (result) {
    return {
      board,
      currentPlayer,
      status: STATUS.WON,
      winner: result.winner,
      winningCells: result.cells,
    };
  }

  const status = moves.length === board.length ? STATUS.DRAW : STATUS.IN_PROGRESS;
  return { board, currentPlayer, status, winner: null, winningCells: [] };
}

export function validateMove(moves, { player, row, col }) {
  const { board, currentPlayer, status } = getGameState(moves);

  if (status !== STATUS.IN_PROGRESS) {
    return 'The game is already over. Start a new game to keep playing.';
  }

  if (!isOnBoard(row) || !isOnBoard(col)) {
    return 'That move is outside the board.';
  }

  if (player !== currentPlayer) {
    return `It is Player ${currentPlayer}'s turn.`;
  }

  if (board[toIndex(row, col)]) {
    return 'That cell is already taken.';
  }

  return null;
}

// a line where the player already has two cells and the third one is empty
function findWinningMove(board, player) {
  for (const line of WIN_LINES) {
    const owned = line.filter((i) => board[i] === player);
    const empty = line.filter((i) => board[i] === null);
    if (owned.length === 2 && empty.length === 1) {
      return empty[0];
    }
  }
  return null;
}

// Cell 0 is a real move, so every check compares with null/undefined
// instead of relying on truthy values.
export function getComputerMove(board, computer = PLAYER_O) {
  const winningMove = findWinningMove(board, computer);
  if (winningMove !== null) {
    return winningMove;
  }

  const blockingMove = findWinningMove(board, otherPlayer(computer));
  if (blockingMove !== null) {
    return blockingMove;
  }

  if (board[CENTER] === null) {
    return CENTER;
  }

  const freeCorner = CORNERS.find((i) => board[i] === null);
  if (freeCorner !== undefined) {
    return freeCorner;
  }

  const freeCell = board.findIndex((cell) => cell === null);
  return freeCell === -1 ? null : freeCell;
}
