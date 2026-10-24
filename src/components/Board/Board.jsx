import clsx from 'clsx';
import { useRef, useState } from 'react';
import { BOARD_SIZE, PLAYER_O, PLAYER_X } from '@/game/constants';
import { toIndex, toRowCol } from '@/game/gameLogic';
import { formatPosition } from '@/utils/format';
import styles from './Board.module.css';

const LAST = BOARD_SIZE - 1;

// arrow keys move around the grid and stop at the edges
function getNextIndex(index, key) {
  const { row, col } = toRowCol(index);

  switch (key) {
    case 'ArrowUp':
      return toIndex(Math.max(row - 1, 0), col);
    case 'ArrowDown':
      return toIndex(Math.min(row + 1, LAST), col);
    case 'ArrowLeft':
      return toIndex(row, Math.max(col - 1, 0));
    case 'ArrowRight':
      return toIndex(row, Math.min(col + 1, LAST));
    default:
      return null;
  }
}

export default function Board({ board, winningCells, turn, locked, waiting, onCellClick }) {
  // Only one cell is in the tab order at a time (roving tabindex), so Tab jumps
  // over the board in one step and the arrow keys move inside it.
  const [focusedIndex, setFocusedIndex] = useState(0);
  const cellRefs = useRef([]);

  const handleKeyDown = (event) => {
    const next = getNextIndex(focusedIndex, event.key);
    if (next === null) {
      return;
    }
    event.preventDefault();
    setFocusedIndex(next);
    cellRefs.current[next].focus();
  };

  return (
    <div className={styles.wrap}>
      <div
        className={clsx(styles.board, locked && styles.locked, waiting && styles.waiting)}
        data-turn={locked || waiting ? undefined : turn}
        role="group"
        aria-label="Game board"
        onKeyDown={handleKeyDown}
      >
        {board.map((value, index) => {
          const { row, col } = toRowCol(index);
          const isWinning = winningCells.includes(index);
          const label = `${formatPosition(row, col)}, ${value ?? 'empty'}${isWinning ? ', winning' : ''}`;

          // aria-disabled instead of disabled: a filled cell stays focusable,
          // so keyboard players never lose their place on the board
          const isPlayable = !locked && !waiting && value === null;

          return (
            <button
              key={index}
              ref={(element) => {
                cellRefs.current[index] = element;
              }}
              type="button"
              className={clsx(
                styles.cell,
                value === PLAYER_X && styles.x,
                value === PLAYER_O && styles.o,
                isWinning && styles.winning,
              )}
              tabIndex={index === focusedIndex ? 0 : -1}
              aria-disabled={!isPlayable}
              aria-label={label}
              onFocus={() => setFocusedIndex(index)}
              onClick={() => {
                if (isPlayable) {
                  onCellClick(index);
                }
              }}
            >
              {value}
            </button>
          );
        })}
      </div>
    </div>
  );
}
