import prisma from './db';
import bcrypt from 'bcryptjs';

let isDbInitialized = false;

export async function ensureDatabaseReady() {
  if (isDbInitialized) return;

  try {
    // Test if User table exists by querying count
    await prisma.user.count();
  } catch (error: any) {
    console.warn('Database tables missing or uninitialized. Running self-healing schema creation...', error?.message);

    try {
      // Create all tables using raw SQL DDL
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "User" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "fullName" TEXT NOT NULL,
          "businessName" TEXT NOT NULL,
          "facebookPageUrl" TEXT,
          "email" TEXT NOT NULL UNIQUE,
          "passwordHash" TEXT NOT NULL,
          "phone" TEXT,
          "avatarUrl" TEXT,
          "role" TEXT NOT NULL DEFAULT 'USER',
          "status" TEXT NOT NULL DEFAULT 'ACTIVE',
          "plan" TEXT NOT NULL DEFAULT 'STARTER',
          "planStatus" TEXT NOT NULL DEFAULT 'INACTIVE',
          "monthlyMessageLimit" INTEGER NOT NULL DEFAULT 500,
          "messagesSentThisMonth" INTEGER NOT NULL DEFAULT 0,
          "planExpiresAt" DATETIME,
          "activePackageId" TEXT,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "AiSetting" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "userId" TEXT NOT NULL,
          "provider" TEXT NOT NULL DEFAULT 'GEMINI',
          "model" TEXT NOT NULL DEFAULT 'gemini-1.5-flash',
          "encryptedApiKey" TEXT,
          "temperature" REAL NOT NULL DEFAULT 0.7,
          "maxTokens" INTEGER NOT NULL DEFAULT 800,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          UNIQUE("userId", "provider")
        );
      `);

      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "ActivityLog" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "userId" TEXT NOT NULL,
          "pageId" TEXT,
          "action" TEXT NOT NULL,
          "description" TEXT NOT NULL,
          "metadata" TEXT,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "Package" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "name" TEXT NOT NULL,
          "slug" TEXT NOT NULL UNIQUE,
          "description" TEXT,
          "price" REAL NOT NULL DEFAULT 0,
          "durationDays" INTEGER NOT NULL DEFAULT 30,
          "messageLimit" INTEGER NOT NULL DEFAULT 1000,
          "pageLimit" INTEGER NOT NULL DEFAULT 1,
          "productLimit" INTEGER NOT NULL DEFAULT 50,
          "features" TEXT NOT NULL DEFAULT '[]',
          "isPopular" BOOLEAN NOT NULL DEFAULT 0,
          "isActive" BOOLEAN NOT NULL DEFAULT 1,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "PaymentMethod" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "name" TEXT NOT NULL UNIQUE,
          "displayName" TEXT NOT NULL,
          "accountType" TEXT NOT NULL DEFAULT 'PERSONAL',
          "accountNumber" TEXT NOT NULL,
          "instructions" TEXT,
          "qrCodeUrl" TEXT,
          "isActive" BOOLEAN NOT NULL DEFAULT 1,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "PackageOrder" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "orderNumber" TEXT NOT NULL UNIQUE,
          "userId" TEXT NOT NULL,
          "packageId" TEXT NOT NULL,
          "paymentMethodId" TEXT,
          "paymentMethodName" TEXT NOT NULL,
          "amount" REAL NOT NULL,
          "senderNumber" TEXT NOT NULL,
          "transactionId" TEXT NOT NULL,
          "status" TEXT NOT NULL DEFAULT 'PENDING',
          "adminNote" TEXT,
          "paymentProofUrl" TEXT,
          "approvedAt" DATETIME,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "Page" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "userId" TEXT NOT NULL,
          "facebookPageId" TEXT NOT NULL,
          "pageName" TEXT NOT NULL,
          "pageUsername" TEXT,
          "pageProfileImage" TEXT,
          "pageAccessTokenEncrypted" TEXT NOT NULL,
          "verifyTokenEncrypted" TEXT NOT NULL,
          "webhookUrl" TEXT,
          "webhookStatus" TEXT NOT NULL DEFAULT 'PENDING',
          "connectionStatus" TEXT NOT NULL DEFAULT 'CONNECTED',
          "autoReplyEnabled" BOOLEAN NOT NULL DEFAULT 1,
          "humanHandoffEnabled" BOOLEAN NOT NULL DEFAULT 1,
          "replyLanguage" TEXT NOT NULL DEFAULT 'AUTO',
          "replyStyle" TEXT NOT NULL DEFAULT 'FRIENDLY',
          "aiInstructions" TEXT,
          "productImageReply" BOOLEAN NOT NULL DEFAULT 1,
          "orderDetection" BOOLEAN NOT NULL DEFAULT 1,
          "voiceProcessing" BOOLEAN NOT NULL DEFAULT 1,
          "imageUnderstanding" BOOLEAN NOT NULL DEFAULT 1,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          UNIQUE("userId", "facebookPageId")
        );
      `);

      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "Product" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "userId" TEXT NOT NULL,
          "pageId" TEXT,
          "name" TEXT NOT NULL,
          "description" TEXT,
          "sku" TEXT,
          "category" TEXT,
          "price" REAL NOT NULL,
          "discountPrice" REAL,
          "stockQuantity" INTEGER NOT NULL DEFAULT 0,
          "stockStatus" TEXT NOT NULL DEFAULT 'IN_STOCK',
          "imageUrl" TEXT,
          "deliveryInfo" TEXT,
          "productAiInstructions" TEXT,
          "isActive" BOOLEAN NOT NULL DEFAULT 1,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "Conversation" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "userId" TEXT NOT NULL,
          "pageId" TEXT NOT NULL,
          "senderPsid" TEXT NOT NULL,
          "customerName" TEXT,
          "lastMessage" TEXT,
          "lastMessageAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "status" TEXT NOT NULL DEFAULT 'ACTIVE',
          "aiEnabled" BOOLEAN NOT NULL DEFAULT 1,
          "unreadCount" INTEGER NOT NULL DEFAULT 0,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          UNIQUE("pageId", "senderPsid")
        );
      `);

      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "Message" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "conversationId" TEXT NOT NULL,
          "userId" TEXT NOT NULL,
          "pageId" TEXT NOT NULL,
          "senderPsid" TEXT NOT NULL,
          "direction" TEXT NOT NULL,
          "messageType" TEXT NOT NULL DEFAULT 'TEXT',
          "messageText" TEXT,
          "mediaUrl" TEXT,
          "transcription" TEXT,
          "aiGenerated" BOOLEAN NOT NULL DEFAULT 0,
          "aiModel" TEXT,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "Order" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "userId" TEXT NOT NULL,
          "pageId" TEXT NOT NULL,
          "conversationId" TEXT,
          "customerName" TEXT NOT NULL,
          "phone" TEXT NOT NULL,
          "address" TEXT NOT NULL,
          "product" TEXT NOT NULL,
          "productId" TEXT,
          "quantity" INTEGER NOT NULL DEFAULT 1,
          "price" REAL NOT NULL DEFAULT 0,
          "totalPrice" REAL NOT NULL DEFAULT 0,
          "notes" TEXT,
          "status" TEXT NOT NULL DEFAULT 'PENDING',
          "source" TEXT NOT NULL DEFAULT 'MESSENGER_AI',
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "SystemSetting" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "key" TEXT NOT NULL UNIQUE,
          "value" TEXT NOT NULL,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "LicenseKey" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "key" TEXT NOT NULL UNIQUE,
          "plan" TEXT NOT NULL DEFAULT 'STARTER',
          "packageId" TEXT,
          "durationDays" INTEGER NOT NULL DEFAULT 30,
          "messageLimit" INTEGER NOT NULL DEFAULT 1000,
          "pageLimit" INTEGER NOT NULL DEFAULT 1,
          "productLimit" INTEGER NOT NULL DEFAULT 50,
          "clientName" TEXT,
          "clientPhone" TEXT,
          "clientNote" TEXT,
          "status" TEXT NOT NULL DEFAULT 'ACTIVE',
          "usedByUserId" TEXT,
          "usedAt" DATETIME,
          "expiresAt" DATETIME,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);
    } catch (ddlErr) {
      console.warn('Raw table creation error:', ddlErr);
    }
  }

  try {
    // 1. Seed default Admin account if not present
    const existingAdmin = await prisma.user.findFirst({
      where: {
        OR: [
          { role: 'ADMIN' },
          { email: 'admin@replyx.ai' },
          { email: 'admin@gmail.com' },
        ],
      },
    });

    if (!existingAdmin) {
      const defaultPasswordHash = await bcrypt.hash('admin123', 10);
      await prisma.user.create({
        data: {
          id: 'usr_admin_default',
          fullName: 'Super Admin',
          businessName: 'ReplyX AI Platform',
          email: 'admin@replyx.ai',
          passwordHash: defaultPasswordHash,
          role: 'ADMIN',
          status: 'ACTIVE',
          plan: 'PRO',
          planStatus: 'ACTIVE',
          monthlyMessageLimit: 999999,
        },
      });
    }

    // 2. Seed default packages if empty
    const pkgCount = await prisma.package.count();
    if (pkgCount === 0) {
      await prisma.package.createMany({
        data: [
          {
            id: 'pkg_starter',
            name: 'স্টার্টার প্যাকেজ',
            slug: 'starter',
            description: 'ছোট ব্যবসার জন্য আদর্শ AI অটোমেশন প্যাকেজ',
            price: 990,
            durationDays: 30,
            messageLimit: 1000,
            pageLimit: 1,
            productLimit: 50,
            features: JSON.stringify(['১টি ফেসবুক পেজ অটোমেশন', '১,০০০ চ্যাট অটো-রিপ্লাই', 'বাংলা ও ইংলিশ এআই রিপ্লাই', 'অর্ডার নেওয়ার সুবিধা']),
            isPopular: false,
            isActive: true,
          },
          {
            id: 'pkg_business',
            name: 'বিজনেস প্যাকেজ',
            slug: 'business',
            description: 'মাঝারি সাইজের পেজের জন্য সবচেয়ে জনপ্রিয় প্যাকেজ',
            price: 1990,
            durationDays: 30,
            messageLimit: 3000,
            pageLimit: 3,
            productLimit: 200,
            features: JSON.stringify(['৩টি ফেসবুক পেজ সংযোগ', '৩,০০০ চ্যাট অটো-রিপ্লাই', 'প্রোডাক্ট ছবি দেখে ছবিসহ উত্তর', 'মেসেঞ্জারে অটোমেটিক অর্ডার']),
            isPopular: true,
            isActive: true,
          },
          {
            id: 'pkg_pro',
            name: 'প্রো প্যাকেজ',
            slug: 'pro',
            description: 'বড় ই-কমার্স পেজের জন্য আনলিমিটেড স্কেলিং প্যাকেজ',
            price: 3490,
            durationDays: 30,
            messageLimit: 10000,
            pageLimit: 10,
            productLimit: 1000,
            features: JSON.stringify(['১০টি ফেসবুক পেজ কানেকশন', '১০,০০০ চ্যাট অটো-রিপ্লাই', 'ভয়েস ও টেক্সট দুই চ্যাটেই রিপ্লাই', 'প্রাইওরিটি কাস্টমার সাপোর্ট']),
            isPopular: false,
            isActive: true,
          },
        ],
      });
    }

    // 3. Seed default payment methods if empty
    const pmCount = await prisma.paymentMethod.count();
    if (pmCount === 0) {
      await prisma.paymentMethod.createMany({
        data: [
          {
            id: 'pm_bkash',
            name: 'BKASH',
            displayName: 'বিকাশ (Personal)',
            accountType: 'Personal',
            accountNumber: '01700000000',
            instructions: 'বিকাশ অ্যাপ বা *247# ডায়াল করে Send Money করুন।',
            isActive: true,
          },
          {
            id: 'pm_nagad',
            name: 'NAGAD',
            displayName: 'নগদ (Personal)',
            accountType: 'Personal',
            accountNumber: '01700000000',
            instructions: 'নগদ অ্যাপ বা *167# ডায়াল করে Send Money করুন।',
            isActive: true,
          },
          {
            id: 'pm_rocket',
            name: 'ROCKET',
            displayName: 'রকেট (Personal)',
            accountType: 'Personal',
            accountNumber: '01700000000',
            instructions: 'রকেট অ্যাপ বা *322# ডায়াল করে Send Money করুন।',
            isActive: true,
          },
        ],
      });
    }

    isDbInitialized = true;
    console.log('Database self-healing schema creation & seeding completed successfully.');
  } catch (err) {
    console.error('Error during database self-healing initialization:', err);
  }
}
