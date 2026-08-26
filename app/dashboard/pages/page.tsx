'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  Layers,
  Plus,
  Check,
  Copy,
  Activity,
  Trash2,
  Settings,
  Sparkles,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  X,
  Edit3,
  Globe,
  Sliders,
  MessageSquare,
  Bot,
  Camera,
  Mic,
  ShoppingBag,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function PagesManagementPage() {
  const toast = useToast();
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPage, setSelectedPage] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Form State for Add Page
  const [addForm, setAddForm] = useState({
    pageName: '',
    facebookPageId: '',
    pageAccessToken: '',
    replyLanguage: 'AUTO',
    replyStyle: 'FRIENDLY',
    aiInstructions: '',
  });

  // Form State for Edit Page
  const [editForm, setEditForm] = useState<any>({});

  const fetchPages = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/pages');
      const data = await res.json();
      if (data.success) {
        setPages(data.pages);
      }
    } catch (e) {
      toast.error('পেজ তালিকা লোড করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success('ক্লিপবোর্ডে কপি করা হয়েছে!');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleAddPage = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error || 'পেজ যুক্ত করতে ব্যর্থ হয়েছে।');
        setSaving(false);
        return;
      }

      toast.success(data.message || 'পেজ সফলভাবে যুক্ত হয়েছে!');
      setShowAddModal(false);
      setAddForm({
        pageName: '',
        facebookPageId: '',
        pageAccessToken: '',
        replyLanguage: 'AUTO',
        replyStyle: 'FRIENDLY',
        aiInstructions: '',
      });
      fetchPages();
    } catch (e) {
      toast.error('সার্ভারে যোগাযোগ করা যায়নি।');
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async (pageId: string) => {
    setTestingId(pageId);
    try {
      const res = await fetch(`/api/pages/${pageId}/test`, { method: 'POST' });
      const data = await res.json();

      if (data.success) {
        toast.success(data.message || 'Facebook Page সফলভাবে connected!');
      } else {
        toast.error(data.error || 'সংযোগ পরীক্ষা ব্যর্থ হয়েছে।');
      }
      fetchPages();
    } catch (e) {
      toast.error('কানেকশন টেস্টে ত্রুটি হয়েছে।');
    } finally {
      setTestingId(null);
    }
  };

  const openEditModal = (page: any) => {
    setSelectedPage(page);
    setEditForm({
      pageName: page.pageName || '',
      facebookPageId: page.facebookPageId || '',
      pageAccessToken: '',
      autoReplyEnabled: page.autoReplyEnabled ?? true,
      humanHandoffEnabled: page.humanHandoffEnabled ?? true,
      replyLanguage: page.replyLanguage || 'AUTO',
      replyStyle: page.replyStyle || 'FRIENDLY',
      productImageReply: page.productImageReply ?? true,
      orderDetection: page.orderDetection ?? true,
      voiceProcessing: page.voiceProcessing ?? true,
      imageUnderstanding: page.imageUnderstanding ?? true,
      aiInstructions: page.aiInstructions || '',
    });
    setShowEditModal(true);
  };

  const handleUpdatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPage) return;
    setSaving(true);

    try {
      const res = await fetch(`/api/pages/${selectedPage.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error || 'পেজ আপডেট করতে সমস্যা হয়েছে।');
        setSaving(false);
        return;
      }

      toast.success('পেজের সমস্ত সেকশন ও সেটিংস সফলভাবে আপডেট হয়েছে!');
      setShowEditModal(false);
      fetchPages();
    } catch (e) {
      toast.error('সার্ভার ত্রুটি।');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePage = async (pageId: string, pageName: string) => {
    if (!confirm(`আপনি কি নিশ্চিতভাবে "${pageName}" পেজটি মুছে ফেলতে চান?`)) return;

    try {
      const res = await fetch(`/api/pages/${pageId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('পেজটি মুছে ফেলা হয়েছে।');
        fetchPages();
      } else {
        toast.error(data.error || 'পেজ মুছতে ব্যর্থ হয়েছে।');
      }
    } catch (e) {
      toast.error('পেজ মুছতে সমস্যা হয়েছে।');
    }
  };

  return (
    <DashboardLayout
      title="Facebook Page সমূহ"
      subtitle="সংযুক্ত ফেসবুক পেজের সেটিংস পরিবর্তন করুন, ফিচারগুলো এডিট ও আপডেট করুন"
    >
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-lg font-bold text-white">সংযুক্ত পেজ তালিকা</h2>
          <p className="text-xs text-gray-400">যেকোনো সময় সংযোগ, ভাষা, টোন ও এআই নিয়মাবলী এডিট করতে পারবেন</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন Page সংযুক্ত করুন</span>
        </button>
      </div>

      {/* Pages List */}
      {loading ? (
        <div className="py-20 text-center text-sm text-gray-400">পেজ তালিকা লোড হচ্ছে...</div>
      ) : pages.length === 0 ? (
        <div className="bg-[#12141c] border border-[#1f2433] rounded-3xl p-12 text-center max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
            <Layers className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">এখনও কোনো Facebook Page সংযুক্ত করা হয়নি</h3>
          <p className="text-xs text-gray-400 mb-6 leading-relaxed">
            ReplyX AI দিয়ে স্বয়ংক্রিয় রিপ্লাই চালু করতে আপনার ফেসবুক পেজের Page ID এবং Access Token প্রদান করে সংযুক্ত করুন।
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all"
          >
            <Plus className="w-4 h-4" /> নতুন Page যুক্ত করুন
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {pages.map((page) => (
            <div
              key={page.id}
              className="bg-[#12141c] border border-[#1f2433] hover:border-[#2b354d] rounded-2xl p-6 transition-all shadow-xl flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-4 pb-4 border-b border-[#1a1f2e]">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-base">
                      {page.pageName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <span>{page.pageName}</span>
                      </h3>
                      <p className="text-xs text-gray-400 font-mono mt-0.5">
                        ID: {page.facebookPageId}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
                      page.connectionStatus === 'CONNECTED'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                    {page.connectionStatus === 'CONNECTED' ? 'কানেক্টেড' : 'টোকেন মেয়াদোত্তীর্ণ'}
                  </span>
                </div>

                {/* Webhook Details & Copy Buttons */}
                <div className="space-y-2.5 mb-5 bg-[#0a0c13] p-4 rounded-xl border border-[#1a1f2e]">
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-gray-400 font-medium mb-1">
                      <span>Webhook Callback URL:</span>
                      <button
                        onClick={() => handleCopy(page.webhookUrl || '', `url-${page.id}`)}
                        className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                      >
                        {copiedKey === `url-${page.id}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>কপি</span>
                      </button>
                    </div>
                    <p className="text-xs font-mono text-gray-300 truncate bg-[#121624] px-2.5 py-1.5 rounded-lg border border-[#1e2538]">
                      {page.webhookUrl || 'URL Pending'}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[11px] text-gray-400 font-medium mb-1">
                      <span>Webhook Verify Token:</span>
                      <button
                        onClick={() => handleCopy(page.verifyToken || '', `tok-${page.id}`)}
                        className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                      >
                        {copiedKey === `tok-${page.id}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>কপি</span>
                      </button>
                    </div>
                    <p className="text-xs font-mono text-gray-300 truncate bg-[#121624] px-2.5 py-1.5 rounded-lg border border-[#1e2538]">
                      {page.verifyToken || '••••••••'}
                    </p>
                  </div>
                </div>

                {/* Feature Pills */}
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-400 mb-5">
                  <div className="flex items-center justify-between bg-[#141824] px-3 py-1.5 rounded-lg">
                    <span>অটো রিপ্লাই:</span>
                    <span className={page.autoReplyEnabled ? 'text-emerald-400 font-semibold' : 'text-gray-500'}>
                      {page.autoReplyEnabled ? 'সক্রিয়' : 'বন্ধ'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-[#141824] px-3 py-1.5 rounded-lg">
                    <span>রিপ্লাই ভাষা:</span>
                    <span className="text-gray-200 font-semibold">{page.replyLanguage}</span>
                  </div>
                  <div className="flex items-center justify-between bg-[#141824] px-3 py-1.5 rounded-lg">
                    <span>প্রোডাক্ট ছবি:</span>
                    <span className={page.productImageReply ? 'text-cyan-400 font-semibold' : 'text-gray-500'}>
                      {page.productImageReply ? 'চালু' : 'বন্ধ'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-[#141824] px-3 py-1.5 rounded-lg">
                    <span>অর্ডার ক্যাপচার:</span>
                    <span className={page.orderDetection ? 'text-amber-400 font-semibold' : 'text-gray-500'}>
                      {page.orderDetection ? 'চালু' : 'বন্ধ'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2 pt-4 border-t border-[#1a1f2e]">
                <button
                  onClick={() => handleTestConnection(page.id)}
                  disabled={testingId === page.id}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#1a1f2e] hover:bg-[#252c40] text-gray-200 text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testingId === page.id ? 'animate-spin text-emerald-400' : ''}`} />
                  <span>{testingId === page.id ? 'পরীক্ষা করা হচ্ছে...' : 'কানেকশন টেস্ট'}</span>
                </button>

                <button
                  onClick={() => openEditModal(page)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1a1f2e] hover:bg-[#252c40] text-emerald-400 hover:text-emerald-300 font-semibold text-xs transition-colors border border-emerald-500/20"
                  title="সেটিংস এডিট ও আপডেট করুন"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>এডিট</span>
                </button>

                <button
                  onClick={() => handleDeletePage(page.id, page.pageName)}
                  className="p-2 rounded-xl bg-[#1a1f2e] hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                  title="পেজ মুছে ফেলুন"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Page Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#12141c] border border-[#1f2433] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative my-8">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">নতুন Facebook Page সংযুক্ত করুন</h3>
            <p className="text-xs text-gray-400 mb-6">পরবর্তীতে যেকোনো সময় এই সেকশনের সমস্ত তথ্য এডিট ও আপডেট করতে পারবেন</p>

            <form onSubmit={handleAddPage} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                  পেজের নাম (Page Name) <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={addForm.pageName}
                  onChange={(e) => setAddForm({ ...addForm, pageName: e.target.value })}
                  placeholder="যেমন: স্টাইলিশ ফ্যাশন বিডি"
                  className="w-full px-3.5 py-2 bg-[#0a0c13] border border-[#1e2538] rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                  Facebook Page ID <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={addForm.facebookPageId}
                  onChange={(e) => setAddForm({ ...addForm, facebookPageId: e.target.value })}
                  placeholder="যেমন: 104829104928102"
                  className="w-full px-3.5 py-2 bg-[#0a0c13] border border-[#1e2538] rounded-xl text-white placeholder-gray-500 text-sm font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                  Page Access Token <span className="text-red-400">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={addForm.pageAccessToken}
                  onChange={(e) => setAddForm({ ...addForm, pageAccessToken: e.target.value })}
                  placeholder="EAAB... (Never-expiring Page Access Token)"
                  className="w-full px-3.5 py-2 bg-[#0a0c13] border border-[#1e2538] rounded-xl text-white placeholder-gray-500 text-xs font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                    রিপ্লাই ভাষা
                  </label>
                  <select
                    value={addForm.replyLanguage}
                    onChange={(e) => setAddForm({ ...addForm, replyLanguage: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0a0c13] border border-[#1e2538] rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="AUTO">অটো ডিটেক্ট (Auto Detect)</option>
                    <option value="BANGLA">বাংলা (Bangla)</option>
                    <option value="ENGLISH">English</option>
                    <option value="BANGLISH">ব্যাংলিশ (Banglish)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                    বাচনভঙ্গি / টোন
                  </label>
                  <select
                    value={addForm.replyStyle}
                    onChange={(e) => setAddForm({ ...addForm, replyStyle: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0a0c13] border border-[#1e2538] rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="FRIENDLY">আন্তরিক (Friendly)</option>
                    <option value="PROFESSIONAL">পেশাদার (Professional)</option>
                    <option value="SALES_FOCUSED">সেলস ফোকাসড (Sales)</option>
                    <option value="SHORT">সংক্ষিপ্ত (Short)</option>
                    <option value="CASUAL">ক্যাজুয়াল (Casual)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1e2538]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#1a1f2e] text-gray-300 text-xs font-semibold hover:bg-[#252c40]"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-bold text-xs shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  {saving ? 'সংরক্ষণ হচ্ছে...' : 'সংযুক্ত করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Page Settings Modal */}
      {showEditModal && selectedPage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#12141c] border border-[#1f2433] rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative my-8">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-emerald-400" />
              <span>পেজের সেকশন ও সেটিংস আপডেট এডিটর</span>
            </h3>
            <p className="text-xs text-gray-400 mb-6">
              {selectedPage.pageName} (ID: {selectedPage.facebookPageId})
            </p>

            <form onSubmit={handleUpdatePage} className="space-y-5 max-h-[75vh] overflow-y-auto pr-1">
              {/* Section 1: Connection Info */}
              <div className="space-y-3 p-4 rounded-2xl bg-[#0a0c13] border border-[#1e2538]">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
                  ১. মূল সংযোগ তথ্য (Basic Info)
                </h4>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    পেজের নাম (Page Name)
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.pageName}
                    onChange={(e) => setEditForm({ ...editForm, pageName: e.target.value })}
                    className="w-full px-3.5 py-2 bg-[#121624] border border-[#1e2538] rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Facebook Page ID
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.facebookPageId}
                    onChange={(e) => setEditForm({ ...editForm, facebookPageId: e.target.value })}
                    className="w-full px-3.5 py-2 bg-[#121624] border border-[#1e2538] rounded-xl text-white text-sm font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Page Access Token আপডেট (ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    value={editForm.pageAccessToken}
                    onChange={(e) => setEditForm({ ...editForm, pageAccessToken: e.target.value })}
                    placeholder="টোকেন পরিবর্তন করতে চাইলে নতুন টোকেন দিন (EAAB...)"
                    className="w-full px-3.5 py-2 bg-[#121624] border border-[#1e2538] rounded-xl text-white placeholder-gray-500 text-xs font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Section 2: Reply Style & Language */}
              <div className="space-y-3 p-4 rounded-2xl bg-[#0a0c13] border border-[#1e2538]">
                <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">
                  ২. ভাষা ও বাচনভঙ্গি সেটিংস (Language & Tone)
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      রিপ্লাই ভাষা
                    </label>
                    <select
                      value={editForm.replyLanguage}
                      onChange={(e) => setEditForm({ ...editForm, replyLanguage: e.target.value })}
                      className="w-full px-3 py-2 bg-[#121624] border border-[#1e2538] rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                    >
                      <option value="AUTO">অটো ডিটেক্ট (Auto Detect)</option>
                      <option value="BANGLA">বাংলা (Bangla)</option>
                      <option value="ENGLISH">English</option>
                      <option value="BANGLISH">ব্যাংলিশ (Banglish)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      বাচনভঙ্গি / টোন
                    </label>
                    <select
                      value={editForm.replyStyle}
                      onChange={(e) => setEditForm({ ...editForm, replyStyle: e.target.value })}
                      className="w-full px-3 py-2 bg-[#121624] border border-[#1e2538] rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                    >
                      <option value="FRIENDLY">আন্তরিক (Friendly)</option>
                      <option value="PROFESSIONAL">পেশাদার (Professional)</option>
                      <option value="SALES_FOCUSED">সেলস ফোকাসড (Sales)</option>
                      <option value="SHORT">সংক্ষিপ্ত (Short)</option>
                      <option value="CASUAL">ক্যাজুয়াল (Casual)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 3: Feature Toggles */}
              <div className="space-y-3 p-4 rounded-2xl bg-[#0a0c13] border border-[#1e2538]">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
                  ৩. এআই ফিচার কন্ট্রোল (Feature Toggles)
                </h4>

                <label className="flex items-center justify-between text-xs cursor-pointer p-2 rounded-lg bg-[#121624]">
                  <span className="text-gray-200 font-medium">স্বয়ংক্রিয় রিপ্লাই (Auto Reply)</span>
                  <input
                    type="checkbox"
                    checked={editForm.autoReplyEnabled}
                    onChange={(e) => setEditForm({ ...editForm, autoReplyEnabled: e.target.checked })}
                    className="w-4 h-4 accent-emerald-500 rounded"
                  />
                </label>

                <label className="flex items-center justify-between text-xs cursor-pointer p-2 rounded-lg bg-[#121624]">
                  <span className="text-gray-200 font-medium">হিউম্যান হ্যান্ডঅফ টেকওভার সাপোর্ট</span>
                  <input
                    type="checkbox"
                    checked={editForm.humanHandoffEnabled}
                    onChange={(e) => setEditForm({ ...editForm, humanHandoffEnabled: e.target.checked })}
                    className="w-4 h-4 accent-emerald-500 rounded"
                  />
                </label>

                <label className="flex items-center justify-between text-xs cursor-pointer p-2 rounded-lg bg-[#121624]">
                  <span className="text-gray-200 font-medium">প্রোডাক্টের ছবি পাঠানো (Product Image Reply)</span>
                  <input
                    type="checkbox"
                    checked={editForm.productImageReply}
                    onChange={(e) => setEditForm({ ...editForm, productImageReply: e.target.checked })}
                    className="w-4 h-4 accent-emerald-500 rounded"
                  />
                </label>

                <label className="flex items-center justify-between text-xs cursor-pointer p-2 rounded-lg bg-[#121624]">
                  <span className="text-gray-200 font-medium">স্বয়ংক্রিয় অর্ডার ক্যাপচার (Order Intent Detection)</span>
                  <input
                    type="checkbox"
                    checked={editForm.orderDetection}
                    onChange={(e) => setEditForm({ ...editForm, orderDetection: e.target.checked })}
                    className="w-4 h-4 accent-emerald-500 rounded"
                  />
                </label>

                <label className="flex items-center justify-between text-xs cursor-pointer p-2 rounded-lg bg-[#121624]">
                  <span className="text-gray-200 font-medium">ভয়েস/অডিও মেসেজ প্রসেসিং (Voice AI)</span>
                  <input
                    type="checkbox"
                    checked={editForm.voiceProcessing}
                    onChange={(e) => setEditForm({ ...editForm, voiceProcessing: e.target.checked })}
                    className="w-4 h-4 accent-emerald-500 rounded"
                  />
                </label>

                <label className="flex items-center justify-between text-xs cursor-pointer p-2 rounded-lg bg-[#121624]">
                  <span className="text-gray-200 font-medium">ছবি চেনা ও ভিশন বিশ্লেষণ (Vision AI)</span>
                  <input
                    type="checkbox"
                    checked={editForm.imageUnderstanding}
                    onChange={(e) => setEditForm({ ...editForm, imageUnderstanding: e.target.checked })}
                    className="w-4 h-4 accent-emerald-500 rounded"
                  />
                </label>
              </div>

              {/* Section 4: AI Instructions */}
              <div className="space-y-2 p-4 rounded-2xl bg-[#0a0c13] border border-[#1e2538]">
                <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-2">
                  ৪. কাস্টম পেজ নির্দেশিকা (Custom AI Rules)
                </h4>
                <textarea
                  rows={4}
                  value={editForm.aiInstructions}
                  onChange={(e) => setEditForm({ ...editForm, aiInstructions: e.target.value })}
                  placeholder="আপনার পেজের জন্য বিশেষ নির্দেশাবলী, ডেলিভারি রুলস বা অফার টেক্সট লিখুন..."
                  className="w-full px-3.5 py-2 bg-[#121624] border border-[#1e2538] rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1e2538]">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#1a1f2e] text-gray-300 text-xs font-semibold hover:bg-[#252c40]"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-bold text-xs shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  {saving ? 'সংরক্ষণ হচ্ছে...' : 'সেটিংস আপডেট করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
