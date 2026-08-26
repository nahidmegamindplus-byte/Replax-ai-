'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import {
  Cpu,
  Sparkles,
  Key,
  ShieldCheck,
  CheckCircle2,
  Save,
  Send,
  Bot,
  Zap,
  Activity,
  AlertCircle,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function AdminAiSettingsPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // AI Configuration State
  const [provider, setProvider] = useState<'DEEPSEEK' | 'GEMINI' | 'OPENAI'>('DEEPSEEK');
  const [model, setModel] = useState('deepseek-chat');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(800);

  // API Keys
  const [deepseekKey, setDeepseekKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [openaiKey, setOpenAIKey] = useState('');

  const [keyStatus, setKeyStatus] = useState({
    deepseek: { hasKey: false, maskedKey: '' },
    gemini: { hasKey: false, maskedKey: '' },
    openai: { hasKey: false, maskedKey: '' },
  });

  // Individual API Key Test States
  const [testingKey, setTestingKey] = useState<string | null>(null);
  const [keyTestResults, setKeyTestResults] = useState<{
    deepseek?: { success: boolean; message: string };
    gemini?: { success: boolean; message: string };
    openai?: { success: boolean; message: string };
  }>({});

  // Sandbox Chat Simulator State
  const [testMessage, setTestMessage] = useState('');
  const [chatLog, setChatLog] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: 'আসসালামু আলাইকুম! আমি ReplyX AI। সিস্টেমের যেকোনো AI প্রোভাইডার ও মডেলের পারফরম্যান্স এখান থেকে টেস্ট করতে পারেন।',
    },
  ]);
  const [testingChat, setTestingChat] = useState(false);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/ai-settings');
      const data = await res.json();

      if (data.success && data.settings) {
        setProvider(data.settings.provider || 'DEEPSEEK');
        setModel(data.settings.model || 'deepseek-chat');
        setTemperature(data.settings.temperature || 0.7);
        setMaxTokens(data.settings.maxTokens || 800);
        setKeyStatus({
          deepseek: data.settings.deepseek || { hasKey: false, maskedKey: '' },
          gemini: data.settings.gemini || { hasKey: false, maskedKey: '' },
          openai: data.settings.openai || { hasKey: false, maskedKey: '' },
        });
      }
    } catch (e) {
      toast.error('AI সেটিংস লোড করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleProviderChange = (newProvider: 'DEEPSEEK' | 'GEMINI' | 'OPENAI') => {
    setProvider(newProvider);
    if (newProvider === 'DEEPSEEK') {
      setModel('deepseek-chat');
    } else if (newProvider === 'OPENAI') {
      setModel('gpt-4o-mini');
    } else {
      setModel('gemini-1.5-flash');
    }
  };

  // Test an individual API Key Connection
  const handleTestApiKey = async (targetProvider: 'DEEPSEEK' | 'GEMINI' | 'OPENAI', currentInputKey: string) => {
    const keyKey = targetProvider.toLowerCase() as 'deepseek' | 'gemini' | 'openai';
    setTestingKey(targetProvider);
    setKeyTestResults((prev) => ({ ...prev, [keyKey]: undefined }));

    try {
      const res = await fetch('/api/admin/ai-settings/test-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: targetProvider,
          apiKey: currentInputKey || undefined,
          model:
            targetProvider === 'DEEPSEEK'
              ? 'deepseek-chat'
              : targetProvider === 'OPENAI'
              ? 'gpt-4o-mini'
              : 'gemini-1.5-flash',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setKeyTestResults((prev) => ({
          ...prev,
          [keyKey]: { success: true, message: data.message },
        }));
        toast.success(`${targetProvider} কানেকশন সফল!`);
      } else {
        setKeyTestResults((prev) => ({
          ...prev,
          [keyKey]: { success: false, message: data.error || 'কানেকশন ব্যর্থ হয়েছে।' },
        }));
        toast.error(data.error || 'কানেকশন ব্যর্থ হয়েছে।');
      }
    } catch (e: any) {
      setKeyTestResults((prev) => ({
        ...prev,
        [keyKey]: { success: false, message: 'সার্ভারে যোগাযোগ করতে ব্যর্থ হয়েছে।' },
      }));
      toast.error('সার্ভার ত্রুটি।');
    } finally {
      setTestingKey(null);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/admin/ai-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          model,
          temperature,
          maxTokens,
          deepseekKey: deepseekKey || undefined,
          geminiKey: geminiKey || undefined,
          openaiKey: openaiKey || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(data.message || 'AI সেটিংস সফলভাবে সংরক্ষিত হয়েছে!');
        setDeepseekKey('');
        setGeminiKey('');
        setOpenAIKey('');
        fetchSettings();
      } else {
        toast.error(data.error || 'সংরক্ষণ ব্যর্থ হয়েছে।');
      }
    } catch (e) {
      toast.error('সার্ভার ত্রুটি।');
    } finally {
      setSaving(false);
    }
  };

  const handleTestChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testMessage.trim()) return;

    const userText = testMessage.trim();
    setTestMessage('');
    setChatLog((prev) => [...prev, { role: 'user', text: userText }]);
    setTestingChat(true);

    try {
      const res = await fetch('/api/ai/test-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: chatLog.map((m) => ({
            direction: m.role === 'user' ? 'INCOMING' : 'OUTGOING',
            text: m.text,
          })),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setChatLog((prev) => [
          ...prev,
          { role: 'assistant', text: data.reply || 'কোনো উত্তর পাওয়া যায়নি।' },
        ]);
      } else {
        setChatLog((prev) => [
          ...prev,
          { role: 'assistant', text: `ত্রুটি: ${data.error || 'AI উত্তর দিতে ব্যর্থ হয়েছে।'}` },
        ]);
      }
    } catch (e) {
      setChatLog((prev) => [
        ...prev,
        { role: 'assistant', text: 'সার্ভারে যোগাযোগ করতে সমস্যা হয়েছে।' },
      ]);
    } finally {
      setTestingChat(false);
    }
  };

  return (
    <AdminLayout
      title="🤖 AI ও API Key সেটিংস"
      subtitle="প্ল্যাটফর্মের সেন্ট্রাল AI ইঞ্জিন, DeepSeek, Google Gemini এবং OpenAI কনফিগারেশন ও লাইভ কানেকশন টেস্ট"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Configuration Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#120e20] border border-purple-900/30 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-purple-900/20">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <span>সেন্ট্রাল AI প্রোভাইডার নির্বাচন</span>
                </h3>
                <p className="text-xs text-purple-300/70 mt-1">
                  সিস্টেমের সমস্ত মেসেঞ্জার অটোরিপ্লাইয়ের জন্য প্রাথমিক AI ইঞ্জিন বেছে নিন
                </p>
              </div>

              <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                <span>AES-256 Secure</span>
              </span>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-6">
              {/* Provider Selector Cards */}
              <div>
                <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider mb-2.5">
                  অ্যাক্টিভ AI প্রোভাইডার
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* DeepSeek Option */}
                  <button
                    type="button"
                    onClick={() => handleProviderChange('DEEPSEEK')}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      provider === 'DEEPSEEK'
                        ? 'bg-purple-600/20 border-purple-500 text-white font-bold shadow-lg shadow-purple-500/10'
                        : 'bg-[#0a0812] border-purple-900/30 text-gray-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-bold text-cyan-300 flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-cyan-400" />
                        <span>DeepSeek</span>
                      </span>
                      {provider === 'DEEPSEEK' && <CheckCircle2 className="w-4 h-4 text-purple-400" />}
                    </div>
                    <p className="text-[11px] text-gray-400 font-normal">
                      সুপার ফাস্ট, সাশ্রয়ী ও বাংলা/ব্যাংলিশে পারদর্শী
                    </p>
                  </button>

                  {/* Gemini Option */}
                  <button
                    type="button"
                    onClick={() => handleProviderChange('GEMINI')}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      provider === 'GEMINI'
                        ? 'bg-purple-600/20 border-purple-500 text-white font-bold shadow-lg shadow-purple-500/10'
                        : 'bg-[#0a0812] border-purple-900/30 text-gray-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-bold text-emerald-300">Google Gemini</span>
                      {provider === 'GEMINI' && <CheckCircle2 className="w-4 h-4 text-purple-400" />}
                    </div>
                    <p className="text-[11px] text-gray-400 font-normal">
                      মাল্টিমোডাল ভিশন ও ভয়েস সমর্থন
                    </p>
                  </button>

                  {/* OpenAI Option */}
                  <button
                    type="button"
                    onClick={() => handleProviderChange('OPENAI')}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      provider === 'OPENAI'
                        ? 'bg-purple-600/20 border-purple-500 text-white font-bold shadow-lg shadow-purple-500/10'
                        : 'bg-[#0a0812] border-purple-900/30 text-gray-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-bold text-blue-300">OpenAI</span>
                      {provider === 'OPENAI' && <CheckCircle2 className="w-4 h-4 text-purple-400" />}
                    </div>
                    <p className="text-[11px] text-gray-400 font-normal">
                      স্মার্ট ও নির্ভরযোগ্য মডেল (GPT-4o)
                    </p>
                  </button>
                </div>
              </div>

              {/* Model Selection */}
              <div>
                <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider mb-1.5">
                  মডেল নির্বাচন ({provider})
                </label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0a0812] border border-purple-900/40 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                >
                  {provider === 'DEEPSEEK' ? (
                    <>
                      <option value="deepseek-chat">deepseek-chat (DeepSeek-V3 — দ্রুত ও আদর্শ)</option>
                      <option value="deepseek-reasoner">deepseek-reasoner (DeepSeek-R1 — ডিপ রিজনিং)</option>
                    </>
                  ) : provider === 'OPENAI' ? (
                    <>
                      <option value="gpt-4o-mini">gpt-4o-mini (ফাস্ট ও ব্যালেন্সড)</option>
                      <option value="gpt-4o">gpt-4o (সর্বোচ্চ সক্ষমতা)</option>
                    </>
                  ) : (
                    <>
                      <option value="gemini-1.5-flash">gemini-1.5-flash (সুপার ফাস্ট - রেকমেন্ডেড)</option>
                      <option value="gemini-1.5-pro">gemini-1.5-pro (কমপ্লেক্স লজিক)</option>
                    </>
                  )}
                </select>
              </div>

              {/* DeepSeek API Key Input & Live Test Button */}
              <div className="p-4 rounded-2xl bg-[#0a0812] border border-cyan-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5" />
                    <span>DeepSeek API Key</span>
                  </label>
                  {keyStatus.deepseek.hasKey && (
                    <span className="text-[11px] text-emerald-400 font-mono">
                      সংরক্ষিত: {keyStatus.deepseek.maskedKey}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={deepseekKey}
                    onChange={(e) => setDeepseekKey(e.target.value)}
                    placeholder={
                      keyStatus.deepseek.hasKey
                        ? 'নতুন DeepSeek API Key সেট করতে চাইলে লিখুন...'
                        : 'sk-... (platform.deepseek.com থেকে সংগ্রহ করুন)'
                    }
                    className="flex-1 px-3.5 py-2 bg-[#140f24] border border-purple-900/40 rounded-xl text-white placeholder-gray-500 text-xs font-mono focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    type="button"
                    disabled={testingKey === 'DEEPSEEK'}
                    onClick={() => handleTestApiKey('DEEPSEEK', deepseekKey)}
                    className="px-3.5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span>{testingKey === 'DEEPSEEK' ? 'টেস্ট হচ্ছে...' : 'টেস্ট করুন'}</span>
                  </button>
                </div>
                {keyTestResults.deepseek && (
                  <div
                    className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                      keyTestResults.deepseek.success
                        ? 'bg-emerald-950/30 border border-emerald-500/40 text-emerald-300'
                        : 'bg-red-950/30 border border-red-500/40 text-red-300'
                    }`}
                  >
                    {keyTestResults.deepseek.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    )}
                    <span>{keyTestResults.deepseek.message}</span>
                  </div>
                )}
              </div>

              {/* Gemini API Key Input & Live Test Button */}
              <div className="p-4 rounded-2xl bg-[#0a0812] border border-emerald-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5" />
                    <span>Google Gemini API Key</span>
                  </label>
                  {keyStatus.gemini.hasKey && (
                    <span className="text-[11px] text-emerald-400 font-mono">
                      সংরক্ষিত: {keyStatus.gemini.maskedKey}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    placeholder={
                      keyStatus.gemini.hasKey
                        ? 'নতুন Gemini API Key সেট করতে চাইলে লিখুন...'
                        : 'AIzaSy... (aistudio.google.com থেকে সংগ্রহ করুন)'
                    }
                    className="flex-1 px-3.5 py-2 bg-[#140f24] border border-purple-900/40 rounded-xl text-white placeholder-gray-500 text-xs font-mono focus:outline-none focus:border-emerald-400"
                  />
                  <button
                    type="button"
                    disabled={testingKey === 'GEMINI'}
                    onClick={() => handleTestApiKey('GEMINI', geminiKey)}
                    className="px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span>{testingKey === 'GEMINI' ? 'টেস্ট হচ্ছে...' : 'টেস্ট করুন'}</span>
                  </button>
                </div>
                {keyTestResults.gemini && (
                  <div
                    className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                      keyTestResults.gemini.success
                        ? 'bg-emerald-950/30 border border-emerald-500/40 text-emerald-300'
                        : 'bg-red-950/30 border border-red-500/40 text-red-300'
                    }`}
                  >
                    {keyTestResults.gemini.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    )}
                    <span>{keyTestResults.gemini.message}</span>
                  </div>
                )}
              </div>

              {/* OpenAI API Key Input & Live Test Button */}
              <div className="p-4 rounded-2xl bg-[#0a0812] border border-blue-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5" />
                    <span>OpenAI API Key</span>
                  </label>
                  {keyStatus.openai.hasKey && (
                    <span className="text-[11px] text-emerald-400 font-mono">
                      সংরক্ষিত: {keyStatus.openai.maskedKey}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={openaiKey}
                    onChange={(e) => setOpenAIKey(e.target.value)}
                    placeholder={
                      keyStatus.openai.hasKey
                        ? 'নতুন OpenAI API Key সেট করতে চাইলে লিখুন...'
                        : 'sk-... (platform.openai.com থেকে সংগ্রহ করুন)'
                    }
                    className="flex-1 px-3.5 py-2 bg-[#140f24] border border-purple-900/40 rounded-xl text-white placeholder-gray-500 text-xs font-mono focus:outline-none focus:border-blue-400"
                  />
                  <button
                    type="button"
                    disabled={testingKey === 'OPENAI'}
                    onClick={() => handleTestApiKey('OPENAI', openaiKey)}
                    className="px-3.5 py-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span>{testingKey === 'OPENAI' ? 'টেস্ট হচ্ছে...' : 'টেস্ট করুন'}</span>
                  </button>
                </div>
                {keyTestResults.openai && (
                  <div
                    className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                      keyTestResults.openai.success
                        ? 'bg-emerald-950/30 border border-emerald-500/40 text-emerald-300'
                        : 'bg-red-950/30 border border-red-500/40 text-red-300'
                    }`}
                  >
                    {keyTestResults.openai.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    )}
                    <span>{keyTestResults.openai.message}</span>
                  </div>
                )}
              </div>

              {/* Sliders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-purple-300 font-semibold">Temperature:</span>
                    <span className="text-cyan-400 font-bold font-mono">{temperature}</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full accent-purple-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-purple-300 font-semibold">Max Output Tokens:</span>
                    <span className="text-cyan-400 font-bold font-mono">{maxTokens}</span>
                  </div>
                  <input
                    type="range"
                    min="200"
                    max="2000"
                    step="100"
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(parseInt(e.target.value, 10))}
                    className="w-full accent-purple-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-purple-900/30 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-500/25 disabled:opacity-50 transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'সংরক্ষণ হচ্ছে...' : 'AI সেটিংস ও API Keys সংরক্ষণ করুন'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right: Live AI Sandbox Chat Tester (5 cols) */}
        <div className="lg:col-span-5 bg-[#120e20] border border-purple-900/30 rounded-3xl p-6 shadow-2xl flex flex-col h-[650px]">
          <div className="flex items-center justify-between pb-3 border-b border-purple-900/20 mb-3">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Bot className="w-4 h-4 text-purple-400" />
                <span>লাইভ AI রেসপন্স টেস্ট</span>
              </h4>
              <p className="text-[11px] text-purple-300/70 mt-0.5">
                অ্যাক্টিভ ইঞ্জিন: <strong className="text-cyan-300">{provider} ({model})</strong>
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setChatLog([
                  {
                    role: 'assistant',
                    text: 'আসসালামু আলাইকুম! আমি ReplyX AI। যেকোনো প্রশ্ন বা প্রোডাক্টের দাম জানতে লিখে পাঠান।',
                  },
                ])
              }
              className="text-[10px] text-purple-400 hover:text-purple-300 underline"
            >
              ক্লিয়ার চ্যাট
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {chatLog.map((msg, idx) => {
              const isUser = msg.role === 'user';
              return (
                <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                      isUser
                        ? 'bg-purple-600 text-white rounded-tr-none'
                        : 'bg-[#1a142c] text-purple-100 rounded-tl-none border border-purple-900/30'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] opacity-75 mb-1">
                      <span>{isUser ? 'টেস্টার (Admin)' : `ReplyX (${provider})`}</span>
                    </div>
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>
              );
            })}
            {testingChat && (
              <div className="flex justify-start">
                <div className="bg-[#1a142c] text-purple-300 rounded-2xl p-3 text-xs rounded-tl-none border border-purple-900/30 animate-pulse">
                  AI টাইপ করছে...
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleTestChat} className="pt-3 border-t border-purple-900/20 flex gap-2">
            <input
              type="text"
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              placeholder="বাংলা, English বা Banglish এ টেস্ট মেসেজ লিখুন..."
              className="flex-1 px-3.5 py-2.5 bg-[#0a0812] border border-purple-900/40 rounded-xl text-white placeholder-gray-500 text-xs focus:outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              disabled={testingChat || !testMessage.trim()}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs disabled:opacity-50 transition-all flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>পাঠান</span>
            </button>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
