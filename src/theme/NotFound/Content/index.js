import React from 'react';
import Link from '@docusaurus/Link';

/** The site's own 404 text, in the same voice as the rest of the pages. */
export default function NotFoundContent() {
  return (
    <main className="e-page">
      <div className="e-measure">
        <h1>This page does not exist</h1>
        <p className="e-lede">
          It may have moved when the site was reorganized. The component
          pages and the repository list are now on{' '}
          <Link to="/how-it-works">How it works</Link>.
        </p>
        <p>
          Start from the <Link to="/">home page</Link>, the{' '}
          <Link to="/docs/intro">documentation</Link> or the{' '}
          <Link to="/news">news</Link>.
        </p>
      </div>
    </main>
  );
}
