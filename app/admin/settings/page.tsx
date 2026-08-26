'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/layout/AdminLayout';
import {
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Server,
  Bot,
  Cpu,
  Lock,
  Zap,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function AdminSettingsPage() {
  const toast = useToast();

  return (
    <AdminLayout
      title="সিস্টেম আর্কিটেকচার ও সেটিংস"
      subtitle="ReplyX AI প্ল্যাটফর্মের সার্ভার আর্কিটেকচার, ডাটাবেজ হেলথ এবং সিকিউরিটি ওভারভিউ"
    >
      <div className="max-w-3xl space-y-8">
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

        {/* System Health Card */}
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
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span className="font-semibold text-white">ওয়েবহুক সিগনেচার সিকিউরিটি:</span>
              </div>
              <span className="font-mono text-emerald-400">HMAC-SHA256 (X-Hub-Signature-256)</span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#090710] border border-purple-900/30">
              <div className="flex items-center gap-2.5">
                <Cpu className="w-4 h-4 text-purple-400" />
                <span className="font-semibold text-white">সক্রিয় AI প্রোভাইডার্স:</span>
              </div>
              <span className="font-mono text-purple-300">DeepSeek (V3/R1), Google Gemini, OpenAI</span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#090710] border border-purple-900/30">
              <div className="flex items-center gap-2.5">
                <Zap className="w-4 h-4 text-purple-400" />
                <span className="font-semibold text-white">গ্রাফ API ভার্সন:</span>
              </div>
              <span className="font-mono text-cyan-300">v20.0 (Official Meta Graph API)</span>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
