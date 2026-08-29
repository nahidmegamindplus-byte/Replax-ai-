'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  Layers,
  MessageSquare,
  Bot,
  ShoppingCart,
  ArrowUpRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  Sparkles,
  Inbox,
  UserCheck,
  Send,
  Zap,
  BarChart2,
  RefreshCw,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function DashboardOverviewPage() {
  const toast = useToast();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'today' | '7d' | '30d'>('today');

  const fetchOverviewData = async (range = timeRange) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/reports?range=${range}`);
      const data = await res.json();

      if (data.success) {
        setStats(data);
      }
    } catch (err) {
      toast.error('ড্যাশবোর্ড ডাটা লোড করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverviewData(timeRange);
  }, [timeRange]);

  const metrics = stats?.metrics || {};
  const monthlyUsed = metrics.messagesSentThisMonth || 0;
  const monthlyLimit = metrics.monthlyMessageLimit || 0;
  const usagePercent =
    monthlyLimit > 0 ? Math.min(Math.round((monthlyUsed / monthlyLimit) * 100), 100) : 0;

  return (
    <DashboardLayout
      title="ওভারভিউ ড্যাশবোর্ড"
      subtitle="আপনার Facebook Messenger AI অটোমেশনের সর্বমোট মেসেজ সংখ্যা, রিয়েল-টাইম পরিসংখ্যান ও গতিবিধি"
    >
      {/* Top Controls: Time Filter & Refresh */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <span>লাইভ অ্যানালিটিক্স ওভারভিউ</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </h2>
          <p className="text-xs text-gray-400">সকল পেজের মেসেজ ও অটোমেশন রিয়েল-টাইমে পর্যবেক্ষণ করুন</p>
        </div>

        <div className="flex items-center gap-2 bg-[#12141c] border border-[#1f2433] p-1 rounded-xl">
          <button
            onClick={() => setTimeRange('today')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              timeRange === 'today'
                ? 'bg-emerald-500 text-black shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            আজকে
          </button>
          <button
            onClick={() => setTimeRange('7d')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              timeRange === '7d'
                ? 'bg-emerald-500 text-black shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            গত ৭ দিন
          </button>
          <button
            onClick={() => setTimeRange('30d')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              timeRange === '30d'
                ? 'bg-emerald-500 text-black shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            গত ৩০ দিন
          </button>
          <button
            onClick={() => fetchOverviewData(timeRange)}
            title="রিফ্রেশ ডাটা"
            className="p-1.5 rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Top 4 Statistic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-6">
        {/* Card 1: Total Messages (Combined / All-time & Range) */}
        <div className="bg-gradient-to-b from-[#161a29] to-[#12141c] border border-cyan-500/30 rounded-2xl p-5 hover:border-cyan-500/50 transition-all shadow-lg relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl pointer-events-none"></div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" /> মোট মেসেজ সংখ্যা
            </span>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center border border-cyan-500/30">
              <Inbox className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              {loading ? '...' : (metrics.allTimeTotalMessages ?? metrics.totalMessages ?? 0).toLocaleString()}
            </h3>
            <span className="text-xs text-cyan-300 font-medium">টি সর্বমোট</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-gray-400 mt-2.5 pt-2 border-t border-[#1e2538]">
            <span>
              {timeRange === 'today' ? 'আজকে' : timeRange === '7d' ? '৭ দিনে' : '৩০ দিনে'}:{' '}
              <strong className="text-gray-200">{(metrics.totalMessages ?? 0).toLocaleString()}</strong> টি
            </span>
            <span>
              ইনকামিং: <strong className="text-emerald-400">{(metrics.totalIncoming ?? 0).toLocaleString()}</strong>
            </span>
          </div>
        </div>

        {/* Card 2: AI Replies */}
        <div className="bg-gradient-to-b from-[#181528] to-[#12141c] border border-purple-500/30 rounded-2xl p-5 hover:border-purple-500/50 transition-all shadow-lg relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-purple-500/10 rounded-full blur-xl pointer-events-none"></div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5" /> AI স্বয়ংক্রিয় রিপ্লাই
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center border border-purple-500/30">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              {loading ? '...' : (metrics.allTimeAiReplies ?? metrics.totalAiReplies ?? 0).toLocaleString()}
            </h3>
            <span className="text-xs text-purple-300 font-medium">টি মোট</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-gray-400 mt-2.5 pt-2 border-t border-[#1e2538]">
            <span>
              {timeRange === 'today' ? 'আজকে' : 'সিলেক্টেড'}:{' '}
              <strong className="text-gray-200">{(metrics.totalAiReplies ?? 0).toLocaleString()}</strong> টি
            </span>
            <span className="text-emerald-400 font-semibold">১.৮ সে. গড় গতি</span>
          </div>
        </div>

        {/* Card 3: Connected Pages */}
        <div className="bg-gradient-to-b from-[#131d20] to-[#12141c] border border-emerald-500/30 rounded-2xl p-5 hover:border-emerald-500/50 transition-all shadow-lg relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none"></div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" /> সক্রিয় Facebook Page
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-500/30">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              {loading ? '...' : stats?.pagesBreakdown?.length || 0}
            </h3>
            <span className="text-xs text-emerald-300 font-medium">টি পেজ সংযুক্ত</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-gray-400 mt-2.5 pt-2 border-t border-[#1e2538]">
            <span>
              মোট চ্যাট:{' '}
              <strong className="text-gray-200">{(metrics.allTimeConversations || 0).toLocaleString()}</strong> টি
            </span>
            <Link href="/dashboard/pages" className="text-emerald-400 hover:underline">
              ম্যানেজ করুন
            </Link>
          </div>
        </div>

        {/* Card 4: Orders & Revenue */}
        <div className="bg-gradient-to-b from-[#1f1912] to-[#12141c] border border-amber-500/30 rounded-2xl p-5 hover:border-amber-500/50 transition-all shadow-lg relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none"></div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShoppingCart className="w-3.5 h-3.5" /> ক্যাপচার্ড অর্ডার
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-500/30">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              {loading ? '...' : (metrics.totalOrders || 0).toLocaleString()}
            </h3>
            <span className="text-xs text-amber-300 font-medium">
              ({(metrics.totalRevenue || 0).toLocaleString()} ৳)
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-gray-400 mt-2.5 pt-2 border-t border-[#1e2538]">
            <span>কনভার্শন রেট: {metrics.conversionRate || 0}%</span>
            <Link href="/dashboard/orders" className="text-amber-400 hover:underline">
              অর্ডার দেখুন
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* Comprehensive Message Breakdown & Subscription Quota Box                  */}
      {/* ========================================================================= */}
      <div className="bg-[#12141c] border border-[#1f2433] rounded-2xl p-5 sm:p-6 mb-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-[#1e2538]">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-emerald-400" />
              <span>মেসেজ ও অটোমেশন সম্পূর্ণ পরিসংখ্যান (All Message Metrics)</span>
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              ইনকামিং, আউটগোয়িং, AI অটো-রিপ্লাই এবং বর্তমান সাবস্ক্রিপশন কোটা ব্যবহার
            </p>
          </div>

          <Link
            href="/dashboard/conversations"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-colors self-start sm:self-auto"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>ইনবক্স ওপেন করুন</span>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          {/* Metric 1: Total All-time Messages */}
          <div className="p-4 rounded-xl bg-[#090a0f] border border-[#1e2538]">
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
              সর্বমোট মেসেজ
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-white">
              {(metrics.allTimeTotalMessages ?? 0).toLocaleString()}
            </div>
            <div className="text-[10px] text-gray-500 mt-1">ইনকামিং + আউটগোয়িং</div>
          </div>

          {/* Metric 2: Total Incoming */}
          <div className="p-4 rounded-xl bg-[#090a0f] border border-[#1e2538]">
            <div className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider mb-1">
              গ্রাহক ইনকামিং
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-cyan-300">
              {(metrics.allTimeIncoming ?? 0).toLocaleString()}
            </div>
            <div className="text-[10px] text-gray-500 mt-1">
              {timeRange === 'today' ? 'আজকে' : 'সিলেক্টেড'}: +{(metrics.totalIncoming || 0).toLocaleString()}
            </div>
          </div>

          {/* Metric 3: AI Auto Replies */}
          <div className="p-4 rounded-xl bg-[#090a0f] border border-[#1e2538]">
            <div className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider mb-1">
              AI অটো রিপ্লাই
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-purple-300">
              {(metrics.allTimeAiReplies ?? 0).toLocaleString()}
            </div>
            <div className="text-[10px] text-gray-500 mt-1">
              {timeRange === 'today' ? 'আজকে' : 'সিলেক্টেড'}: +{(metrics.totalAiReplies || 0).toLocaleString()}
            </div>
          </div>

          {/* Metric 4: Total Conversations */}
          <div className="p-4 rounded-xl bg-[#090a0f] border border-[#1e2538]">
            <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider mb-1">
              মোট কথোপকথন
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-emerald-300">
              {(metrics.allTimeConversations ?? 0).toLocaleString()}
            </div>
            <div className="text-[10px] text-gray-500 mt-1">কাস্টমার চ্যাট থ্রেড</div>
          </div>

          {/* Metric 5: Monthly Plan Quota */}
          <div className="p-4 rounded-xl bg-[#090a0f] border border-[#1e2538] col-span-2 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between text-[11px] font-semibold text-amber-400 uppercase tracking-wider mb-1">
              <span>চলতি মাসের কোটা</span>
              <span className="text-[10px] text-gray-400 lowercase font-normal">{metrics.packageName || 'সক্রিয়'}</span>
            </div>
            <div className="text-base sm:text-lg font-bold text-white">
              {monthlyUsed.toLocaleString()} / {monthlyLimit > 0 ? monthlyLimit.toLocaleString() : '∞'}
            </div>
            {/* Progress bar */}
            {monthlyLimit > 0 && (
              <div className="w-full bg-[#1e2538] h-1.5 rounded-full overflow-hidden mt-2">
                <div
                  className={`h-full rounded-full ${
                    usagePercent > 85 ? 'bg-red-500' : usagePercent > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${usagePercent}%` }}
                ></div>
              </div>
            )}
            <div className="text-[10px] text-gray-500 mt-1">
              {monthlyLimit > 0 ? `${usagePercent}% ব্যবহৃত হয়েছে` : 'আনলিমিটেড মেসেজ'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Connected Pages & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Connected Pages Status (2 Columns) */}
        <div className="lg:col-span-2 bg-[#12141c] border border-[#1f2433] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-white">Facebook Page সমূহ</h3>
              <p className="text-xs text-gray-400">সংযুক্ত ফেসবুক পেজের স্ট্যাটাস ও কার্যক্রম</p>
            </div>
            <Link
              href="/dashboard/pages"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> পেজ যুক্ত করুন
            </Link>
          </div>

          {loading ? (
            <div className="py-10 text-center text-sm text-gray-400">ডাটা লোড হচ্ছে...</div>
          ) : stats?.pagesBreakdown?.length === 0 ? (
            <div className="py-10 text-center">
              <div className="w-12 h-12 rounded-full bg-[#1a1f2e] text-gray-400 flex items-center justify-center mx-auto mb-3">
                <Layers className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-gray-200 mb-1">এখনও কোনো Facebook Page সংযুক্ত করা হয়নি</h4>
              <p className="text-xs text-gray-400 mb-4">অটোমেশন শুরু করতে এখনই আপনার ফেসবুক পেজ যুক্ত করুন</p>
              <Link
                href="/dashboard/pages"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> নতুন Page যুক্ত করুন
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {stats?.pagesBreakdown?.map((page: any) => (
                <div
                  key={page.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-[#0d0f17] border border-[#1a1f2e] hover:border-[#2a334a] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-sm">
                      {page.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{page.name}</h4>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                        <span>কথোপকথন: {page.conversations}</span>
                        <span>•</span>
                        <span>অর্ডার: {page.orders}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
                        page.status === 'CONNECTED'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                      {page.status === 'CONNECTED' ? 'সক্রিয়' : 'টোকেন এক্সপায়ার্ড'}
                    </span>
                    <Link
                      href={`/dashboard/pages`}
                      className="text-xs text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-[#1a1f2e] transition-colors"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Launch / Setup Guide Card */}
        <div className="bg-[#12141c] border border-[#1f2433] rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">AI রিপ্লাই কনফিগারেশন</h3>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed mb-4">
              আপনার ব্যবসার ধরণ অনুযায়ী AI-কে বিশেষ ট্রেনিং দিন। ১৪টি সহজ প্রশ্নের উত্তর দিয়ে কাস্টম AI রুলস তৈরি করুন।
            </p>

            <div className="space-y-2 mb-6">
              <Link
                href="/dashboard/ai-rules"
                className="flex items-center justify-between p-3 rounded-xl bg-[#0d0f17] border border-[#1a1f2e] hover:border-emerald-500/40 text-xs font-semibold text-gray-200 hover:text-emerald-400 transition-colors"
              >
                <span>🤖 AI রুলস বিল্ডার (Easy Mode)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/dashboard/products"
                className="flex items-center justify-between p-3 rounded-xl bg-[#0d0f17] border border-[#1a1f2e] hover:border-cyan-500/40 text-xs font-semibold text-gray-200 hover:text-cyan-400 transition-colors"
              >
                <span>📦 প্রোডাক্ট ইনভেন্টরি যুক্ত করুন</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/dashboard/conversations"
                className="flex items-center justify-between p-3 rounded-xl bg-[#0d0f17] border border-[#1a1f2e] hover:border-purple-500/40 text-xs font-semibold text-gray-200 hover:text-purple-400 transition-colors"
              >
                <span>💬 মেসেঞ্জার ইনবক্স মনিটর</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 text-xs text-gray-300">
            <p className="font-semibold text-emerald-400 mb-1">💡 টিপস</p>
            প্রোডাক্ট তালিকায় ছবি এবং সঠিক দাম দিলে AI কাস্টমারকে ছবিসহ দাম জানিয়ে দ্রুত অর্ডার কনফার্ম করতে পারে।
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
