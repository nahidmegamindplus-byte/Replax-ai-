'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdminSidebar from './AdminSidebar';
import Header from './Header';
import { ToastProvider } from '@/components/ui/Toast';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export default function AdminLayout({ children, title, subtitle }: AdminLayoutProps) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isUnauthorized, setIsUnauthorized] = useState(false);

  useEffect(() => {
    async function checkAdminAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          router.push('/login');
          return;
        }
        const data = await res.json();
        if (data.success && data.user) {
          if (data.user.role !== 'ADMIN') {
            setIsUnauthorized(true);
          } else {
            setUser(data.user);
          }
        } else {
          router.push('/login');
        }
      } catch (err) {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }

    checkAdminAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090710] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-purple-300 font-medium">অ্যাডমিন অধিকার যাচাই করা হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (isUnauthorized) {
    return (
      <div className="min-h-screen bg-[#090710] flex items-center justify-center p-4">
        <div className="bg-[#140f24] border border-red-500/30 rounded-3xl p-8 sm:p-12 text-center max-w-md w-full shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mx-auto mb-4 border border-red-500/20">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">অ্যাক্সেস ডিনাইড (Access Denied)</h3>
          <p className="text-xs text-red-300 mb-6 leading-relaxed">
            এই পেজটি শুধুমাত্র সিস্টেম অ্যাডমিনিস্ট্রেটরদের জন্য সংরক্ষিত। আপনার অ্যাকাউন্টে অ্যাডমিন পারমিশন নেই।
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>ইউজার ড্যাশবোর্ডে ফিরে যান</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#090710] text-gray-100 flex flex-col">
        <AdminSidebar
          user={user}
          isOpenMobile={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
        />

        <div className="lg:pl-64 flex-1 flex flex-col min-h-screen">
          <Header
            title={title}
            subtitle={subtitle}
            onOpenMobile={() => setMobileOpen(true)}
          />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
