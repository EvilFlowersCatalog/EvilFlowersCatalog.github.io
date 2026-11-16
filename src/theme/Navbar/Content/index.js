import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import {useLocation} from '@docusaurus/router';
import {useNavbarMobileSidebar} from '@docusaurus/theme-common/internal';
import NavbarColorModeToggle from '@theme/Navbar/ColorModeToggle';
import NavbarMobileSidebarToggle from '@theme/Navbar/MobileSidebar/Toggle';

import {NAV, GITHUB} from '@site/src/data/site';
import styles from './styles.module.css';

/**
 * The site's own header. Docusaurus still provides the frame (fixed bar, mobile
 * drawer with the docs menu); everything inside it is ours. The drawer lists
 * themeConfig.navbar.items, which docusaurus.config.js builds from the same NAV.
 */
export default function NavbarContent() {
  const mobileSidebar = useNavbarMobileSidebar();
  const {pathname} = useLocation();
  return (
    <div className={clsx('navbar__inner', styles.inner)}>
      <div className={styles.left}>
        {!mobileSidebar.disabled && <NavbarMobileSidebarToggle />}
        <Link to="/" className={styles.brand} aria-label="ELVIRA, home">
          <span className={styles.wordmark}>ELVIRA</span>
          <span className={styles.owner}>Slovak University of Technology</span>
        </Link>
      </div>
      <nav className={styles.links} aria-label="Sections">
        {NAV.map((item) => {
          const active = pathname.startsWith(item.match ?? item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={clsx(styles.link, active && styles.active)}
              aria-current={active ? 'page' : undefined}>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className={styles.right}>
        <a className={styles.link} href={GITHUB} target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
        <NavbarColorModeToggle className={styles.toggle} />
      </div>
    </div>
  );
}
