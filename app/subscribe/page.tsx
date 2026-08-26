'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  CheckCircle2,
  Zap,
  Clock,
  ArrowRight,
  RefreshCw,
  ShieldCheck,
  Star,
  Check,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function SubscribePage() {
  const router = useRouter();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [packages, setPackages] = useState<any[]>([]);

  const loadData = async () => {
    try {
      setLoading(true);

      const [userRes, subRes, pkgRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/packages/my-subscription'),
        fetch('/api/packages'),
      ]);

      const userData = await userRes.json();
      if (userData.success && userData.user) {
        setCurrentUser(userData.user);
      }

      const subData = await subRes.json();
      if (subData.success) {
        setSubscription(subData.subscription);
      }

      const pkgData = await pkgRes.json();
      if (pkgData.success) {
        setPackages(pkgData.packages || []);
      }
    } catch (e) {
      toast.error('তথ্য লোড করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectPackage = (packageId: string) => {
    router.push(`/checkout?packageId=${packageId}`);
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090e] flex items-center justify-center text-white">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-gray-400">প্যাকেজ তথ্য লোড হচ্ছে...</span>
        </div>
      </div>
    );
  }

  // Active Subscriber View
  if (subscription?.planStatus === 'ACTIVE' || currentUser?.role === 'ADMIN') {
    return (
      <div className="min-h-screen bg-[#07090e] text-white flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#11141e] border border-emerald-500/30 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-bold text-white mb-2">সাবস্ক্রিপশন সক্রিয় আছে</h2>
          <p className="text-xs text-gray-400 mb-6">
            আপনার <span className="text-emerald-400 font-bold">{subscription?.activePackage?.name || subscription?.plan}</span> প্যাকেজটি বর্তমানে সক্রিয় আছে।
          </p>

          <div className="p-4 rounded-2xl bg-[#090b14] border border-[#1f2433] text-left text-xs space-y-2 mb-6">
            <div className="flex justify-between">
              <span className="text-gray-400">গ্রাহকের নাম:</span>
              <span className="font-semibold text-white">{currentUser?.fullName}</span>
            </div>
            {currentUser?.facebookPageUrl && (
              <div className="flex justify-between">
                <span className="text-gray-400">ফেসবুক পেজ:</span>
                <span className="font-mono text-emerald-400 truncate max-w-[200px]">{currentUser.facebookPageUrl}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-400">মাসিক AI মেসেজ লিমিট:</span>
              <span className="font-mono text-emerald-400 font-bold">{subscription?.monthlyMessageLimit?.toLocaleString()} টি</span>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all"
          >
            <span>ড্যাশবোর্ডে প্রবেশ করুন</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // Pending Approval View
  if (subscription?.planStatus === 'PENDING_APPROVAL' && subscription?.latestOrder?.status === 'PENDING') {
    const order = subscription.latestOrder;
    return (
      <div className="min-h-screen bg-[#07090e] text-white flex flex-col items-center justify-center p-4">
        <div className="max-w-lg w-full bg-[#11141e] border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Clock className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-bold text-white text-center mb-1">পেমেন্ট ভেরিফিকেশন অপেক্ষমান</h2>
          <p className="text-xs text-amber-300/80 text-center mb-6">
            আপনার প্যাকেজ অর্ডারের তথ্য জমা নেওয়া হয়েছে। ট্রানজেকশন আইডি যাচাই করে অ্যাডমিন শীঘ্রই অ্যাকাউন্ট সক্রিয় করবেন।
          </p>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#090b14] border border-[#1f2433] text-xs space-y-2.5 mb-6">
            <div className="flex justify-between border-b border-gray-800 pb-2">
              <span className="text-gray-400">অর্ডার নম্বর:</span>
              <span className="font-mono text-cyan-300 font-bold">{order?.orderNumber}</span>
            </div>
            <div className="flex justify-between border-b border-gray-800 pb-2">
              <span className="text-gray-400">নির্বাচিত প্যাকেজ:</span>
              <span className="font-bold text-white">{order?.package?.name}</span>
            </div>
            <div className="flex justify-between border-b border-gray-800 pb-2">
              <span className="text-gray-400">টাকার পরিমাণ:</span>
              <span className="font-mono text-white font-bold">৳ {order?.amount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Transaction ID (TrxID):</span>
              <span className="font-mono text-purple-300 font-bold">{order?.transactionId}</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <button
              onClick={loadData}
              className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-500/20 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>স্ট্যাটাস রিফ্রেশ করুন</span>
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-3 rounded-xl bg-[#090b14] hover:bg-red-500/10 text-gray-400 hover:text-red-400 border border-gray-800 text-xs font-semibold transition-all"
            >
              লগআউট
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090e] text-white">
      {/* Header */}
      <header className="border-b border-[#1f2433] bg-[#0c0e17]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center font-black text-black text-lg shadow-lg shadow-emerald-500/20">
              <Sparkles className="w-5 h-5 text-black" />
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-white flex items-center gap-1.5">
                ReplyX <span className="text-emerald-400">AI</span>
              </h1>
              <p className="text-[10px] text-gray-400">প্যাকেজ নির্বাচন</p>
            </div>
          </Link>

          <div className="flex items-center gap-3 text-xs">
            {currentUser ? (
              <div className="flex items-center gap-2.5">
                <span className="text-gray-400 hidden sm:inline">{currentUser.fullName}</span>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-lg bg-[#141824] hover:bg-red-500/10 text-gray-300 hover:text-red-400 border border-gray-800 transition-colors"
                >
                  লগআউট
                </button>
              </div>
            ) : (
              <Link
                href="/login?redirect=/subscribe"
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold transition-all"
              >
                লগইন করুন
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold mb-4">
            <Zap className="w-3.5 h-3.5" />
            <span>ফেসবুক পেজ অটোমেশন প্যাকেজ</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            আপনার ব্যবসার জন্য সঠিক প্যাকেজটি বেছে নিন
          </h2>
          <p className="text-sm text-gray-400 mt-3 leading-relaxed">
            কোনো অতিরিক্ত ঝামেলা ছাড়া ১ মিনিটে প্যাকেজ পছন্দ করে চেকআউটে চলে যান। ২৪/৭ AI এজেন্ট কাস্টমার সার্ভিস নিশ্চিত করুন!
          </p>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mb-16">
          {packages.map((pkg) => {
            const features = Array.isArray(pkg.features) ? pkg.features : [];

            return (
              <div
                key={pkg.id}
                className={`rounded-3xl p-7 flex flex-col justify-between relative overflow-hidden transition-all duration-300 ${
                  pkg.isPopular
                    ? 'bg-gradient-to-b from-[#141929] to-[#0d101a] border-2 border-emerald-500 shadow-2xl shadow-emerald-500/10 scale-[1.03]'
                    : 'bg-[#0f121c] border border-[#1f2433] hover:border-emerald-500/40'
                }`}
              >
                {pkg.isPopular && (
                  <div className="absolute top-0 right-0">
                    <span className="bg-emerald-500 text-black text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-bl-2xl shadow-lg">
                      🔥 সেরা পছন্দ (Most Popular)
                    </span>
                  </div>
                )}

                <div>
                  <h3 className="text-xl font-extrabold text-white mb-2">{pkg.name}</h3>
                  <p className="text-xs text-gray-400 mb-6 leading-relaxed min-h-[36px]">
                    {pkg.description || 'ফেসবুক পেজ সেলস ও সাপোর্ট অটোমেশনের জন্য পারফেক্ট প্ল্যাটফর্ম।'}
                  </p>

                  {/* Price display */}
                  <div className="mb-6 pb-6 border-b border-[#1f2433]">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black text-emerald-400 font-mono">৳ {pkg.price}</span>
                      <span className="text-xs text-gray-400">/ {pkg.durationDays} দিন</span>
                    </div>
                    <p className="text-[11px] text-emerald-300/80 mt-1 font-semibold">
                      সীমিত সময়ের জন্য ৫০% বিশেষ ডিসকাউন্ট!
                    </p>
                  </div>

                  {/* Features list */}
                  <div className="space-y-3 text-xs text-gray-300 mb-8">
                    <div className="font-semibold text-white text-[11px] uppercase tracking-wider mb-2">
                      প্যাকেজের অন্তর্ভুক্ত সুবিধাসমূহ:
                    </div>
                    {features.map((feat: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2.5">
                        <div className="w-4 h-4 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/30">
                          <Check className="w-3 h-3" />
                        </div>
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Direct Checkout Button */}
                <button
                  type="button"
                  onClick={() => handleSelectPackage(pkg.id)}
                  className={`w-full py-4 rounded-2xl font-black text-xs shadow-lg transition-all flex items-center justify-center gap-2 ${
                    pkg.isPopular
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black shadow-emerald-500/25 hover:scale-[1.02]'
                      : 'bg-[#192033] hover:bg-emerald-500 hover:text-black text-white border border-[#2d364f]'
                  }`}
                >
                  <span>অর্ডার ও চেকআউটে যান</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Guarantee Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0f1320] border border-[#1f263b] flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">১০০% মানি ব্যাক ও সন্তুষ্টি গ্যারান্টি</h4>
              <p className="text-xs text-gray-400 mt-1">
                আপনার ফেসবুক পেজে AI ইনস্টল করে ৭ দিনের মধ্যে সার্ভিস পছন্দ না হলে ১০০% টাকা ফেরত!
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-amber-400 font-bold text-xs shrink-0">
            <Star className="w-4 h-4 fill-amber-400" />
            <Star className="w-4 h-4 fill-amber-400" />
            <Star className="w-4 h-4 fill-amber-400" />
            <Star className="w-4 h-4 fill-amber-400" />
            <Star className="w-4 h-4 fill-amber-400" />
            <span className="ml-2 text-white">4.9/5 Rating (500+ BD Merchants)</span>
          </div>
        </div>
      </main>
    </div>
  );
}
