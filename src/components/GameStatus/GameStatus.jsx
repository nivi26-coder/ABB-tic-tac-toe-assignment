import clsx from 'clsx';
import Marker from '@/components/Marker';
import { MODES, PLAYER_X, STATUS } from '@/game/constants';
import { twoDigits } from '@/utils/format';
import styles from './GameStatus.module.css';

function getMessage({ status, currentPlayer, winner, mode }) {
  const vsComputer = mode === MODES.COMPUTER;

  if (status === STATUS.WON) {
    if (vsComputer) {
      return winner === PLAYER_X ? 'You win!' : 'Computer wins!';
    }
    return `Player ${winner} wins!`;
  }

  if (status === STATUS.DRAW) {
    return "It's a draw!";
  }

  if (vsComputer) {
    return currentPlayer === PLAYER_X ? 'Your turn (X)' : 'Computer is thinking...';
  }

  return `Player ${currentPlayer}'s turn`;
}

export default function GameStatus({ gameId, status, currentPlayer, winner, mode }) {
  const isOver = status !== STATUS.IN_PROGRESS;
  const marker = isOver ? winner : currentPlayer;
  const isThinking = mode === MODES.COMPUTER && !isOver && currentPlayer !== PLAYER_X;

  return (
    <div
      className={clsx(
        styles.status,
        status === STATUS.WON && styles.won,
        status === STATUS.DRAW && styles.draw,
        isThinking && styles.thinking,
      )}
    >
      <div className={styles.meta}>
        <span>Game {twoDigits(gameId)}</span>
        <span>{mode === MODES.COMPUTER ? 'You (X) vs CPU (O)' : '2 Player mode'}</span>
      </div>
      <p className={styles.message} role="status">
        {marker && <Marker player={marker} aria-hidden="true" />}
        <span>{getMessage({ status, currentPlayer, winner, mode })}</span>
      </p>
    </div>
  );
}
