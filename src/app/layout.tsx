import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Stayin | Grand Horizon Hotel Solo',
  description:
    'Booking engine hotel mobile untuk Alfa Teve: pilih kamar, bayar, dan terima e-voucher dalam satu alur.',
  applicationName: 'Stayin Webview',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Stayin',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#EB6430',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id" className={inter.variable}>
      <body className="min-h-screen bg-slate-200 font-sans">
        <div className="relative mx-auto flex min-h-screen w-full max-w-[480px] flex-col bg-canvas shadow-2xl">
          {children}
        </div>
      </body>
    </html>
  );
}
