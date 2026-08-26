import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '@/components/ui/Toast';
import { ThemeProvider } from '@/components/ui/ThemeProvider';

export const metadata: Metadata = {
  title: 'ReplyX AI — AI-Powered Facebook Messenger Automation',
  description: 'আপনার Facebook Messenger-এর জন্য স্মার্ট AI Sales & Customer Care Assistant। বাংলা, ইংলিশ ও ব্যাংলিশ সাপোর্ট সহ সম্পূর্ণ অটোমেশন।',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn" className="dark" suppressHydrationWarning>
      <body
        className="bg-[#090a0f] text-gray-100 antialiased selection:bg-emerald-500/30 selection:text-emerald-300"
        suppressHydrationWarning
      >
        <ThemeProvider>
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
