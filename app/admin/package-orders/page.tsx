'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import Link from 'next/link';
import {
  FileCheck2,
  Clock,
  CheckCircle2,
  XCircle,
  Copy,
  Search,
  Check,
  X,
  Phone,
  Plus,
  Edit2,
  Trash2,
  Eye,
  RefreshCw,
  Package as PackageIcon,
  CreditCard,
  User as UserIcon,
  DollarSign,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function AdminPackageOrdersPage() {
  const toast = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [counts, setCounts] = useState<any>({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);

  // Filter & Search
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Dropdown option sources (Users, Packages, Payment Methods)
  const [usersList, setUsersList] = useState<any[]>([]);
  const [packagesList, setPackagesList] = useState<any[]>([]);
  const [paymentMethodsList, setPaymentMethodsList] = useState<any[]>([]);

  // Processing ID state
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [viewingOrder, setViewingOrder] = useState<any>(null);
  const [rejectOrder, setRejectOrder] = useState<any>(null);
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);

  // Form State for Add / Edit
  const [formUserId, setFormUserId] = useState('');
  const [formPackageId, setFormPackageId] = useState('');
  const [formPaymentMethodName, setFormPaymentMethodName] = useState('bKash (Personal)');
  const [formAmount, setFormAmount] = useState('');
  const [formSenderNumber, setFormSenderNumber] = useState('');
  const [formTransactionId, setFormTransactionId] = useState('');
  const [formStatus, setFormStatus] = useState('PENDING');
  const [formAdminNote, setFormAdminNote] = useState('');
  const [saving, setSaving] = useState(false);

  // Reject Note state
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

  const fetchAuxiliaryData = async () => {
    try {
      const [uRes, pRes, pmRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/packages'),
        fetch('/api/admin/payment-methods'),
      ]);

      const uData = await uRes.json();
      if (uData.success) setUsersList(uData.users || []);

      const pData = await pRes.json();
      if (pData.success) setPackagesList(pData.packages || []);

      const pmData = await pmRes.json();
      if (pmData.success) setPaymentMethodsList(pmData.paymentMethods || []);
    } catch (e) {
      console.error('Aux data fetch error', e);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchAuxiliaryData();
  }, [statusFilter]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} কপি করা হয়েছে!`);
  };

  // Open Add Order Modal
  const handleOpenAdd = () => {
    setEditingOrder(null);
    setFormUserId(usersList.length > 0 ? usersList[0].id : '');
    setFormPackageId(packagesList.length > 0 ? packagesList[0].id : '');
    setFormAmount(packagesList.length > 0 ? packagesList[0].price.toString() : '990');
    setFormPaymentMethodName(paymentMethodsList.length > 0 ? paymentMethodsList[0].displayName : 'bKash (Personal)');
    setFormSenderNumber('');
    setFormTransactionId('');
    setFormStatus('APPROVED');
    setFormAdminNote('অ্যাডমিন ম্যানুয়াল অর্ডার তৈরি করা হয়েছে।');
    setIsAddModalOpen(true);
  };

  // Open Edit Order Modal
  const handleOpenEdit = (order: any) => {
    setEditingOrder(order);
    setFormUserId(order.userId || '');
    setFormPackageId(order.packageId || '');
    setFormAmount(order.amount ? order.amount.toString() : '0');
    setFormPaymentMethodName(order.paymentMethodName || 'bKash');
    setFormSenderNumber(order.senderNumber || '');
    setFormTransactionId(order.transactionId || '');
    setFormStatus(order.status || 'PENDING');
    setFormAdminNote(order.adminNote || '');
    setIsAddModalOpen(true);
  };

  // Package Change handler in Form to auto update price
  const handlePackageSelectChange = (pkgId: string) => {
    setFormPackageId(pkgId);
    const selectedPkg = packagesList.find((p) => p.id === pkgId);
    if (selectedPkg) {
      setFormAmount(selectedPkg.price.toString());
    }
  };

  // Save Order (Create or Update)
  const handleSaveOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formUserId) {
      toast.error('ব্যবহারকারী সিলেক্ট করুন।');
      return;
    }
    if (!formPackageId) {
      toast.error('প্যাকেজ সিলেক্ট করুন।');
      return;
    }
    if (!formSenderNumber.trim()) {
      toast.error('প্রেরকের নম্বর লিখুন।');
      return;
    }
    if (!formTransactionId.trim()) {
      toast.error('Transaction ID (TrxID) লিখুন।');
      return;
    }

    setSaving(true);
    try {
      const url = editingOrder ? `/api/admin/package-orders/${editingOrder.id}` : '/api/admin/package-orders';
      const method = editingOrder ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: formUserId,
          packageId: formPackageId,
          paymentMethodName: formPaymentMethodName,
          amount: parseFloat(formAmount || '0'),
          senderNumber: formSenderNumber.trim(),
          transactionId: formTransactionId.trim(),
          status: formStatus,
          adminNote: formAdminNote.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(data.message || 'অর্ডার সফলভাবে সংরক্ষিত হয়েছে!');
        setIsAddModalOpen(false);
        setEditingOrder(null);
        fetchOrders();
      } else {
        toast.error(data.error || 'অর্ডার সংরক্ষণ ব্যর্থ হয়েছে।');
      }
    } catch (e) {
      toast.error('সার্ভার ত্রুটি।');
    } finally {
      setSaving(false);
    }
  };

  // Approve Action
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

  // Open Reject Modal
  const handleOpenReject = (order: any) => {
    setRejectOrder(order);
    setRejectNote('Transaction ID যাচাইকরণ ব্যর্থ হয়েছে। সঠিক TrxID প্রদান করুন।');
  };

  // Confirm Reject
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

  // Delete Order
  const handleDeleteOrder = async (orderId: string, orderNumber: string) => {
    if (!confirm(`আপনি কি নিশ্চিতভাবে "${orderNumber}" অর্ডারটি মুছে ফেলতে চান? এটি স্থায়ীভাবে রিমুভ হয়ে যাবে।`)) return;

    setProcessingId(orderId);
    try {
      const res = await fetch(`/api/admin/package-orders/${orderId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || 'অর্ডার সফলভাবে রিমুভ করা হয়েছে!');
        setDeletingOrderId(null);
        fetchOrders();
      } else {
        toast.error(data.error || 'অর্ডার মুছতে ব্যর্থ হয়েছে।');
      }
    } catch (e) {
      toast.error('সার্ভার ত্রুটি।');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const s = search.toLowerCase();
    return (
      o.orderNumber?.toLowerCase().includes(s) ||
      o.transactionId?.toLowerCase().includes(s) ||
      o.senderNumber?.includes(s) ||
      o.user?.businessName?.toLowerCase().includes(s) ||
      o.user?.fullName?.toLowerCase().includes(s) ||
      o.user?.email?.toLowerCase().includes(s)
    );
  });

  return (
    <AdminLayout
      title="📝 প্যাকেজ সাবস্ক্রিপশন অর্ডার ও পেমেন্ট ভেরিফিকেশন"
      subtitle="গ্রাহকদের পেমেন্ট TrxID যাচাইকরণ, ম্যানুয়াল অর্ডার যুক্ত, এডিট, রিমুভ ও অনুমোদন পরিচালনা করুন"
    >
      {/* Top Quick Management Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 p-4 rounded-3xl bg-[#120e20] border border-purple-900/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">প্যাকেজ অর্ডার নিয়ন্ত্রণ কেন্দ্র</h3>
            <p className="text-xs text-purple-300/70">সব অর্ডার ম্যানুয়ালি এডিট, এড, রিমুভ বা সাবস্ক্রিপশন পারমিশন কনফিগার করুন</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchOrders}
            className="p-2.5 rounded-xl bg-[#0a0812] border border-purple-900/40 text-gray-400 hover:text-white transition-colors"
            title="তালিকা রিফ্রেশ করুন"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <Link
            href="/admin/packages"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-950/40 hover:bg-purple-900/40 text-purple-300 border border-purple-500/30 text-xs font-semibold transition-all"
          >
            <PackageIcon className="w-4 h-4" />
            <span>প্যাকেজ সেটিংস</span>
          </Link>

          <Link
            href="/admin/payment-methods"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-950/40 hover:bg-purple-900/40 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition-all"
          >
            <CreditCard className="w-4 h-4" />
            <span>পেমেন্ট মাধ্যম</span>
          </Link>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন অর্ডার যুক্ত করুন</span>
          </button>
        </div>
      </div>

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
            placeholder="অর্ডার নম্বর, TrxID, প্রেরকের নম্বর বা গ্রাহক দিয়ে খুঁজুন..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#120e20] border border-purple-900/40 rounded-xl text-white placeholder-gray-500 text-xs focus:outline-none focus:border-purple-500"
          />
        </div>

        <span className="text-xs text-gray-400">
          প্রদর্শিত হচ্ছে: <strong className="text-purple-300">{filteredOrders.length}</strong> টি অর্ডার
        </span>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="py-24 text-center text-sm text-gray-400">অর্ডার তালিকা লোড হচ্ছে...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-[#120e20] border border-purple-900/30 rounded-3xl p-12 text-center max-w-md mx-auto my-8">
          <FileCheck2 className="w-12 h-12 text-purple-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">কোনো প্যাকেজ অর্ডার পাওয়া যায়নি</h3>
          <p className="text-xs text-gray-400 mb-4">গ্রাহকরা প্যাকেজ কেনার জন্য সাবমিট করলে বা ম্যানুয়ালি যুক্ত করলে এখানে থাকবে।</p>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
          >
            + ম্যানুয়াল অর্ডার তৈরি করুন
          </button>
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
                  <th className="py-3.5 px-4 font-semibold text-right">ম্যানেজমেন্ট অ্যাকশন</th>
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
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Quick Approve / Reject for Pending */}
                          {isPending && (
                            <>
                              <button
                                onClick={() => handleApprove(o.id, o.orderNumber)}
                                disabled={processingId === o.id}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md disabled:opacity-50 transition-all"
                                title="অনুমোদন করুন"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>অনুমোদন</span>
                              </button>
                              <button
                                onClick={() => handleOpenReject(o)}
                                className="inline-flex items-center gap-1 px-2 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600/40 text-red-300 border border-red-500/30 text-xs font-semibold transition-colors"
                                title="বাতিল করুন"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>বাতিল</span>
                              </button>
                            </>
                          )}

                          {/* View details button */}
                          <button
                            onClick={() => setViewingOrder(o)}
                            className="p-1.5 rounded-xl bg-purple-900/30 hover:bg-purple-900/60 text-purple-300 border border-purple-500/30 transition-colors"
                            title="বিস্তারিত দেখুন"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit button */}
                          <button
                            onClick={() => handleOpenEdit(o)}
                            className="p-1.5 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-500/30 transition-colors"
                            title="সম্পাদনা করুন (Edit)"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete button */}
                          <button
                            onClick={() => handleDeleteOrder(o.id, o.orderNumber)}
                            className="p-1.5 rounded-xl bg-red-950/30 hover:bg-red-900/50 text-red-400 hover:text-red-300 border border-red-500/30 transition-colors"
                            title="ডিলিট করুন (Remove)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Order Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#120e20] border border-purple-900/40 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative my-8">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-1">
              {editingOrder ? `অর্ডার সম্পাদনা (${editingOrder.orderNumber})` : 'নতুন ম্যানুয়াল সাবস্ক্রিপশন অর্ডার যুক্ত করুন'}
            </h3>
            <p className="text-xs text-purple-300/70 mb-6">
              ব্যবহারকারীর অ্যাকাউন্ট নির্বাচন, প্যাকেজ, পেমেন্ট ট্রানজেকশন তথ্য ও অনুমোদন নির্ধারণ করুন
            </p>

            <form onSubmit={handleSaveOrder} className="space-y-4">
              {/* Select User */}
              <div>
                <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider mb-1.5">
                  গ্রাহক / অ্যাকাউন্ট সিলেক্ট করুন *
                </label>
                <select
                  required
                  value={formUserId}
                  onChange={(e) => setFormUserId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0a0812] border border-purple-900/40 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                >
                  <option value="">-- অ্যাকাউন্ট সিলেক্ট করুন --</option>
                  {usersList.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.businessName || u.fullName} ({u.email}) - {u.plan || 'STARTER'} [{u.planStatus}]
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Package & Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider mb-1.5">
                    সাবস্ক্রিপশন প্যাকেজ *
                  </label>
                  <select
                    required
                    value={formPackageId}
                    onChange={(e) => handlePackageSelectChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#0a0812] border border-purple-900/40 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                  >
                    <option value="">-- প্যাকেজ বেছে নিন --</option>
                    {packagesList.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} - ৳{p.price} ({p.durationDays} দিন)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider mb-1.5">
                    অর্ডার মূল্য (BDT ৳) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    placeholder="990"
                    className="w-full px-3.5 py-2 bg-[#0a0812] border border-purple-900/40 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Payment Method & Sender Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider mb-1.5">
                    পেমেন্ট মাধ্যম *
                  </label>
                  <select
                    value={formPaymentMethodName}
                    onChange={(e) => setFormPaymentMethodName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#0a0812] border border-purple-900/40 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                  >
                    {paymentMethodsList.length > 0 ? (
                      paymentMethodsList.map((pm) => (
                        <option key={pm.id} value={pm.displayName}>
                          {pm.displayName} ({pm.accountNumber})
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="bKash (Personal)">bKash (Personal)</option>
                        <option value="Nagad (Personal)">Nagad (Personal)</option>
                        <option value="Rocket (Personal)">Rocket (Personal)</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Manual Cash/Discount">Manual Cash/Discount</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider mb-1.5">
                    প্রেরকের মোবাইল নম্বর *
                  </label>
                  <input
                    type="text"
                    required
                    value={formSenderNumber}
                    onChange={(e) => setFormSenderNumber(e.target.value)}
                    placeholder="017XXXXXXXX"
                    className="w-full px-3.5 py-2 bg-[#0a0812] border border-purple-900/40 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Transaction ID & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider mb-1.5">
                    Transaction ID (TrxID) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTransactionId}
                    onChange={(e) => setFormTransactionId(e.target.value)}
                    placeholder="9J48XXXXXX"
                    className="w-full px-3.5 py-2 bg-[#0a0812] border border-purple-900/40 rounded-xl text-white text-xs font-mono uppercase focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider mb-1.5">
                    অর্ডার স্ট্যাটাস *
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#0a0812] border border-purple-900/40 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                  >
                    <option value="PENDING">PENDING (অপেক্ষমান)</option>
                    <option value="APPROVED">APPROVED (অনুমোদিত & সক্রিয়)</option>
                    <option value="REJECTED">REJECTED (বাতিল)</option>
                  </select>
                </div>
              </div>

              {/* Admin Note */}
              <div>
                <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider mb-1.5">
                  অ্যাডমিন নোট / নির্দেশনা
                </label>
                <textarea
                  rows={2}
                  value={formAdminNote}
                  onChange={(e) => setFormAdminNote(e.target.value)}
                  placeholder="যেমন: ম্যানুয়ালি ক্যাশ রিসিভ করা হয়েছে।"
                  className="w-full px-3.5 py-2 bg-[#0a0812] border border-purple-900/40 rounded-xl text-white text-xs leading-relaxed focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Modal Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-purple-900/30">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#0a0812] text-gray-400 text-xs font-semibold hover:text-white"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-500/25 disabled:opacity-50 transition-all"
                >
                  {saving ? 'সংরক্ষণ হচ্ছে...' : editingOrder ? 'পরিবর্তন সংরক্ষণ করুন' : 'অর্ডার তৈরি ও সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
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

      {/* View Order Details Modal */}
      {viewingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#120e20] border border-purple-900/40 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setViewingOrder(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-cyan-300 font-bold">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">অর্ডার বিস্তারিত: {viewingOrder.orderNumber}</h3>
                <span className="text-xs text-purple-300/70">
                  {new Date(viewingOrder.createdAt).toLocaleString('bn-BD', { dateStyle: 'full', timeStyle: 'short' })}
                </span>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              {/* Customer Box */}
              <div className="p-4 rounded-2xl bg-[#0a0812] border border-purple-900/30 space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-purple-400">গ্রাহক ও ব্যবসার তথ্য</div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-gray-400">ব্যবসার নাম:</span>
                    <p className="font-bold text-white">{viewingOrder.user?.businessName || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">মালিকের নাম:</span>
                    <p className="font-bold text-white">{viewingOrder.user?.fullName || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">ইমেইল:</span>
                    <p className="font-mono text-cyan-300">{viewingOrder.user?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">ফোন:</span>
                    <p className="font-mono text-white">{viewingOrder.user?.phone || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Payment Box */}
              <div className="p-4 rounded-2xl bg-[#0a0812] border border-purple-900/30 space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">পেমেন্ট ও প্যাকেজ বিবরণ</div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-gray-400">প্যাকেজ:</span>
                    <p className="font-bold text-purple-300">{viewingOrder.package?.name}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">পরিশোধিত মূল্য:</span>
                    <p className="font-mono font-bold text-emerald-400 text-sm">৳ {viewingOrder.amount}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">পেমেন্ট মেথড:</span>
                    <p className="font-bold text-white">{viewingOrder.paymentMethodName}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">প্রেরকের নম্বর:</span>
                    <p className="font-mono text-cyan-300 font-bold">{viewingOrder.senderNumber}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-400">Transaction ID (TrxID):</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-mono font-black text-purple-300 text-sm px-2.5 py-1 rounded bg-purple-950/60 border border-purple-800/40">
                        {viewingOrder.transactionId}
                      </span>
                      <button
                        onClick={() => handleCopy(viewingOrder.transactionId, 'TrxID')}
                        className="text-gray-400 hover:text-purple-300 p-1"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Box */}
              <div className="p-4 rounded-2xl bg-[#0a0812] border border-purple-900/30 flex items-center justify-between">
                <div>
                  <span className="text-gray-400 block mb-1">বর্তমান স্ট্যাটাস</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      viewingOrder.status === 'APPROVED'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : viewingOrder.status === 'PENDING'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-red-500/20 text-red-300 border border-red-500/40'
                    }`}
                  >
                    {viewingOrder.status}
                  </span>
                </div>

                {viewingOrder.approvedAt && (
                  <div className="text-right">
                    <span className="text-gray-400 block mb-1">অনুমোদনের তারিখ</span>
                    <span className="text-white font-mono text-[11px]">
                      {new Date(viewingOrder.approvedAt).toLocaleString('bn-BD', { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  </div>
                )}
              </div>

              {viewingOrder.adminNote && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300">
                  <strong>নোট:</strong> {viewingOrder.adminNote}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-6 mt-4 border-t border-purple-900/30">
              <button
                type="button"
                onClick={() => setViewingOrder(null)}
                className="px-4 py-2 rounded-xl bg-[#0a0812] text-gray-400 text-xs font-semibold hover:text-white"
              >
                বন্ধ করুন
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = viewingOrder;
                  setViewingOrder(null);
                  handleOpenEdit(target);
                }}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
              >
                অর্ডারটি এডিট করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
