export const PLAYER_X = 'X';
export const PLAYER_O = 'O';

export const MODES = {
  TWO_PLAYER: 'TwoPlayer',
  COMPUTER: 'Computer',
};

export const STATUS = {
  IN_PROGRESS: 'InProgress',
  WON: 'Won',
  DRAW: 'Draw',
};

export const BOARD_SIZE = 3;

// cells are indexed 0-8, left to right, top to bottom
export const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export const CENTER = 4;
export const CORNERS = [0, 2, 6, 8];
