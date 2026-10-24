import { describe, expect, it } from 'vitest';
import { PLAYER_O, PLAYER_X, STATUS } from './constants';
import {
  buildBoard,
  findWinner,
  getComputerMove,
  getGameState,
  toRowCol,
  validateMove,
} from './gameLogic';

const movesFromCells = (cells) =>
  cells.map((index, i) => ({
    number: i + 1,
    player: i % 2 === 0 ? PLAYER_X : PLAYER_O,
    ...toRowCol(index),
  }));

// 'X', 'O' or '.' per cell, row by row
const boardFrom = (layout) => layout.split('').map((c) => (c === '.' ? null : c));

describe('buildBoard', () => {
  it('rebuilds the board from the move list', () => {
    const board = buildBoard(movesFromCells([0, 4]));
    expect(board).toEqual(boardFrom('X...O....'));
  });
});

describe('win detection', () => {
  it('detects a row win', () => {
    expect(findWinner(boardFrom('XXXOO....'))).toEqual({ winner: 'X', cells: [0, 1, 2] });
  });

  it('detects a column win', () => {
    expect(findWinner(boardFrom('OX.OX.O..'))).toEqual({ winner: 'O', cells: [0, 3, 6] });
  });

  it('detects both diagonals', () => {
    expect(findWinner(boardFrom('XO.OX...X'))?.cells).toEqual([0, 4, 8]);
    expect(findWinner(boardFrom('XXO.O.O.X'))?.cells).toEqual([2, 4, 6]);
  });

  it('returns null when nobody has three in a line', () => {
    expect(findWinner(boardFrom('XOXXOOOXX'))).toBeNull();
  });
});

describe('getGameState', () => {
  it('starts with X and an empty board', () => {
    const state = getGameState([]);
    expect(state.currentPlayer).toBe(PLAYER_X);
    expect(state.status).toBe(STATUS.IN_PROGRESS);
    expect(state.board.every((cell) => cell === null)).toBe(true);
  });

  it('switches turns after each move', () => {
    expect(getGameState(movesFromCells([0])).currentPlayer).toBe(PLAYER_O);
    expect(getGameState(movesFromCells([0, 4])).currentPlayer).toBe(PLAYER_X);
  });

  it('reports the winner and winning cells', () => {
    const state = getGameState(movesFromCells([0, 3, 1, 4, 2]));
    expect(state.status).toBe(STATUS.WON);
    expect(state.winner).toBe(PLAYER_X);
    expect(state.winningCells).toEqual([0, 1, 2]);
  });

  it('marks a full board with no winner as a draw', () => {
    const state = getGameState(movesFromCells([0, 1, 2, 4, 3, 5, 7, 6, 8]));
    expect(state.status).toBe(STATUS.DRAW);
    expect(state.winner).toBeNull();
  });

  it('treats a win on the last cell as a win, not a draw', () => {
    // X completes the 0-4-8 diagonal with the ninth move
    const state = getGameState(movesFromCells([0, 1, 2, 5, 3, 6, 4, 7, 8]));
    expect(state.status).toBe(STATUS.WON);
    expect(state.winner).toBe(PLAYER_X);
  });
});

describe('validateMove', () => {
  const moves = movesFromCells([4]);

  it('accepts a valid move', () => {
    expect(validateMove(moves, { player: PLAYER_O, row: 0, col: 0 })).toBeNull();
  });

  it('rejects a move outside the board', () => {
    expect(validateMove(moves, { player: PLAYER_O, row: 3, col: 0 })).toMatch(/outside/);
    expect(validateMove(moves, { player: PLAYER_O, row: 0, col: -1 })).toMatch(/outside/);
  });

  it('rejects a move on an occupied cell', () => {
    expect(validateMove(moves, { player: PLAYER_O, row: 1, col: 1 })).toMatch(/already taken/);
  });

  it('rejects a move by the wrong player', () => {
    expect(validateMove(moves, { player: PLAYER_X, row: 0, col: 0 })).toMatch(/Player O's turn/);
  });

  it('rejects a move after the game is finished', () => {
    const finished = movesFromCells([0, 3, 1, 4, 2]);
    expect(validateMove(finished, { player: PLAYER_O, row: 2, col: 2 })).toMatch(/already over/);
  });
});

describe('getComputerMove', () => {
  it('takes the winning move first', () => {
    // O can win at 2, X could also win at 5 - winning wins
    expect(getComputerMove(boardFrom('OO.XX....'))).toBe(2);
  });

  it('blocks X when X is about to win', () => {
    expect(getComputerMove(boardFrom('XX..O....'))).toBe(2);
  });

  it('takes the center when nothing is urgent', () => {
    expect(getComputerMove(boardFrom('X........'))).toBe(4);
  });

  it('takes a corner when the center is gone', () => {
    expect(getComputerMove(boardFrom('....X....'))).toBe(0);
  });

  it('falls back to any free cell', () => {
    // center and corners filled, no line has two of a kind with a gap
    expect(getComputerMove(boardFrom('X.O.X.O.X'))).toBe(1);
  });

  it('only ever picks an empty cell', () => {
    const board = boardFrom('XOXOX.OX.');
    expect(board[getComputerMove(board)]).toBeNull();
  });

  it('returns null on a full board', () => {
    expect(getComputerMove(boardFrom('XOXXOOOXX'))).toBeNull();
  });
});
