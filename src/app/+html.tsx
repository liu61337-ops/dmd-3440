import type { PropsWithChildren } from 'react';
import { ScrollViewStyleReset, useServerDocumentContext } from 'expo-router/html';

/**
 * Web-only HTML document (ignored on iOS / Android).
 *
 * `<meta name="referrer" content="no-referrer">` stops the browser from sending
 * `Referer: http://localhost:…` with API calls and artwork images. The Art Institute
 * of Chicago's Cloudflare firewall answers those requests with 403, which shows up as a
 * CORS error / broken images during local web development.
 */
export default function Root({ children }: PropsWithChildren) {
  const { htmlAttributes, bodyAttributes, headNodes, bodyNodes } = useServerDocumentContext();
  return (
    <html lang="en" {...htmlAttributes}>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="referrer" content="no-referrer" />
        <ScrollViewStyleReset />
        {headNodes}
      </head>
      <body {...bodyAttributes}>
        {children}
        {bodyNodes}
      </body>
    </html>
  );
}
