import { describe, expect, it } from 'vitest';
import { MODES, PLAYER_O, PLAYER_X, STATUS } from './constants';
import { getGameState, toRowCol } from './gameLogic';
import { ACTIONS, canUndo, createInitialState, gameReducer } from './gameReducer';

const move = (player, index) => ({ type: ACTIONS.MOVE, move: { player, ...toRowCol(index) } });
const computerMove = { type: ACTIONS.COMPUTER_MOVE };

// plays cells in order, always as whoever's turn it is
function play(state, cells) {
  let current = state;
  for (const index of cells) {
    const { currentPlayer } = getGameState(current.moves);
    current = gameReducer(current, move(currentPlayer, index));
  }
  return current;
}

// human plays each cell as X and the computer answers straight away (the hook adds the delay)
function playVsComputer(state, cells) {
  let current = state;
  for (const index of cells) {
    current = gameReducer(current, move(PLAYER_X, index));
    current = gameReducer(current, computerMove);
  }
  return current;
}

const twoPlayer = () => createInitialState(MODES.TWO_PLAYER);
const vsComputer = () => createInitialState(MODES.COMPUTER);
const statusOf = (state) => getGameState(state.moves);

const X_WINS_TOP_ROW = [0, 3, 1, 4, 2];
const DRAW = [0, 1, 2, 4, 3, 5, 7, 6, 8];

describe('moves', () => {
  it('records a valid move and passes the turn', () => {
    const state = gameReducer(twoPlayer(), move(PLAYER_X, 4));

    expect(state.moves).toEqual([{ number: 1, player: PLAYER_X, row: 1, col: 1 }]);
    expect(statusOf(state).board[4]).toBe(PLAYER_X);
    expect(statusOf(state).currentPlayer).toBe(PLAYER_O);
    expect(state.error).toBeNull();
  });

  it('rejects an invalid move without changing the turn', () => {
    const before = gameReducer(twoPlayer(), move(PLAYER_X, 4));
    const after = gameReducer(before, move(PLAYER_O, 4));

    expect(after.moves).toBe(before.moves);
    expect(statusOf(after).currentPlayer).toBe(PLAYER_O);
    expect(after.error).toMatch(/already taken/);
  });

  it('clears the error after the next valid move', () => {
    let state = gameReducer(twoPlayer(), move(PLAYER_O, 0));
    expect(state.error).toMatch(/Player X's turn/);

    state = gameReducer(state, move(PLAYER_X, 0));
    expect(state.error).toBeNull();
  });

  it('rejects any move after the game is over', () => {
    const won = play(twoPlayer(), X_WINS_TOP_ROW);
    const after = gameReducer(won, move(PLAYER_O, 8));

    expect(after.moves).toHaveLength(5);
    expect(after.error).toMatch(/already over/);
  });
});

describe('scoreboard', () => {
  it('can start from a saved scoreboard', () => {
    const saved = { xWins: 3, oWins: 1, draws: 2 };
    expect(createInitialState(MODES.TWO_PLAYER, saved).scoreboard).toEqual(saved);
  });

  it('counts a win for the winner', () => {
    const state = play(twoPlayer(), X_WINS_TOP_ROW);
    expect(statusOf(state).status).toBe(STATUS.WON);
    expect(state.scoreboard).toEqual({ xWins: 1, oWins: 0, draws: 0 });
  });

  it('counts an O win', () => {
    const state = play(twoPlayer(), [0, 2, 1, 4, 8, 6]);
    expect(statusOf(state).winner).toBe(PLAYER_O);
    expect(state.scoreboard).toEqual({ xWins: 0, oWins: 1, draws: 0 });
  });

  it('counts a draw', () => {
    const state = play(twoPlayer(), DRAW);
    expect(statusOf(state).status).toBe(STATUS.DRAW);
    expect(state.scoreboard).toEqual({ xWins: 0, oWins: 0, draws: 1 });
  });

  it('updates only once for a finished game', () => {
    let state = play(twoPlayer(), X_WINS_TOP_ROW);
    state = gameReducer(state, move(PLAYER_O, 8));
    state = gameReducer(state, { type: ACTIONS.UNDO });

    expect(state.scoreboard).toEqual({ xWins: 1, oWins: 0, draws: 0 });
  });

  it('keeps adding up across games', () => {
    let state = play(twoPlayer(), X_WINS_TOP_ROW);
    state = gameReducer(state, { type: ACTIONS.RESET_GAME });
    state = play(state, DRAW);

    expect(state.scoreboard).toEqual({ xWins: 1, oWins: 0, draws: 1 });
  });

  it('can be reset on its own', () => {
    let state = play(twoPlayer(), [0, 3, 1, 4]);
    state = { ...state, scoreboard: { xWins: 2, oWins: 1, draws: 3 } };
    state = gameReducer(state, { type: ACTIONS.RESET_SCOREBOARD });

    expect(state.scoreboard).toEqual({ xWins: 0, oWins: 0, draws: 0 });
    expect(state.moves).toHaveLength(4);
  });
});

describe('reset game', () => {
  it('starts a fresh game but keeps the scoreboard', () => {
    const won = play(twoPlayer(), X_WINS_TOP_ROW);
    const state = gameReducer(won, { type: ACTIONS.RESET_GAME });
    const game = statusOf(state);

    expect(state.moves).toEqual([]);
    expect(game.board.every((cell) => cell === null)).toBe(true);
    expect(game.status).toBe(STATUS.IN_PROGRESS);
    expect(game.winner).toBeNull();
    expect(game.currentPlayer).toBe(PLAYER_X);
    expect(state.gameId).toBe(won.gameId + 1);
    expect(state.scoreboard).toEqual({ xWins: 1, oWins: 0, draws: 0 });
  });
});

describe('undo', () => {
  it('is not available before any move', () => {
    const state = twoPlayer();
    expect(canUndo(state)).toBe(false);
    expect(gameReducer(state, { type: ACTIONS.UNDO }).error).toMatch(/nothing to undo/);
  });

  it('removes only the last move in two player mode', () => {
    const state = gameReducer(play(twoPlayer(), [0, 4]), { type: ACTIONS.UNDO });

    expect(state.moves).toEqual([{ number: 1, player: PLAYER_X, row: 0, col: 0 }]);
    expect(statusOf(state).board[4]).toBeNull();
    expect(statusOf(state).currentPlayer).toBe(PLAYER_O);
  });

  it('removes the computer move and the human move before it', () => {
    const afterMove = playVsComputer(vsComputer(), [0]);
    expect(afterMove.moves).toHaveLength(2);

    const state = gameReducer(afterMove, { type: ACTIONS.UNDO });
    expect(state.moves).toEqual([]);
    expect(statusOf(state).currentPlayer).toBe(PLAYER_X);
  });

  it('keeps earlier moves when undoing in computer mode', () => {
    const state = gameReducer(playVsComputer(vsComputer(), [0, 8]), { type: ACTIONS.UNDO });

    expect(state.moves.map((m) => m.number)).toEqual([1, 2]);
    expect(statusOf(state).currentPlayer).toBe(PLAYER_X);
  });

  it('takes back only the human move if the computer has not answered yet', () => {
    const waiting = gameReducer(vsComputer(), move(PLAYER_X, 0));
    const state = gameReducer(waiting, { type: ACTIONS.UNDO });

    expect(state.moves).toEqual([]);
    expect(statusOf(state).currentPlayer).toBe(PLAYER_X);
  });

  it('is disabled once the game is over', () => {
    const won = play(twoPlayer(), X_WINS_TOP_ROW);
    const state = gameReducer(won, { type: ACTIONS.UNDO });

    expect(canUndo(won)).toBe(false);
    expect(state.moves).toHaveLength(5);
    expect(state.error).toMatch(/not available/);
  });
});

describe('computer mode', () => {
  it('hands the turn to the computer after the human move', () => {
    const state = gameReducer(vsComputer(), move(PLAYER_X, 0));

    expect(state.moves).toHaveLength(1);
    expect(statusOf(state).currentPlayer).toBe(PLAYER_O);
  });

  it('plays the computer move when asked', () => {
    const state = gameReducer(gameReducer(vsComputer(), move(PLAYER_X, 0)), computerMove);

    expect(state.moves).toEqual([
      { number: 1, player: PLAYER_X, row: 0, col: 0 },
      { number: 2, player: PLAYER_O, row: 1, col: 1 },
    ]);
    expect(statusOf(state).currentPlayer).toBe(PLAYER_X);
  });

  it('blocks the human when they threaten to win', () => {
    // X 0, O 4 (center), X 1 -> computer has to block at 2
    const state = playVsComputer(vsComputer(), [0, 1]);
    expect(state.moves.at(-1)).toMatchObject({ player: PLAYER_O, row: 0, col: 2 });
  });

  it('does not let the human play as O', () => {
    const state = gameReducer(vsComputer(), move(PLAYER_O, 0));
    expect(state.moves).toEqual([]);
    expect(state.error).toMatch(/play as X/);
  });

  it('does not let the human move while the computer is thinking', () => {
    const waiting = gameReducer(vsComputer(), move(PLAYER_X, 0));
    const state = gameReducer(waiting, move(PLAYER_X, 8));

    expect(state.moves).toHaveLength(1);
    expect(state.error).toMatch(/Player O's turn/);
  });

  it('ignores a computer move when it is not the computer turn', () => {
    const humanTurn = vsComputer();
    expect(gameReducer(humanTurn, computerMove)).toBe(humanTurn);

    const twoPlayerGame = play(twoPlayer(), [0]);
    expect(gameReducer(twoPlayerGame, computerMove)).toBe(twoPlayerGame);
  });

  it('does not move after the game is over', () => {
    // X already has 0 and 1, so playing 2 ends the game before the computer's turn
    const almostDone = {
      ...vsComputer(),
      moves: [
        { number: 1, player: PLAYER_X, row: 0, col: 0 },
        { number: 2, player: PLAYER_O, row: 1, col: 1 },
        { number: 3, player: PLAYER_X, row: 0, col: 1 },
        { number: 4, player: PLAYER_O, row: 1, col: 0 },
      ],
    };
    const won = gameReducer(almostDone, move(PLAYER_X, 2));
    const state = gameReducer(won, computerMove);

    expect(statusOf(state).winner).toBe(PLAYER_X);
    expect(state).toBe(won);
    expect(state.moves.at(-1).player).toBe(PLAYER_X);
  });

  it('can win against a careless human', () => {
    // X 1 -> O center, X 2 -> O blocks at 0, X 7 -> O finishes the 0-4-8 diagonal
    const state = playVsComputer(vsComputer(), [1, 2, 7]);
    const game = statusOf(state);

    expect(game.status).toBe(STATUS.WON);
    expect(game.winner).toBe(PLAYER_O);
    expect(state.scoreboard.oWins).toBe(1);
  });
});

describe('changing mode', () => {
  it('starts a new game in the selected mode and keeps the score', () => {
    const won = play(twoPlayer(), X_WINS_TOP_ROW);
    const state = gameReducer(won, { type: ACTIONS.CHANGE_MODE, mode: MODES.COMPUTER });

    expect(state.mode).toBe(MODES.COMPUTER);
    expect(state.moves).toEqual([]);
    expect(state.scoreboard.xWins).toBe(1);
  });

  it('does nothing when the same mode is picked again', () => {
    const state = play(twoPlayer(), [0]);
    expect(gameReducer(state, { type: ACTIONS.CHANGE_MODE, mode: MODES.TWO_PLAYER })).toBe(state);
  });
});
