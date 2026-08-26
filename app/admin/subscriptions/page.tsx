'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import {
  CreditCard,
  Users,
  MessageSquare,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Edit2,
  RotateCcw,
  CheckCircle2,
  Zap,
  Sliders,
  X,
  Search,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function AdminSubscriptionsPage() {
  const toast = useToast();
  const [summary, setSummary] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedPlanFilter, setSelectedPlanFilter] = useState('ALL');

  // Edit Modal State
  const [editUser, setEditUser] = useState<any>(null);
  const [planInput, setPlanInput] = useState('STARTER');
  const [limitInput, setLimitInput] = useState('500');
  const [saving, setSaving] = useState(false);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/subscriptions');
      const data = await res.json();

      if (data.success) {
        setSummary(data.summary);
        setUsers(data.users);
      } else {
        toast.error(data.error || 'সাবস্ক্রিপশন ডাটা লোড করতে সমস্যা হয়েছে।');
      }
    } catch (e) {
      toast.error('সার্ভার ত্রুটি।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handleOpenEdit = (user: any) => {
    setEditUser(user);
    setPlanInput(user.plan || 'STARTER');
    setLimitInput(user.monthlyMessageLimit ? user.monthlyMessageLimit.toString() : '500');
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    setSaving(true);

    try {
      const res = await fetch('/api/admin/subscriptions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: editUser.id,
          plan: planInput,
          monthlyMessageLimit: parseInt(limitInput, 10),
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('সাবস্ক্রিপশন প্ল্যান সফলভাবে আপডেট হয়েছে!');
        setEditUser(null);
        fetchSubscriptions();
      } else {
        toast.error(data.error || 'আপডেট ব্যর্থ হয়েছে।');
      }
    } catch (e) {
      toast.error('সার্ভার ত্রুটি।');
    } finally {
      setSaving(false);
    }
  };

  const handleResetQuota = async (userId: string, email: string) => {
    if (!confirm(`আপনি কি "${email}" এর বর্তমান মাসের মেসেজ কাউন্টার ০ তে রিসেট করতে চান?`)) return;

    try {
      const res = await fetch('/api/admin/subscriptions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          resetUsage: true,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('মেসেজ কোটা রিসেট করা হয়েছে!');
        fetchSubscriptions();
      } else {
        toast.error(data.error || 'রিসেট ব্যর্থ হয়েছে।');
      }
    } catch (e) {
      toast.error('সার্ভার ত্রুটি।');
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.businessName?.toLowerCase().includes(search.toLowerCase()) ||
      u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());

    const matchesPlan = selectedPlanFilter === 'ALL' || u.plan === selectedPlanFilter;
    return matchesSearch && matchesPlan;
  });

  return (
    <AdminLayout
      title="💎 সাবস্ক্রিপশন ও মেসেজ ব্যবহার ট্র্যাকিং"
      subtitle="কোন সাবস্ক্রিপশন প্ল্যানে কত মেসেজ পাঠানো হয়েছে তা ট্র্যাক ও পরিচালনা করুন (শুধুমাত্র অ্যাডমিন দেখতে পাবে)"
    >
      {/* Top Plan KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Starter Plan Card */}
        <div className="bg-[#120e20] border border-cyan-500/20 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-cyan-400" /> STARTER প্ল্যান
            </span>
            <span className="text-[10px] text-gray-400 font-mono">Limit: ৫০০/মাস</span>
          </div>
          <p className="text-2xl font-black text-white">{summary?.plans?.starter?.messages || 0}</p>
          <p className="text-[11px] text-cyan-300/80 mt-1">
            {summary?.plans?.starter?.users || 0} জন সক্রিয় গ্রাহক
          </p>
        </div>

        {/* Business Plan Card */}
        <div className="bg-[#120e20] border border-emerald-500/20 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-400" /> BUSINESS প্ল্যান
            </span>
            <span className="text-[10px] text-gray-400 font-mono">Limit: ২,৫০০/মাস</span>
          </div>
          <p className="text-2xl font-black text-white">{summary?.plans?.business?.messages || 0}</p>
          <p className="text-[11px] text-emerald-300/80 mt-1">
            {summary?.plans?.business?.users || 0} জন সক্রিয় গ্রাহক
          </p>
        </div>

        {/* Pro Plan Card */}
        <div className="bg-[#120e20] border border-purple-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-400" /> PRO প্ল্যান
            </span>
            <span className="text-[10px] text-gray-400 font-mono">Limit: ১০,০০০/মাস</span>
          </div>
          <p className="text-2xl font-black text-white">{summary?.plans?.pro?.messages || 0}</p>
          <p className="text-[11px] text-purple-300/80 mt-1">
            {summary?.plans?.pro?.users || 0} জন সক্রিয় গ্রাহক
          </p>
        </div>

        {/* Total Platform Messages */}
        <div className="bg-[#120e20] border border-purple-900/40 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-purple-400" /> মোট AI মেসেজ পাঠানো
            </span>
            <span className="text-[10px] text-emerald-400 font-bold">All Plans</span>
          </div>
          <p className="text-2xl font-black text-white">{summary?.totalMessagesSent || 0}</p>
          <p className="text-[11px] text-gray-400 mt-1">মোট {summary?.totalUsers || 0} জন গ্রাহকের মাঝে</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ব্যবসার নাম বা ইমেইল দিয়ে খুঁজুন..."
              className="w-full pl-10 pr-4 py-2 bg-[#120e20] border border-purple-900/40 rounded-xl text-white placeholder-gray-500 text-xs focus:outline-none focus:border-purple-500"
            />
          </div>

          <select
            value={selectedPlanFilter}
            onChange={(e) => setSelectedPlanFilter(e.target.value)}
            className="px-3 py-2 bg-[#120e20] border border-purple-900/40 rounded-xl text-xs text-purple-300 focus:outline-none focus:border-purple-500"
          >
            <option value="ALL">সকল সাবস্ক্রিপশন প্ল্যান</option>
            <option value="STARTER">STARTER</option>
            <option value="BUSINESS">BUSINESS</option>
            <option value="PRO">PRO</option>
          </select>
        </div>
      </div>

      {/* Users Subscription & Message Consumption Table */}
      {loading ? (
        <div className="py-24 text-center text-sm text-gray-400">সাবস্ক্রিপশন মেট্রিক্স লোড হচ্ছে...</div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-[#120e20] border border-purple-900/30 rounded-3xl p-12 text-center max-w-md mx-auto my-8">
          <CreditCard className="w-12 h-12 text-purple-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">কোনো ব্যবহারকারী পাওয়া যায়নি</h3>
          <p className="text-xs text-gray-400">ইউজাররা সাইন আপ করলে তাদের মেসেজ ব্যবহার এখানে প্রদর্শিত হবে।</p>
        </div>
      ) : (
        <div className="bg-[#120e20] border border-purple-900/30 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-purple-900/30 bg-[#0a0812] text-purple-300">
                  <th className="py-3.5 px-4 font-semibold">ব্যবসা ও ব্যবহারকারী</th>
                  <th className="py-3.5 px-4 font-semibold">সাবস্ক্রিপশন প্ল্যান</th>
                  <th className="py-3.5 px-4 font-semibold">মেসেজ ব্যবহার (Consumption)</th>
                  <th className="py-3.5 px-4 font-semibold">পেজ ও প্রোডাক্ট</th>
                  <th className="py-3.5 px-4 font-semibold text-right">ম্যানেজমেন্ট</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-900/20 text-gray-300">
                {filteredUsers.map((u) => {
                  const sent = u.messagesSentThisMonth || 0;
                  const limit = u.monthlyMessageLimit || 500;
                  const percent = Math.min(Math.round((sent / limit) * 100), 100);

                  return (
                    <tr key={u.id} className="hover:bg-purple-950/20 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white">{u.businessName || 'Business'}</div>
                        <div className="text-[11px] text-gray-400">{u.fullName} • <span className="font-mono text-purple-300">{u.email}</span></div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider ${
                            u.plan === 'PRO'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                              : u.plan === 'BUSINESS'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                          }`}
                        >
                          {u.plan || 'STARTER'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 min-w-[220px]">
                        <div className="flex items-center justify-between text-[11px] mb-1 font-mono">
                          <span className="font-bold text-white">{sent.toLocaleString()} / {limit.toLocaleString()}</span>
                          <span className={percent > 90 ? 'text-red-400 font-bold' : 'text-purple-300'}>{percent}%</span>
                        </div>
                        <div className="w-full bg-[#0a0812] rounded-full h-2 overflow-hidden border border-purple-900/40">
                          <div
                            className={`h-full rounded-full transition-all ${
                              percent > 90
                                ? 'bg-red-500'
                                : percent > 60
                                ? 'bg-amber-400'
                                : 'bg-gradient-to-r from-purple-500 to-cyan-400'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-[11px] text-gray-400">
                        {u._count?.pages || 0} টি পেজ • {u._count?.products || 0} টি প্রোডাক্ট
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(u)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30 text-[11px] font-semibold transition-colors"
                            title="প্ল্যান পরিবর্তন করুন"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>প্ল্যান পরিবর্তন</span>
                          </button>
                          <button
                            onClick={() => handleResetQuota(u.id, u.email)}
                            className="p-1.5 rounded-lg bg-[#0a0812] hover:bg-amber-500/20 text-gray-400 hover:text-amber-400 border border-purple-900/40 transition-colors"
                            title="মেসেজ কোটা রিসেট করুন"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Plan & Limit Edit Modal */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#120e20] border border-purple-900/40 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setEditUser(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-1">সাবস্ক্রিপশন প্ল্যান পরিবর্তন</h3>
            <p className="text-xs text-purple-300/70 mb-6">{editUser.businessName} ({editUser.email})</p>

            <form onSubmit={handleSavePlan} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider mb-1.5">
                  প্ল্যান টিয়ার
                </label>
                <select
                  value={planInput}
                  onChange={(e) => {
                    const newPlan = e.target.value;
                    setPlanInput(newPlan);
                    if (newPlan === 'STARTER') setLimitInput('500');
                    else if (newPlan === 'BUSINESS') setLimitInput('2500');
                    else if (newPlan === 'PRO') setLimitInput('10000');
                  }}
                  className="w-full px-3.5 py-2.5 bg-[#0a0812] border border-purple-900/40 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                >
                  <option value="STARTER">STARTER (৫০০ মেসেজ/মাস)</option>
                  <option value="BUSINESS">BUSINESS (২,৫০০ মেসেজ/মাস)</option>
                  <option value="PRO">PRO (১০,০০০ মেসেজ/মাস)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider mb-1.5">
                  কাস্টম মাসিক মেসেজ লিমিট
                </label>
                <input
                  type="number"
                  required
                  min="50"
                  max="1000000"
                  value={limitInput}
                  onChange={(e) => setLimitInput(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#0a0812] border border-purple-900/40 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-purple-900/30">
                <button
                  type="button"
                  onClick={() => setEditUser(null)}
                  className="px-4 py-2 rounded-xl bg-[#0a0812] text-gray-400 text-xs font-semibold hover:text-white"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-500/25 disabled:opacity-50 transition-all"
                >
                  {saving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
