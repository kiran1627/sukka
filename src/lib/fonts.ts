import { Playfair_Display, Inter, Great_Vibes } from 'next/font/google';

export const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800', '900'],
});

export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const greatVibes = Great_Vibes({
  subsets: ['latin'],
  variable: '--font-script',
  display: 'swap',
  weight: '400',
});
