'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import {
  Package as PackageIcon,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Sparkles,
  Zap,
  Layers,
  MessageSquare,
  DollarSign,
  X,
  Check,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function AdminPackagesPage() {
  const toast = useToast();
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('990');
  const [durationDays, setDurationDays] = useState('30');
  const [messageLimit, setMessageLimit] = useState('1000');
  const [pageLimit, setPageLimit] = useState('1');
  const [productLimit, setProductLimit] = useState('50');
  const [featureInputs, setFeatureInputs] = useState<string[]>(['']);
  const [isPopular, setIsPopular] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/packages');
      const data = await res.json();
      if (data.success) {
        setPackages(data.packages || []);
      } else {
        toast.error(data.error || 'প্যাকেজ লোড ব্যর্থ হয়েছে।');
      }
    } catch (e) {
      toast.error('সার্ভার ত্রুটি।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleOpenAdd = () => {
    setEditingPkg(null);
    setName('');
    setSlug('');
    setDescription('');
    setPrice('990');
    setDurationDays('30');
    setMessageLimit('1000');
    setPageLimit('1');
    setProductLimit('50');
    setFeatureInputs([
      '১টি ফেসবুক পেজ কানেকশন',
      '১,০০০ AI অটো রিপ্লাই / মাস',
      '৫০টি প্রোডাক্ট ইনভেন্টরি',
      'বাংলা ও ব্যাংলিশ সাপোর্ট',
    ]);
    setIsPopular(false);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (pkg: any) => {
    setEditingPkg(pkg);
    setName(pkg.name);
    setSlug(pkg.slug);
    setDescription(pkg.description || '');
    setPrice(pkg.price.toString());
    setDurationDays(pkg.durationDays.toString());
    setMessageLimit(pkg.messageLimit.toString());
    setPageLimit(pkg.pageLimit.toString());
    setProductLimit(pkg.productLimit.toString());
    setFeatureInputs(
      Array.isArray(pkg.features) && pkg.features.length > 0 ? pkg.features : ['']
    );
    setIsPopular(Boolean(pkg.isPopular));
    setIsActive(Boolean(pkg.isActive));
    setIsModalOpen(true);
  };

  const handleAddFeatureField = () => {
    setFeatureInputs((prev) => [...prev, '']);
  };

  const handleRemoveFeatureField = (index: number) => {
    setFeatureInputs((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleFeatureChange = (index: number, val: string) => {
    const updated = [...featureInputs];
    updated[index] = val;
    setFeatureInputs(updated);
  };

  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('প্যাকেজের নাম লিখুন।');
      return;
    }

    setSaving(true);
    const validFeatures = featureInputs.map((f) => f.trim()).filter(Boolean);

    try {
      const url = editingPkg ? `/api/admin/packages/${editingPkg.id}` : '/api/admin/packages';
      const method = editingPkg ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim() || undefined,
          description: description.trim(),
          price: parseFloat(price),
          durationDays: parseInt(durationDays, 10),
          messageLimit: parseInt(messageLimit, 10),
          pageLimit: parseInt(pageLimit, 10),
          productLimit: parseInt(productLimit, 10),
          features: validFeatures,
          isPopular,
          isActive,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(data.message || 'প্যাকেজ সংরক্ষিত হয়েছে!');
        setIsModalOpen(false);
        fetchPackages();
      } else {
        toast.error(data.error || 'সংরক্ষণ ব্যর্থ হয়েছে।');
      }
    } catch (e) {
      toast.error('সার্ভার ত্রুটি।');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePackage = async (id: string, pkgName: string) => {
    if (!confirm(`আপনি কি নিশ্চিতভাবে "${pkgName}" প্যাকেজটি মুছে ফেলতে চান?`)) return;

    try {
      const res = await fetch(`/api/admin/packages/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || 'প্যাকেজ ডিলিট করা হয়েছে!');
        fetchPackages();
      } else {
        toast.error(data.error || 'ডিলিট ব্যর্থ হয়েছে।');
      }
    } catch (e) {
      toast.error('সার্ভার ত্রুটি।');
    }
  };

  return (
    <AdminLayout
      title="📦 সাবস্ক্রিপশন প্যাকেজ ম্যানেজমেন্ট"
      subtitle="ব্যবহারকারীদের জন্য নতুন প্যাকেজ তৈরি করুন, মূল্য ও লিমিট নির্ধারণ এবং পরিচালনা করুন"
    >
      {/* Top Action Bar */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <h3 className="text-sm font-bold text-white">সর্বমোট {packages.length} টি প্যাকেজ</h3>
          <p className="text-xs text-purple-300/70">গ্রাহকরা চেকআউট পেজে এই প্যাকেজগুলো দেখতে পাবেন</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-500/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন প্যাকেজ তৈরি করুন</span>
        </button>
      </div>

      {/* Packages Grid */}
      {loading ? (
        <div className="py-24 text-center text-sm text-gray-400">প্যাকেজ তালিকা লোড হচ্ছে...</div>
      ) : packages.length === 0 ? (
        <div className="bg-[#120e20] border border-purple-900/30 rounded-3xl p-12 text-center max-w-md mx-auto my-8">
          <PackageIcon className="w-12 h-12 text-purple-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">কোনো প্যাকেজ তৈরি করা নেই</h3>
          <p className="text-xs text-gray-400 mb-6">উপরের বাটনে ক্লিক করে আপনার প্রথম সাবস্ক্রিপশন প্যাকেজ যোগ করুন।</p>
          <button
            onClick={handleOpenAdd}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md"
          >
            + প্যাকেজ যোগ করুন
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packages.map((pkg) => {
            const features = Array.isArray(pkg.features) ? pkg.features : [];
            const subscribersCount = pkg._count?.users || 0;
            const ordersCount = pkg._count?.orders || 0;

            return (
              <div
                key={pkg.id}
                className="bg-[#120e20] border border-purple-900/30 rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between"
              >
                {pkg.isPopular && (
                  <div className="absolute top-4 right-4">
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-500 text-white text-[10px] font-bold uppercase tracking-wider shadow">
                      Popular
                    </span>
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-lg font-bold text-white">{pkg.name}</h4>
                    {!pkg.isActive && (
                      <span className="px-2 py-0.5 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-bold">
                        নিষ্ক্রিয়
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-400 mb-4 line-clamp-2">{pkg.description}</p>

                  <div className="mb-4 flex items-baseline gap-1.5">
                    <span className="text-3xl font-black text-cyan-300">৳ {pkg.price}</span>
                    <span className="text-xs text-gray-400">/ {pkg.durationDays} দিন</span>
                  </div>

                  {/* Limits Badge Grid */}
                  <div className="grid grid-cols-3 gap-2 mb-4 p-3 rounded-2xl bg-[#0a0812] border border-purple-900/30 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-gray-400 block">মেসেজ লিমিট</span>
                      <strong className="text-purple-300 font-mono">{pkg.messageLimit}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block">পেজ লিমিট</span>
                      <strong className="text-cyan-300 font-mono">{pkg.pageLimit}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block">প্রোডাক্ট</span>
                      <strong className="text-emerald-300 font-mono">{pkg.productLimit}</strong>
                    </div>
                  </div>

                  {/* Feature Bullets */}
                  <div className="space-y-2 text-xs text-gray-300 border-t border-purple-900/20 pt-4">
                    {features.map((feat: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Actions & Stats */}
                <div className="mt-6 pt-4 border-t border-purple-900/20 flex items-center justify-between">
                  <span className="text-[11px] text-gray-400">
                    {subscribersCount} জন গ্রাহক • {ordersCount} টি অর্ডার
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(pkg)}
                      className="p-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30 text-xs transition-colors"
                      title="এডিট করুন"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeletePackage(pkg.id, pkg.name)}
                      className="p-2 rounded-xl bg-[#0a0812] hover:bg-red-500/20 text-gray-400 hover:text-red-400 border border-purple-900/40 text-xs transition-colors"
                      title="ডিলিট করুন"
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

      {/* Add / Edit Package Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#120e20] border border-purple-900/40 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-1">
              {editingPkg ? 'প্যাকেজ সম্পাদনা (Edit Package)' : 'নতুন সাবস্ক্রিপশন প্যাকেজ তৈরি'}
            </h3>
            <p className="text-xs text-purple-300/70 mb-6">
              প্যাকেজের মূল্য, মেয়াদ, AI মেসেজ লিমিট এবং ফিচার বুলেট নির্ধারণ করুন
            </p>

            <form onSubmit={handleSavePackage} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider mb-1.5">
                    প্যাকেজের নাম *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="যেমন: বিজনেস প্রো"
                    className="w-full px-3.5 py-2 bg-[#0a0812] border border-purple-900/40 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider mb-1.5">
                    মূল্য (BDT ৳) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="990"
                    className="w-full px-3.5 py-2 bg-[#0a0812] border border-purple-900/40 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider mb-1.5">
                  সংক্ষিপ্ত বিবরণ
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="যেমন: দ্রুত বর্ধনশীল মাঝারি বিজনেসের জন্য আদর্শ"
                  className="w-full px-3.5 py-2 bg-[#0a0812] border border-purple-900/40 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Limits */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-purple-300 mb-1">
                    মেয়াদ (দিন)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={durationDays}
                    onChange={(e) => setDurationDays(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0a0812] border border-purple-900/40 rounded-xl text-white text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-purple-300 mb-1">
                    AI মেসেজ লিমিট
                  </label>
                  <input
                    type="number"
                    required
                    min="50"
                    value={messageLimit}
                    onChange={(e) => setMessageLimit(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0a0812] border border-purple-900/40 rounded-xl text-white text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-purple-300 mb-1">
                    পেজ সংখ্যা
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={pageLimit}
                    onChange={(e) => setPageLimit(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0a0812] border border-purple-900/40 rounded-xl text-white text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-purple-300 mb-1">
                    প্রোডাক্ট লিমিট
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={productLimit}
                    onChange={(e) => setProductLimit(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0a0812] border border-purple-900/40 rounded-xl text-white text-xs font-mono"
                  />
                </div>
              </div>

              {/* Dynamic Feature Bullets */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-purple-300 uppercase tracking-wider">
                    প্যাকেজ ফিচার তালিকা (Bullet Points)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddFeatureField}
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-bold"
                  >
                    + আরও ফিচার যোগ করুন
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {featureInputs.map((feat, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        value={feat}
                        onChange={(e) => handleFeatureChange(idx, e.target.value)}
                        placeholder={`ফিচার পয়েন্ট ${idx + 1}`}
                        className="flex-1 px-3 py-1.5 bg-[#0a0812] border border-purple-900/40 rounded-xl text-white text-xs"
                      />
                      {featureInputs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveFeatureField(idx)}
                          className="px-2.5 text-gray-500 hover:text-red-400"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Checkboxes */}
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPopular}
                    onChange={(e) => setIsPopular(e.target.checked)}
                    className="accent-purple-600 rounded"
                  />
                  <span>জনপ্রিয় / রিকমেন্ডেড ব্যাজ দিন (Most Popular)</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="accent-purple-600 rounded"
                  />
                  <span>সক্রিয় রাখুন (Active)</span>
                </label>
              </div>

              {/* Actions */}
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
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-500/25 disabled:opacity-50 transition-all"
                >
                  {saving ? 'সংরক্ষণ হচ্ছে...' : 'প্যাকেজ সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
