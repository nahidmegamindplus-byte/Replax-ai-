'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/layout/AdminLayout';
import {
  Sparkles,
  ArrowLeft,
  Server,
  Bot,
  Cpu,
  Lock,
  Zap,
  PhoneCall,
  Save,
  CheckCircle2,
  Sliders,
  AlignLeft,
  AlignRight,
  MessageSquare,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function AdminSettingsPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // WhatsApp Settings Form State
  const [whatsappForm, setWhatsappForm] = useState({
    enabled: true,
    number: '+8801521716613',
    message: 'আসসালামু আলাইকুম, আমি ReplyX AI সম্পর্কে তথ্য জানতে চাই।',
    position: 'RIGHT',
  });

  const fetchWhatsAppSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/settings/whatsapp');
      const data = await res.json();
      if (data.success && data.settings) {
        setWhatsappForm({
          enabled: data.settings.enabled ?? true,
          number: data.settings.number || '+8801521716613',
          message: data.settings.message || 'আসসালামু আলাইকুম, আমি ReplyX AI সম্পর্কে তথ্য জানতে চাই।',
          position: data.settings.position || 'RIGHT',
        });
      }
    } catch (e) {
      toast.error('WhatsApp সেটিংস লোড করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWhatsAppSettings();
  }, []);

  const handleSaveWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(whatsappForm),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(data.message || 'WhatsApp সাপোর্ট সেটিংস সফলভাবে আপডেট হয়েছে!');
      } else {
        toast.error(data.error || 'সেটিংস সেভ করা সম্ভব হয়নি।');
      }
    } catch (e) {
      toast.error('সার্ভারে যোগাযোগ করতে ব্যর্থ হয়েছে।');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout
      title="সিস্টেম আর্কিটেকচার ও সেটিংস"
      subtitle="ReplyX AI প্ল্যাটফর্মের WhatsApp কাস্টমার সাপোর্ট, ডাটাবেজ হেলথ এবং সিকিউরিটি ওভারভিউ"
    >
      <div className="max-w-4xl space-y-8">
        {/* Top Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#140f24] border border-purple-900/30 text-purple-300 hover:text-white text-xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>অ্যাডমিন ড্যাশবোর্ডে ফিরে যান</span>
          </Link>

          <Link
            href="/admin/ai-settings"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-all"
          >
            <Bot className="w-4 h-4" />
            <span>AI ও API সেটিংস</span>
          </Link>
        </div>

        {/* WhatsApp Support Management Card */}
        <div className="bg-[#120e20] border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-purple-900/30">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#25D366]/20 border border-[#25D366]/40 text-[#25D366] flex items-center justify-center font-bold text-lg">
                💬
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>WhatsApp লাইভ সাপোর্ট সিস্টেম</span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-mono">
                    Live Floating Widget
                  </span>
                </h3>
                <p className="text-xs text-purple-300/70">
                  ওয়েবসাইটের ভিজিটর ও ব্যবহারকারীদের জন্য লাইভ WhatsApp চ্যাট বাটন কনফিগার করুন
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
                  whatsappForm.enabled
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'bg-red-500/10 text-red-400 border border-red-500/30'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-current"></span>
                <span>{whatsappForm.enabled ? 'সক্রিয় (ON)' : 'নিষ্ক্রিয় (OFF)'}</span>
              </span>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-gray-400">WhatsApp সেটিংস লোড হচ্ছে...</div>
          ) : (
            <form onSubmit={handleSaveWhatsApp} className="space-y-6">
              {/* Toggle Switch */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-[#090710] border border-purple-900/30">
                <div>
                  <h4 className="text-xs font-bold text-white">WhatsApp সাপোর্ট বাটন প্রদর্শন</h4>
                  <p className="text-[11px] text-gray-400">
                    এটি অন থাকলে সাইটের স্ক্রিনে ভাসমান WhatsApp সাপোর্ট বাটন অটোমেটিক রেন্ডার হবে
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={whatsappForm.enabled}
                    onChange={(e) => setWhatsappForm({ ...whatsappForm, enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Admin WhatsApp Number */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                    অ্যাডমিন WhatsApp নম্বর (Admin WhatsApp Number) <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <PhoneCall className="w-4 h-4 text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={whatsappForm.number}
                      onChange={(e) => setWhatsappForm({ ...whatsappForm, number: e.target.value })}
                      placeholder="যেমন: +8801521716613"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#090710] border border-purple-900/30 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">
                    মোবাইলে WhatsApp অ্যাপ এবং ডেস্কটপে WhatsApp Web দিয়ে সরাসরি চ্যাট শুরু হবে
                  </p>
                </div>

                {/* Button Floating Position */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                    ফ্লোটিং আইকন পজিশন (Position) <span className="text-red-400">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setWhatsappForm({ ...whatsappForm, position: 'LEFT' })}
                      className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                        whatsappForm.position === 'LEFT'
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold shadow-md'
                          : 'bg-[#090710] border-purple-900/30 text-gray-400 hover:text-white'
                      }`}
                    >
                      <AlignLeft className="w-4 h-4" />
                      <span>নিচে বামে (Left)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setWhatsappForm({ ...whatsappForm, position: 'RIGHT' })}
                      className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                        whatsappForm.position === 'RIGHT'
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold shadow-md'
                          : 'bg-[#090710] border-purple-900/30 text-gray-400 hover:text-white'
                      }`}
                    >
                      <AlignRight className="w-4 h-4" />
                      <span>নিচে ডানে (Right)</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Default Pre-filled Message */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  ডিফল্ট প্রি-ফিল্ড মেসেজ (Default Pre-filled Message)
                </label>
                <div className="relative">
                  <MessageSquare className="w-4 h-4 text-purple-400 absolute left-3.5 top-3" />
                  <textarea
                    rows={3}
                    value={whatsappForm.message}
                    onChange={(e) => setWhatsappForm({ ...whatsappForm, message: e.target.value })}
                    placeholder="কাস্টমার ক্লিক করলে মেসেজটি প্রি-ফিল্ড হয়ে থাকবে..."
                    className="w-full pl-10 pr-4 py-2.5 bg-[#090710] border border-purple-900/30 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end pt-4 border-t border-purple-900/30">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'সংরক্ষণ হচ্ছে...' : 'WhatsApp সেটিংস সেভ করুন'}</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* System Health Overview Card */}
        <div className="bg-[#120e20] border border-purple-900/30 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-purple-900/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/40 text-purple-300 flex items-center justify-center">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">সিস্টেম সিকিউরিটি ও ডাটাবেজ স্ট্যাটাস</h3>
                <p className="text-xs text-purple-300/70">রিয়েল-টাইম আর্কিটেকচার ও এনক্রিপশন স্পেসিফিকেশন</p>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>100% Operational</span>
            </span>
          </div>

          <div className="space-y-3 text-xs text-gray-300">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#090710] border border-purple-900/30">
              <div className="flex items-center gap-2.5">
                <Server className="w-4 h-4 text-purple-400" />
                <span className="font-semibold text-white">ডাটাবেজ ইঞ্জিন:</span>
              </div>
              <span className="font-mono text-cyan-300">SQLite (Local) / PostgreSQL (Cloud via Prisma ORM)</span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#090710] border border-purple-900/30">
              <div className="flex items-center gap-2.5">
                <Lock className="w-4 h-4 text-purple-400" />
                <span className="font-semibold text-white">টোকেন ও API কী এনক্রিপশন:</span>
              </div>
              <span className="font-mono text-emerald-400">AES-256-GCM at Rest</span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#090710] border border-purple-900/30">
              <div className="flex items-center gap-2.5">
                <Cpu className="w-4 h-4 text-purple-400" />
                <span className="font-semibold text-white">সক্রিয় AI প্রোভাইডার্স:</span>
              </div>
              <span className="font-mono text-purple-300">DeepSeek (V3/R1), Google Gemini, OpenAI</span>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
