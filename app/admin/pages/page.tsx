'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/layout/AdminLayout';
import {
  Layers,
  Search,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function AdminPagesPage() {
  const toast = useToast();
  const [pages, setPages] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/pages');
      const data = await res.json();
      if (data.success) {
        setPages(data.pages);
      }
    } catch (e) {
      toast.error('পেজ ডাটা লোড করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const filteredPages = pages.filter(
    (p) =>
      p.pageName.toLowerCase().includes(search.toLowerCase()) ||
      p.facebookPageId.toLowerCase().includes(search.toLowerCase()) ||
      p.owner?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      p.owner?.businessName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout
      title="সংযুক্ত ফেসবুক পেজ সমূহ (Global Pages)"
      subtitle="প্ল্যাটফর্মের সমস্ত ব্যবহারকারীর কানেক্টেড ফেসবুক পেজ এবং ওয়েবহুক স্ট্যাটাস"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="p-2 rounded-xl bg-[#161a29] border border-[#232a40] text-gray-300 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="পেজ নাম, Page ID বা মালিকের নাম..."
              className="w-full pl-9 pr-3 py-2 bg-[#12141c] border border-[#1f2433] rounded-xl text-white placeholder-gray-500 text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div className="text-xs text-gray-400">
          মোট পেজ: <strong className="text-white">{filteredPages.length}</strong> টি
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center text-sm text-gray-400">পেজ তালিকা লোড হচ্ছে...</div>
      ) : (
        <div className="bg-[#12141c] border border-[#1f2433] rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-[#0d0f17] text-gray-400 border-b border-[#1f2433] uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">পেজের নাম</th>
                  <th className="py-3.5 px-4 font-semibold">Page ID</th>
                  <th className="py-3.5 px-4 font-semibold">মালিক / ব্যবসা</th>
                  <th className="py-3.5 px-4 font-semibold">কানেকশন স্ট্যাটাস</th>
                  <th className="py-3.5 px-4 font-semibold">অটো রিপ্লাই</th>
                  <th className="py-3.5 px-4 font-semibold">মেসেজ / অর্ডার</th>
                  <th className="py-3.5 px-4 font-semibold">তারিখ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a1f2e]">
                {filteredPages.map((p) => (
                  <tr key={p.id} className="hover:bg-[#161a29]/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white">{p.pageName}</td>
                    <td className="py-3.5 px-4 font-mono text-gray-400">{p.facebookPageId}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-gray-200">{p.owner?.fullName}</div>
                      <div className="text-[11px] text-gray-400">{p.owner?.businessName || p.owner?.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold inline-flex items-center gap-1 ${
                          p.connectionStatus === 'CONNECTED'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        {p.connectionStatus === 'CONNECTED' ? 'সক্রিয়' : 'মেয়াদোত্তীর্ণ'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={p.autoReplyEnabled ? 'text-emerald-400 font-semibold' : 'text-gray-500'}>
                        {p.autoReplyEnabled ? 'সক্রিয় (ON)' : 'বন্ধ (OFF)'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-400">
                      {p.counts?.conversations || 0} চ্যাট • {p.counts?.orders || 0} অর্ডার
                    </td>
                    <td className="py-3.5 px-4 text-gray-500 text-[11px]">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
