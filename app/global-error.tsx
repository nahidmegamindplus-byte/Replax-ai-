'use client';

import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="bn">
      <body className="bg-[#07090e] text-white min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md text-center space-y-4">
          <h2 className="text-xl font-bold">অ্যাপ্লিকেশনে সাময়িক ট্রানজিশন ত্রুটি</h2>
          <p className="text-xs text-gray-400">
            {error?.message || 'একটি ক্লায়েন্ট-সাইড প্রতিক্রিয়া দেখা দিয়েছে।'}
          </p>
          <button
            onClick={() => reset()}
            className="px-6 py-2.5 rounded-xl bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400 transition-all"
          >
            পুনরায় চেষ্টা করুন
          </button>
        </div>
      </body>
    </html>
  );
}
