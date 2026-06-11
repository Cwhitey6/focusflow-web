/**
 * _document.tsx
 *
 * Custom Next.js document that adds global head tags to every page
 * Sets up the favicon PWA manifest and iOS home screen metadata
 * This file only runs on the server so it is the right place for
 * static meta tags that never change between pages
 */

import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>

        {/* favicon shown in the browser tab */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon-16x16.png" sizes="16x16" type="image/png" />
        <link rel="icon" href="/favicon-32x32.png" sizes="32x32" type="image/png" />

        {/* PWA manifest makes the app installable from the browser */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#7c6af7" />

        {/* iOS specific tags for adding to the home screen */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="FocusFlow" />
        <link rel="apple-touch-icon" href="/android-chrome-192x192.png" />

      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}