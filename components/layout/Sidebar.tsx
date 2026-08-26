'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Layers,
  Package,
  Bot,
  MessageSquare,
  ShoppingCart,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
  Sparkles,
  X,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface SidebarProps {
  user?: {
    id: string;
    fullName: string;
    businessName: string;
    email: string;
    role: string;
  } | null;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export default function Sidebar({ user, isOpenMobile, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const toast = useToast();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      toast.success('সফলভাবে লগআউট হয়েছে!');
      router.push('/login');
      router.refresh();
    } catch (e) {
      toast.error('লগআউট করতে ব্যর্থ হয়েছে।');
    }
  };

  const navItems = [
    { href: '/dashboard', label: 'ওভারভিউ', icon: LayoutDashboard },
    { href: '/dashboard/pages', label: 'পেজ সমূহ', icon: Layers },
    { href: '/dashboard/products', label: 'প্রোডাক্ট ইনভেন্টরি', icon: Package },
    { href: '/dashboard/ai-rules', label: 'AI নিয়মাবলী', icon: Bot },
    { href: '/dashboard/conversations', label: 'কথোপকথন', icon: MessageSquare },
    { href: '/dashboard/orders', label: 'অর্ডারসমূহ', icon: ShoppingCart },
    { href: '/dashboard/reports', label: 'রিপোর্ট ও অ্যানালিটিক্স', icon: BarChart3 },
    { href: '/dashboard/settings', label: 'ব্যবসার সেটিংস', icon: Settings },
    { href: '/dashboard/support', label: 'সাপোর্ট গাইড', icon: HelpCircle },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/70 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-[#0d0f17] border-r border-[#1a1f2e] flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div>
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#1a1f2e]">
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Sparkles className="w-5 h-5 text-black" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                  ReplyX <span className="text-emerald-400 font-extrabold">AI</span>
                </h1>
                <p className="text-[10px] text-gray-400 font-medium tracking-wide">স্মার্ট Messenger অটোমেশন</p>
              </div>
            </Link>
            {onCloseMobile && (
              <button
                onClick={onCloseMobile}
                className="lg:hidden text-gray-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            <div className="px-3 py-1.5 text-[11px] font-semibold tracking-wider text-gray-500 uppercase">
              মেনু
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => onCloseMobile && onCloseMobile()}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm font-semibold'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-[#141824]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-gray-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Info & Logout footer */}
        <div className="p-3 border-t border-[#1a1f2e] bg-[#0a0c13]">
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#121624] border border-[#1e2538]">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-gray-200 truncate">{user?.fullName || 'ব্যবহারকারী'}</p>
                <p className="text-[11px] text-gray-400 truncate">{user?.businessName || user?.email || 'Business'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="সাইন আউট"
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
