import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PulseRevenue — AI Revenue Engine',
  description:
    'AI-powered autonomous revenue engine that hunts prospects, sends outreach, and closes deals 24/7',
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
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="vignette" />
        <div className="orb orb-gold" style={{ top: '10%', left: '15%', width: '500px', height: '500px', animationDelay: '0s' }} />
        <div className="orb orb-violet" style={{ top: '50%', right: '10%', width: '400px', height: '400px', animationDelay: '-7s' }} />
        <div className="orb orb-teal" style={{ bottom: '10%', left: '40%', width: '350px', height: '350px', animationDelay: '-14s' }} />
        {children}
      </body>
    </html>
  );
}
