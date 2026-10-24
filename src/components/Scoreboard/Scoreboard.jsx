import clsx from 'clsx';
import Panel from '@/components/Panel';
import { twoDigits } from '@/utils/format';
import styles from './Scoreboard.module.css';

export default function Scoreboard({ scoreboard, className }) {
  const items = [
    { label: 'X wins', value: scoreboard.xWins, tone: styles.x },
    { label: 'Draws', value: scoreboard.draws, tone: styles.draw },
    { label: 'O wins', value: scoreboard.oWins, tone: styles.o },
  ];

  return (
    <Panel title="Scoreboard" hideTitle accent="cyan" className={clsx(styles.panel, className)}>
      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.label} className={clsx(styles.item, item.tone)}>
            <span className={styles.label}>{item.label}</span>
            <span className={styles.value}>{twoDigits(item.value)}</span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
