'use client';

import React from 'react';
import { Menu, Bell, Sparkles } from 'lucide-react';
import ThemeToggle from '@/components/ui/ThemeToggle';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onOpenMobile?: () => void;
}

export default function Header({ title, subtitle, onOpenMobile }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-[#090a0f]/90 backdrop-blur-md border-b border-[#1a1f2e]">
      <div className="flex items-center gap-3">
        {onOpenMobile && (
          <button
            onClick={onOpenMobile}
            className="lg:hidden p-2 rounded-xl bg-[#121624] border border-[#1e2538] text-gray-300 hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">{title}</h1>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>AI ইঞ্জিন সক্রিয়</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Dark / Light Mode Toggle Button */}
          <ThemeToggle />

          <button
            className="p-2 rounded-xl bg-[#121624] border border-[#1e2538] text-gray-400 hover:text-white transition-colors relative"
            title="নোটিফিকেশন"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full"></span>
          </button>
        </div>
      </div>
    </header>
  );
}
