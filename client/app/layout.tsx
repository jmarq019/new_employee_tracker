import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import Nav from '@/components/nav';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Employee Tracker',
  description: 'Manage employees, roles, and departments',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Nav />
        <main className="min-h-screen bg-background">{children}</main>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
