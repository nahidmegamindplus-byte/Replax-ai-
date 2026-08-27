'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Sparkles,
  CheckCircle2,
  Zap,
  Phone,
  Hash,
  Copy,
  Clock,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Globe,
  Award,
  Users,
  Check,
  Lock,
  Flame,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();

  const packageIdParam = searchParams.get('packageId') || searchParams.get('pkg');

  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [packages, setPackages] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);

  // Selected checkout options
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [selectedMethod, setSelectedMethod] = useState<any>(null);
  const [senderNumber, setSenderNumber] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  // Urgency Timer State (10 Minutes = 600s)
  const [timeLeft, setTimeLeft] = useState(599);

  // Social Proof Ticker
  const [recentPurchases] = useState([
    { name: 'তানভীর হাসান (ঢাকা)', time: '২ মিনিট আগে', pkg: 'বিজনেস প্যাকেজ' },
    { name: 'আরিফ আহমেদ (চট্টগ্রাম)', time: '৫ মিনিট আগে', pkg: 'প্রো প্যাকেজ' },
    { name: 'সাবরিনা সুলতানা (সিলেট)', time: '৮ মিনিট আগে', pkg: 'স্টার্টার প্যাকেজ' },
    { name: 'মোঃ রনি (বগুড়া)', time: '১১ মিনিট আগে', pkg: 'বিজনেস প্যাকেজ' },
  ]);
  const [currentTickerIdx, setCurrentTickerIdx] = useState(0);

  // Timer Effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Ticker Effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTickerIdx((prev) => (prev + 1) % recentPurchases.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [recentPurchases.length]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const loadCheckoutData = async () => {
    try {
      setLoading(true);

      const [userRes, subRes, pkgRes, pmRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/packages/my-subscription'),
        fetch('/api/packages'),
        fetch('/api/payment-methods'),
      ]);

      const userData = await userRes.json();
      if (!userData.success || !userData.user) {
        toast.error('অর্ডার সম্পন্ন করতে অনুগ্রহ করে প্রথমে লগইন বা রেজিস্ট্রেশন করুন।');
        router.push(`/login?redirect=/checkout${packageIdParam ? `?packageId=${packageIdParam}` : ''}`);
        return;
      }
      setCurrentUser(userData.user);

      const subData = await subRes.json();
      if (subData.success) {
        setSubscription(subData.subscription);
      }

      const pkgData = await pkgRes.json();
      const pmData = await pmRes.json();

      let targetPkg = null;
      if (pkgData.success && pkgData.packages?.length > 0) {
        setPackages(pkgData.packages);

        if (packageIdParam) {
          targetPkg = pkgData.packages.find((p: any) => p.id === packageIdParam || p.slug === packageIdParam);
        }
        if (!targetPkg) {
          targetPkg = pkgData.packages.find((p: any) => p.isPopular) || pkgData.packages[0];
        }
        setSelectedPackage(targetPkg);
      }

      if (pmData.success && pmData.paymentMethods?.length > 0) {
        setPaymentMethods(pmData.paymentMethods);
        setSelectedMethod(pmData.paymentMethods[0]);
      }
    } catch (e) {
      toast.error('চেকআউট তথ্য লোড করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCheckoutData();
  }, [packageIdParam]);

  const handleCopyNumber = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopied(true);
    toast.success('নম্বর কপি করা হয়েছে!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      toast.error('অনুগ্রহ করে লগইন করুন।');
      router.push('/login?redirect=/checkout');
      return;
    }

    if (!selectedPackage || !selectedMethod) {
      toast.error('প্যাকেজ ও পেমেন্ট মাধ্যম সিলেক্ট করুন।');
      return;
    }

    if (!senderNumber.trim() || !transactionId.trim()) {
      toast.error('প্রেরকের নম্বর এবং Transaction ID আবশ্যক।');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/packages/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: selectedPackage.id,
          paymentMethodId: selectedMethod.id,
          paymentMethodName: selectedMethod.displayName || selectedMethod.name,
          senderNumber: senderNumber.trim(),
          transactionId: transactionId.trim().toUpperCase(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(data.message || 'অর্ডার সফলভাবে জমা হয়েছে!');
        router.push('/subscribe');
      } else {
        toast.error(data.error || 'অর্ডার জমা ব্যর্থ হয়েছে।');
      }
    } catch (e) {
      toast.error('সার্ভার ত্রুটি। আবার চেষ্টা করুন।');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090e] flex items-center justify-center text-white">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-gray-400">চেকআউট পেজ লোড হচ্ছে...</span>
        </div>
      </div>
    );
  }

  const originalPrice = selectedPackage ? Math.round(selectedPackage.price * 2) : 0;
  const currentTicker = recentPurchases[currentTickerIdx];

  return (
    <div className="min-h-screen bg-[#06080d] text-white selection:bg-emerald-500 selection:text-black pb-20">
      {/* Emergency Sticky Timer Banner */}
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white py-2.5 px-4 sticky top-0 z-50 shadow-xl border-b border-red-500/40">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm font-black tracking-wide">
            <Flame className="w-4 h-4 text-amber-300 animate-bounce" />
            <span>জরুরি অফার! ৫০% ছাড় ও ফ্রি AI ইনস্টলেশন সুবিধাটি শেষ হচ্ছে:</span>
          </div>

          <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full border border-amber-300/30 text-amber-300 font-mono font-black text-sm">
            <Clock className="w-4 h-4 animate-spin text-amber-300" />
            <span>{formatTime(timeLeft)}</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="border-b border-[#1b2030] bg-[#0a0d17]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center font-black text-black text-lg shadow-lg shadow-emerald-500/20">
              <Sparkles className="w-5 h-5 text-black" />
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-white flex items-center gap-1.5">
                ReplyX <span className="text-emerald-400">AI</span>
              </h1>
              <p className="text-[10px] text-gray-400">নিরাপদ ইনস্ট্যান্ট চেকআউট</p>
            </div>
          </Link>

          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">256-Bit Encrypted Payment</span>
          </div>
        </div>
      </header>

      {/* Main Checkout Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-8">

        {/* Personalized Facebook Setup Confirmation Badge */}
        {currentUser && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-[#0d1726] to-[#0f1d33] border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-300">
                  গ্রাহক: <span className="text-white font-extrabold">{currentUser.fullName}</span> ({currentUser.businessName})
                </h4>
                {currentUser.facebookPageUrl ? (
                  <p className="text-xs text-emerald-400 font-mono mt-0.5 flex items-center justify-center sm:justify-start gap-1">
                    <span>পেজ লিঙ্ক:</span>
                    <span className="underline font-semibold">{currentUser.facebookPageUrl}</span>
                  </p>
                ) : (
                  <p className="text-xs text-gray-400 mt-0.5">ফেসবুক পেজ AI অটোমেশন সেটআপ রেডি!</p>
                )}
              </div>
            </div>

            <div className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold flex items-center gap-1.5 shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>AI Agent Integration Ready</span>
            </div>
          </div>
        )}

        {/* Severe Loss Aversion Warning Box */}
        <div className="mb-8 p-6 rounded-3xl bg-gradient-to-r from-red-950/50 via-[#1a0c14] to-[#170911] border-2 border-red-500/50 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 text-xs font-black uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-red-400 animate-pulse" />
                <span>সতর্কতা: ফেসবুক পেজে AI না থাকায় বিপুল ক্ষতি!</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white">
                আপনি কি জানেন? প্রতিদিন AI অটোমেশন না থাকলে আপনার ২০-৩০ জন কাস্টমার হাতছাড়া হচ্ছে!
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-3xl">
                কাস্টমার ইনবক্সে মেসেজ দেওয়ার ৩-৫ মিনিটের মধ্যে রিপ্লাই না পেলে <strong className="text-red-400 underline">৮২% কাস্টমার প্রতিযোগী পেজ থেকে পণ্য কিনে নেয়</strong>। 
                ম্যানুয়ালি রিপ্লাই দেওয়া অসম্ভব — যার কারণে আপনার দৈনিক <strong className="text-amber-300">৳১,৫০০ থেকে ৳৫,০০০+ টাকা অপচয়</strong> হচ্ছে!
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-black/60 border border-red-500/40 text-center min-w-[210px] w-full md:w-auto shrink-0 space-y-1">
              <div className="flex items-center justify-center gap-1 text-red-400 text-xs font-bold uppercase">
                <TrendingDown className="w-4 h-4" />
                <span>আনুমানিক দৈনিক সেলস ক্ষতি</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-red-400 font-mono">
                - ৳ ১,৫০-৫,০০০+
              </div>
              <p className="text-[10px] text-gray-400">এখনই AI চালু করে প্রতি মাসের লাখ টাকা বাঁচান</p>
            </div>
          </div>
        </div>

        {/* Main 2-Column Grid: Left Package Summary & Right Payment Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column (5 Cols): Selected Package & Value Highlights */}
          <div className="lg:col-span-5 space-y-6">
            {/* Package Summary Card */}
            <div className="bg-[#0e111a] border border-[#1e2538] rounded-3xl p-6 sm:p-7 shadow-xl">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#1c2233]">
                <div>
                  <span className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider block">অর্ডার সমারি</span>
                  <h3 className="text-xl font-black text-white">{selectedPackage?.name}</h3>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black">
                  {selectedPackage?.durationDays} দিন মেয়াদ
                </span>
              </div>

              {/* Package Selector Dropdown if multiple packages available */}
              {packages.length > 1 && (
                <div className="mb-5">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    অন্য প্যাকেজ নির্বাচন করতে চান?
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {packages.map((pkg) => (
                      <button
                        key={pkg.id}
                        type="button"
                        onClick={() => setSelectedPackage(pkg)}
                        className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                          selectedPackage?.id === pkg.id
                            ? 'bg-emerald-500 text-black border-emerald-400 shadow-md'
                            : 'bg-[#151926] text-gray-300 border-[#222a3d] hover:border-gray-600'
                        }`}
                      >
                        {pkg.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Breakdown */}
              <div className="p-4 rounded-2xl bg-[#080a12] border border-[#1a2030] space-y-2.5 text-xs mb-6">
                <div className="flex justify-between text-gray-400">
                  <span>নিয়মিত মূল্য:</span>
                  <span className="line-through text-red-400 font-mono">৳ {originalPrice}</span>
                </div>
                <div className="flex justify-between text-emerald-400 font-bold">
                  <span>৫০% ইনস্ট্যান্ট ছাড়:</span>
                  <span>- ৳ {originalPrice - (selectedPackage?.price || 0)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>ফেসবুক AI ইনস্টলেশন চার্জ:</span>
                  <span className="text-emerald-400 font-bold">ফ্রি (৳১,৫০০ মান)</span>
                </div>
                <div className="pt-3 border-t border-[#1c2233] flex justify-between items-baseline">
                  <span className="font-extrabold text-white text-sm">সর্বমোট প্রদেয় টাকা:</span>
                  <div className="text-right">
                    <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                      ৳ {selectedPackage?.price}
                    </span>
                    <span className="block text-[10px] text-gray-400">এককালীন মূল্য ({selectedPackage?.durationDays} দিন)</span>
                  </div>
                </div>
              </div>

              {/* Bonus Included List */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  <span>অর্ডারের সাথে যে বোনাসগুলো পাবেন:</span>
                </h4>
                <div className="space-y-2 text-xs text-gray-300">
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>২৪/৭ মেসেঞ্জার অটো-রিপ্লাই ও কাস্টমার চ্যাট AI</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>বাংলা, ইংলিশ ও বাংলিশ তিন ভাষাতেই স্মার্ট চ্যাট</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>প্রোডাক্ট ছবি দেখে ছবিসহ কাস্টমারকে সঠিক উত্তর দেওয়া</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>মেসেঞ্জারে অটোমেটিক অর্ডার নেওয়া ও নোটিফিকেশন</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust & Guarantee Box */}
            <div className="p-5 rounded-2xl bg-[#0c101c] border border-emerald-500/20 text-center space-y-3">
              <div className="flex justify-center items-center gap-2 text-emerald-400 font-bold text-xs">
                <Award className="w-5 h-5 text-emerald-400" />
                <span>৭ দিনের মানি ব্যাক গ্যারান্টি</span>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                প্যাকেজ কিনে সার্ভিস পছন্দ না হলে কোনো প্রশ্ন ছাড়াই ৭ দিনের মধ্যে সম্পূর্ণ টাকা ফেরত দেওয়া হবে।
              </p>
            </div>
          </div>

          {/* Right Column (7 Cols): Payment Selector & Transaction Form */}
          <div className="lg:col-span-7 bg-[#0e111a] border border-[#1e2538] rounded-3xl p-6 sm:p-8 shadow-2xl relative">
            <h3 className="text-base font-extrabold text-white mb-6 flex items-center gap-2.5 pb-4 border-b border-[#1c2233]">
              <span className="w-7 h-7 rounded-full bg-emerald-500 text-black text-sm font-black flex items-center justify-center shadow-lg">
                1
              </span>
              <span>পেমেন্ট করুন ও অর্ডার জমা দিন</span>
            </h3>

            {/* Payment Method Selector Tabs */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-[#c5cbd3] uppercase tracking-wider mb-2.5">
                পেমেন্ট মাধ্যম বেছে নিন:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {paymentMethods.map((pm) => {
                  const isSelected = selectedMethod?.id === pm.id;
                  return (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setSelectedMethod(pm)}
                      className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                        isSelected
                          ? 'bg-emerald-500/20 border-emerald-500 text-white font-bold shadow-lg shadow-emerald-500/10 scale-[1.02]'
                          : 'bg-[#080a12] border-[#1d2436] text-[#9ca3af] hover:text-white hover:border-gray-600'
                      }`}
                    >
                      <span className="text-sm font-black">{pm.displayName}</span>
                      <span className="text-[10px] text-emerald-400 font-semibold">{pm.accountType}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Method Details Card */}
            {selectedMethod && (
              <div className="mb-6 p-5 rounded-2xl bg-gradient-to-b from-[#090b14] to-[#0d101d] border border-emerald-500/30 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1c2233]">
                  <div>
                    <span className="text-[11px] text-[#9ca3af] block font-semibold">
                      {selectedMethod.displayName} টাকা পাঠানোর নম্বর:
                    </span>
                    <span className="text-xl font-mono font-black text-emerald-400 tracking-wider">
                      {selectedMethod.accountNumber}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopyNumber(selectedMethod.accountNumber)}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all shrink-0"
                  >
                    <Copy className="w-4 h-4" />
                    <span>{copied ? 'কপি হয়েছে!' : 'নম্বর কপি করুন'}</span>
                  </button>
                </div>

                <div className="text-xs text-[#d1d5db] space-y-1.5 leading-relaxed bg-[#111524] p-4 rounded-xl border border-[#1e273c]">
                  <p className="font-bold text-white flex items-center gap-1">
                    <span>নির্দেশনা (কিভাবে টাকা পাঠাবেন):</span>
                  </p>
                  <p className="text-[#d1d5db]">
                    ১. {selectedMethod.displayName} অ্যাপ বা কোড ডায়াল করে <strong className="text-emerald-400 font-mono">{selectedMethod.accountNumber}</strong> নম্বরে <strong className="text-white">Send Money</strong> করুন।
                  </p>
                  <p className="text-[#d1d5db]">
                    ২. টাকার পরিমাণ: <strong className="text-emerald-400 font-mono text-sm">৳ {selectedPackage?.price}</strong>
                  </p>
                  <p className="text-[#d1d5db]">
                    ৩. পেমেন্ট শেষে মেসেজ বা অ্যাপ থেকে পাওয়া <strong className="text-amber-300">Transaction ID (TrxID)</strong> নিচে বসিয়ে অর্ডার সম্পন্ন করুন।
                  </p>
                </div>
              </div>
            )}

            {/* Order Form */}
            <form onSubmit={handleOrderSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#c5cbd3] uppercase tracking-wider mb-1.5">
                  যে নম্বর থেকে টাকা পাঠিয়েছেন (Sender Mobile Number) <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#6b7280] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={senderNumber}
                    onChange={(e) => setSenderNumber(e.target.value)}
                    placeholder="যেমন: 017XXXXXXXX"
                    className="w-full pl-10 pr-4 py-3 bg-[#080a12] border border-[#1e2538] rounded-xl text-white placeholder:text-[#6b7280] text-xs font-mono focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#c5cbd3] uppercase tracking-wider mb-1.5">
                  Transaction ID (TrxID) <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Hash className="w-4 h-4 text-[#6b7280] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="যেমন: BLA8934JKA"
                    className="w-full pl-10 pr-4 py-3 bg-[#080a12] border border-[#1e2538] rounded-xl text-white placeholder:text-[#6b7280] text-xs font-mono uppercase focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#080a12] border border-[#1d2436] text-[11px] text-[#9ca3af] flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>অর্ডার করার কিছুক্ষণের মধ্যেই ট্রানজেকশন যাচাই করে আপনার ড্যাশবোর্ড একটিভ করে দেওয়া হবে।</span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-black text-sm shadow-xl shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    <span>অর্ডার সাবমিট হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <Flame className="w-5 h-5 text-black" />
                    <span>🔥 এখনই ৳ {selectedPackage?.price} দিয়ে অর্ডার সম্পন্ন করুন</span>
                    <ArrowRight className="w-5 h-5 text-black" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Floating Social Proof Ticker */}
      <div className="fixed bottom-4 left-4 z-40 max-w-sm hidden sm:block animate-fade-in">
        <div className="p-3.5 rounded-2xl bg-[#0d111d]/90 backdrop-blur-md border border-emerald-500/40 text-xs text-white shadow-2xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 border border-emerald-500/40">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-white">{currentTicker.name}</p>
            <p className="text-[10px] text-[#9ca3af]">
              <span className="text-emerald-400 font-semibold">{currentTicker.time}</span> • {currentTicker.pkg} অর্ডার করেছেন
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#07090e] flex items-center justify-center text-white">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm text-gray-400">চেকআউট পেজ লোড হচ্ছে...</span>
          </div>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}

