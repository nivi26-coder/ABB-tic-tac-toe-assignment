import clsx from 'clsx';
import { PLAYER_X } from '@/game/constants';
import styles from './Marker.module.css';

export default function Marker({ player, small = false, ...props }) {
  return (
    <span
      className={clsx(
        styles.marker,
        small && styles.small,
        player === PLAYER_X ? styles.x : styles.o,
      )}
      {...props}
    >
      {player}
    </span>
  );
}
