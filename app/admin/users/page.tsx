'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/layout/AdminLayout';
import {
  Users,
  Search,
  ShieldCheck,
  ShieldAlert,
  Trash2,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Layers,
  Globe,
  Edit2,
  X,
  Phone,
  Building,
  Key,
  Eye,
  EyeOff,
  MessageCircle,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function AdminUsersPage() {
  const toast = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [editingUser, setEditingUser] = useState<any>(null);
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [facebookPageUrl, setFacebookPageUrl] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('USER');
  const [status, setStatus] = useState('ACTIVE');
  const [plan, setPlan] = useState('STARTER');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
      } else {
        toast.error(data.error || 'অননুমোদিত অ্যাক্সেস।');
      }
    } catch (e) {
      toast.error('ব্যবহারকারী তালিকা লোড করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenEdit = (user: any) => {
    setEditingUser(user);
    setFullName(user.fullName || '');
    setBusinessName(user.businessName || '');
    setFacebookPageUrl(user.facebookPageUrl || '');
    setPhone(user.phone || '');
    setRole(user.role || 'USER');
    setStatus(user.status || 'ACTIVE');
    setPlan(user.plan || 'STARTER');
    setNewPassword('');
    setShowNewPassword(false);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setSaving(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: editingUser.id,
          fullName: fullName.trim(),
          businessName: businessName.trim(),
          facebookPageUrl: facebookPageUrl.trim() || null,
          phone: phone.trim() || null,
          role,
          status,
          plan,
          password: newPassword ? newPassword.trim() : undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(data.message || 'ব্যবহারকারীর তথ্য সফলভাবে আপডেট হয়েছে!');
        setEditingUser(null);
        fetchUsers();
      } else {
        toast.error(data.error || 'আপডেট ব্যর্থ হয়েছে।');
      }
    } catch (e) {
      toast.error('সার্ভার ত্রুটি।');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status: nextStatus }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`অ্যাকাউন্ট স্ট্যাটাস আপডেট হয়েছে: ${nextStatus}`);
        fetchUsers();
      } else {
        toast.error(data.error || 'স্ট্যাটাস আপডেট ব্যর্থ হয়েছে।');
      }
    } catch (e) {
      toast.error('সার্ভার ত্রুটি।');
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (!confirm(`আপনি কি নিশ্চিতভাবে ব্যবহারকারী "${email}" এবং তার সমস্ত ডাটা মুছে ফেলতে চান?`)) return;

    try {
      const res = await fetch(`/api/admin/users?userId=${userId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('ব্যবহারকারী সফলভাবে মুছে ফেলা হয়েছে।');
        fetchUsers();
      } else {
        toast.error(data.error || 'মুছতে ব্যর্থ হয়েছে।');
      }
    } catch (e) {
      toast.error('সার্ভার ত্রুটি।');
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.businessName?.toLowerCase().includes(search.toLowerCase()) ||
      u.facebookPageUrl?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout
      title="👥 ব্যবহারকারী পরিচালনা (User Management)"
      subtitle="রেজিস্টার্ড ইউজার, ফেসবুক পেজ URL, রোল এবং সাবস্ক্রিপশন কন্ট্রোল করুন"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="p-2 rounded-xl bg-[#161a29] border border-[#232a40] text-gray-300 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="relative min-w-[280px]">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="নাম, ইমেইল, ব্যবসা বা FB Page URL খুঁজুন..."
              className="w-full pl-9 pr-3 py-2 bg-[#12141c] border border-[#1f2433] rounded-xl text-white placeholder-gray-500 text-xs focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        <div className="text-xs text-gray-400">
          মোট ব্যবহারকারী: <strong className="text-white">{filteredUsers.length}</strong> জন
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center text-sm text-gray-400">ব্যবহারকারী তালিকা লোড হচ্ছে...</div>
      ) : (
        <div className="bg-[#12141c] border border-[#1f2433] rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-[#0d0f17] text-gray-400 border-b border-[#1f2433] uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">ব্যবহারকারী</th>
                  <th className="py-3.5 px-4 font-semibold">ব্যবসা ও ফেসবুক পেজ</th>
                  <th className="py-3.5 px-4 font-semibold">রোল</th>
                  <th className="py-3.5 px-4 font-semibold">প্ল্যান ও সাবস্ক্রিপশন</th>
                  <th className="py-3.5 px-4 font-semibold">পেজ / প্রোডাক্ট / অর্ডার</th>
                  <th className="py-3.5 px-4 font-semibold">স্ট্যাটাস</th>
                  <th className="py-3.5 px-4 font-semibold">তারিখ</th>
                  <th className="py-3.5 px-4 font-semibold text-right">একশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a1f2e]">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-[#161a29]/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{u.fullName}</div>
                      <div className="text-[11px] text-gray-400 font-mono">{u.email}</div>
                      {u.phone && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-[10px] text-gray-400 font-mono">{u.phone}</span>
                          <a
                            href={`https://wa.me/${u.phone.replace(/[^\d]/g, '').replace(/^01/, '8801')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-[9px] font-bold"
                            title="WhatsApp এ কথা বলুন"
                          >
                            <MessageCircle className="w-2.5 h-2.5" />
                            <span>WhatsApp</span>
                          </a>
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white mb-0.5">{u.businessName || 'N/A'}</div>
                      {u.facebookPageUrl ? (
                        <a
                          href={u.facebookPageUrl.startsWith('http') ? u.facebookPageUrl : `https://${u.facebookPageUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-mono text-[11px] text-emerald-400 hover:underline max-w-[200px] truncate"
                          title={u.facebookPageUrl}
                        >
                          <Globe className="w-3 h-3 shrink-0" />
                          <span className="truncate">{u.facebookPageUrl.replace(/^https?:\/\/(www\.)?facebook\.com\//, '')}</span>
                        </a>
                      ) : (
                        <span className="text-[10px] text-gray-500">পেজ লিঙ্ক নেই</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.role === 'ADMIN'
                            ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
                            : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-mono font-semibold text-emerald-400 text-xs">{u.plan}</div>
                      <span
                        className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.planStatus === 'ACTIVE'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : u.planStatus === 'PENDING_APPROVAL'
                            ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                            : 'bg-gray-500/10 text-gray-400 border border-gray-500/30'
                        }`}
                      >
                        {u.planStatus === 'ACTIVE'
                          ? '✓ প্যাকেজ সক্রিয়'
                          : u.planStatus === 'PENDING_APPROVAL'
                          ? '⏳ অপেক্ষমান'
                          : '✕ প্যাকেজ নেই'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-gray-400">
                      {u._count.pages} পেজ • {u._count.products} প্রোডাক্ট • {u._count.orders} অর্ডার
                    </td>

                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleStatus(u.id, u.status)}
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                          u.status === 'ACTIVE'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-red-500/10 text-red-400 border border-red-500/30'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        <span>{u.status === 'ACTIVE' ? 'সক্রিয়' : 'স্থগিত'}</span>
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-gray-500 text-[11px]">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="p-1.5 rounded-lg bg-[#1a1f2e] hover:bg-purple-500/20 text-gray-300 hover:text-purple-300 transition-colors"
                          title="সম্পাদনা ও পাসওয়ার্ড সেট করুন"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="p-1.5 rounded-lg bg-[#1a1f2e] hover:bg-amber-500/20 text-gray-300 hover:text-amber-300 transition-colors"
                          title="পাসওয়ার্ড রিসেট করুন"
                        >
                          <Key className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id, u.email)}
                          className="p-1.5 rounded-lg bg-[#1a1f2e] hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#12141c] border border-[#1f2433] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setEditingUser(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-1">ব্যবহারকারী তথ্য এডিট (Edit Profile)</h3>
            <p className="text-xs text-gray-400 mb-6">{editingUser.email}</p>

            <form onSubmit={handleSaveUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                  নাম
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#090b14] border border-[#1f2433] rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                  ব্যবসার নাম
                </label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#090b14] border border-[#1f2433] rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                  ফেসবুক পেজ লিঙ্ক (Facebook Page URL)
                </label>
                <input
                  type="text"
                  value={facebookPageUrl}
                  onChange={(e) => setFacebookPageUrl(e.target.value)}
                  placeholder="https://facebook.com/yourpage"
                  className="w-full px-3.5 py-2 bg-[#090b14] border border-[#1f2433] rounded-xl text-white text-xs font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                  মোবাইল / WhatsApp নম্বর (Mobile/WhatsApp Number)
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="যেমন: +8801700000000"
                  className="w-full px-3.5 py-2 bg-[#090b14] border border-[#1f2433] rounded-xl text-white text-xs font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Set New Password for User */}
              <div className="p-3.5 rounded-2xl bg-[#090b14] border border-purple-900/30">
                <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-purple-400" />
                    <span>নতুন পাসওয়ার্ড সেট করুন (Set New Password)</span>
                  </span>
                  <span className="text-[10px] text-gray-500 font-normal">পরিবর্তন করতে চাইলে লিখুন</span>
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="নতুন পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)..."
                    className="w-full pl-3.5 pr-10 py-2 bg-[#12141c] border border-[#1f2433] rounded-xl text-white text-xs font-mono focus:outline-none focus:border-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1"
                    title={showNewPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 mb-1">রোল (Role)</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-2.5 py-2 bg-[#090b14] border border-[#1f2433] rounded-xl text-white text-xs"
                  >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 mb-1">স্ট্যাটাস</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-2.5 py-2 bg-[#090b14] border border-[#1f2433] rounded-xl text-white text-xs"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="DISABLED">DISABLED</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 mb-1">প্ল্যান (Plan)</label>
                  <select
                    value={plan}
                    onChange={(e) => setPlan(e.target.value)}
                    className="w-full px-2.5 py-2 bg-[#090b14] border border-[#1f2433] rounded-xl text-white text-xs"
                  >
                    <option value="STARTER">STARTER</option>
                    <option value="BUSINESS">BUSINESS</option>
                    <option value="PRO">PRO</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1f2433]">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl bg-[#090b14] text-gray-400 text-xs font-semibold hover:text-white"
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
