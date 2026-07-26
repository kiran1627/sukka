import type { Metadata } from 'next';
import { playfair, inter, greatVibes } from '@/lib/fonts';
import './globals.css';

export const metadata: Metadata = {
  title: 'AURORA — A Birthday Experience',
  description:
    'An interactive cinematic birthday experience crafted with love. A journey through memories, emotions, and magic.',
  keywords: ['birthday', 'interactive', 'experience', 'love', 'memories'],
  authors: [{ name: 'Aurora' }],
  openGraph: {
    title: 'AURORA — A Birthday Experience',
    description: 'An interactive cinematic birthday experience crafted with love.',
    type: 'website',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} ${greatVibes.variable}`}
    >
      <head>
        <meta name="theme-color" content="#050505" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
      </head>
      <body className="bg-aurora-bg-deep font-sans antialiased">
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(registration) {
                    console.log('ServiceWorker registration successful');
                  }, function(err) {
                    console.log('ServiceWorker registration failed: ', err);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
