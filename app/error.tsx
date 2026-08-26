'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Client-side exception caught by error boundary:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#07090e] text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#0d111d] border border-emerald-500/30 rounded-3xl p-8 text-center shadow-2xl space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8 text-emerald-400" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-white mb-2">পেজ লোড করতে সাময়িক সমস্যা হয়েছে</h2>
          <p className="text-xs text-gray-400 leading-relaxed">
            ব্রাউজার ক্যাশ বা সংযোগের কারণে সমস্যা হতে পারে। রিফ্রেশ করে আবার চেষ্টা করুন।
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="flex-1 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center justify-center gap-2 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>আবার চেষ্টা করুন</span>
          </button>

          <Link
            href="/"
            className="flex-1 py-3 px-4 rounded-xl bg-[#171d2d] hover:bg-[#20273b] text-gray-300 font-semibold text-xs flex items-center justify-center gap-2 transition-all border border-[#232b3f]"
          >
            <Home className="w-4 h-4" />
            <span>হোমে ফিরুন</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
