import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { generateAIReply } from '@/lib/ai';

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if ('response' in auth) return auth.response;

  try {
    const body = await req.json();
    const { pageId, message, imageUrl, history = [] } = body;

    let targetPageId = pageId;
    if (!targetPageId || targetPageId === 'ALL') {
      const firstPage = await prisma.page.findFirst({
        where: { userId: auth.user.id },
      });
      if (firstPage) {
        targetPageId = firstPage.id;
      } else {
        const anyPage = await prisma.page.findFirst();
        if (anyPage) targetPageId = anyPage.id;
      }
    }

    if (!targetPageId) {
      // Create a default demo page context if none exists in entire database
      const defaultPage = await prisma.page.create({
        data: {
          userId: auth.user.id,
          facebookPageId: `demo_page_${Date.now()}`,
          pageName: 'ReplyX AI Demo Store',
          pageAccessTokenEncrypted: 'mock_token',
          verifyTokenEncrypted: 'mock_verify',
          webhookStatus: 'ACTIVE',
          connectionStatus: 'CONNECTED',
        },
      });
      targetPageId = defaultPage.id;
    }

    const aiResult = await generateAIReply({
      userId: auth.user.id,
      pageId: targetPageId,
      senderPsid: 'sandbox_test_user',
      incomingText: message || '',
      incomingImageUrl: imageUrl || undefined,
      conversationHistory: history,
    });

    return NextResponse.json({
      success: true,
      reply: aiResult.replyText,
      matchedProduct: aiResult.matchedProduct,
      detectedOrder: aiResult.detectedOrder,
      model: aiResult.aiModel,
      provider: aiResult.provider,
    });
  } catch (error: any) {
    console.error('Test chat error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'AI টেস্ট চ্যাটে ত্রুটি হয়েছে।' },
      { status: 500 }
    );
  }
}
