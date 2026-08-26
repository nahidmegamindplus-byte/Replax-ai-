'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type Language = 'bn' | 'en';

export const translations: Record<Language, Record<string, string>> = {
  bn: {
    dashboard: 'ড্যাশবোর্ড',
    pages: 'Facebook Page সমূহ',
    aiRules: 'এআই রুলস ও প্রম্পট',
    conversations: 'লাইভ কাস্টমার চ্যাট',
    orders: 'অর্ডারসমূহ',
    products: 'প্রোডাক্ট ইনভেন্টরি',
    reports: 'রিপোর্টস ও এনালাইটিক্স',
    support: 'হেল্প ও সাপোর্ট',
    settings: 'সেটিংস',
    adminUsers: 'ইউজার ম্যানেজমেন্ট',
    adminPackages: 'প্যাকেজসমূহ',
    adminOrders: 'প্যাকেজ অর্ডারসমূহ',
    adminPayments: 'পেমেন্ট মেথড',
    adminAi: 'এআই এপিআই কী',
    adminSubscriptions: 'সাবস্ক্রিপশনসমূহ',
    logout: 'লগআউট',
    darkMode: 'ডার্ক মোড',
    lightMode: 'লাইট মোড',
    connectPage: 'নতুন Page সংযুক্ত করুন',
    connectedPages: 'সংযুক্ত পেজ তালিকা',
    testConnection: 'কানেকশন টেস্ট',
    edit: 'এডিট',
    delete: 'মুছে ফেলুন',
    save: 'সংরক্ষণ করুন',
    cancel: 'বাতিল',
    active: 'সক্রিয়',
    inactive: 'বন্ধ',
    search: 'খুঁজুন...',
    allStatus: 'সকল স্ট্যাটাস',
    totalUsers: 'মোট ইউজার',
    activeSubscribers: 'সক্রিয় সাবস্ক্রাইবার',
    totalOrders: 'মোট অর্ডার',
    totalRevenue: 'মোট রেভিনিউ',
    language: 'ভাষা',
    bangla: 'বাংলা',
    english: 'English',
  },
  en: {
    dashboard: 'Dashboard',
    pages: 'Facebook Pages',
    aiRules: 'AI Rules & Prompts',
    conversations: 'Live Conversations',
    orders: 'Orders',
    products: 'Products',
    reports: 'Reports & Analytics',
    support: 'Help & Support',
    settings: 'Settings',
    adminUsers: 'User Management',
    adminPackages: 'Packages',
    adminOrders: 'Package Orders',
    adminPayments: 'Payment Methods',
    adminAi: 'AI API Keys',
    adminSubscriptions: 'Subscriptions',
    logout: 'Logout',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    connectPage: 'Connect New Page',
    connectedPages: 'Connected Pages',
    testConnection: 'Test Connection',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save',
    cancel: 'Cancel',
    active: 'Active',
    inactive: 'Inactive',
    search: 'Search...',
    allStatus: 'All Status',
    totalUsers: 'Total Users',
    activeSubscribers: 'Active Subscribers',
    totalOrders: 'Total Orders',
    totalRevenue: 'Total Revenue',
    language: 'Language',
    bangla: 'Bangla',
    english: 'English',
  },
};

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('bn');

  useEffect(() => {
    const savedLang = localStorage.getItem('replyx-lang') as Language | null;
    if (savedLang === 'en' || savedLang === 'bn') {
      setLangState(savedLang);
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('replyx-lang', newLang);
  };

  const toggleLang = () => {
    const nextLang = lang === 'bn' ? 'en' : 'bn';
    setLang(nextLang);
  };

  const t = (key: string): string => {
    return translations[lang]?.[key] || translations['bn']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      lang: 'bn' as Language,
      setLang: () => {},
      toggleLang: () => {},
      t: (key: string) => key,
    };
  }
  return context;
}
