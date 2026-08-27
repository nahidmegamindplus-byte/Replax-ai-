'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import Link from 'next/link';
import {
  Key,
  Plus,
  Copy,
  Check,
  Search,
  Filter,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Edit2,
  Trash2,
  Users,
  Sparkles,
  Layers,
  Bot,
  Zap,
  Phone,
  Building,
  Eye,
  X,
  Share2,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function AdminLicensesPage() {
  const toast = useToast();
  const [licenses, setLicenses] = useState<any[]>([]);
  const [counts, setCounts] = useState<any>({ total: 0, active: 0, used: 0, expired: 0, revoked: 0 });
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Modals
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [generatedBatch, setGeneratedBatch] = useState<any[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingLicense, setEditingLicense] = useState<any>(null);
  const [viewingLicense, setViewingLicense] = useState<any>(null);

  // Generator Form State
  const [formPackageId, setFormPackageId] = useState('');
  const [formPlan, setFormPlan] = useState('BUSINESS');
  const [formCount, setFormCount] = useState('1');
  const [formDurationDays, setFormDurationDays] = useState('30');
  const [formMessageLimit, setFormMessageLimit] = useState('3000');
  const [formPageLimit, setFormPageLimit] = useState('3');
  const [formProductLimit, setFormProductLimit] = useState('200');
  const [formClientName, setFormClientName] = useState('');
  const [formClientPhone, setFormClientPhone] = useState('');
  const [formClientNote, setFormClientNote] = useState('');
  const [formCustomPrefix, setFormCustomPrefix] = useState('RPLX');
  const [generating, setGenerating] = useState(false);

  // Edit Form State
  const [editDurationDays, setEditDurationDays] = useState('30');
  const [editMessageLimit, setEditMessageLimit] = useState('3000');
  const [editPageLimit, setEditPageLimit] = useState('3');
  const [editStatus, setEditStatus] = useState('ACTIVE');
  const [editClientName, setEditClientName] = useState('');
  const [editClientPhone, setEditClientPhone] = useState('');
  const [editClientNote, setEditClientNote] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchLicenses = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/licenses?status=${statusFilter}`);
      const data = await res.json();
      if (data.success) {
        setLicenses(data.licenses || []);
        setCounts(data.counts || { total: 0, active: 0, used: 0, expired: 0, revoked: 0 });
      } else {
        toast.error(data.error || 'লাইসেন্স লোড করতে সমস্যা হয়েছে।');
      }
    } catch (e) {
      toast.error('সার্ভার ত্রুটি।');
    } finally {
      setLoading(false);
    }
  };

  const fetchPackages = async () => {
    try {
      const res = await fetch('/api/admin/packages');
      const data = await res.json();
      if (data.success && data.packages) {
        setPackages(data.packages);
        if (data.packages.length > 0) {
          const defaultPkg = data.packages.find((p: any) => p.isPopular) || data.packages[0];
          setFormPackageId(defaultPkg.id);
          setFormPlan(defaultPkg.slug.toUpperCase());
          setFormDurationDays(defaultPkg.durationDays.toString());
          setFormMessageLimit(defaultPkg.messageLimit.toString());
          setFormPageLimit(defaultPkg.pageLimit.toString());
          setFormProductLimit(defaultPkg.productLimit.toString());
        }
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchLicenses();
    fetchPackages();
  }, [statusFilter]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} কপি করা হয়েছে!`);
  };

  const handleCopyDirectLink = (key: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://replax-ai.vercel.app';
    const directLink = `${origin}/activate?key=${encodeURIComponent(key)}`;
    navigator.clipboard.writeText(directLink);
    toast.success('ডাইরেক্ট অ্যাক্টিভেশন লিংক কপি হয়েছে!');
  };

  const handlePackageChange = (pkgId: string) => {
    setFormPackageId(pkgId);
    const selectedPkg = packages.find((p) => p.id === pkgId);
    if (selectedPkg) {
      setFormPlan(selectedPkg.slug.toUpperCase());
      setFormDurationDays(selectedPkg.durationDays.toString());
      setFormMessageLimit(selectedPkg.messageLimit.toString());
      setFormPageLimit(selectedPkg.pageLimit.toString());
      setFormProductLimit(selectedPkg.productLimit.toString());
    }
  };

  // Generate License Keys
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);

    try {
      const res = await fetch('/api/admin/licenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: formPackageId || undefined,
          plan: formPlan,
          count: parseInt(formCount) || 1,
          durationDays: parseInt(formDurationDays) || 30,
          messageLimit: parseInt(formMessageLimit) || 3000,
          pageLimit: parseInt(formPageLimit) || 3,
          productLimit: parseInt(formProductLimit) || 200,
          clientName: formClientName,
          clientPhone: formClientPhone,
          clientNote: formClientNote,
          customPrefix: formCustomPrefix || 'RPLX',
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(data.message || 'লাইসেন্স কি সফলভাবে তৈরি হয়েছে!');
        setGeneratedBatch(data.keys || []);
        fetchLicenses();
      } else {
        toast.error(data.error || 'লাইসেন্স তৈরি ব্যর্থ হয়েছে।');
      }
    } catch (e) {
      toast.error('সার্ভার ত্রুটি।');
    } finally {
      setGenerating(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (lic: any) => {
    setEditingLicense(lic);
    setEditDurationDays(lic.durationDays?.toString() || '30');
    setEditMessageLimit(lic.messageLimit?.toString() || '3000');
    setEditPageLimit(lic.pageLimit?.toString() || '3');
    setEditStatus(lic.status || 'ACTIVE');
    setEditClientName(lic.clientName || '');
    setEditClientPhone(lic.clientPhone || '');
    setEditClientNote(lic.clientNote || '');
    setIsEditModalOpen(true);
  };

  // Save Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLicense) return;

    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/licenses/${editingLicense.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          durationDays: parseInt(editDurationDays),
          messageLimit: parseInt(editMessageLimit),
          pageLimit: parseInt(editPageLimit),
          status: editStatus,
          clientName: editClientName,
          clientPhone: editClientPhone,
          clientNote: editClientNote,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('লাইসেন্স কি আপডেট হয়েছে!');
        setIsEditModalOpen(false);
        setEditingLicense(null);
        fetchLicenses();
      } else {
        toast.error(data.error || 'আপডেট ব্যর্থ হয়েছে।');
      }
    } catch (e) {
      toast.error('সার্ভার ত্রুটি।');
    } finally {
      setUpdating(false);
    }
  };

  // Toggle Revoke/Active
  const handleToggleStatus = async (lic: any) => {
    const nextStatus = lic.status === 'ACTIVE' ? 'REVOKED' : 'ACTIVE';
    const actionLabel = nextStatus === 'REVOKED' ? 'বাতিল (Revoke)' : 'সক্রিয় (Activate)';

    if (!confirm(`আপনি কি "${lic.key}" লাইসেন্সটি ${actionLabel} করতে চান?`)) return;

    try {
      const res = await fetch(`/api/admin/licenses/${lic.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`লাইসেন্স কি ${actionLabel} করা হয়েছে!`);
        fetchLicenses();
      } else {
        toast.error(data.error || 'স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে।');
      }
    } catch (e) {
      toast.error('সার্ভার ত্রুটি।');
    }
  };

  // Delete License
  const handleDeleteLicense = async (lic: any) => {
    if (!confirm(`আপনি কি নিশ্চিতভাবে "${lic.key}" লাইসেন্সটি মুছে ফেলতে চান? এটি স্থায়ীভাবে রিমুভ হয়ে যাবে।`)) return;

    try {
      const res = await fetch(`/api/admin/licenses/${lic.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (data.success) {
        toast.success('লাইসেন্স কি সফলভাবে মুছে ফেলা হয়েছে!');
        fetchLicenses();
      } else {
        toast.error(data.error || 'মুছতে ব্যর্থ হয়েছে।');
      }
    } catch (e) {
      toast.error('সার্ভার ত্রুটি।');
    }
  };

  const handleCopyAllBatch = () => {
    if (generatedBatch.length === 0) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://replax-ai.vercel.app';
    const text = generatedBatch
      .map((k, idx) => `${idx + 1}. Key: ${k.key} | Plan: ${k.plan} (${k.durationDays}d) | Link: ${origin}/activate?key=${k.key}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    toast.success('সকল জেনারেটেড কি ও লিংক কপি হয়েছে!');
  };

  const filteredLicenses = licenses.filter((l) => {
    const s = search.toLowerCase();
    return (
      l.key?.toLowerCase().includes(s) ||
      l.plan?.toLowerCase().includes(s) ||
      l.clientName?.toLowerCase().includes(s) ||
      l.clientPhone?.includes(s) ||
      l.clientNote?.toLowerCase().includes(s) ||
      l.usedByUser?.fullName?.toLowerCase().includes(s) ||
      l.usedByUser?.businessName?.toLowerCase().includes(s) ||
      l.usedByUser?.email?.toLowerCase().includes(s)
    );
  });

  return (
    <AdminLayout
      title="🔑 লাইসেন্স কি জেনারেটর ও ইনস্ট্যান্ট এক্সেস কন্ট্রোল"
      subtitle="গ্রাহকদের জন্য রেজিস্ট্রেশনবিহীন ইনস্ট্যান্ট ড্যাশবোর্ড এক্সেস লাইসেন্স কি তৈরি ও পরিচালনা করুন"
    >
      {/* Top Banner with Quick Generator Trigger */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 p-5 rounded-3xl bg-gradient-to-r from-[#170e2b] via-[#140f26] to-[#0f142b] border border-purple-900/40 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
            <Key className="w-6 h-6 text-black" />
          </div>
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <span>লাইসেন্স কি দিয়ে রেজিস্ট্রেশন ছাড়া ১-ক্লিক প্রবেশ</span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                1-Click Instant Access
              </span>
            </h3>
            <p className="text-xs text-purple-300/80 mt-0.5">
              অ্যাডমিন এখান থেকে কি জেনারেট করে ক্লায়েন্টকে দেবে; ক্লায়েন্ট কি দিয়ে সরাসরি ড্যাশবোর্ডে লগইন হতে পারবে।
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchLicenses}
            className="p-2.5 rounded-xl bg-[#0a0812] border border-purple-900/40 text-gray-400 hover:text-white transition-colors"
            title="তালিকা রিফ্রেশ করুন"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <Link
            href="/activate"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/40 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all"
          >
            <ExternalLink className="w-4 h-4" />
            <span>ইউজার অ্যাক্টিভেশন পেজ</span>
          </Link>

          <button
            onClick={() => {
              setGeneratedBatch([]);
              setIsGenerateModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-500 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs shadow-lg shadow-purple-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ নতুন লাইসেন্স কি তৈরি করুন</span>
          </button>
        </div>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 mb-8">
        <button
          type="button"
          onClick={() => setStatusFilter('ALL')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            statusFilter === 'ALL'
              ? 'bg-purple-600/20 border-purple-500 text-white font-bold shadow-lg'
              : 'bg-[#120e20] border-purple-900/30 text-gray-400 hover:text-white'
          }`}
        >
          <span className="text-xs text-purple-300 block mb-1">মোট লাইসেন্স কি</span>
          <span className="text-2xl font-black text-white">{counts.total}</span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('ACTIVE')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            statusFilter === 'ACTIVE'
              ? 'bg-emerald-500/20 border-emerald-500 text-white font-bold shadow-lg'
              : 'bg-[#120e20] border-purple-900/30 text-gray-400 hover:text-white'
          }`}
        >
          <span className="text-xs text-emerald-300 block mb-1">সক্রিয় (ব্যবহারযোগ্য)</span>
          <span className="text-2xl font-black text-emerald-400">{counts.active}</span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('USED')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            statusFilter === 'USED'
              ? 'bg-cyan-500/20 border-cyan-500 text-white font-bold shadow-lg'
              : 'bg-[#120e20] border-purple-900/30 text-gray-400 hover:text-white'
          }`}
        >
          <span className="text-xs text-cyan-300 block mb-1">ব্যবহৃত (Active User)</span>
          <span className="text-2xl font-black text-cyan-400">{counts.used}</span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('EXPIRED')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            statusFilter === 'EXPIRED'
              ? 'bg-amber-500/20 border-amber-500 text-white font-bold shadow-lg'
              : 'bg-[#120e20] border-purple-900/30 text-gray-400 hover:text-white'
          }`}
        >
          <span className="text-xs text-amber-300 block mb-1">মেয়াদোত্তীর্ণ</span>
          <span className="text-2xl font-black text-amber-400">{counts.expired}</span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('REVOKED')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            statusFilter === 'REVOKED'
              ? 'bg-red-500/20 border-red-500 text-white font-bold shadow-lg'
              : 'bg-[#120e20] border-purple-900/30 text-gray-400 hover:text-white'
          }`}
        >
          <span className="text-xs text-red-300 block mb-1">বাতিল (Revoked)</span>
          <span className="text-2xl font-black text-red-400">{counts.revoked}</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="লাইসেন্স কি, ক্লায়েন্টের নাম, নম্বর, বা নোট দিয়ে খুঁজুন..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#120e20] border border-purple-900/40 rounded-xl text-white placeholder-gray-500 text-xs focus:outline-none focus:border-purple-500"
          />
        </div>

        <span className="text-xs text-gray-400">
          প্রদর্শিত হচ্ছে: <strong className="text-purple-300">{filteredLicenses.length}</strong> টি কি
        </span>
      </div>

      {/* Licenses Table */}
      {loading ? (
        <div className="py-24 text-center text-sm text-gray-400">লাইসেন্স কি তালিকা লোড হচ্ছে...</div>
      ) : filteredLicenses.length === 0 ? (
        <div className="bg-[#120e20] border border-purple-900/30 rounded-3xl p-12 text-center max-w-md mx-auto my-8">
          <Key className="w-12 h-12 text-purple-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">কোনো লাইসেন্স কি পাওয়া যায়নি</h3>
          <p className="text-xs text-gray-400 mb-4">
            নতুন লাইসেন্স কি তৈরি করে ক্লায়েন্টদের ১-ক্লিক ড্যাশবোর্ড এক্সেস দিন।
          </p>
          <button
            onClick={() => setIsGenerateModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-500/25"
          >
            + নতুন লাইসেন্স কি তৈরি করুন
          </button>
        </div>
      ) : (
        <div className="bg-[#120e20] border border-purple-900/30 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-purple-900/30 bg-[#0a0812] text-purple-300">
                  <th className="py-3.5 px-4 font-semibold">লাইসেন্স কি (License Key)</th>
                  <th className="py-3.5 px-4 font-semibold">প্ল্যান ও মেয়াদ</th>
                  <th className="py-3.5 px-4 font-semibold">লিমিট (মেসেজ/পেজ)</th>
                  <th className="py-3.5 px-4 font-semibold">অ্যাসাইন করা ক্লায়েন্ট / ইউজার</th>
                  <th className="py-3.5 px-4 font-semibold">স্ট্যাটাস</th>
                  <th className="py-3.5 px-4 font-semibold">তৈরি ও অ্যাক্টিভেশন</th>
                  <th className="py-3.5 px-4 font-semibold text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-900/20 text-gray-300">
                {filteredLicenses.map((lic) => {
                  const isActive = lic.status === 'ACTIVE';
                  const isUsed = lic.status === 'USED';
                  const isRevoked = lic.status === 'REVOKED';
                  const isExpired = lic.status === 'EXPIRED';

                  return (
                    <tr key={lic.id} className="hover:bg-purple-950/20 transition-colors">
                      {/* Key Column */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-black text-cyan-300 text-sm tracking-wider px-2.5 py-1 rounded bg-[#0a0812] border border-cyan-900/40">
                            {lic.key}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(lic.key, 'লাইসেন্স কি')}
                            className="p-1 text-gray-400 hover:text-cyan-300"
                            title="কি কপি করুন"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopyDirectLink(lic.key)}
                            className="p-1 text-gray-400 hover:text-purple-300"
                            title="১-ক্লিক ডাইরেক্ট লগইন লিংক কপি করুন"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {lic.clientNote && (
                          <p className="text-[10px] text-gray-400 mt-1 max-w-[200px] truncate" title={lic.clientNote}>
                            নোট: {lic.clientNote}
                          </p>
                        )}
                      </td>

                      {/* Plan & Duration */}
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold text-[11px] block w-fit mb-1">
                          {lic.package?.name || lic.plan}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {lic.durationDays >= 999 ? 'লাইফটাইম' : `${lic.durationDays} দিন মেয়াদ`}
                        </span>
                      </td>

                      {/* Limits */}
                      <td className="py-3.5 px-4">
                        <div className="text-white font-mono font-bold">
                          {lic.messageLimit.toLocaleString()} মেসেজ
                        </div>
                        <div className="text-[10px] text-gray-400">
                          {lic.pageLimit}টি পেজ • {lic.productLimit}টি পণ্য
                        </div>
                      </td>

                      {/* Client / User Info */}
                      <td className="py-3.5 px-4">
                        {lic.usedByUser ? (
                          <div>
                            <div className="font-bold text-emerald-400 flex items-center gap-1">
                              <span>{lic.usedByUser.businessName || lic.usedByUser.fullName}</span>
                            </div>
                            <div className="text-[10px] text-gray-400 font-mono">
                              {lic.usedByUser.email} {lic.usedByUser.phone ? `• ${lic.usedByUser.phone}` : ''}
                            </div>
                          </div>
                        ) : lic.clientName ? (
                          <div>
                            <div className="font-semibold text-white">{lic.clientName}</div>
                            <div className="text-[10px] text-gray-400 font-mono">{lic.clientPhone || 'অ্যাসাইন করা'}</div>
                          </div>
                        ) : (
                          <span className="text-gray-500 italic text-[11px]">উন্মুক্ত (যেকোনো ইউজার)</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider inline-flex items-center gap-1 ${
                            isActive
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : isUsed
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                              : isExpired
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-red-500/20 text-red-300 border border-red-500/40'
                          }`}
                        >
                          {isActive ? (
                            <>
                              <Zap className="w-3 h-3 text-emerald-400" />
                              <span>সক্রিয়</span>
                            </>
                          ) : isUsed ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                              <span>ব্যবহৃত</span>
                            </>
                          ) : isExpired ? (
                            <>
                              <Clock className="w-3 h-3 text-amber-400" />
                              <span>মেয়াদ শেষ</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-red-400" />
                              <span>বাতিল</span>
                            </>
                          )}
                        </span>
                      </td>

                      {/* Dates */}
                      <td className="py-3.5 px-4 text-[10px] text-gray-400">
                        <div>তৈরি: {new Date(lic.createdAt).toLocaleDateString('bn-BD')}</div>
                        {lic.usedAt && (
                          <div className="text-cyan-300">
                            ব্যবহার: {new Date(lic.usedAt).toLocaleDateString('bn-BD')}
                          </div>
                        )}
                        {lic.expiresAt && (
                          <div className="text-amber-300">
                            মেয়াদ: {new Date(lic.expiresAt).toLocaleDateString('bn-BD')}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* 1-Click Copy Link */}
                          <button
                            onClick={() => handleCopyDirectLink(lic.key)}
                            className="p-1.5 rounded-xl bg-purple-900/30 hover:bg-purple-900/60 text-purple-300 border border-purple-500/30 transition-colors"
                            title="১-ক্লিক ডাইরেক্ট অ্যাক্টিভেশন লিংক কপি করুন"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>

                          {/* View details */}
                          <button
                            onClick={() => setViewingLicense(lic)}
                            className="p-1.5 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-500/30 transition-colors"
                            title="বিস্তারিত দেখুন"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => handleOpenEdit(lic)}
                            className="p-1.5 rounded-xl bg-blue-950/40 hover:bg-blue-900/60 text-blue-300 border border-blue-500/30 transition-colors"
                            title="সম্পাদনা করুন"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Toggle Revoke / Active */}
                          <button
                            onClick={() => handleToggleStatus(lic)}
                            className={`p-1.5 rounded-xl border transition-colors ${
                              isRevoked
                                ? 'bg-emerald-950/30 hover:bg-emerald-900/50 text-emerald-400 border-emerald-500/30'
                                : 'bg-amber-950/30 hover:bg-amber-900/50 text-amber-400 border-amber-500/30'
                            }`}
                            title={isRevoked ? 'সক্রিয় করুন' : 'বাতিল (Revoke) করুন'}
                          >
                            {isRevoked ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteLicense(lic)}
                            className="p-1.5 rounded-xl bg-red-950/30 hover:bg-red-900/50 text-red-400 border border-red-500/30 transition-colors"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* Generate License Key Modal */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#120e20] border border-purple-900/40 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative my-8">
            <button
              onClick={() => setIsGenerateModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">নতুন লাইসেন্স কি তৈরি করুন</h3>
                <p className="text-xs text-purple-300/70">একক বা একাধিক (বাল্ক) লাইসেন্স কি জেনারেট করুন</p>
              </div>
            </div>

            {/* Generated Batch Success Box */}
            {generatedBatch.length > 0 && (
              <div className="mb-6 p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{generatedBatch.length}টি লাইসেন্স কি সফলভাবে তৈরি হয়েছে!</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyAllBatch}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs transition-all shadow"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>সব কপি করুন</span>
                  </button>
                </div>

                <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                  {generatedBatch.map((k) => (
                    <div
                      key={k.id}
                      className="p-2 rounded-xl bg-[#090b14] border border-emerald-500/20 flex items-center justify-between text-xs"
                    >
                      <span className="font-mono font-bold text-cyan-300">{k.key}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-400">{k.plan} ({k.durationDays}d)</span>
                        <button
                          onClick={() => handleCopy(k.key, 'লাইসেন্স কি')}
                          className="text-gray-400 hover:text-emerald-400 p-0.5"
                          title="কি কপি করুন"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleGenerate} className="space-y-4">
              {/* Package Selector & Plan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider mb-1.5">
                    প্যাকেজ টেমপ্লেট
                  </label>
                  <select
                    value={formPackageId}
                    onChange={(e) => handlePackageChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#0a0812] border border-purple-900/40 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                  >
                    <option value="">-- কাস্টম কনফিগারেশন --</option>
                    {packages.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (৳{p.price}) - {p.durationDays} দিন
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider mb-1.5">
                    প্ল্যান টিয়ার (Plan Tier)
                  </label>
                  <select
                    value={formPlan}
                    onChange={(e) => setFormPlan(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#0a0812] border border-purple-900/40 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                  >
                    <option value="STARTER">STARTER (স্টার্টার)</option>
                    <option value="BUSINESS">BUSINESS (বিজনেস)</option>
                    <option value="PRO">PRO (প্রো)</option>
                  </select>
                </div>
              </div>

              {/* Count & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider mb-1.5">
                    কতগুলো কি জেনারেট করবেন? *
                  </label>
                  <select
                    value={formCount}
                    onChange={(e) => setFormCount(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#0a0812] border border-purple-900/40 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                  >
                    <option value="1">১টি কি (Single Key)</option>
                    <option value="5">৫টি কি (5 Keys Bulk)</option>
                    <option value="10">১০টি কি (10 Keys Bulk)</option>
                    <option value="20">২০টি কি (20 Keys Bulk)</option>
                    <option value="50">৫০টি কি (50 Keys Bulk)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider mb-1.5">
                    মেয়াদ (দিন) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formDurationDays}
                    onChange={(e) => setFormDurationDays(e.target.value)}
                    placeholder="30"
                    className="w-full px-3.5 py-2 bg-[#0a0812] border border-purple-900/40 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Message Limit & Page Limit */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider mb-1.5">
                    মেসেজ লিমিট *
                  </label>
                  <input
                    type="number"
                    required
                    min="100"
                    value={formMessageLimit}
                    onChange={(e) => setFormMessageLimit(e.target.value)}
                    placeholder="3000"
                    className="w-full px-3.5 py-2 bg-[#0a0812] border border-purple-900/40 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider mb-1.5">
                    পেজ লিমিট *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formPageLimit}
                    onChange={(e) => setFormPageLimit(e.target.value)}
                    placeholder="3"
                    className="w-full px-3.5 py-2 bg-[#0a0812] border border-purple-900/40 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider mb-1.5">
                    কাস্টম প্রিফিক্স
                  </label>
                  <input
                    type="text"
                    value={formCustomPrefix}
                    onChange={(e) => setFormCustomPrefix(e.target.value.toUpperCase())}
                    placeholder="RPLX"
                    className="w-full px-3.5 py-2 bg-[#0a0812] border border-purple-900/40 rounded-xl text-white text-xs font-mono uppercase focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Optional Client Assignment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-purple-900/30">
                <div>
                  <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider mb-1.5">
                    নির্দিষ্ট ক্লায়েন্টের নাম (ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    value={formClientName}
                    onChange={(e) => setFormClientName(e.target.value)}
                    placeholder="যেমন: Tanvir Fashion"
                    className="w-full px-3.5 py-2 bg-[#0a0812] border border-purple-900/40 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider mb-1.5">
                    ক্লায়েন্ট ফোন নম্বর (ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    value={formClientPhone}
                    onChange={(e) => setFormClientPhone(e.target.value)}
                    placeholder="017XXXXXXXX"
                    className="w-full px-3.5 py-2 bg-[#0a0812] border border-purple-900/40 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Client Note */}
              <div>
                <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider mb-1.5">
                  অ্যাডমিন নোট / নির্দেশনা
                </label>
                <textarea
                  rows={2}
                  value={formClientNote}
                  onChange={(e) => setFormClientNote(e.target.value)}
                  placeholder="যেমন: ৩ মাসের বিজনেস অফার কি।"
                  className="w-full px-3.5 py-2 bg-[#0a0812] border border-purple-900/40 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-purple-900/30">
                <button
                  type="button"
                  onClick={() => setIsGenerateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#0a0812] text-gray-400 text-xs font-semibold hover:text-white"
                >
                  বন্ধ করুন
                </button>
                <button
                  type="submit"
                  disabled={generating}
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-500/25 disabled:opacity-50 transition-all"
                >
                  {generating ? 'জেনারেট হচ্ছে...' : '⚡ লাইসেন্স কি তৈরি করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit License Modal */}
      {isEditModalOpen && editingLicense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#120e20] border border-purple-900/40 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-1">লাইসেন্স কি সম্পাদনা</h3>
            <p className="text-xs text-purple-300 font-mono mb-4">{editingLicense.key}</p>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider mb-1.5">
                    স্ট্যাটাস *
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0a0812] border border-purple-900/40 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                  >
                    <option value="ACTIVE">ACTIVE (সক্রিয়)</option>
                    <option value="USED">USED (ব্যবহৃত)</option>
                    <option value="EXPIRED">EXPIRED (মেয়াদ শেষ)</option>
                    <option value="REVOKED">REVOKED (বাতিল)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider mb-1.5">
                    মেয়াদ (দিন) *
                  </label>
                  <input
                    type="number"
                    required
                    value={editDurationDays}
                    onChange={(e) => setEditDurationDays(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0a0812] border border-purple-900/40 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider mb-1.5">
                    মেসেজ লিমিট *
                  </label>
                  <input
                    type="number"
                    required
                    value={editMessageLimit}
                    onChange={(e) => setEditMessageLimit(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0a0812] border border-purple-900/40 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider mb-1.5">
                    পেজ লিমিট *
                  </label>
                  <input
                    type="number"
                    required
                    value={editPageLimit}
                    onChange={(e) => setEditPageLimit(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0a0812] border border-purple-900/40 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider mb-1.5">
                  ক্লায়েন্টের নাম
                </label>
                <input
                  type="text"
                  value={editClientName}
                  onChange={(e) => setEditClientName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0a0812] border border-purple-900/40 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider mb-1.5">
                  নোট
                </label>
                <textarea
                  rows={2}
                  value={editClientNote}
                  onChange={(e) => setEditClientNote(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0a0812] border border-purple-900/40 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-purple-900/30">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#0a0812] text-gray-400 text-xs font-semibold hover:text-white"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-500/25 disabled:opacity-50 transition-all"
                >
                  {updating ? 'আপডেট হচ্ছে...' : 'সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View License Modal */}
      {viewingLicense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#120e20] border border-purple-900/40 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setViewingLicense(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-cyan-300 font-bold">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">লাইসেন্স বিস্তারিত</h3>
                <span className="text-xs text-purple-300/70">{viewingLicense.plan} প্ল্যান</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-[#0a0812] border border-purple-900/30">
                <span className="text-gray-400 block mb-1">লাইসেন্স কি:</span>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-cyan-300 text-sm">{viewingLicense.key}</span>
                  <button
                    onClick={() => handleCopy(viewingLicense.key, 'লাইসেন্স কি')}
                    className="p-1 rounded bg-purple-900/40 text-purple-300 hover:text-white"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#0a0812] border border-purple-900/30 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-gray-400">মেয়াদ:</span>
                    <p className="font-bold text-white">{viewingLicense.durationDays} দিন</p>
                  </div>
                  <div>
                    <span className="text-gray-400">মেসেজ লিমিট:</span>
                    <p className="font-mono font-bold text-emerald-400">{viewingLicense.messageLimit.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">পেজ লিমিট:</span>
                    <p className="font-bold text-white">{viewingLicense.pageLimit} টি</p>
                  </div>
                  <div>
                    <span className="text-gray-400">স্ট্যাটাস:</span>
                    <p className="font-bold text-cyan-300">{viewingLicense.status}</p>
                  </div>
                </div>
              </div>

              {viewingLicense.usedByUser && (
                <div className="p-3.5 rounded-2xl bg-[#0a0812] border border-emerald-500/30 space-y-1">
                  <span className="text-emerald-400 font-bold block">ব্যবহারকারী তথ্য:</span>
                  <p className="text-white font-bold">{viewingLicense.usedByUser.businessName || viewingLicense.usedByUser.fullName}</p>
                  <p className="text-gray-400 font-mono">{viewingLicense.usedByUser.email}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-5 mt-4 border-t border-purple-900/30">
              <button
                type="button"
                onClick={() => handleCopyDirectLink(viewingLicense.key)}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>ডাইরেক্ট লিংক কপি করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
