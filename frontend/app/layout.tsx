import type { ReactNode } from 'react';
import Script from 'next/script';
import './globals.css';
import { Toaster } from 'sonner';
import { Sidebar } from '../components/layout/sidebar';
import { Topbar } from '../components/layout/topbar';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <Script src="https://cdn.tailwindcss.com" strategy="beforeInteractive" />
      </head>
      <body className="min-h-screen bg-slate-950 text-slate-100">
        <Toaster richColors position="top-right" />
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex min-h-screen flex-1 flex-col">
            <Topbar />
            <main className="flex-1 px-4 py-4 md:px-8 md:py-6">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
