'use client';

import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from './LanguageProvider';

export default function LanguageToggle() {
  const { lang, toggleLang } = useLanguage();

  return (
    <button
      onClick={toggleLang}
      className="p-2 rounded-xl bg-[#121624] border border-[#1e2538] text-gray-300 hover:text-white transition-all flex items-center gap-1.5 shadow-sm"
      title={lang === 'bn' ? 'Switch to English' : 'বাংলা ভাষায় পরিবর্তন করুন'}
    >
      <Globe className="w-4 h-4 text-cyan-400" />
      <span className="text-xs font-semibold uppercase tracking-wider text-cyan-300">
        {lang === 'bn' ? 'EN' : 'BN'}
      </span>
    </button>
  );
}
