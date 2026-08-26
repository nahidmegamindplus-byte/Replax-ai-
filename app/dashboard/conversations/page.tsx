'use client';

import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  MessageSquare,
  Search,
  Bot,
  User,
  Pause,
  Play,
  Send,
  ShoppingCart,
  Clock,
  CheckCircle2,
  Image as ImageIcon,
  Mic,
  Plus,
  Layers,
  X,
  Phone,
  MapPin,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function ConversationsPage() {
  const toast = useToast();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConv, setSelectedConv] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Input & Order modal
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderForm, setOrderForm] = useState({
    customerName: '',
    phone: '',
    address: '',
    product: '',
    quantity: '1',
    price: '',
    notes: '',
  });

  const fetchConversations = async () => {
    try {
      setLoadingList(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter !== 'ALL') params.append('status', statusFilter);

      const res = await fetch(`/api/conversations?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setConversations(data.conversations);
        if (data.conversations.length > 0 && !selectedConv) {
          loadConversation(data.conversations[0].id);
        }
      }
    } catch (e) {
      toast.error('কথোপকথন তালিকা লোড করতে সমস্যা হয়েছে।');
    } finally {
      setLoadingList(false);
    }
  };

  const loadConversation = async (id: string) => {
    try {
      setLoadingMessages(true);
      const res = await fetch(`/api/conversations/${id}`);
      const data = await res.json();

      if (data.success) {
        setSelectedConv(data.conversation);
        setMessages(data.messages);
        // Setup order form defaults
        setOrderForm({
          customerName: data.conversation.customerName || '',
          phone: '',
          address: '',
          product: '',
          quantity: '1',
          price: '',
          notes: '',
        });
      }
    } catch (e) {
      toast.error('মেসেজ লোড করতে সমস্যা হয়েছে।');
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [search, statusFilter]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendManualReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConv || !replyText.trim()) return;

    setSending(true);
    try {
      const res = await fetch(`/api/conversations/${selectedConv.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageText: replyText }),
      });

      const data = await res.json();
      if (data.success) {
        setReplyText('');
        setMessages((prev) => [...prev, data.savedMessage]);
        toast.success('মেসেজ সফলভাবে পাঠানো হয়েছে!');
      } else {
        toast.error(data.error || 'মেসেজ পাঠাতে ব্যর্থ হয়েছে।');
      }
    } catch (e) {
      toast.error('মেসেজ পাঠাতে সমস্যা হয়েছে।');
    } finally {
      setSending(false);
    }
  };

  const handleToggleAi = async () => {
    if (!selectedConv) return;
    const nextState = !selectedConv.aiEnabled;

    try {
      const res = await fetch(`/api/conversations/${selectedConv.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aiEnabled: nextState }),
      });

      const data = await res.json();
      if (data.success) {
        setSelectedConv(data.conversation);
        setConversations((prev) =>
          prev.map((c) => (c.id === data.conversation.id ? data.conversation : c))
        );
        toast.success(data.message);
      }
    } catch (e) {
      toast.error('AI স্ট্যাটাস পরিবর্তন করতে ব্যর্থ হয়েছে।');
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConv) return;

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageId: selectedConv.pageId,
          conversationId: selectedConv.id,
          customerName: orderForm.customerName,
          phone: orderForm.phone,
          address: orderForm.address,
          product: orderForm.product,
          quantity: orderForm.quantity,
          price: orderForm.price,
          totalPrice: parseFloat(orderForm.price || '0') * parseInt(orderForm.quantity || '1', 10),
          notes: orderForm.notes,
          status: 'PENDING',
          source: 'MANUAL',
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('অর্ডার সফলভাবে তৈরি হয়েছে!');
        setShowOrderModal(false);
      } else {
        toast.error(data.error || 'অর্ডার তৈরি ব্যর্থ হয়েছে।');
      }
    } catch (e) {
      toast.error('সার্ভার ত্রুটি।');
    }
  };

  return (
    <DashboardLayout
      title="কথোপকথন ও ইনবক্স"
      subtitle="কাস্টমারদের সাথে মেসেঞ্জার চ্যাট দেখুন, রিয়েল-টাইমে AI পজ/রিজিউম করুন বা ম্যানুয়াল টেকওভার নিন"
    >
      <div className="bg-[#12141c] border border-[#1f2433] rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 h-[750px]">
        {/* Left Pane: Customer List (4 Columns) */}
        <div className="lg:col-span-4 border-r border-[#1f2433] flex flex-col h-full bg-[#0d0f17]">
          {/* Filter Bar */}
          <div className="p-4 border-b border-[#1f2433] space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="গ্রাহকের নাম বা মেসেজ খুঁজুন..."
                className="w-full pl-9 pr-3 py-2 bg-[#12141c] border border-[#1e2538] rounded-xl text-white placeholder-gray-500 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1 rounded-lg transition-colors font-medium whitespace-nowrap ${
                  statusFilter === 'ALL'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                সকল চ্যাট
              </button>
              <button
                onClick={() => setStatusFilter('ACTIVE')}
                className={`px-3 py-1 rounded-lg transition-colors font-medium whitespace-nowrap ${
                  statusFilter === 'ACTIVE'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                AI সক্রিয়
              </button>
              <button
                onClick={() => setStatusFilter('HUMAN_MODE')}
                className={`px-3 py-1 rounded-lg transition-colors font-medium whitespace-nowrap ${
                  statusFilter === 'HUMAN_MODE'
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                হিউম্যান মোড
              </button>
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#1a1f2e]">
            {loadingList ? (
              <div className="py-12 text-center text-xs text-gray-400">ইনবক্স লোড হচ্ছে...</div>
            ) : conversations.length === 0 ? (
              <div className="py-12 text-center text-xs text-gray-400 px-4">
                কোনো মেসেজ পাওয়া যায়নি।
              </div>
            ) : (
              conversations.map((c) => {
                const isSelected = selectedConv?.id === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => loadConversation(c.id)}
                    className={`w-full p-3.5 text-left flex items-start gap-3 transition-colors ${
                      isSelected ? 'bg-[#161a29]' : 'hover:bg-[#121624]'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      {c.customerName?.charAt(0) || 'C'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <h4 className="text-xs font-bold text-white truncate">
                          {c.customerName || `Customer (${c.senderPsid.slice(-4)})`}
                        </h4>
                        <span className="text-[10px] text-gray-500 shrink-0">
                          {new Date(c.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <p className="text-xs text-gray-400 truncate mb-1.5">
                        {c.lastMessage || 'নতুন বার্তা'}
                      </p>

                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-gray-500 truncate">{c.page?.pageName}</span>
                        {c.aiEnabled ? (
                          <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> AI Active
                          </span>
                        ) : (
                          <span className="text-amber-400 flex items-center gap-1 font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> Human Mode
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Active Message Thread & Actions (8 Columns) */}
        <div className="lg:col-span-8 flex flex-col h-full bg-[#090a0f]">
          {selectedConv ? (
            <>
              {/* Thread Header */}
              <div className="p-4 border-b border-[#1f2433] bg-[#12141c] flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-sm">
                    {selectedConv.customerName?.charAt(0) || 'C'}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      {selectedConv.customerName || `Customer (${selectedConv.senderPsid})`}
                    </h3>
                    <p className="text-[11px] text-gray-400">
                      পেজ: <span className="text-gray-200">{selectedConv.page?.pageName}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowOrderModal(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold transition-colors"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>অর্ডার তৈরি</span>
                  </button>

                  <button
                    onClick={handleToggleAi}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors border ${
                      selectedConv.aiEnabled
                        ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    }`}
                  >
                    {selectedConv.aiEnabled ? (
                      <>
                        <Pause className="w-3.5 h-3.5" />
                        <span>AI পজ করুন</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5" />
                        <span>AI চালু করুন</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Message List */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {loadingMessages ? (
                  <div className="py-20 text-center text-xs text-gray-400">মেসেজ লোড হচ্ছে...</div>
                ) : messages.length === 0 ? (
                  <div className="py-20 text-center text-xs text-gray-400">এই কথোপকথনে কোনো বার্তা নেই।</div>
                ) : (
                  messages.map((m) => {
                    const isIncoming = m.direction === 'INCOMING';
                    return (
                      <div
                        key={m.id}
                        className={`flex ${isIncoming ? 'justify-start' : 'justify-end'}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                            isIncoming
                              ? 'bg-[#161a29] text-gray-200 rounded-tl-none border border-[#232a40]'
                              : m.aiGenerated
                              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-tr-none shadow-md'
                              : 'bg-blue-600 text-white rounded-tr-none shadow-md'
                          }`}
                        >
                          {/* Message meta badge */}
                          <div className="flex items-center justify-between text-[10px] mb-1.5 opacity-75">
                            <span>
                              {isIncoming
                                ? 'গ্রাহক'
                                : m.aiGenerated
                                ? `ReplyX AI (${m.aiModel || 'Flash'})`
                                : 'Human Agent'}
                            </span>
                            <span>
                              {new Date(m.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>

                          {/* Text content */}
                          {m.messageText && <p className="whitespace-pre-wrap">{m.messageText}</p>}

                          {/* Image Attachment if present */}
                          {m.mediaUrl && m.messageType === 'IMAGE' && (
                            <div className="mt-2 rounded-xl overflow-hidden border border-white/10">
                              <img src={m.mediaUrl} alt="Attached Media" className="max-h-48 object-cover" />
                            </div>
                          )}

                          {/* Audio transcription if present */}
                          {m.transcription && (
                            <div className="mt-2 bg-black/20 p-2 rounded-lg text-[11px] flex items-center gap-1.5">
                              <Mic className="w-3.5 h-3.5 text-emerald-300" />
                              <span>{m.transcription}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply Input Bar */}
              <form onSubmit={handleSendManualReply} className="p-4 bg-[#12141c] border-t border-[#1f2433]">
                {!selectedConv.aiEnabled && (
                  <div className="mb-2 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] flex items-center gap-1.5">
                    <User className="w-3 h-3" />
                    <span>হিউম্যান মোড সক্রিয় আছে। AI এখন কোনো অটোমেটিক রিপ্লাই দেবে না।</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="ম্যানুয়াল উত্তর লিখুন এবং মেসেঞ্জারে পাঠান..."
                    className="flex-1 px-4 py-2.5 bg-[#0a0c13] border border-[#1e2538] rounded-xl text-white placeholder-gray-500 text-xs focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    disabled={sending || !replyText.trim()}
                    className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>পাঠান</span>
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-gray-400">
              <MessageSquare className="w-12 h-12 text-gray-600 mb-3" />
              <h4 className="text-sm font-semibold text-gray-300">কোনো কথোপকথন নির্বাচন করা হয়নি</h4>
              <p className="text-xs text-gray-500 mt-1">বাম পাশের তালিকা থেকে একটি কাস্টমার চ্যাট সিলেক্ট করুন</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Order Creator Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#12141c] border border-[#1f2433] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative my-8">
            <button
              onClick={() => setShowOrderModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">নতুন অর্ডার তৈরি করুন</h3>
            <p className="text-xs text-gray-400 mb-6">কথোপকথন থেকে সরাসরি অর্ডার বুক করুন</p>

            <form onSubmit={handleCreateOrder} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">গ্রাহকের নাম *</label>
                <input
                  type="text"
                  required
                  value={orderForm.customerName}
                  onChange={(e) => setOrderForm({ ...orderForm, customerName: e.target.value })}
                  className="w-full px-3.5 py-2 bg-[#0a0c13] border border-[#1e2538] rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">ফোন নম্বর *</label>
                <input
                  type="tel"
                  required
                  value={orderForm.phone}
                  onChange={(e) => setOrderForm({ ...orderForm, phone: e.target.value })}
                  placeholder="01XXXXXXXXX"
                  className="w-full px-3.5 py-2 bg-[#0a0c13] border border-[#1e2538] rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">ডেলিভারি ঠিকানা *</label>
                <textarea
                  rows={2}
                  required
                  value={orderForm.address}
                  onChange={(e) => setOrderForm({ ...orderForm, address: e.target.value })}
                  placeholder="বাড়ি নং, রোড, থানা, জেলা"
                  className="w-full px-3.5 py-2 bg-[#0a0c13] border border-[#1e2538] rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">পণ্য (Product) *</label>
                <input
                  type="text"
                  required
                  value={orderForm.product}
                  onChange={(e) => setOrderForm({ ...orderForm, product: e.target.value })}
                  placeholder="পণ্যের নাম ও সাইজ"
                  className="w-full px-3.5 py-2 bg-[#0a0c13] border border-[#1e2538] rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">পরিমাণ</label>
                  <input
                    type="number"
                    value={orderForm.quantity}
                    onChange={(e) => setOrderForm({ ...orderForm, quantity: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0a0c13] border border-[#1e2538] rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">মূল্য (৳)</label>
                  <input
                    type="number"
                    value={orderForm.price}
                    onChange={(e) => setOrderForm({ ...orderForm, price: e.target.value })}
                    placeholder="মোট মূল্য"
                    className="w-full px-3 py-2 bg-[#0a0c13] border border-[#1e2538] rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1e2538]">
                <button
                  type="button"
                  onClick={() => setShowOrderModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#1a1f2e] text-gray-300 text-xs font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs"
                >
                  অর্ডার কনফার্ম করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
