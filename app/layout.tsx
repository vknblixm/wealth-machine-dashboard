import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Wealth Machine Dashboard | AI Revenue Hunter',
  description: 'Cinematic 3D interactive dashboard for exponential business scaling with AI agents',
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&display=swap"
          rel="preload"
          as="style"
        />
      </head>
      <body className="dark-bg grid-bg">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
