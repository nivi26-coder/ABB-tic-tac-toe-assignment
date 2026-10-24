import { MODES } from '@/game/constants';
import styles from './ModeSelector.module.css';

const OPTIONS = [
  { value: MODES.TWO_PLAYER, label: 'Two Player' },
  { value: MODES.COMPUTER, label: 'Play vs Computer' },
];

export default function ModeSelector({ mode, onChange }) {
  return (
    <div className={styles.selector} role="group" aria-label="Game mode">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          className={styles.option}
          aria-pressed={mode === option.value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
