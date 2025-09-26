import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Starter Commerce CMS',
  description: 'Composable admin dashboard backed by Supabase'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-100">
        <div className="mx-auto flex min-h-screen max-w-6xl flex-col p-6">{children}</div>
      </body>
    </html>
  );
}
