import { useEffect, useReducer } from 'react';
import { MODES, PLAYER_O, PLAYER_X, STATUS } from '@/game/constants';
import { getGameState, toRowCol } from '@/game/gameLogic';
import {
  ACTIONS,
  canUndo,
  createInitialState,
  emptyScoreboard,
  gameReducer,
} from '@/game/gameReducer';
import { loadScoreboard, saveScoreboard } from '@/utils/storage';

// long enough to see the human move land before the computer answers
const COMPUTER_DELAY_MS = 450;

const initState = (mode) => createInitialState(mode, loadScoreboard() ?? emptyScoreboard());

export function useTicTacToe(initialMode = MODES.TWO_PLAYER) {
  const [state, dispatch] = useReducer(gameReducer, initialMode, initState);
  const game = getGameState(state.moves);

  const isComputerTurn =
    state.mode === MODES.COMPUTER &&
    game.status === STATUS.IN_PROGRESS &&
    game.currentPlayer === PLAYER_O;

  // Undo, reset or a mode change flips isComputerTurn back to false,
  // and the cleanup cancels the pending computer move.
  useEffect(() => {
    if (!isComputerTurn) {
      return undefined;
    }
    const timer = setTimeout(() => dispatch({ type: ACTIONS.COMPUTER_MOVE }), COMPUTER_DELAY_MS);
    return () => clearTimeout(timer);
  }, [isComputerTurn]);

  useEffect(() => {
    saveScoreboard(state.scoreboard);
  }, [state.scoreboard]);

  const playCell = (index) => {
    const { row, col } = toRowCol(index);
    const player = state.mode === MODES.COMPUTER ? PLAYER_X : game.currentPlayer;
    dispatch({ type: ACTIONS.MOVE, move: { player, row, col } });
  };

  return {
    ...state,
    ...game,
    isComputerTurn,
    canUndo: canUndo(state),
    playCell,
    undo: () => dispatch({ type: ACTIONS.UNDO }),
    resetGame: () => dispatch({ type: ACTIONS.RESET_GAME }),
    changeMode: (mode) => dispatch({ type: ACTIONS.CHANGE_MODE, mode }),
    resetScoreboard: () => dispatch({ type: ACTIONS.RESET_SCOREBOARD }),
  };
}
