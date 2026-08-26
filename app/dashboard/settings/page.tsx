'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  Building,
  User,
  Phone,
  Mail,
  ShieldCheck,
  Save,
  CheckCircle2,
  Lock,
  Cpu,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function UserSettingsPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Business Profile Form
  const [profile, setProfile] = useState({
    fullName: '',
    businessName: '',
    email: '',
    phone: '',
    plan: 'STARTER',
    status: 'ACTIVE',
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/auth/me');
      const data = await res.json();

      if (data.success && data.user) {
        setProfile({
          fullName: data.user.fullName || '',
          businessName: data.user.businessName || '',
          email: data.user.email || '',
          phone: data.user.phone || '',
          plan: data.user.plan || 'STARTER',
          status: data.user.status || 'ACTIVE',
        });
      }
    } catch (e) {
      toast.error('প্রোফাইল লোড করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: profile.fullName,
          businessName: profile.businessName,
          phone: profile.phone,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(data.message || 'ব্যবসার তথ্য সফলভাবে সংরক্ষিত হয়েছে!');
        fetchProfile();
      } else {
        toast.error(data.error || 'সংরক্ষণ ব্যর্থ হয়েছে।');
      }
    } catch (e) {
      toast.error('সংরক্ষণ ব্যর্থ হয়েছে।');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout
      title="ব্যবসার সেটিংস"
      subtitle="আপনার ব্যবসা ও প্রোফাইল পরিচিতি"
    >
      <div className="max-w-3xl space-y-6">
        {/* Business Profile Card */}
        <div className="bg-[#12141c] border border-[#1f2433] rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#1f2433]">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building className="w-5 h-5 text-emerald-400" />
                <span>ব্যবসা ও প্রোফাইল তথ্য</span>
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                আপনার ব্যবসায়ের নাম এবং কন্টাক্ট ইনফরমেশন পরিচালনা করুন
              </p>
            </div>

            <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>ভেরিফাইড প্রোফাইল</span>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-sm text-gray-400">লোড হচ্ছে...</div>
          ) : (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                    ব্যবসার নাম
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 absolute left-3.5 top-3 text-gray-500" />
                    <input
                      type="text"
                      value={profile.businessName}
                      onChange={(e) => setProfile({ ...profile, businessName: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-[#0a0c13] border border-[#1e2538] rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                    মালিক / প্রতিনিধির নাম
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-3 text-gray-500" />
                    <input
                      type="text"
                      value={profile.fullName}
                      onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-[#0a0c13] border border-[#1e2538] rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                    ইমেইল অ্যাড্রেস
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-3 text-gray-500" />
                    <input
                      type="email"
                      disabled
                      value={profile.email}
                      className="w-full pl-10 pr-4 py-2.5 bg-[#0a0c13]/50 border border-[#1e2538] rounded-xl text-gray-400 font-mono text-xs cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                    মোবাইল নম্বর
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-3 text-gray-500" />
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      placeholder="01XXXXXXXXX"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#0a0c13] border border-[#1e2538] rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Plan & AI Status Banner */}
              <div className="pt-3">
                <div className="p-4 rounded-2xl bg-[#0a0c13] border border-[#1e2538] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                      <Cpu className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>ReplyX AI অটোমেশন ইঞ্জিন</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      </p>
                      <p className="text-[11px] text-gray-400">
                        সিস্টেমের সেন্ট্রাল AI প্রোভাইডার (DeepSeek / Gemini / OpenAI) দ্বারা সকল মেসেঞ্জার অটোরিপ্লাই সক্রিয় আছে।
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                    Active
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-[#1f2433] flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'সংরক্ষণ হচ্ছে...' : 'তথ্য সংরক্ষণ করুন'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
