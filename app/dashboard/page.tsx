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
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function DashboardOverviewPage() {
  const toast = useToast();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchOverviewData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/reports?range=today');
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
    fetchOverviewData();
  }, []);

  return (
    <DashboardLayout
      title="ওভারভিউ ড্যাশবোর্ড"
      subtitle="আপনার Facebook Messenger AI অটোমেশনের রিয়েল-টাইম পরিসংখ্যান ও গতিবিধি"
    >
      {/* Top 4 Statistic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
        {/* Card 1: Connected Pages */}
        <div className="bg-[#12141c] border border-[#1f2433] rounded-2xl p-5 hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">সংযুক্ত পেজ সমূহ</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              {loading ? '...' : stats?.pagesBreakdown?.length || 0}
            </h3>
            <span className="text-xs text-emerald-400 font-medium">টি সক্রিয়</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-2">সকল পেজে মেসেঞ্জার অটোমেশন সক্রিয়</p>
        </div>

        {/* Card 2: Messages Today */}
        <div className="bg-[#12141c] border border-[#1f2433] rounded-2xl p-5 hover:border-cyan-500/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">আজকের মেসেজ</span>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              {loading ? '...' : stats?.metrics?.totalIncoming || 0}
            </h3>
            <span className="text-xs text-cyan-400 font-medium">টি ইনকামিং</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-2">কাস্টমারদের থেকে প্রাপ্ত মোট মেসেজ</p>
        </div>

        {/* Card 3: AI Replies */}
        <div className="bg-[#12141c] border border-[#1f2433] rounded-2xl p-5 hover:border-purple-500/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">AI রিপ্লাই সংখ্যা</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              {loading ? '...' : stats?.metrics?.totalAiReplies || 0}
            </h3>
            <span className="text-xs text-purple-400 font-medium">টি স্বয়ংক্রিয়</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-2">গড় রেসপন্স টাইম: ১.৮ সেকেন্ড</p>
        </div>

        {/* Card 4: Orders Captured */}
        <div className="bg-[#12141c] border border-[#1f2433] rounded-2xl p-5 hover:border-amber-500/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">ক্যাপচার্ড অর্ডার</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              {loading ? '...' : stats?.metrics?.totalOrders || 0}
            </h3>
            <span className="text-xs text-amber-400 font-medium">
              ({stats?.metrics?.totalRevenue || 0} ৳)
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-2">কনভার্শন রেট: {stats?.metrics?.conversionRate || 0}%</p>
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
