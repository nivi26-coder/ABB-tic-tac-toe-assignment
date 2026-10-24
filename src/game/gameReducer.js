import { MODES, PLAYER_O, PLAYER_X, STATUS } from './constants';
import { getComputerMove, getGameState, toRowCol, validateMove } from './gameLogic';

export const ACTIONS = {
  MOVE: 'move',
  COMPUTER_MOVE: 'computerMove',
  UNDO: 'undo',
  RESET_GAME: 'resetGame',
  CHANGE_MODE: 'changeMode',
  RESET_SCOREBOARD: 'resetScoreboard',
};

export const emptyScoreboard = () => ({ xWins: 0, oWins: 0, draws: 0 });

export function createInitialState(mode = MODES.TWO_PLAYER, scoreboard = emptyScoreboard()) {
  return {
    gameId: 1,
    mode,
    moves: [],
    scoreboard,
    error: null,
  };
}

function startNewGame(state, mode) {
  return {
    ...state,
    mode,
    gameId: state.gameId + 1,
    moves: [],
    error: null,
  };
}

function recordResult(scoreboard, moves) {
  const { status, winner } = getGameState(moves);

  if (status === STATUS.DRAW) {
    return { ...scoreboard, draws: scoreboard.draws + 1 };
  }
  if (status === STATUS.WON && winner === PLAYER_X) {
    return { ...scoreboard, xWins: scoreboard.xWins + 1 };
  }
  if (status === STATUS.WON && winner === PLAYER_O) {
    return { ...scoreboard, oWins: scoreboard.oWins + 1 };
  }
  return scoreboard;
}

// Every move, human or computer, goes through here. Moves are rejected once a
// game is over and undo is blocked after that, so a finished game is scored once.
function applyMove(state, player, row, col) {
  const moves = [...state.moves, { number: state.moves.length + 1, player, row, col }];

  return {
    ...state,
    moves,
    scoreboard: recordResult(state.scoreboard, moves),
    error: null,
  };
}

function playMove(state, move) {
  if (state.mode === MODES.COMPUTER && move.player !== PLAYER_X) {
    return { ...state, error: 'You play as X against the computer.' };
  }

  const error = validateMove(state.moves, move);
  if (error) {
    return { ...state, error };
  }

  return applyMove(state, move.player, move.row, move.col);
}

function playComputerMove(state) {
  const { board, currentPlayer, status } = getGameState(state.moves);

  // a late timer after undo, reset or a mode change must not play anything
  if (
    state.mode !== MODES.COMPUTER ||
    status !== STATUS.IN_PROGRESS ||
    currentPlayer !== PLAYER_O
  ) {
    return state;
  }

  const { row, col } = toRowCol(getComputerMove(board, PLAYER_O));
  return applyMove(state, PLAYER_O, row, col);
}

export function canUndo(state) {
  return state.moves.length > 0 && getGameState(state.moves).status === STATUS.IN_PROGRESS;
}

function undoMove(state) {
  if (!canUndo(state)) {
    const error =
      state.moves.length === 0
        ? 'There is nothing to undo.'
        : 'Undo is not available once the game is over.';
    return { ...state, error };
  }

  let moves = state.moves.slice(0, -1);

  // against the computer, take back its reply together with the human move before it
  if (state.mode === MODES.COMPUTER && state.moves.at(-1).player === PLAYER_O) {
    moves = moves.slice(0, -1);
  }

  return { ...state, moves, error: null };
}

export function gameReducer(state, action) {
  switch (action.type) {
    case ACTIONS.MOVE:
      return playMove(state, action.move);
    case ACTIONS.COMPUTER_MOVE:
      return playComputerMove(state);
    case ACTIONS.UNDO:
      return undoMove(state);
    case ACTIONS.RESET_GAME:
      return startNewGame(state, state.mode);
    case ACTIONS.CHANGE_MODE:
      return action.mode === state.mode ? state : startNewGame(state, action.mode);
    case ACTIONS.RESET_SCOREBOARD:
      return { ...state, scoreboard: emptyScoreboard(), error: null };
    default:
      return state;
  }
}
