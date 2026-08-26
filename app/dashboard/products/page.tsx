'use client';

import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  Package,
  Plus,
  Search,
  Copy,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  Upload,
  Link as LinkIcon,
  Image as ImageIcon,
  X,
  Eye,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function ProductsPage() {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState('');
  const [selectedPage, setSelectedPage] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStock, setSelectedStock] = useState('ALL');

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [imageUploadMode, setImageUploadMode] = useState<'upload' | 'url'>('upload');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sku: '',
    category: '',
    price: '',
    discountPrice: '',
    stockQuantity: '10',
    stockStatus: 'IN_STOCK',
    imageUrl: '',
    deliveryInfo: '',
    productAiInstructions: '',
    pageId: 'ALL',
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedCategory !== 'ALL') params.append('category', selectedCategory);
      if (selectedStock !== 'ALL') params.append('stockStatus', selectedStock);
      if (selectedPage !== 'ALL') params.append('pageId', selectedPage);

      const [prodRes, pageRes] = await Promise.all([
        fetch(`/api/products?${params.toString()}`),
        fetch('/api/pages'),
      ]);

      const prodData = await prodRes.json();
      const pageData = await pageRes.json();

      if (prodData.success) {
        setProducts(prodData.products);
        setCategories(prodData.categories || []);
      }
      if (pageData.success) {
        setPages(pageData.pages);
      }
    } catch (e) {
      toast.error('প্রোডাক্ট লোড করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search, selectedPage, selectedCategory, selectedStock]);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({
      name: '',
      description: '',
      sku: '',
      category: '',
      price: '',
      discountPrice: '',
      stockQuantity: '10',
      stockStatus: 'IN_STOCK',
      imageUrl: '',
      deliveryInfo: '',
      productAiInstructions: '',
      pageId: selectedPage !== 'ALL' ? selectedPage : 'ALL',
    });
    setImageUploadMode('upload');
    setShowModal(true);
  };

  const handleOpenEdit = (p: any) => {
    setIsEditing(true);
    setCurrentId(p.id);
    setFormData({
      name: p.name,
      description: p.description || '',
      sku: p.sku || '',
      category: p.category || '',
      price: p.price.toString(),
      discountPrice: p.discountPrice ? p.discountPrice.toString() : '',
      stockQuantity: p.stockQuantity.toString(),
      stockStatus: p.stockStatus,
      imageUrl: p.imageUrl || '',
      deliveryInfo: p.deliveryInfo || '',
      productAiInstructions: p.productAiInstructions || '',
      pageId: p.pageId || 'ALL',
    });
    setImageUploadMode(p.imageUrl?.startsWith('data:') ? 'upload' : 'url');
    setShowModal(true);
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      toast.error('ছবির সাইজ সর্বোচ্চ ৪ মেগাবাইট হতে পারবে।');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setFormData((prev) => ({ ...prev, imageUrl: result }));
      toast.success('ছবি সফলভাবে যুক্ত হয়েছে!');
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = isEditing ? `/api/products/${currentId}` : '/api/products';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error || 'প্রোডাক্ট সংরক্ষণ ব্যর্থ হয়েছে।');
        setSaving(false);
        return;
      }

      toast.success(isEditing ? 'প্রোডাক্ট সফলভাবে আপডেট হয়েছে!' : 'নতুন প্রোডাক্ট যুক্ত হয়েছে!');
      setShowModal(false);
      fetchProducts();
    } catch (e) {
      toast.error('সার্ভার ত্রুটি।');
    } finally {
      setSaving(false);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}/duplicate`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        toast.success('প্রোডাক্ট সফলভাবে ডুপ্লিকেট হয়েছে!');
        fetchProducts();
      } else {
        toast.error(data.error || 'ডুপ্লিকেট করতে ব্যর্থ হয়েছে।');
      }
    } catch (e) {
      toast.error('ত্রুটি হয়েছে।');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`আপনি কি "${name}" মুছে ফেলতে চান?`)) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('প্রোডাক্ট মুছে ফেলা হয়েছে।');
        fetchProducts();
      } else {
        toast.error(data.error || 'মুছতে ব্যর্থ হয়েছে।');
      }
    } catch (e) {
      toast.error('ত্রুটি হয়েছে।');
    }
  };

  return (
    <DashboardLayout
      title="প্রোডাক্ট ইনভেন্টরি"
      subtitle="পেজ অনুযায়ী পণ্য তালিকা ও ছবি পরিচালনা; মেসেঞ্জারে AI গ্রাহকদের এই ডাটা থেকে সঠিক উত্তর ও ছবি পাঠাবে"
    >
      {/* Top Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="নাম, কোড (SKU) দিয়ে খুঁজুন..."
              className="w-full pl-10 pr-4 py-2 bg-[#12141c] border border-[#1f2433] rounded-xl text-white placeholder-gray-500 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Facebook Page Filter */}
          <div className="flex items-center gap-1.5 bg-[#12141c] border border-[#1f2433] rounded-xl px-2 py-1">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <select
              value={selectedPage}
              onChange={(e) => setSelectedPage(e.target.value)}
              className="bg-transparent text-xs text-gray-300 focus:outline-none py-1 pr-2"
            >
              <option value="ALL" className="bg-[#12141c] text-white">সকল Facebook Pages</option>
              {pages.map((pg) => (
                <option key={pg.id} value={pg.id} className="bg-[#12141c] text-white">
                  📄 {pg.pageName}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-[#12141c] border border-[#1f2433] rounded-xl text-xs text-gray-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">সকল ক্যাটাগরি</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Stock Filter */}
          <select
            value={selectedStock}
            onChange={(e) => setSelectedStock(e.target.value)}
            className="px-3 py-2 bg-[#12141c] border border-[#1f2433] rounded-xl text-xs text-gray-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">সকল স্টক অবস্থা</option>
            <option value="IN_STOCK">স্টকে আছে (In Stock)</option>
            <option value="OUT_OF_STOCK">স্টক শেষ (Out of Stock)</option>
            <option value="PRE_ORDER">প্রি-অর্ডার (Pre Order)</option>
          </select>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন প্রোডাক্ট যোগ করুন</span>
        </button>
      </div>

      {/* Product Grid / Cards */}
      {loading ? (
        <div className="py-24 text-center text-sm text-gray-400">প্রোডাক্ট লোড হচ্ছে...</div>
      ) : products.length === 0 ? (
        <div className="bg-[#12141c] border border-[#1f2433] rounded-3xl p-12 text-center max-w-xl mx-auto my-8">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto mb-4 border border-cyan-500/20">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">কোনো প্রোডাক্ট পাওয়া যায়নি</h3>
          <p className="text-xs text-gray-400 mb-6 leading-relaxed">
            AI যেন মেসেঞ্জারে গ্রাহকদের সঠিক দাম, বিবরণ ও পণ্যের ছবি দেখাতে পারে, সেজন্য আপনার প্রোডাক্টগুলো এখানে যুক্ত করুন।
          </p>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-colors"
          >
            <Plus className="w-4 h-4" /> নতুন প্রোডাক্ট যোগ করুন
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <div
              key={p.id}
              className="bg-[#12141c] border border-[#1f2433] hover:border-emerald-500/30 rounded-2xl p-5 transition-all shadow-lg flex flex-col justify-between group"
            >
              <div>
                {/* Product Image & Badges */}
                <div className="relative w-full h-48 rounded-xl bg-[#0a0c13] border border-[#1e2538] overflow-hidden mb-4 flex items-center justify-center">
                  {p.imageUrl ? (
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-gray-600">
                      <ImageIcon className="w-10 h-10 stroke-1" />
                      <span className="text-[11px]">ছবি নেই</span>
                    </div>
                  )}

                  {/* Price Tag */}
                  <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/10 text-xs font-bold text-emerald-400">
                    {p.discountPrice ? `${p.discountPrice} ৳` : `${p.price} ৳`}
                    {p.discountPrice && (
                      <span className="text-[10px] line-through text-gray-400 ml-1.5">{p.price} ৳</span>
                    )}
                  </div>

                  {/* Category Badge */}
                  {p.category && (
                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-[#12141c]/90 backdrop-blur-md text-[10px] font-semibold text-gray-300 border border-white/10">
                      {p.category}
                    </div>
                  )}

                  {/* Connected Page Badge */}
                  <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md text-[10px] font-semibold text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                    <Layers className="w-3 h-3 text-cyan-400" />
                    <span>{p.page ? p.page.pageName : 'সকল Page (Global)'}</span>
                  </div>
                </div>

                {/* Title & Description */}
                <h3 className="text-base font-bold text-white mb-1 line-clamp-1">{p.name}</h3>
                <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed mb-3">
                  {p.description || 'কোনো বিবরণ যোগ করা হয়নি।'}
                </p>

                {/* Stock and SKU */}
                <div className="flex items-center justify-between text-xs py-2 border-t border-[#1a1f2e] text-gray-400">
                  <div className="flex items-center gap-1.5">
                    {p.stockStatus === 'IN_STOCK' ? (
                      <span className="text-emerald-400 flex items-center gap-1 text-[11px] font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" /> স্টকে আছে ({p.stockQuantity}টি)
                      </span>
                    ) : p.stockStatus === 'PRE_ORDER' ? (
                      <span className="text-amber-400 flex items-center gap-1 text-[11px] font-medium">
                        <Clock className="w-3.5 h-3.5" /> প্রি-অর্ডার
                      </span>
                    ) : (
                      <span className="text-red-400 flex items-center gap-1 text-[11px] font-medium">
                        <XCircle className="w-3.5 h-3.5" /> স্টক শেষ
                      </span>
                    )}
                  </div>
                  {p.sku && <span className="font-mono text-[11px] text-gray-500">SKU: {p.sku}</span>}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2 pt-3 border-t border-[#1a1f2e] mt-2">
                <button
                  onClick={() => handleDuplicate(p.id)}
                  title="ডুপ্লিকেট করুন"
                  className="p-2 rounded-xl bg-[#1a1f2e] hover:bg-[#252c40] text-gray-300 hover:text-white transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleOpenEdit(p)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#1a1f2e] hover:bg-[#252c40] text-gray-200 text-xs font-semibold transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>এডিট</span>
                </button>
                <button
                  onClick={() => handleDelete(p.id, p.name)}
                  title="মুছে ফেলুন"
                  className="p-2 rounded-xl bg-[#1a1f2e] hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#12141c] border border-[#1f2433] rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative my-8">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">
              {isEditing ? 'প্রোডাক্ট তথ্য পরিবর্তন করুন' : 'নতুন প্রোডাক্ট যুক্ত করুন'}
            </h3>
            <p className="text-xs text-gray-400 mb-6">AI এই তথ্যের উপর ভিত্তি করে পেজের কাস্টমারদের উত্তর ও ছবি প্রদান করবে</p>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Facebook Page Assignment */}
              <div>
                <label className="block text-xs font-semibold text-cyan-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  <span>সংযুক্ত Facebook Page নির্ধারণ করুন</span>
                </label>
                <select
                  value={formData.pageId}
                  onChange={(e) => setFormData({ ...formData, pageId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#0a0c13] border border-cyan-500/30 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-400"
                >
                  <option value="ALL">🌐 সকল সংযুক্ত Facebook Pages (গ্লোবাল পণ্য)</option>
                  {pages.map((pg) => (
                    <option key={pg.id} value={pg.id}>
                      📄 {pg.pageName} (ID: {pg.facebookPageId})
                    </option>
                  ))}
                </select>
              </div>

              {/* Product Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                  পণ্যের নাম (Product Name) <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="যেমন: প্রিমিয়াম কটন পাঞ্জাবি"
                  className="w-full px-3.5 py-2 bg-[#0a0c13] border border-[#1e2538] rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Price & Discount */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                    মূল্য (Regular Price ৳) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="যেমন: 1850"
                    className="w-full px-3.5 py-2 bg-[#0a0c13] border border-[#1e2538] rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                    অফার মূল্য (Discount Price ৳)
                  </label>
                  <input
                    type="number"
                    value={formData.discountPrice}
                    onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                    placeholder="যেমন: 1490"
                    className="w-full px-3.5 py-2 bg-[#0a0c13] border border-[#1e2538] rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Category, SKU, Stock */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                    ক্যাটাগরি
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="পাঞ্জাবি / জুতা"
                    className="w-full px-3 py-2 bg-[#0a0c13] border border-[#1e2538] rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                    SKU / কোড
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="PJB-001"
                    className="w-full px-3 py-2 bg-[#0a0c13] border border-[#1e2538] rounded-xl text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                    স্টক অবস্থা
                  </label>
                  <select
                    value={formData.stockStatus}
                    onChange={(e) => setFormData({ ...formData, stockStatus: e.target.value })}
                    className="w-full px-2 py-2 bg-[#0a0c13] border border-[#1e2538] rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="IN_STOCK">ইন স্টক</option>
                    <option value="OUT_OF_STOCK">স্টক শেষ</option>
                    <option value="PRE_ORDER">প্রি-অর্ডার</option>
                  </select>
                </div>
              </div>

              {/* Product Image Section (Upload & URL) */}
              <div className="p-4 rounded-2xl bg-[#0a0c13] border border-[#1e2538] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-200 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-emerald-400" />
                    <span>প্রোডাক্টের ছবি (Product Image)</span>
                  </label>

                  <div className="flex items-center gap-1 bg-[#12141c] p-1 rounded-lg border border-[#1e2538]">
                    <button
                      type="button"
                      onClick={() => setImageUploadMode('upload')}
                      className={`px-2.5 py-1 rounded text-[10px] font-semibold transition-all ${
                        imageUploadMode === 'upload'
                          ? 'bg-emerald-500 text-black font-bold'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      ডিভাইস থেকে ফাইল
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageUploadMode('url')}
                      className={`px-2.5 py-1 rounded text-[10px] font-semibold transition-all ${
                        imageUploadMode === 'url'
                          ? 'bg-emerald-500 text-black font-bold'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Image URL
                    </button>
                  </div>
                </div>

                {/* Image Preview Box */}
                {formData.imageUrl && (
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#12141c] border border-emerald-500/30">
                    <div className="w-16 h-16 rounded-lg bg-black overflow-hidden shrink-0 border border-white/10">
                      <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-xs font-semibold text-emerald-400">ছবি সংযুক্ত আছে</p>
                      <p className="text-[10px] text-gray-400 truncate font-mono">{formData.imageUrl.substring(0, 45)}...</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, imageUrl: '' })}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                      title="ছবি বাতিল করুন"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Upload or URL Inputs */}
                {imageUploadMode === 'upload' ? (
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-3 px-4 rounded-xl border border-dashed border-[#2d374e] hover:border-emerald-500/50 bg-[#12141c]/50 hover:bg-[#12141c] text-gray-300 hover:text-emerald-400 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                    >
                      <Upload className="w-4 h-4 text-emerald-400" />
                      <span>{formData.imageUrl ? 'অন্য ছবি পরিবর্তন করুন' : 'কম্পিউটার/মোবাইল থেকে ছবি সিলেক্ট করুন'}</span>
                    </button>
                  </div>
                ) : (
                  <div>
                    <input
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      placeholder="https://example.com/product-image.jpg"
                      className="w-full px-3.5 py-2 bg-[#12141c] border border-[#1e2538] rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                  প্রোডাক্টের বিবরণ (Description)
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="উপাদান, সাইজ বা অন্যান্য বৈশিষ্ট্য..."
                  className="w-full px-3.5 py-2 bg-[#0a0c13] border border-[#1e2538] rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Delivery Info */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                  ডেলিভারি তথ্য
                </label>
                <input
                  type="text"
                  value={formData.deliveryInfo}
                  onChange={(e) => setFormData({ ...formData, deliveryInfo: e.target.value })}
                  placeholder="যেমন: ঢাকা ৭০ টাকা, বাইরে ১৩০ টাকা। ক্যাশ অন ডেলিভারি আছে।"
                  className="w-full px-3.5 py-2 bg-[#0a0c13] border border-[#1e2538] rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1e2538]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#1a1f2e] text-gray-300 text-xs font-semibold hover:bg-[#252c40]"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-bold text-xs shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  {saving ? 'সংরক্ষণ হচ্ছে...' : isEditing ? 'আপডেট করুন' : 'যোগ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
