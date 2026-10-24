import clsx from 'clsx';
import { useId } from 'react';
import styles from './Panel.module.css';

export default function Panel({ title, hideTitle = false, accent, className, children }) {
  const titleId = useId();

  return (
    <section
      className={clsx(styles.panel, accent && styles[accent], className)}
      aria-labelledby={titleId}
    >
      <h2 id={titleId} className={hideTitle ? 'sr-only' : styles.title}>
        {title}
      </h2>
      {children}
    </section>
  );
}
