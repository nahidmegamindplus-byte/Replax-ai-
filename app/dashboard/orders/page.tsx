'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  ShoppingCart,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  AlertCircle,
  Bot,
  User,
  Phone,
  MapPin,
  X,
  Trash2,
  Edit2,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function OrdersPage() {
  const toast = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [pages, setPages] = useState<any[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({
    ALL: 0,
    PENDING: 0,
    CONFIRMED: 0,
    PROCESSING: 0,
    DELIVERED: 0,
    CANCELLED: 0,
  });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedPageId, setSelectedPageId] = useState('ALL');

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [addForm, setAddForm] = useState({
    pageId: '',
    customerName: '',
    phone: '',
    address: '',
    product: '',
    quantity: '1',
    price: '',
    notes: '',
    status: 'PENDING',
  });

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (selectedPageId !== 'ALL') params.append('pageId', selectedPageId);

      const [orderRes, pageRes] = await Promise.all([
        fetch(`/api/orders?${params.toString()}`),
        fetch('/api/pages'),
      ]);

      const orderData = await orderRes.json();
      const pageData = await pageRes.json();

      if (orderData.success) {
        setOrders(orderData.orders);
        if (orderData.counts) setCounts(orderData.counts);
      }
      if (pageData.success && pageData.pages.length > 0) {
        setPages(pageData.pages);
        if (!addForm.pageId) {
          setAddForm((prev) => ({ ...prev, pageId: pageData.pages[0].id }));
        }
      }
    } catch (e) {
      toast.error('অর্ডার তালিকা লোড করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [search, statusFilter, selectedPageId]);

  const handleUpdateStatus = async (orderId: string, nextStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`অর্ডার স্ট্যাটাস আপডেট হয়েছে: ${nextStatus}`);
        fetchOrders();
      } else {
        toast.error(data.error || 'স্ট্যাটাস আপডেট ব্যর্থ হয়েছে।');
      }
    } catch (e) {
      toast.error('সার্ভার ত্রুটি।');
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const qty = parseInt(addForm.quantity || '1', 10);
      const prc = parseFloat(addForm.price || '0');

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...addForm,
          quantity: qty,
          price: prc,
          totalPrice: prc * qty,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('অর্ডার তৈরি হয়েছে!');
        setShowAddModal(false);
        setAddForm({
          pageId: pages[0]?.id || '',
          customerName: '',
          phone: '',
          address: '',
          product: '',
          quantity: '1',
          price: '',
          notes: '',
          status: 'PENDING',
        });
        fetchOrders();
      } else {
        toast.error(data.error || 'অর্ডার তৈরি ব্যর্থ হয়েছে।');
      }
    } catch (e) {
      toast.error('সার্ভার ত্রুটি।');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (!confirm('আপনি কি এই অর্ডারটি মুছে ফেলতে চান?')) return;

    try {
      const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('অর্ডার মুছে ফেলা হয়েছে।');
        fetchOrders();
        setShowDetailModal(false);
      }
    } catch (e) {
      toast.error('অর্ডার মুছতে সমস্যা হয়েছে।');
    }
  };

  return (
    <DashboardLayout
      title="অর্ডার ম্যানেজমেন্ট"
      subtitle="AI ও মেসেঞ্জার থেকে ক্যাপচার করা সমস্ত অর্ডার মনিটর ও স্ট্যাটাস পরিবর্তন করুন"
    >
      {/* Top Status Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {[
          { id: 'ALL', label: 'সকল অর্ডার', count: counts.ALL, color: 'text-gray-300' },
          { id: 'PENDING', label: 'পেন্ডিং', count: counts.PENDING, color: 'text-amber-400' },
          { id: 'CONFIRMED', label: 'কনফার্মড', count: counts.CONFIRMED, color: 'text-blue-400' },
          { id: 'PROCESSING', label: 'প্রসেসিং', count: counts.PROCESSING, color: 'text-purple-400' },
          { id: 'DELIVERED', label: 'ডেলিভার্ড', count: counts.DELIVERED, color: 'text-emerald-400' },
          { id: 'CANCELLED', label: 'বাতিল', count: counts.CANCELLED, color: 'text-red-400' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              statusFilter === tab.id
                ? 'bg-[#161a29] border-emerald-500/40 shadow-lg'
                : 'bg-[#12141c] border-[#1f2433] hover:border-[#2b354d]'
            }`}
          >
            <span className="text-[11px] font-medium text-gray-400 block">{tab.label}</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className={`text-xl font-extrabold ${tab.color}`}>{tab.count || 0}</span>
              <span className="text-[10px] text-gray-500">টি</span>
            </div>
          </button>
        ))}
      </div>

      {/* Filter and Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="গ্রাহকের নাম, ফোন, ঠিকানা বা পণ্য..."
              className="w-full pl-10 pr-4 py-2 bg-[#12141c] border border-[#1f2433] rounded-xl text-white placeholder-gray-500 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <select
            value={selectedPageId}
            onChange={(e) => setSelectedPageId(e.target.value)}
            className="px-3 py-2 bg-[#12141c] border border-[#1f2433] rounded-xl text-xs text-gray-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">সকল পেজ</option>
            {pages.map((p) => (
              <option key={p.id} value={p.id}>
                {p.pageName}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>ম্যানুয়াল অর্ডার তৈরি করুন</span>
        </button>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="py-20 text-center text-sm text-gray-400">অর্ডার লোড হচ্ছে...</div>
      ) : orders.length === 0 ? (
        <div className="bg-[#12141c] border border-[#1f2433] rounded-3xl p-12 text-center max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
            <ShoppingCart className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">কোনো অর্ডার পাওয়া যায়নি</h3>
          <p className="text-xs text-gray-400 mb-6 leading-relaxed">
            গ্রাহক মেসেঞ্জারে ক্রয়ের আগ্রহ প্রকাশ করলে AI স্বয়ংক্রিয়ভাবে তথ্য সংগ্রহ করে এখানে অর্ডার যুক্ত করবে।
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-colors"
          >
            <Plus className="w-4 h-4" /> নতুন অর্ডার যুক্ত করুন
          </button>
        </div>
      ) : (
        <div className="bg-[#12141c] border border-[#1f2433] rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-[#0d0f17] text-gray-400 border-b border-[#1f2433] uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">অর্ডার নং</th>
                  <th className="py-3.5 px-4 font-semibold">গ্রাহক ও ফোন</th>
                  <th className="py-3.5 px-4 font-semibold">পণ্য ও পরিমাণ</th>
                  <th className="py-3.5 px-4 font-semibold">মূল্য</th>
                  <th className="py-3.5 px-4 font-semibold">উৎস (Source)</th>
                  <th className="py-3.5 px-4 font-semibold">স্ট্যাটাস</th>
                  <th className="py-3.5 px-4 font-semibold">তারিখ</th>
                  <th className="py-3.5 px-4 font-semibold text-right">একশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a1f2e]">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-[#161a29]/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                      #{o.id.slice(0, 8)}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{o.customerName}</div>
                      <div className="text-[11px] text-gray-400 font-mono">{o.phone}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-gray-200">{o.product}</div>
                      <div className="text-[11px] text-gray-500">{o.quantity} টি</div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white font-mono">
                      {o.totalPrice} ৳
                    </td>
                    <td className="py-3.5 px-4">
                      {o.source === 'MESSENGER_AI' ? (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold border border-emerald-500/20 inline-flex items-center gap-1">
                          <Bot className="w-3 h-3" /> AI Captured
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-gray-500/10 text-gray-400 text-[10px] font-semibold border border-gray-500/20 inline-flex items-center gap-1">
                          <User className="w-3 h-3" /> Manual
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={o.status}
                        onChange={(e) => handleUpdateStatus(o.id, e.target.value)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold border focus:outline-none cursor-pointer ${
                          o.status === 'CONFIRMED'
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                            : o.status === 'DELIVERED'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : o.status === 'PROCESSING'
                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                            : o.status === 'CANCELLED'
                            ? 'bg-red-500/10 text-red-400 border-red-500/30'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}
                      >
                        <option value="PENDING" className="bg-[#12141c] text-white">পেন্ডিং (Pending)</option>
                        <option value="CONFIRMED" className="bg-[#12141c] text-white">কনফার্মড (Confirmed)</option>
                        <option value="PROCESSING" className="bg-[#12141c] text-white">প্রসেসিং (Processing)</option>
                        <option value="DELIVERED" className="bg-[#12141c] text-white">ডেলিভার্ড (Delivered)</option>
                        <option value="CANCELLED" className="bg-[#12141c] text-white">বাতিল (Cancelled)</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-gray-500 text-[11px]">
                      {new Date(o.createdAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedOrder(o);
                          setShowDetailModal(true);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-[#1a1f2e] hover:bg-[#252c40] text-gray-300 text-xs font-semibold transition-colors"
                      >
                        বিস্তারিত
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#12141c] border border-[#1f2433] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative my-8">
            <button
              onClick={() => setShowDetailModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-emerald-400 font-bold">#{selectedOrder.id.slice(0, 8)}</span>
              <span className="text-xs text-gray-500">•</span>
              <span className="text-xs text-gray-400">অর্ডার বিস্তারিত</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-6">{selectedOrder.customerName}</h3>

            <div className="space-y-4 text-xs bg-[#0a0c13] p-4 rounded-2xl border border-[#1e2538] mb-6">
              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-gray-400 block text-[11px]">মোবাইল নম্বর:</span>
                  <span className="text-white font-mono text-sm font-semibold">{selectedOrder.phone}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-gray-400 block text-[11px]">ডেলিভারি ঠিকানা:</span>
                  <span className="text-gray-200 leading-relaxed">{selectedOrder.address}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 border-t border-[#1e2538] pt-3">
                <ShoppingCart className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-gray-400 block text-[11px]">অর্ডারকৃত পণ্য:</span>
                  <span className="text-white font-bold">{selectedOrder.product}</span>
                  <span className="text-gray-400 ml-2">({selectedOrder.quantity} টি)</span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-[#1e2538] pt-3 text-sm">
                <span className="text-gray-400 font-medium">মোট প্রদেয় মূল্য (COD):</span>
                <span className="text-emerald-400 font-extrabold font-mono text-base">
                  {selectedOrder.totalPrice} ৳
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-4 border-t border-[#1f2433]">
              <button
                onClick={() => handleDeleteOrder(selectedOrder.id)}
                className="px-4 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-semibold transition-colors"
              >
                মুছে ফেলুন
              </button>

              <button
                onClick={() => setShowDetailModal(false)}
                className="px-5 py-2 rounded-xl bg-[#1a1f2e] text-gray-200 text-xs font-semibold hover:bg-[#252c40]"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Manual Order Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#12141c] border border-[#1f2433] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative my-8">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">ম্যানুয়াল অর্ডার তৈরি করুন</h3>
            <p className="text-xs text-gray-400 mb-6">কাস্টমারের তথ্য ও পণ্যের বিবরণ দিয়ে অর্ডার বুক করুন</p>

            <form onSubmit={handleCreateOrder} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">ফেসবুক পেজ *</label>
                <select
                  required
                  value={addForm.pageId}
                  onChange={(e) => setAddForm({ ...addForm, pageId: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0a0c13] border border-[#1e2538] rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                >
                  {pages.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.pageName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">গ্রাহকের নাম *</label>
                <input
                  type="text"
                  required
                  value={addForm.customerName}
                  onChange={(e) => setAddForm({ ...addForm, customerName: e.target.value })}
                  placeholder="যেমন: তানভীর রহমান"
                  className="w-full px-3.5 py-2 bg-[#0a0c13] border border-[#1e2538] rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">মোবাইল ফোন নম্বর *</label>
                <input
                  type="tel"
                  required
                  value={addForm.phone}
                  onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                  placeholder="01XXXXXXXXX"
                  className="w-full px-3.5 py-2 bg-[#0a0c13] border border-[#1e2538] rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">ডেলিভারির পূর্ণ ঠিকানা *</label>
                <textarea
                  rows={2}
                  required
                  value={addForm.address}
                  onChange={(e) => setAddForm({ ...addForm, address: e.target.value })}
                  placeholder="হাউজ নং, রোড, এরিয়া, জেলা"
                  className="w-full px-3.5 py-2 bg-[#0a0c13] border border-[#1e2538] rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">পণ্য (Product) *</label>
                <input
                  type="text"
                  required
                  value={addForm.product}
                  onChange={(e) => setAddForm({ ...addForm, product: e.target.value })}
                  placeholder="পণ্যের নাম ও সাইজ"
                  className="w-full px-3.5 py-2 bg-[#0a0c13] border border-[#1e2538] rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">পরিমাণ</label>
                  <input
                    type="number"
                    value={addForm.quantity}
                    onChange={(e) => setAddForm({ ...addForm, quantity: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0a0c13] border border-[#1e2538] rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">একক মূল্য (৳)</label>
                  <input
                    type="number"
                    value={addForm.price}
                    onChange={(e) => setAddForm({ ...addForm, price: e.target.value })}
                    placeholder="যেমন: 1490"
                    className="w-full px-3 py-2 bg-[#0a0c13] border border-[#1e2538] rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1e2538]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#1a1f2e] text-gray-300 text-xs font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-bold text-xs shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  {saving ? 'সংরক্ষণ হচ্ছে...' : 'অর্ডার সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
