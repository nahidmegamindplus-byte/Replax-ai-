import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAdmin, hashPassword } from '@/lib/auth';
import { encrypt } from '@/lib/crypto';
import { logActivity } from '@/lib/logger';

export async function POST(req: NextRequest) {
  const adminAuth = await requireAdmin(req);
  if ('response' in adminAuth) return adminAuth.response;

  try {
    const demoEmail = 'demo@replyx.ai';

    // 1. Check or create demo user
    let demoUser = await prisma.user.findUnique({
      where: { email: demoEmail },
    });

    if (!demoUser) {
      const passwordHash = await hashPassword('demo123456');
      demoUser = await prisma.user.create({
        data: {
          fullName: 'তানভীর আহমেদ',
          businessName: 'স্টাইলিশ ফ্যাশন বিডি (Stylish Fashion BD)',
          email: demoEmail,
          passwordHash,
          phone: '01711223344',
          role: 'USER',
          status: 'ACTIVE',
          plan: 'PRO',
        },
      });
    }

    // 2. Create Demo AI Settings
    await prisma.aiSetting.upsert({
      where: { userId_provider: { userId: demoUser.id, provider: 'GEMINI' } },
      update: { model: 'gemini-1.5-flash', temperature: 0.7, maxTokens: 800 },
      create: {
        userId: demoUser.id,
        provider: 'GEMINI',
        model: 'gemini-1.5-flash',
        temperature: 0.7,
        maxTokens: 800,
      },
    });

    // 3. Create Demo Facebook Page
    const demoPage = await prisma.page.upsert({
      where: {
        userId_facebookPageId: {
          userId: demoUser.id,
          facebookPageId: 'demo_page_stylish_fashion_101',
        },
      },
      update: {
        pageName: 'Stylish Fashion BD — Official Page',
        connectionStatus: 'CONNECTED',
        webhookStatus: 'ACTIVE',
        autoReplyEnabled: true,
        replyLanguage: 'BANGLA',
        replyStyle: 'FRIENDLY',
      },
      create: {
        userId: demoUser.id,
        facebookPageId: 'demo_page_stylish_fashion_101',
        pageName: 'Stylish Fashion BD — Official Page',
        pageUsername: 'stylishfashionbd.official',
        pageAccessTokenEncrypted: encrypt('EAAB_demo_facebook_page_access_token_replyx_ai_sample'),
        verifyTokenEncrypted: encrypt('replyx_verify_demo_token_12345678'),
        webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/webhooks/facebook`,
        webhookStatus: 'ACTIVE',
        connectionStatus: 'CONNECTED',
        autoReplyEnabled: true,
        humanHandoffEnabled: true,
        replyLanguage: 'BANGLA',
        replyStyle: 'FRIENDLY',
        aiInstructions: 'গ্রাহকের সাথে অত্যন্ত নম্র ও আন্তরিকভাবে কথা বলবেন। সকল পণ্যের ক্যাশ অন ডেলিভারি সুবিধা রয়েছে। অর্ডার নিশ্চিত করতে নাম, ঠিকানা ও ফোন নম্বর সংগ্রহ করবেন।',
      },
    });

    // 4. Create Demo Products
    const sampleProducts = [
      {
        name: 'প্রিমিয়াম প্রিমিয়াম কটন পাঞ্জাবি (কালো ও মেরুন)',
        description: '১০০% পিওর কটন ফেব্রিক, এক্সক্লুসিভ অ্যামব্রয়ডারি ডিজাইন ও আরামদায়ক ফিটিং।',
        sku: 'PJB-001',
        category: 'পাঞ্জাবি',
        price: 1850,
        discountPrice: 1490,
        stockQuantity: 45,
        stockStatus: 'IN_STOCK',
        imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=60',
        deliveryInfo: 'সারা দেশে ২-৩ দিনের মধ্যে হোম ডেলিভারি। ডেলিভারি চার্জ: ঢাকা ৭০ টাকা, ঢাকার বাইরে ১৩০ টাকা।',
      },
      {
        name: 'জেনুইন লেদার প্রিমিয়াম ওয়ালেট',
        description: 'আসল চামড়ার তৈরি মসৃণ ও টেকসই ওয়ালেট। ৮টি কার্ড স্লট এবং ২ টি ক্যাশ চেম্বার।',
        sku: 'WLT-102',
        category: 'এক্সেসরিজ',
        price: 1200,
        discountPrice: 950,
        stockQuantity: 30,
        stockStatus: 'IN_STOCK',
        imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop&q=60',
        deliveryInfo: 'হোম ডেলিভারি সুবিধা। ক্যাশ অন ডেলিভারি প্রযোজ্য।',
      },
      {
        name: 'আল্ট্রা লাইটওয়েট স্পোর্টস স্নিকার্স (সাদা/কালো)',
        description: 'দৈনন্দিন রানিং এবং ক্যাজুয়াল ব্যবহারের জন্য অত্যন্ত আরামদায়ক ও দীর্ঘস্থায়ী জুতা।',
        sku: 'SNK-303',
        category: 'জুতা',
        price: 2450,
        discountPrice: 1990,
        stockQuantity: 20,
        stockStatus: 'IN_STOCK',
        imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=60',
        deliveryInfo: 'সাইজ পরিবর্তনযোগ্য (রিপ্লেসমেন্ট গ্যারান্টি ৭ দিন)।',
      },
      {
        name: 'খাঁটি রাজশাহী সিল্ক শাড়ি (ব্লু অ্যান্ড গোল্ড)',
        description: 'ঐতিহ্যবাহী রাজশাহী রেশমি সিল্ক, চমৎকার জরি ওয়ার্ক ও সফট গ্লসি টেক্সচার।',
        sku: 'SRI-504',
        category: 'শাড়ি',
        price: 4200,
        discountPrice: 3600,
        stockQuantity: 12,
        stockStatus: 'IN_STOCK',
        imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=60',
        deliveryInfo: 'ফ্রি হোম ডেলিভারি।',
      },
    ];

    for (const p of sampleProducts) {
      await prisma.product.upsert({
        where: { id: `demo_prod_${p.sku}` },
        update: { ...p, userId: demoUser.id, pageId: demoPage.id, isActive: true },
        create: {
          id: `demo_prod_${p.sku}`,
          userId: demoUser.id,
          pageId: demoPage.id,
          ...p,
          isActive: true,
        },
      });
    }

    // 5. Create Demo Conversations & Messages
    const conv1 = await prisma.conversation.upsert({
      where: { pageId_senderPsid: { pageId: demoPage.id, senderPsid: 'demo_cust_001' } },
      update: {
        customerName: 'রাকিবুল হাসান',
        lastMessage: 'অর্ডারটি কনফার্ম করতে আমার নাম ও ঠিকানা দিলাম।',
        lastMessageAt: new Date(),
        status: 'ACTIVE',
        aiEnabled: true,
      },
      create: {
        userId: demoUser.id,
        pageId: demoPage.id,
        senderPsid: 'demo_cust_001',
        customerName: 'রাকিবুল হাসান',
        lastMessage: 'অর্ডারটি কনফার্ম করতে আমার নাম ও ঠিকানা দিলাম।',
        lastMessageAt: new Date(),
        status: 'ACTIVE',
        aiEnabled: true,
        unreadCount: 0,
      },
    });

    // Messages for conv1
    await prisma.message.createMany({
      data: [
        {
          conversationId: conv1.id,
          userId: demoUser.id,
          pageId: demoPage.id,
          senderPsid: 'demo_cust_001',
          direction: 'INCOMING',
          messageType: 'TEXT',
          messageText: 'ভাইয়া কটন পাঞ্জাবির দাম কত? সাইজ ৪০ আছে?',
          createdAt: new Date(Date.now() - 3600000 * 2),
        },
        {
          conversationId: conv1.id,
          userId: demoUser.id,
          pageId: demoPage.id,
          senderPsid: 'demo_cust_001',
          direction: 'OUTGOING',
          messageType: 'TEXT',
          messageText: 'নমস্কার! আমাদের প্রিমিয়াম কটন পাঞ্জাবির ডিসকাউন্ট মূল্য ১,৪৯০ টাকা (নিয়মিত ১,৮৫০ টাকা)। জি, ৪০ সাইজ বর্তমানে স্টকে আছে! আপনি কি এটি নিতে চাচ্ছেন?',
          aiGenerated: true,
          aiModel: 'gemini-1.5-flash',
          createdAt: new Date(Date.now() - 3600000 * 2 + 15000),
        },
        {
          conversationId: conv1.id,
          userId: demoUser.id,
          pageId: demoPage.id,
          senderPsid: 'demo_cust_001',
          direction: 'INCOMING',
          messageType: 'TEXT',
          messageText: 'হ্যাঁ, আমি একটা নিব। ক্যাশ অন ডেলিভারি হবে?',
          createdAt: new Date(Date.now() - 3600000),
        },
        {
          conversationId: conv1.id,
          userId: demoUser.id,
          pageId: demoPage.id,
          senderPsid: 'demo_cust_001',
          direction: 'OUTGOING',
          messageType: 'TEXT',
          messageText: 'জি অবশ্যই! সারা দেশে ক্যাশ অন ডেলিভারি সুবিধা আছে। অর্ডার কনফার্ম করতে আপনার সম্পূর্ণ নাম, মোবাইল নম্বর এবং ডেলিভারির ঠিকানাটি দিন।',
          aiGenerated: true,
          aiModel: 'gemini-1.5-flash',
          createdAt: new Date(Date.now() - 3600000 + 10000),
        },
        {
          conversationId: conv1.id,
          userId: demoUser.id,
          pageId: demoPage.id,
          senderPsid: 'demo_cust_001',
          direction: 'INCOMING',
          messageType: 'TEXT',
          messageText: 'নাম: রাকিবুল হাসান\nফোন: 01819887766\nঠিকানা: হাউজ #১২, রোড #৪, ধানমন্ডি, ঢাকা।',
          createdAt: new Date(Date.now() - 1800000),
        },
        {
          conversationId: conv1.id,
          userId: demoUser.id,
          pageId: demoPage.id,
          senderPsid: 'demo_cust_001',
          direction: 'OUTGOING',
          messageType: 'TEXT',
          messageText: 'ধন্যবাদ রাকিবুল হাসান সাহেব! আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে। মোট মূল্য: ১,৪৯০ টাকা + ৭০ টাকা ডেলিভারি চার্জ = ১,৫৬০ টাকা। আমাদের টিম খুব শীঘ্রই ডেলিভারির জন্য যোগাযোগ করবে।',
          aiGenerated: true,
          aiModel: 'gemini-1.5-flash',
          createdAt: new Date(Date.now() - 1800000 + 8000),
        },
      ],
    });

    // 6. Create Demo Order
    await prisma.order.upsert({
      where: { id: 'demo_order_001' },
      update: {
        status: 'CONFIRMED',
        totalPrice: 1560,
      },
      create: {
        id: 'demo_order_001',
        userId: demoUser.id,
        pageId: demoPage.id,
        conversationId: conv1.id,
        customerName: 'রাকিবুল হাসান',
        phone: '01819887766',
        address: 'হাউজ #১২, রোড #৪, ধানমন্ডি, ঢাকা',
        product: 'প্রিমিয়াম প্রিমিয়াম কটন পাঞ্জাবি (সাইজ ৪০)',
        productId: 'demo_prod_PJB-001',
        quantity: 1,
        price: 1490,
        totalPrice: 1560,
        notes: 'ক্যাশ অন ডেলিভারি (ধানমন্ডি)',
        status: 'CONFIRMED',
        source: 'MESSENGER_AI',
      },
    });

    await logActivity({
      userId: adminAuth.user.id,
      action: 'DEMO_DATA_SEEDED',
      description: `ডেমো ডাটা সফলভাবে তৈরি করা হয়েছে (ব্যবহারকারী: ${demoEmail})`,
    });

    return NextResponse.json({
      success: true,
      message: 'ডেমো ডাটা (ব্যবহারকারী, পেজ, প্রোডাক্ট, মেসেজ ও অর্ডার) সফলভাবে তৈরি হয়েছে!',
      demoUser: {
        email: demoEmail,
        password: 'demo123456',
      },
    });
  } catch (error: any) {
    console.error('Error seeding demo data:', error);
    return NextResponse.json(
      { success: false, error: 'ডেমো ডাটা তৈরিতে ত্রুটি হয়েছে।' },
      { status: 500 }
    );
  }
}
