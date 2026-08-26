import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { encrypt, decrypt, maskToken } from '@/lib/crypto';
import { testPageConnection } from '@/lib/facebook';
import { logActivity } from '@/lib/logger';

import { getFacebookWebhookUrl } from '@/lib/url';

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if ('response' in auth) return auth.response;

  try {
    const currentWebhookUrl = getFacebookWebhookUrl(req);
    const pages = await prisma.page.findMany({
      where: { userId: auth.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            conversations: true,
            orders: true,
            products: true,
          },
        },
      },
    });

    const safePages = pages.map((page) => {
      const rawVerifyToken = decrypt(page.verifyTokenEncrypted);
      return {
        id: page.id,
        facebookPageId: page.facebookPageId,
        pageName: page.pageName,
        pageUsername: page.pageUsername,
        pageProfileImage: page.pageProfileImage,
        webhookUrl: currentWebhookUrl,
        verifyToken: rawVerifyToken,
        maskedAccessToken: maskToken(decrypt(page.pageAccessTokenEncrypted)),
        webhookStatus: page.webhookStatus,
        connectionStatus: page.connectionStatus,
        autoReplyEnabled: page.autoReplyEnabled,
        humanHandoffEnabled: page.humanHandoffEnabled,
        replyLanguage: page.replyLanguage,
        replyStyle: page.replyStyle,
        aiInstructions: page.aiInstructions,
        productImageReply: page.productImageReply,
        orderDetection: page.orderDetection,
        voiceProcessing: page.voiceProcessing,
        imageUnderstanding: page.imageUnderstanding,
        createdAt: page.createdAt,
        counts: {
          conversations: page._count.conversations,
          orders: page._count.orders,
          products: page._count.products,
        },
      };
    });

    return NextResponse.json({ success: true, pages: safePages });
  } catch (error: any) {
    console.error('Error fetching pages:', error);
    return NextResponse.json(
      { success: false, error: 'Facebook পেজ তালিকা লোড করতে সমস্যা হয়েছে।' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if ('response' in auth) return auth.response;

  try {
    const body = await req.json();
    const { pageName, facebookPageId, pageAccessToken, aiInstructions, replyLanguage, replyStyle } = body;

    if (!pageName || !facebookPageId || !pageAccessToken) {
      return NextResponse.json(
        { success: false, error: 'Page Name, Facebook Page ID এবং Page Access Token আবশ্যক।' },
        { status: 400 }
      );
    }

    const cleanPageId = facebookPageId.trim();
    const cleanToken = pageAccessToken.trim();

    // Check if user already connected this page
    const existing = await prisma.page.findUnique({
      where: {
        userId_facebookPageId: {
          userId: auth.user.id,
          facebookPageId: cleanPageId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'এই Facebook Page-টি ইতিমধ্যে আপনার অ্যাকাউন্টে সংযুক্ত রয়েছে।' },
        { status: 409 }
      );
    }

    // Test connection with Facebook Graph API
    const testResult = await testPageConnection(cleanPageId, cleanToken);

    // Generate random verify token for Webhook
    const rawVerifyToken = `replyx_verify_${crypto.randomBytes(16).toString('hex')}`;
    const webhookUrl = getFacebookWebhookUrl(req);

    const newPage = await prisma.page.create({
      data: {
        userId: auth.user.id,
        facebookPageId: cleanPageId,
        pageName: pageName.trim(),
        pageUsername: testResult.pageUsername || null,
        pageAccessTokenEncrypted: encrypt(cleanToken),
        verifyTokenEncrypted: encrypt(rawVerifyToken),
        webhookUrl,
        webhookStatus: 'PENDING',
        connectionStatus: testResult.success ? 'CONNECTED' : 'TOKEN_EXPIRED',
        aiInstructions: aiInstructions || null,
        replyLanguage: replyLanguage || 'AUTO',
        replyStyle: replyStyle || 'FRIENDLY',
      },
    });

    await logActivity({
      userId: auth.user.id,
      pageId: newPage.id,
      action: 'PAGE_CONNECTED',
      description: `নতুন Facebook Page সংযুক্ত করা হয়েছে: ${newPage.pageName} (ID: ${newPage.facebookPageId})`,
    });

    return NextResponse.json({
      success: true,
      message: testResult.success
        ? 'Facebook Page সফলভাবে সংযুক্ত হয়েছে!'
        : 'Facebook Page সংযুক্ত হয়েছে, কিন্তু Access Token ভ্যালিডেশনে সতর্কতা পাওয়া গেছে।',
      page: {
        id: newPage.id,
        facebookPageId: newPage.facebookPageId,
        pageName: newPage.pageName,
        webhookUrl: newPage.webhookUrl,
        verifyToken: rawVerifyToken,
        connectionStatus: newPage.connectionStatus,
      },
    });
  } catch (error: any) {
    console.error('Error creating page:', error);
    return NextResponse.json(
      { success: false, error: 'Facebook Page সংযুক্ত করতে সমস্যা হয়েছে।' },
      { status: 500 }
    );
  }
}
