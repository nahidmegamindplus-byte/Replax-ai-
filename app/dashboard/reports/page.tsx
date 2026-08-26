'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  BarChart3,
  TrendingUp,
  MessageSquare,
  Bot,
  ShoppingCart,
  DollarSign,
  Calendar,
  Layers,
  Package,
  ArrowUpRight,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function ReportsPage() {
  const toast = useToast();
  const [range, setRange] = useState('7d');
  const [pageId, setPageId] = useState('ALL');
  const [pages, setPages] = useState<any[]>([]);
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ range });
      if (pageId !== 'ALL') params.append('pageId', pageId);

      const [repRes, pageRes] = await Promise.all([
        fetch(`/api/reports?${params.toString()}`),
        fetch('/api/pages'),
      ]);

      const repData = await repRes.json();
      const pageData = await pageRes.json();

      if (repData.success) {
        setReportData(repData);
      }
      if (pageData.success) {
        setPages(pageData.pages);
      }
    } catch (e) {
      toast.error('রিপোর্ট ডাটা লোড করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [range, pageId]);

  return (
    <DashboardLayout
      title="রিপোর্ট ও অ্যানালিটিক্স"
      subtitle="মেসেজ ভলিউম, এআই রেসপন্স পারফরম্যান্স এবং অর্ডার কনভার্শন ট্র্যাকিং"
    >
      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-[#12141c] border border-[#1f2433] p-4 rounded-2xl">
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-300">
          <Calendar className="w-4 h-4 text-emerald-400" />
          <span>সময়কাল নির্বাচন:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-[#0a0c13] p-1 rounded-xl border border-[#1e2538]">
            {[
              { id: 'today', label: 'আজকে' },
              { id: '7d', label: 'গত ৭ দিন' },
              { id: '30d', label: 'গত ৩০ দিন' },
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => setRange(btn.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  range === btn.id
                    ? 'bg-emerald-500 text-black shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          <select
            value={pageId}
            onChange={(e) => setPageId(e.target.value)}
            className="px-3 py-1.5 bg-[#0a0c13] border border-[#1e2538] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">সকল Facebook Page</option>
            {pages.map((p) => (
              <option key={p.id} value={p.id}>
                {p.pageName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center text-sm text-gray-400">রিপোর্ট বিশ্লেষণ করা হচ্ছে...</div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-[#12141c] border border-[#1f2433] rounded-2xl p-5">
              <span className="text-xs text-gray-400 uppercase font-semibold">ইনকামিং মেসেজ</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                {reportData?.metrics?.totalIncoming || 0}
              </div>
              <p className="text-[11px] text-gray-500 mt-2">
                AI রিপ্লাই: {reportData?.metrics?.totalAiReplies || 0} | ম্যানুয়াল:{' '}
                {reportData?.metrics?.totalHumanReplies || 0}
              </p>
            </div>

            <div className="bg-[#12141c] border border-[#1f2433] rounded-2xl p-5">
              <span className="text-xs text-gray-400 uppercase font-semibold">মোট অর্ডার</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                {reportData?.metrics?.totalOrders || 0}
              </div>
              <p className="text-[11px] text-emerald-400 mt-2">
                কনফার্মড/ডেলিভার্ড: {reportData?.metrics?.confirmedOrders || 0} টি
              </p>
            </div>

            <div className="bg-[#12141c] border border-[#1f2433] rounded-2xl p-5">
              <span className="text-xs text-gray-400 uppercase font-semibold">মোট সেলস রেভিনিউ</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono mt-1">
                {reportData?.metrics?.totalRevenue || 0} ৳
              </div>
              <p className="text-[11px] text-gray-500 mt-2">মেসেঞ্জার অর্ডার থেকে অর্জিত</p>
            </div>

            <div className="bg-[#12141c] border border-[#1f2433] rounded-2xl p-5">
              <span className="text-xs text-gray-400 uppercase font-semibold">কনভার্শন রেট</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 mt-1">
                {reportData?.metrics?.conversionRate || 0}%
              </div>
              <p className="text-[11px] text-gray-500 mt-2">ইনবক্স ইনকোয়ারি থেকে সেলস কনভার্শন</p>
            </div>
          </div>

          {/* Daily Trends & Top Products */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Daily Trends Breakdown (2 Columns) */}
            <div className="lg:col-span-2 bg-[#12141c] border border-[#1f2433] rounded-2xl p-6">
              <h3 className="text-base font-bold text-white mb-1">দৈনিক কার্যক্রম ও ট্রেন্ড</h3>
              <p className="text-xs text-gray-400 mb-6">দিনভিত্তিক ইনকামিং মেসেজ, এআই রেসপন্স ও অর্ডার পরিসংখ্যান</p>

              {reportData?.dailyTrends?.length === 0 ? (
                <div className="py-12 text-center text-xs text-gray-400">এই সময়কালে কোনো ডাটা নেই।</div>
              ) : (
                <div className="space-y-4">
                  {reportData?.dailyTrends?.map((item: any) => {
                    const maxCount = Math.max(
                      ...reportData.dailyTrends.map((d: any) => Math.max(d.incoming, d.aiReplies, d.orders)),
                      1
                    );
                    const incomingPct = Math.round((item.incoming / maxCount) * 100);
                    const ordersPct = Math.round((item.orders / maxCount) * 100);

                    return (
                      <div key={item.date} className="bg-[#0a0c13] p-3.5 rounded-xl border border-[#1e2538]">
                        <div className="flex items-center justify-between text-xs font-semibold mb-2">
                          <span className="text-gray-300 font-mono">{item.date}</span>
                          <div className="flex items-center gap-3 text-[11px]">
                            <span className="text-cyan-400">মেসেজ: {item.incoming}</span>
                            <span className="text-purple-400">AI: {item.aiReplies}</span>
                            <span className="text-emerald-400">অর্ডার: {item.orders}</span>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <div className="w-full bg-[#161a29] h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full"
                              style={{ width: `${Math.max(incomingPct, 4)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Top Inquired Products (1 Column) */}
            <div className="bg-[#12141c] border border-[#1f2433] rounded-2xl p-6">
              <h3 className="text-base font-bold text-white mb-1">সর্বাধিক বিক্রিত পণ্য</h3>
              <p className="text-xs text-gray-400 mb-6">মেসেঞ্জারে সবচেয়ে বেশি অর্ডার হওয়া প্রোডাক্ট</p>

              {reportData?.topProducts?.length === 0 ? (
                <div className="py-12 text-center text-xs text-gray-400">কোনো অর্ডার তথ্য পাওয়া যায়নি।</div>
              ) : (
                <div className="space-y-3">
                  {reportData?.topProducts?.map((tp: any, i: number) => (
                    <div
                      key={tp.name}
                      className="flex items-center justify-between p-3 rounded-xl bg-[#0a0c13] border border-[#1e2538]"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-[#161a29] text-emerald-400 font-bold text-xs flex items-center justify-center">
                          {i + 1}
                        </span>
                        <span className="text-xs font-semibold text-gray-200 line-clamp-1">{tp.name}</span>
                      </div>
                      <span className="text-xs font-bold text-emerald-400 shrink-0 ml-2">
                        {tp.count} টি অর্ডার
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
