import {useEffect, useRef, useState} from 'react';
import clsx from 'clsx';

import styles from './styles.module.css';

export function useInView(options) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return undefined;
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      {threshold: 0.15, ...options},
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [options]);
  return [ref, inView];
}

export default function Reveal({
  children,
  className,
  as: Tag = 'div',
  delay = 0,
  ...rest
}) {
  const [ref, inView] = useInView();
  return (
    <Tag
      ref={ref}
      className={clsx(styles.reveal, inView && styles.revealIn, className)}
      style={delay ? {transitionDelay: `${delay}ms`} : undefined}
      {...rest}>
      {children}
    </Tag>
  );
}
