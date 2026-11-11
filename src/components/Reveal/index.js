import {useEffect, useRef, useState} from 'react';
import clsx from 'clsx';

import styles from './styles.module.css';

/**
 * Fade a block in when it scrolls into view.
 *
 * The server-rendered HTML is fully visible, so crawlers, link previews,
 * no-JS readers and full-page screenshots see every section. Only after
 * hydration are blocks that sit below the fold hidden and then revealed;
 * blocks already on screen are never hidden, so nothing flashes.
 *
 * Phases: 'static' (SSR, visible) → 'hidden' (below the fold) → 'shown'.
 */
export function useReveal() {
  const ref = useRef(null);
  const [phase, setPhase] = useState('static');
  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      return undefined;
    }
    const rect = node.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      return undefined;
    }
    setPhase('hidden');
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPhase('shown');
          obs.disconnect();
        }
      },
      {threshold: 0.12},
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, []);
  return [ref, phase];
}

export default function Reveal({
  children,
  className,
  as: Tag = 'div',
  delay = 0,
  style,
  ...rest
}) {
  const [ref, phase] = useReveal();
  const merged = delay ? {...style, transitionDelay: `${delay}ms`} : style;
  return (
    <Tag
      ref={ref}
      className={clsx(
        phase === 'hidden' && styles.hidden,
        phase === 'shown' && styles.shown,
        className,
      )}
      style={merged}
      {...rest}>
      {children}
    </Tag>
  );
}
