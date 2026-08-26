'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Mail, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function ForgotPasswordPage() {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate password reset request flow
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast.success('পাসওয়ার্ড রিসেট লিংক আপনার ইমেইলে পাঠানো হয়েছে (যদি একাউন্ট থাকে)।');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#090a0f] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Sparkles className="w-6 h-6 text-black" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">
              ReplyX <span className="text-emerald-400">AI</span>
            </span>
          </Link>
          <h2 className="text-2xl font-bold text-white tracking-tight">পাসওয়ার্ড রিসেট</h2>
          <p className="text-sm text-gray-400 mt-1">আপনার রেজিস্টার্ড ইমেইল অ্যাড্রেসটি প্রদান করুন</p>
        </div>

        <div className="bg-[#12141c] border border-[#1f2433] rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {submitted ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">ইমেইল পাঠানো হয়েছে</h3>
              <p className="text-sm text-gray-400 leading-relaxed mb-6">
                আপনার ইমেইল অ্যাড্রেসে পাসওয়ার্ড রিসেট করার লিংক পাঠানো হয়েছে। ইনবক্স অথবা স্প্যাম ফোল্ডার চেক করুন।
              </p>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-[#1a1f2e] hover:bg-[#252c40] text-gray-200 font-semibold text-sm transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> লগইন পেজে ফিরে যান
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  ইমেইল অ্যাড্রেস
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="আপনার অ্যাকাউন্টের ইমেইল দিন"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#0a0c13] border border-[#1e2538] rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-bold text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <span>প্রসেস করা হচ্ছে...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>রিসেট লিংক পাঠান</span>
                  </>
                )}
              </button>

              <div className="pt-4 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-200 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> লগইন পেজে ফিরে যান
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
