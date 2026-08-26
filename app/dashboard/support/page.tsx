'use client';

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  HelpCircle,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Code,
  Sparkles,
  Layers,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export default function SupportPage() {
  const steps = [
    {
      num: '১',
      title: 'Facebook Developer Portal-এ অ্যাপ তৈরি',
      desc: 'developers.facebook.com-এ গিয়ে একটি নতুন App তৈরি করুন (App Type: Business বা Other নির্বাচন করুন)।',
      link: 'https://developers.facebook.com/apps',
    },
    {
      num: '২',
      title: 'Messenger প্রোডাক্ট যুক্ত ও টোকেন জেনারেট',
      desc: 'অ্যাপ ড্যাশবোর্ড থেকে "Messenger" প্রোডাক্ট যুক্ত করুন। "Page Access Tokens" সেকশন থেকে আপনার ফেসবুক পেজ সিলেক্ট করে Never-expiring টোকেন তৈরি করুন। প্রয়োজনীয় পারমিশন: pages_messaging, pages_manage_metadata, pages_read_engagement।',
    },
    {
      num: '৩',
      title: 'Webhook Callback URL ও Verify Token কনফিগার',
      desc: 'ReplyX AI ড্যাশবোর্ডের "পেজ সমূহ" পেজ থেকে প্রাপ্ত Webhook Callback URL এবং ইউনিক Verify Token টি কপি করে ফেসবুকের Webhooks সেকশনে পেস্ট করুন ও "Verify and Save"-এ ক্লিক করুন।',
    },
    {
      num: '৪',
      title: 'Messenger ইভেন্ট সাবস্ক্রিপশন',
      desc: 'Webhooks সাবস্ক্রিপশনে "messages", "messaging_postbacks", "message_reads" টিক দিন এবং পেজে সাবস্ক্রাইব করুন।',
    },
    {
      num: '৫',
      title: 'কানেকশন টেস্ট ও AI সক্রিয়করণ',
      desc: 'ReplyX AI ড্যাশবোর্ডের পেজ কার্ড থেকে "কানেকশন টেস্ট" বাটনে চাপুন। সবুজ রঙের "কানেক্টেড" স্ট্যাটাস প্রদর্শিত হলে আপনার অটোমেশন সফলভাবে সক্রিয় হয়ে যাবে!',
    },
  ];

  return (
    <DashboardLayout
      title="সাপোর্ট ও ফেসবুক সেটআপ গাইড"
      subtitle="Facebook Messenger API ইন্টিগ্রেশন ও ট্রাবলশুটিংয়ের সহজ বাংলা নির্দেশিকা"
    >
      <div className="max-w-4xl space-y-8">
        {/* Graph API Version Badge */}
        <div className="bg-[#12141c] border border-[#1f2433] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-mono text-xs font-bold">
              API
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">ডায়নামিক Facebook Graph API ভার্সন</h4>
              <p className="text-[11px] text-gray-400">
                সার্ভার সাইড এনভায়রনমেন্ট ভেরিয়েবল <code className="text-cyan-400 font-mono">FACEBOOK_GRAPH_API_VERSION</code> দিয়ে সহজেই ভার্সন আপডেট করা যায়।
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-mono text-xs font-bold w-fit">
            v20.0 Active
          </span>
        </div>

        {/* Step-by-Step Guide */}
        <div className="bg-[#12141c] border border-[#1f2433] rounded-3xl p-6 sm:p-8 shadow-xl">
          <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <span>Facebook Messenger AI সংযোগের ৫টি সহজ ধাপ</span>
          </h3>
          <p className="text-xs text-gray-400 mb-8">
            নিচের নির্দেশিকা অনুসরণ করে আপনার ফেসবুক পেজটি ReplyX AI-এর সাথে নির্ভুলভাবে যুক্ত করুন:
          </p>

          <div className="space-y-6">
            {steps.map((s) => (
              <div key={s.num} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  {s.num}
                </div>
                <div className="flex-1 bg-[#0a0c13] p-4 rounded-2xl border border-[#1e2538]">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="text-sm font-bold text-white">{s.title}</h4>
                    {s.link && (
                      <a
                        href={s.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
                      >
                        <span>লিংক খুলুন</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Troubleshooting & Security */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Troubleshooting */}
          <div className="bg-[#12141c] border border-[#1f2433] rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3 text-amber-400 font-bold text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>সাধারণ সমস্যা ও সমাধান</span>
            </div>
            <ul className="space-y-2.5 text-xs text-gray-300 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>
                  <strong>টোকেন মেয়াদ শেষ হলে:</strong> ফেসবুক ডেভেলপার পোর্টাল থেকে নতুন পেজ এক্সেস টোকেন জেনারেট করে পেজের সেটিংসে আপডেট করুন।
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>
                  <strong>ওয়েবহুক ভেরিফিকেশন ফেইল হলে:</strong> Verify Token সঠিক আছে কি না এবং সার্ভারটি অনলাইনে সক্রিয় কি না নিশ্চিত করুন।
                </span>
              </li>
            </ul>
          </div>

          {/* Security */}
          <div className="bg-[#12141c] border border-[#1f2433] rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3 text-emerald-400 font-bold text-sm">
              <ShieldCheck className="w-4 h-4" />
              <span>সার্ভার সাইড সিকিউরিটি</span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed mb-3">
              ReplyX AI আপনার ফেসবুক অ্যাপ সিক্রেট এবং পেজ টোকেনগুলো সম্পূর্ণ নিরাপদ রাখতে AES-256-GCM এনক্রিপশন ও HMAC-SHA256 সিগনেচার ভ্যালিডেশন ব্যবহার করে।
            </p>
            <div className="p-2.5 rounded-xl bg-[#0a0c13] border border-[#1e2538] text-[11px] text-gray-400 font-mono">
              X-Hub-Signature-256 Verified
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
