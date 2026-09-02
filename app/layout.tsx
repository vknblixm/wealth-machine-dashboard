import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PulseRevenue | AI Revenue Engine',
  description:
    'AI-powered autonomous revenue engine — hunts prospects, sends outreach, and closes deals 24/7',
  openGraph: {
    title: 'PulseRevenue — AI Revenue Engine',
    description: 'Autonomous AI that hunts prospects, sends outreach, and closes deals for you.',
    url: 'https://pulserevenue.vercel.app',
    siteName: 'PulseRevenue',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="grid-bg">{children}</body>
    </html>
  );
}
