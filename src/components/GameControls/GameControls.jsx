import clsx from 'clsx';
import styles from './GameControls.module.css';

export default function GameControls({ canUndo, onUndo, onResetGame, onResetScoreboard }) {
  return (
    <div className={styles.controls}>
      <button type="button" className={styles.button} onClick={onUndo} disabled={!canUndo}>
        Undo Last Move
      </button>
      <button type="button" className={clsx(styles.button, styles.primary)} onClick={onResetGame}>
        Reset Game
      </button>
      <button
        type="button"
        className={clsx(styles.button, styles.danger)}
        onClick={onResetScoreboard}
      >
        Reset Scoreboard
      </button>
    </div>
  );
}
