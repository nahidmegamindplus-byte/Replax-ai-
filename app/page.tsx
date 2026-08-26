'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  Bot,
  MessageSquare,
  Zap,
  ShieldCheck,
  Package,
  Layers,
  Camera,
  Mic,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Headphones,
  ShoppingBag,
  TrendingUp,
} from 'lucide-react';

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const features = [
    {
      icon: Bot,
      title: 'বাংলা, ইংলিশ ও ব্যাংলিশ বোঝে',
      desc: 'কাস্টমার যেভাবে খুশি মেসেজ দিক (যেমন: "eita koto?", "দাম কত?", "How much?"), ReplyX AI স্বাভাবিক মানুষের মতোই দ্রুত উত্তর দেয়।',
      color: 'from-emerald-500 to-teal-500',
    },
    {
      icon: ShoppingBag,
      title: 'স্বয়ংক্রিয় অর্ডার ক্যাপচার',
      desc: 'কাস্টমারের কেনার আগ্রহ বুঝে স্বয়ংক্রিয়ভাবে নাম, ফোন নম্বর ও ডেলিভারি ঠিকানা সংগ্রহ করে অর্ডার তৈরি করে।',
      color: 'from-cyan-500 to-blue-500',
    },
    {
      icon: Camera,
      title: 'কাস্টমারের ছবি ও প্রোডাক্ট রিকগনিশন',
      desc: 'কাস্টমার কোনো পণ্যের ছবি পাঠালে ভিশন এআই ছবি বিশ্লেষণ করে ইনভেন্টরির সঠিক পণ্যের স্টক ও দাম জানিয়ে দেয়।',
      color: 'from-purple-500 to-indigo-500',
    },
    {
      icon: Mic,
      title: 'ভয়েস মেসেজ আন্ডারস্ট্যান্ডিং',
      desc: 'গ্রাহকের অডিও বা ভয়েস মেসেজ স্বয়ংক্রিয়ভাবে টেক্সটে রূপান্তর করে নির্ভুল উত্তর প্রদান করে।',
      color: 'from-amber-500 to-orange-500',
    },
    {
      icon: Package,
      title: 'ইনভেন্টরি ও ছবি পাঠানো',
      desc: 'আপনার সব প্রোডাক্টের বিবরণ ও দাম ডাটাবেজে সংরক্ষিত থাকে। কাস্টমার জিজ্ঞেস করলেই ছবিসহ সঠিক তথ্য চলে যায়।',
      color: 'from-pink-500 to-rose-500',
    },
    {
      icon: Layers,
      title: 'মাল্টি-পেজ ও হিউম্যান হ্যান্ডঅফ',
      desc: 'একই ড্যাশবোর্ড থেকে একাধিক ফেসবুক পেজ পরিচালনা করুন। জটিল পরিস্থিতিতে এক ক্লিকেই লাইভ চ্যাট টেকওভার করুন।',
      color: 'from-emerald-500 to-cyan-500',
    },
  ];

  const faqs = [
    {
      q: 'ReplyX AI কি ফেসবুকে পেজের মেসেজের উত্তর স্বয়ংক্রিয়ভাবে পাঠাতে পারে?',
      a: 'হ্যাঁ! ফেসবুকের অফিসিয়াল মেসেঞ্জার গ্রাফ এপিআই এবং সিকিউর ওয়েবহুকের মাধ্যমে যেকোনো কাস্টমারের মেসেজে ১-৩ সেকেন্ডের মধ্যে স্বয়ংক্রিয় ও নির্ভুল উত্তর প্রদান করা হয়।',
    },
    {
      q: 'AI কি কাল্পনিক কোনো দাম বা স্টক তথ্য বানিয়ে বলবে?',
      a: 'কখনোই না! ReplyX AI-তে রয়েছে কঠোর প্রম্পট গার্ড এবং ইনভেন্টরি ভেরিফিকেশন ইঞ্জিন। আপনার প্রোডাক্ট লিস্টে উল্লেখিত সঠিক দাম ও স্টক ছাড়া এটি অন্য কোনো মনগড়া তথ্য দেয় না।',
    },
    {
      q: 'গ্রাহক ব্যাংলিশে (Banglish) লিখলে AI বুঝতে পারে?',
      a: 'জি, শতভাগ! আমাদের এআই মডেলগুলো বাংলাদেশি ব্যবহারকারীদের স্বাভাবিক ভাষা, যেমন: "vai delivery charge koto?" বা "Dhakar baire kobe pabo?" খুব সহজে বোঝে।',
    },
    {
      q: 'কোন কোন AI প্রোভাইডার ব্যবহার করা যায়?',
      a: 'আপনি Google Gemini (1.5 Flash / Pro) এবং OpenAI (GPT-4o / GPT-4o-mini) উভয় প্রোভাইডার নির্বাচন করতে পারবেন।',
    },
    {
      q: 'আমরা কি নিজে নিজে সার্ভারে এটি হোস্ট করতে পারবো?',
      a: 'হ্যাঁ, ReplyX AI সম্পূর্ণ সেলফ-হোস্টেবল এবং প্রোডাকশন-রেডি। আপনি ভিপিএস, ক্লাউড রান বা যেকোনো প্ল্যাটফর্মে খুব সহজে ডাটাবেজ সহ চালাতে পারবেন।',
    },
  ];

  return (
    <div className="min-h-screen bg-[#090a0f] text-gray-100 selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-[#090a0f]/80 backdrop-blur-lg border-b border-[#1a1f2e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <Sparkles className="w-6 h-6 text-black" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">
              ReplyX <span className="text-emerald-400">AI</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
            <a href="#features" className="hover:text-emerald-400 transition-colors">ফিচারসমূহ</a>
            <a href="#how-it-works" className="hover:text-emerald-400 transition-colors">কীভাবে কাজ করে</a>
            <a href="#preview" className="hover:text-emerald-400 transition-colors">লাইভ ডেমো</a>
            <a href="#faq" className="hover:text-emerald-400 transition-colors">প্রশ্নোত্তর</a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-semibold text-gray-300 hover:text-white transition-colors"
            >
              লগইন
            </Link>
            <Link
              href="/signup"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all"
            >
              ফ্রি শুরু করুন
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#161a29] border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-6 shadow-inner">
            <Zap className="w-3.5 h-3.5 fill-emerald-400" />
            <span>AI-Powered Facebook Messenger Automation for Bangladeshi Businesses</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.2] mb-6">
            আপনার Facebook Messenger-এর জন্য <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              স্মার্ট AI Sales Assistant
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
            ReplyX AI আপনার কাস্টমারের মেসেজ বুঝে তাৎক্ষণিক উত্তর দেবে, প্রোডাক্টের সঠিক দাম ও ছবি পাঠাবে এবং স্বয়ংক্রিয়ভাবে নাম, ফোন নম্বর ও ঠিকানা সংগ্রহ করে অর্ডার নিশ্চিত করবে।
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-bold text-base shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              <span>বিনামূল্যে শুরু করুন</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#141824] hover:bg-[#1c2234] border border-[#252d42] text-gray-200 font-semibold text-base transition-colors flex items-center justify-center gap-2"
            >
              <span>ডেমো অ্যাকাউন্টে প্রবেশ করুন</span>
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-xs font-medium text-gray-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>বাংলা, ইংলিশ ও ব্যাংলিশ সাপোর্ট</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>২৪/৭ ইনস্ট্যান্ট রিপ্লাই</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>জিরো কনফিগ সেলফ-হোস্টিং</span>
            </div>
          </div>
        </div>
      </section>

      {/* Live Interactive Messenger Simulation Preview */}
      <section id="preview" className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="bg-[#12141c] border border-[#1f2433] rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#1f2433] pb-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold text-sm">
                SF
              </div>
              <div>
                <h4 className="text-base font-bold text-white">স্টাইলিশ ফ্যাশন বিডি</h4>
                <p className="text-xs text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> ReplyX AI সক্রিয়
                </p>
              </div>
            </div>
            <div className="text-xs text-gray-400 bg-[#1c2234] px-3 py-1.5 rounded-lg border border-[#27314a]">
              লাইভ মেসেঞ্জার ডেমো
            </div>
          </div>

          <div className="space-y-4 max-w-2xl mx-auto">
            {/* Customer Message 1 */}
            <div className="flex justify-start">
              <div className="bg-[#1e2538] text-gray-200 px-4 py-3 rounded-2xl rounded-tl-none max-w-md text-sm border border-[#2b354d]">
                ভাইয়া কটন পাঞ্জাবির দাম কত? ঢাকার মধ্যে ডেলিভারি চার্জ কত?
              </div>
            </div>

            {/* AI Reply 1 */}
            <div className="flex justify-end">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-3 rounded-2xl rounded-tr-none max-w-md text-sm shadow-md">
                নমস্কার! আমাদের প্রিমিয়াম কটন পাঞ্জাবির বর্তমান অফার মূল্য ১,৪৯০ টাকা (নিয়মিত ১,৮৫০ টাকা)। ঢাকার মধ্যে ডেলিভারি চার্জ ৭০ টাকা এবং ক্যাশ অন ডেলিভারি সুবিধা আছে। আপনি কি অর্ডার করতে চান? 😊
              </div>
            </div>

            {/* Customer Message 2 */}
            <div className="flex justify-start">
              <div className="bg-[#1e2538] text-gray-200 px-4 py-3 rounded-2xl rounded-tl-none max-w-md text-sm border border-[#2b354d]">
                ha order korbo. Name: Rakib, Phone: 01819887766, Address: Dhanmondi, Dhaka.
              </div>
            </div>

            {/* AI Reply 2 */}
            <div className="flex justify-end">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-3 rounded-2xl rounded-tr-none max-w-md text-sm shadow-md space-y-2">
                <p>ধন্যবাদ রাকিব সাহেব! 🎉 আপনার অর্ডারটি গ্রহণ করা হয়েছে।</p>
                <div className="bg-black/30 p-2.5 rounded-xl text-xs space-y-1 border border-white/10">
                  <p>📦 <strong>পণ্য:</strong> প্রিমিয়াম কটন পাঞ্জাবি (১টি)</p>
                  <p>💰 <strong>মোট:</strong> ১,৪৯০ + ৭০ = ১,৫৬০ টাকা (COD)</p>
                  <p>📍 <strong>ঠিকানা:</strong> ধানমন্ডি, ঢাকা</p>
                </div>
                <p className="text-xs">আমাদের প্রতিনিধি দ্রুতই ডেলিভারির জন্য যোগাযোগ করবেন।</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
            ব্যবসা বৃদ্ধির জন্য প্রয়োজনীয় সবকিছু
          </h2>
          <p className="text-base text-gray-400">
            ReplyX AI আপনার পুরো মেসেঞ্জার ইনবক্সকে একটি পূর্ণাঙ্গ সেলস ও সাপোর্ট সেন্টারে রূপান্তর করে।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="bg-[#12141c] border border-[#1f2433] hover:border-emerald-500/40 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/5 group"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${f.color} flex items-center justify-center text-white mb-5 shadow-md group-hover:scale-105 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#1a1f2e]">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
            ৩টি সহজ ধাপে চালু করুন
          </h2>
          <p className="text-base text-gray-400">কোনো কোডিং জ্ঞান ছাড়াই কয়েক মিনিটে ফেসবুক পেজে AI সেটআপ করুন।</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-[#12141c] border border-[#1f2433] rounded-2xl p-6 relative">
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-black font-extrabold text-sm flex items-center justify-center mb-4">
              ১
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Facebook Page কানেক্ট করুন</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              ড্যাশবোর্ডে আপনার Facebook Page ID ও Access Token দিন। স্বয়ংক্রিয়ভাবে ওয়েবহুক লিংক জেনারেট হবে।
            </p>
          </div>

          <div className="bg-[#12141c] border border-[#1f2433] rounded-2xl p-6 relative">
            <div className="w-8 h-8 rounded-full bg-cyan-500 text-black font-extrabold text-sm flex items-center justify-center mb-4">
              ২
            </div>
            <h3 className="text-lg font-bold text-white mb-2">প্রোডাক্ট ও AI রুলস সেট করুন</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              আপনার ইনভেন্টরির পণ্যগুলো যোগ করুন এবং ১৪টি সহজ প্রশ্নের উত্তর দিয়ে অথবা কাস্টম প্রম্পট দিয়ে এআই ট্রেন করুন।
            </p>
          </div>

          <div className="bg-[#12141c] border border-[#1f2433] rounded-2xl p-6 relative">
            <div className="w-8 h-8 rounded-full bg-purple-500 text-black font-extrabold text-sm flex items-center justify-center mb-4">
              ৩
            </div>
            <h3 className="text-lg font-bold text-white mb-2">অটোমেটিক রিপ্লাই ও সেলস শুরু</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              এখন থেকে যেকোনো কাস্টমার মেসেজ দিলে AI তাৎক্ষণিক উত্তর দেবে এবং রিয়েল-টাইমে অর্ডার ক্যাপচার করবে।
            </p>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-[#1a1f2e]">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
            প্রায়শই জিজ্ঞাসিত প্রশ্নাবলী (FAQ)
          </h2>
          <p className="text-sm text-gray-400">ReplyX AI সম্পর্কে সাধারণ প্রশ্নের উত্তরসমূহ</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="bg-[#12141c] border border-[#1f2433] rounded-2xl overflow-hidden transition-colors"
            >
              <button
                onClick={() => toggleFaq(i)}
                className="w-full px-6 py-4 flex items-center justify-between text-left text-base font-semibold text-white hover:text-emerald-400 transition-colors"
              >
                <span>{faq.q}</span>
                {openFaq === i ? (
                  <ChevronUp className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
                )}
              </button>
              {openFaq === i && (
                <div className="px-6 pb-5 text-sm text-gray-300 leading-relaxed border-t border-[#1a1f2e] pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#090a0f] to-[#0d131f] border-t border-[#1a1f2e]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-6">
            আজই আপনার ব্যবসার Messenger-এ <br />
            <span className="text-emerald-400">AI সেলস অটোমেশন</span> যুক্ত করুন
          </h2>
          <p className="text-base text-gray-300 mb-8 max-w-2xl mx-auto">
            ReplyX AI দিয়ে ২৪/৭ কাস্টমারদের দ্রুততম সেবা দিন, সেলস বাড়ান এবং ব্যবসার সময় বাঁচান।
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-bold text-base shadow-xl shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5"
          >
            <span>এখনই শুরু করুন</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-[#1a1f2e] bg-[#07080c] text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-gray-300">ReplyX AI</span>
            <span>— AI-Powered Facebook Messenger Automation</span>
          </div>
          <p>© <span suppressHydrationWarning>{new Date().getFullYear()}</span> ReplyX AI. সর্বস্বত্ব সংরক্ষিত।</p>
        </div>
      </footer>
    </div>
  );
}
