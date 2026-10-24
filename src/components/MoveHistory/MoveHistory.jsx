import { useEffect, useRef } from 'react';
import Marker from '@/components/Marker';
import Panel from '@/components/Panel';
import { formatPosition, twoDigits } from '@/utils/format';
import styles from './MoveHistory.module.css';

export default function MoveHistory({ moves, className }) {
  const scrollRef = useRef(null);

  // keep the latest move in view once the list starts scrolling
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [moves.length]);

  return (
    <Panel title="Move History" accent="pink" className={className}>
      <div className={styles.scroll} ref={scrollRef}>
        {moves.length === 0 ? (
          <p className={styles.empty}>No moves yet. X goes first.</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Move</th>
                <th scope="col">Player</th>
                <th scope="col">Position</th>
              </tr>
            </thead>
            <tbody>
              {moves.map((move) => (
                <tr key={move.number}>
                  <td>{twoDigits(move.number)}</td>
                  <td>
                    <Marker player={move.player} small />
                  </td>
                  <td>{formatPosition(move.row, move.col)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Panel>
  );
}
