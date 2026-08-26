import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { encrypt, decrypt, maskToken } from '@/lib/crypto';
import { testPageConnection } from '@/lib/facebook';
import { logActivity } from '@/lib/logger';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth(req);
  if ('response' in auth) return auth.response;

  try {
    const page = await prisma.page.findFirst({
      where: {
        id: params.id,
        userId: auth.user.id,
      },
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

    if (!page) {
      return NextResponse.json(
        { success: false, error: 'পেজটি খুঁজে পাওয়া যায়নি।' },
        { status: 404 }
      );
    }

    const rawVerifyToken = decrypt(page.verifyTokenEncrypted);
    const rawAccessToken = decrypt(page.pageAccessTokenEncrypted);

    return NextResponse.json({
      success: true,
      page: {
        ...page,
        verifyToken: rawVerifyToken,
        maskedAccessToken: maskToken(rawAccessToken),
        pageAccessTokenEncrypted: undefined,
        verifyTokenEncrypted: undefined,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'পেজ বিস্তারিত লোড করতে সমস্যা হয়েছে।' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth(req);
  if ('response' in auth) return auth.response;

  try {
    const page = await prisma.page.findFirst({
      where: {
        id: params.id,
        userId: auth.user.id,
      },
    });

    if (!page) {
      return NextResponse.json(
        { success: false, error: 'পেজটি খুঁজে পাওয়া যায়নি।' },
        { status: 404 }
      );
    }

    const body = await req.json();
    const updateData: any = {};

    if (body.pageName !== undefined) updateData.pageName = body.pageName.trim();
    if (body.autoReplyEnabled !== undefined) updateData.autoReplyEnabled = Boolean(body.autoReplyEnabled);
    if (body.humanHandoffEnabled !== undefined) updateData.humanHandoffEnabled = Boolean(body.humanHandoffEnabled);
    if (body.replyLanguage !== undefined) updateData.replyLanguage = body.replyLanguage;
    if (body.replyStyle !== undefined) updateData.replyStyle = body.replyStyle;
    if (body.aiInstructions !== undefined) updateData.aiInstructions = body.aiInstructions;
    if (body.productImageReply !== undefined) updateData.productImageReply = Boolean(body.productImageReply);
    if (body.orderDetection !== undefined) updateData.orderDetection = Boolean(body.orderDetection);
    if (body.voiceProcessing !== undefined) updateData.voiceProcessing = Boolean(body.voiceProcessing);
    if (body.imageUnderstanding !== undefined) updateData.imageUnderstanding = Boolean(body.imageUnderstanding);

    if (body.pageAccessToken && body.pageAccessToken.trim().length > 0 && !body.pageAccessToken.includes('••••')) {
      const cleanToken = body.pageAccessToken.trim();
      updateData.pageAccessTokenEncrypted = encrypt(cleanToken);

      const testRes = await testPageConnection(page.facebookPageId, cleanToken);
      updateData.connectionStatus = testRes.success ? 'CONNECTED' : 'TOKEN_EXPIRED';
    }

    const updatedPage = await prisma.page.update({
      where: { id: params.id },
      data: updateData,
    });

    await logActivity({
      userId: auth.user.id,
      pageId: updatedPage.id,
      action: 'PAGE_UPDATED',
      description: `পেজের সেটিংস আপডেট করা হয়েছে: ${updatedPage.pageName}`,
    });

    return NextResponse.json({
      success: true,
      message: 'পেজ সেটিংস সফলভাবে আপডেট করা হয়েছে।',
      page: updatedPage,
    });
  } catch (error: any) {
    console.error('Error updating page:', error);
    return NextResponse.json(
      { success: false, error: 'পেজ আপডেট করতে সমস্যা হয়েছে।' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth(req);
  if ('response' in auth) return auth.response;

  try {
    const page = await prisma.page.findFirst({
      where: {
        id: params.id,
        userId: auth.user.id,
      },
    });

    if (!page) {
      return NextResponse.json(
        { success: false, error: 'পেজটি খুঁজে পাওয়া যায়নি।' },
        { status: 404 }
      );
    }

    await prisma.page.delete({
      where: { id: params.id },
    });

    await logActivity({
      userId: auth.user.id,
      action: 'PAGE_DISCONNECTED',
      description: `Facebook Page মুছে ফেলা হয়েছে: ${page.pageName} (ID: ${page.facebookPageId})`,
    });

    return NextResponse.json({
      success: true,
      message: 'পেজটি সফলভাবে মুছে ফেলা হয়েছে।',
    });
  } catch (error: any) {
    console.error('Error deleting page:', error);
    return NextResponse.json(
      { success: false, error: 'পেজ মুছে ফেলতে সমস্যা হয়েছে।' },
      { status: 500 }
    );
  }
}
