import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Bayu Insurance | Layanan Pengajuan Asuransi Digital Resmi OJK',
  description:
    'Portal nasabah digital untuk simulasi premi, pengajuan aplikasi asuransi jiwa, dan pemantauan polis secara transparan dan berstandar OJK.',
  icons: {
    icon: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={inter.variable}>
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-blue-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
