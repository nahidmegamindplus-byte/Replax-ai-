'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import {
  CreditCard,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Phone,
  ShieldCheck,
  X,
  FileText,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function AdminPaymentMethodsPage() {
  const toast = useToast();
  const [methods, setMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State for Add & Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<any>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountType, setAccountType] = useState('Personal');
  const [instructions, setInstructions] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchMethods = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/payment-methods');
      const data = await res.json();
      if (data.success) {
        setMethods(data.paymentMethods || []);
      } else {
        toast.error(data.error || 'পেমেন্ট মেথড লোড করতে সমস্যা হয়েছে।');
      }
    } catch (e) {
      toast.error('সার্ভার ত্রুটি।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMethods();
  }, []);

  const handleOpenAdd = () => {
    setEditingMethod(null);
    setName('');
    setDisplayName('');
    setAccountNumber('');
    setAccountType('Personal');
    setInstructions('Send Money করে Transaction ID দিন।');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (pm: any) => {
    setEditingMethod(pm);
    setName(pm.name || '');
    setDisplayName(pm.displayName || '');
    setAccountNumber(pm.accountNumber || '');
    setAccountType(pm.accountType || 'Personal');
    setInstructions(pm.instructions || '');
    setIsActive(Boolean(pm.isActive));
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountNumber.trim()) {
      toast.error('একাউন্ট নম্বর আবশ্যক।');
      return;
    }

    setSaving(true);
    try {
      const url = '/api/admin/payment-methods';
      const method = editingMethod ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(editingMethod && { id: editingMethod.id }),
          name: name.trim().toUpperCase(),
          displayName: displayName.trim(),
          accountNumber: accountNumber.trim(),
          accountType,
          instructions: instructions.trim(),
          isActive,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(data.message || 'পেমেন্ট মেথড সংরক্ষিত হয়েছে!');
        setIsModalOpen(false);
        fetchMethods();
      } else {
        toast.error(data.error || 'সংরক্ষণ ব্যর্থ হয়েছে।');
      }
    } catch (e) {
      toast.error('সার্ভার ত্রুটি।');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, nameStr: string) => {
    if (!confirm(`আপনি কি নিশ্চিতভাবে "${nameStr}" পেমেন্ট মেথডটি মুছে ফেলতে চান?`)) return;

    try {
      const res = await fetch(`/api/admin/payment-methods?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || 'পেমেন্ট মেthড মুছে ফেলা হয়েছে!');
        fetchMethods();
      } else {
        toast.error(data.error || 'মুছতে ব্যর্থ হয়েছে।');
      }
    } catch (e) {
      toast.error('সার্ভার ত্রুটি।');
    }
  };

  return (
    <AdminLayout
      title="💳 পেমেন্ট মাধ্যম পরিচালনা (Payment Methods Management)"
      subtitle="bKash, Nagad, Rocket, Upay বা অন্য যেকোনো রিসিভার নম্বর যুক্ত, সংশোধন ও ডিলিট করুন"
    >
      <div className="max-w-5xl space-y-6">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs text-purple-200">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>
              গ্রাহকরা চেকআউট পেজে এই নম্বরগুলোতে <strong>Send Money</strong> করবে এবং TrxID প্রদান করবে।
            </span>
          </div>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-500/25 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন মেথড যুক্ত করুন</span>
          </button>
        </div>

        {/* Methods Grid */}
        {loading ? (
          <div className="py-24 text-center text-sm text-gray-400">পেমেন্ট মেথড লোড হচ্ছে...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {methods.map((pm) => {
              const colorMap: any = {
                BKASH: 'from-pink-500/20 to-rose-500/10 border-pink-500/30 text-pink-400',
                NAGAD: 'from-orange-500/20 to-amber-500/10 border-orange-500/30 text-orange-400',
                ROCKET: 'from-purple-500/20 to-indigo-500/10 border-purple-500/30 text-purple-400',
                UPAY: 'from-blue-500/20 to-cyan-500/10 border-blue-500/30 text-blue-400',
              };

              const style = colorMap[pm.name] || 'from-purple-500/20 to-indigo-500/10 border-purple-500/30 text-purple-400';

              return (
                <div
                  key={pm.id}
                  className="bg-[#120e20] border border-purple-900/30 rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-3 py-1 rounded-xl bg-gradient-to-r ${style} border text-xs font-bold`}>
                        {pm.displayName}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          pm.isActive
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : 'bg-red-500/20 text-red-400 border border-red-500/40'
                        }`}
                      >
                        {pm.isActive ? 'সক্রিয় (Active)' : 'নিষ্ক্রিয় (Inactive)'}
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#0a0812] border border-purple-900/30 space-y-2 mb-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">একাউন্ট টাইপ:</span>
                        <span className="font-semibold text-white">{pm.accountType}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">রিসিভার নম্বর:</span>
                        <span className="font-mono text-cyan-300 font-extrabold text-sm">{pm.accountNumber}</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                      {pm.instructions || 'Send Money করে TrxID দিন।'}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-purple-900/20 flex items-center justify-between">
                    <span className="text-[11px] text-gray-500">
                      {pm._count?.orders || 0} টি পেমেন্ট অর্ডার
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(pm)}
                        className="p-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30 text-xs transition-colors"
                        title="সম্পাদনা করুন"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(pm.id, pm.displayName)}
                        className="p-2 rounded-xl bg-[#0a0812] hover:bg-red-500/20 text-gray-400 hover:text-red-400 border border-purple-900/40 text-xs transition-colors"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Payment Method Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#120e20] border border-purple-900/40 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-1">
              {editingMethod ? `${editingMethod.displayName} কনফিগারেশন` : 'নতুন পেমেন্ট মেথড তৈরি'}
            </h3>
            <p className="text-xs text-purple-300/70 mb-6">রিসিভার মোবাইল নম্বর এবং গ্রাহক নির্দেশনা লিখুন</p>

            <form onSubmit={handleSave} className="space-y-4">
              {!editingMethod && (
                <div>
                  <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider mb-1.5">
                    মেথডের কীওয়ার্ড/কোড (e.g. CELLFIN, TAP) *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="যেমন: CELLFIN"
                    className="w-full px-3.5 py-2.5 bg-[#0a0812] border border-purple-900/40 rounded-xl text-white text-xs font-mono uppercase focus:outline-none focus:border-purple-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider mb-1.5">
                  ডিসপ্লে নাম (Display Name) *
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="যেমন: সেলফিন / বিকাশ"
                  className="w-full px-3.5 py-2.5 bg-[#0a0812] border border-purple-900/40 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider mb-1.5">
                  টাকা গ্রহণের মোবাইল নম্বর *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#0a0812] border border-purple-900/40 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider mb-1.5">
                  একাউন্ট টাইপ
                </label>
                <select
                  value={accountType}
                  onChange={(e) => setAccountType(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0a0812] border border-purple-900/40 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                >
                  <option value="Personal">Personal (ব্যক্তিগত)</option>
                  <option value="Merchant">Merchant (মার্চেন্ট)</option>
                  <option value="Agent">Agent (এজেন্ট)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider mb-1.5">
                  গ্রাহকদের জন্য নির্দেশনা (Instructions)
                </label>
                <textarea
                  rows={3}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="যেমন: বিকাশ অ্যাপ থেকে Send Money করুন এবং Transaction ID দিন।"
                  className="w-full px-3.5 py-2 bg-[#0a0812] border border-purple-900/40 rounded-xl text-white text-xs leading-relaxed focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="accent-purple-600 rounded"
                  />
                  <span>এই পেমেন্ট মাধ্যমটি সক্রিয় রাখুন (Active)</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-purple-900/30">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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
