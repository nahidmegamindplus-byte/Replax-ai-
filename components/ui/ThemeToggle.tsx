'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-xl bg-[#121624] border border-[#1e2538] text-gray-300 hover:text-white transition-all flex items-center gap-1.5 shadow-sm"
      title={theme === 'dark' ? 'লাইট মোডে পরিবর্তন করুন' : 'ডার্ক মোডে পরিবর্তন করুন'}
    >
      {theme === 'dark' ? (
        <>
          <Sun className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-semibold hidden sm:inline text-amber-300">লাইট মোড</span>
        </>
      ) : (
        <>
          <Moon className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold hidden sm:inline text-emerald-400">ডার্ক মোড</span>
        </>
      )}
    </button>
  );
}
