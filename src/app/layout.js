import './globals.css';
import React from 'react';

export const metadata = {
  title: 'AEWS - Academic Early Warning System',
  description: 'Academic Support System for Institutional Overview',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="bg-[var(--color-surface)] text-[var(--color-on-surface)] font-sans antialiased">
        {children}
      </body>
    </html>
  );
}