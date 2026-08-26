'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import {
  FileCheck2,
  Clock,
  CheckCircle2,
  XCircle,
  Copy,
  Search,
  Filter,
  Check,
  X,
  AlertCircle,
  Phone,
  Hash,
  Sparkles,
  DollarSign,
  User,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function AdminPackageOrdersPage() {
  const toast = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [counts, setCounts] = useState<any>({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Processing state
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Reject Modal State
  const [rejectOrder, setRejectOrder] = useState<any>(null);
  const [rejectNote, setRejectNote] = useState('');
  const [rejecting, setRejecting] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/package-orders?status=${statusFilter}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
        setCounts(data.counts || { total: 0, pending: 0, approved: 0, rejected: 0 });
      } else {
        toast.error(data.error || 'অর্ডার লোড করতে সমস্যা হয়েছে।');
      }
    } catch (e) {
      toast.error('সার্ভার ত্রুটি।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} কপি করা হয়েছে!`);
  };

  const handleApprove = async (orderId: string, orderNumber: string) => {
    if (!confirm(`আপনি কি "${orderNumber}" অর্ডারটি অনুমোদন করতে চান? এটি ব্যবহারকারীর প্যাকেজ সক্রিয় করবে।`)) return;

    setProcessingId(orderId);
    try {
      const res = await fetch(`/api/admin/package-orders/${orderId}/approve`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || 'অর্ডার অনুমোদিত হয়েছে!');
        fetchOrders();
      } else {
        toast.error(data.error || 'অনুমোদন ব্যর্থ হয়েছে।');
      }
    } catch (e) {
      toast.error('সার্ভার ত্রুটি।');
    } finally {
      setProcessingId(null);
    }
  };

  const handleOpenReject = (order: any) => {
    setRejectOrder(order);
    setRejectNote('Transaction ID যাচাইকরণ ব্যর্থ হয়েছে। সঠিক TrxID প্রদান করুন।');
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectOrder) return;

    setRejecting(true);
    try {
      const res = await fetch(`/api/admin/package-orders/${rejectOrder.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminNote: rejectNote }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || 'অর্ডার বাতিল করা হয়েছে!');
        setRejectOrder(null);
        fetchOrders();
      } else {
        toast.error(data.error || 'বাতিলকরণ ব্যর্থ হয়েছে।');
      }
    } catch (e) {
      toast.error('সার্ভার ত্রুটি।');
    } finally {
      setRejecting(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const s = search.toLowerCase();
    return (
      o.orderNumber?.toLowerCase().includes(s) ||
      o.transactionId?.toLowerCase().includes(s) ||
      o.senderNumber?.includes(s) ||
      o.user?.businessName?.toLowerCase().includes(s) ||
      o.user?.email?.toLowerCase().includes(s)
    );
  });

  return (
    <AdminLayout
      title="📝 প্যাকেজ সাবস্ক্রিপশন অর্ডার ও পেমেন্ট ভেরিফিকেশন"
      subtitle="গ্রাহকদের প্রেরিত Transaction ID ও পেমেন্ট তথ্য যাচাই করে ১-ক্লিকে প্যাকেজ অনুমোদন করুন"
    >
      {/* Top Status Counts KPI */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <button
          type="button"
          onClick={() => setStatusFilter('ALL')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            statusFilter === 'ALL'
              ? 'bg-purple-600/20 border-purple-500 text-white font-bold'
              : 'bg-[#120e20] border-purple-900/30 text-gray-400 hover:text-white'
          }`}
        >
          <span className="text-xs text-purple-300 block mb-1">মোট অর্ডার</span>
          <span className="text-2xl font-black text-white">{counts.total}</span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('PENDING')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            statusFilter === 'PENDING'
              ? 'bg-amber-500/20 border-amber-500 text-white font-bold'
              : 'bg-[#120e20] border-purple-900/30 text-gray-400 hover:text-white'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-amber-300">অপেক্ষমান (Pending)</span>
            {counts.pending > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            )}
          </div>
          <span className="text-2xl font-black text-amber-400">{counts.pending}</span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('APPROVED')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            statusFilter === 'APPROVED'
              ? 'bg-emerald-500/20 border-emerald-500 text-white font-bold'
              : 'bg-[#120e20] border-purple-900/30 text-gray-400 hover:text-white'
          }`}
        >
          <span className="text-xs text-emerald-300 block mb-1">অনুমোদিত (Approved)</span>
          <span className="text-2xl font-black text-emerald-400">{counts.approved}</span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('REJECTED')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            statusFilter === 'REJECTED'
              ? 'bg-red-500/20 border-red-500 text-white font-bold'
              : 'bg-[#120e20] border-purple-900/30 text-gray-400 hover:text-white'
          }`}
        >
          <span className="text-xs text-red-300 block mb-1">বাতিল (Rejected)</span>
          <span className="text-2xl font-black text-red-400">{counts.rejected}</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="অর্ডার নম্বর, TrxID, প্রেরকের নম্বর বা ইমেইল দিয়ে খুঁজুন..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#120e20] border border-purple-900/40 rounded-xl text-white placeholder-gray-500 text-xs focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="py-24 text-center text-sm text-gray-400">অর্ডার তালিকা লোড হচ্ছে...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-[#120e20] border border-purple-900/30 rounded-3xl p-12 text-center max-w-md mx-auto my-8">
          <FileCheck2 className="w-12 h-12 text-purple-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">কোনো প্যাকেজ অর্ডার পাওয়া যায়নি</h3>
          <p className="text-xs text-gray-400">গ্রাহকরা প্যাকেজ কেনার জন্য সাবমিট করলে এখানে প্রদর্শিত হবে।</p>
        </div>
      ) : (
        <div className="bg-[#120e20] border border-purple-900/30 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-purple-900/30 bg-[#0a0812] text-purple-300">
                  <th className="py-3.5 px-4 font-semibold">অর্ডার ও তারিখ</th>
                  <th className="py-3.5 px-4 font-semibold">গ্রাহক ও ব্যবসা</th>
                  <th className="py-3.5 px-4 font-semibold">প্যাকেজ ও মূল্য</th>
                  <th className="py-3.5 px-4 font-semibold">পেমেন্ট মেথড ও প্রেরক</th>
                  <th className="py-3.5 px-4 font-semibold">Transaction ID (TrxID)</th>
                  <th className="py-3.5 px-4 font-semibold">স্ট্যাটাস</th>
                  <th className="py-3.5 px-4 font-semibold text-right">ভেরিফিকেশন অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-900/20 text-gray-300">
                {filteredOrders.map((o) => {
                  const isPending = o.status === 'PENDING';
                  const isApproved = o.status === 'APPROVED';

                  return (
                    <tr key={o.id} className="hover:bg-purple-950/20 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-cyan-300">{o.orderNumber}</div>
                        <div className="text-[10px] text-gray-400">
                          {new Date(o.createdAt).toLocaleString('bn-BD', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white">{o.user?.businessName || 'Business'}</div>
                        <div className="text-[11px] text-gray-400">
                          {o.user?.fullName} • <span className="font-mono text-purple-300">{o.user?.email}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">{o.package?.name}</div>
                        <div className="text-[11px] font-mono text-emerald-400 font-bold">৳ {o.amount}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">{o.paymentMethodName}</div>
                        <div className="text-[11px] font-mono text-gray-400 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-gray-500" />
                          <span>{o.senderNumber}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0a0812] border border-purple-900/40">
                          <span className="font-mono text-purple-300 font-bold tracking-wider">{o.transactionId}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(o.transactionId, 'TrxID')}
                            className="text-gray-500 hover:text-purple-400 p-0.5"
                            title="TrxID কপি করুন"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider inline-flex items-center gap-1 ${
                            isApproved
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : isPending
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-red-500/20 text-red-300 border border-red-500/40'
                          }`}
                        >
                          {isApproved ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>অনুমোদিত</span>
                            </>
                          ) : isPending ? (
                            <>
                              <Clock className="w-3 h-3 text-amber-400" />
                              <span>অপেক্ষমান</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-red-400" />
                              <span>বাতিল</span>
                            </>
                          )}
                        </span>
                        {o.adminNote && (
                          <p className="text-[10px] text-red-400 mt-1 max-w-[150px] truncate" title={o.adminNote}>
                            নোট: {o.adminNote}
                          </p>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {isPending ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleApprove(o.id, o.orderNumber)}
                              disabled={processingId === o.id}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 disabled:opacity-50 transition-all"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>{processingId === o.id ? 'অনুমোদন হচ্ছে...' : 'অনুমোদন'}</span>
                            </button>
                            <button
                              onClick={() => handleOpenReject(o)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600/40 text-red-300 border border-red-500/30 text-xs font-semibold transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>বাতিল</span>
                            </button>
                          </div>
                        ) : isApproved ? (
                          <span className="text-[11px] text-emerald-400 font-semibold">প্যাকেজ সক্রিয়</span>
                        ) : (
                          <button
                            onClick={() => handleApprove(o.id, o.orderNumber)}
                            className="text-[11px] text-purple-400 hover:underline"
                          >
                            পুনরায় অনুমোদন করুন
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#120e20] border border-purple-900/40 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setRejectOrder(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-1">অর্ডার বাতিলকরণ ও কারণ</h3>
            <p className="text-xs text-purple-300/70 mb-4">{rejectOrder.orderNumber} ({rejectOrder.user?.email})</p>

            <form onSubmit={handleConfirmReject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider mb-1.5">
                  বাতিলের কারণ (গ্রাহক দেখতে পাবেন) *
                </label>
                <textarea
                  rows={3}
                  required
                  value={rejectNote}
                  onChange={(e) => setRejectNote(e.target.value)}
                  placeholder="যেমন: Transaction ID ভুল পাওয়া গেছে। অনুগ্রহ করে সঠিক TrxID দিয়ে পুনরায় অর্ডার করুন।"
                  className="w-full px-3.5 py-2 bg-[#0a0812] border border-purple-900/40 rounded-xl text-white text-xs leading-relaxed focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-purple-900/30">
                <button
                  type="button"
                  onClick={() => setRejectOrder(null)}
                  className="px-4 py-2 rounded-xl bg-[#0a0812] text-gray-400 text-xs font-semibold hover:text-white"
                >
                  ফিরে যান
                </button>
                <button
                  type="submit"
                  disabled={rejecting}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-500/25 disabled:opacity-50 transition-all"
                >
                  {rejecting ? 'বাতিল হচ্ছে...' : 'অর্ডার বাতিল নিশ্চিত করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
