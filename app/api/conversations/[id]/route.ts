import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { decrypt } from '@/lib/crypto';
import { sendMessengerText } from '@/lib/facebook';
import { logActivity } from '@/lib/logger';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth(req);
  if ('response' in auth) return auth.response;

  try {
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: params.id,
        userId: auth.user.id,
      },
      include: {
        page: {
          select: {
            id: true,
            pageName: true,
            facebookPageId: true,
            autoReplyEnabled: true,
            humanHandoffEnabled: true,
          },
        },
        orders: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { success: false, error: 'কথোপকথনটি খুঁজে পাওয়া যায়নি।' },
        { status: 404 }
      );
    }

    // Fetch messages
    const messages = await prisma.message.findMany({
      where: {
        conversationId: params.id,
        userId: auth.user.id,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Reset unread count
    if (conversation.unreadCount > 0) {
      await prisma.conversation.update({
        where: { id: params.id },
        data: { unreadCount: 0 },
      });
    }

    return NextResponse.json({
      success: true,
      conversation: {
        ...conversation,
        unreadCount: 0,
      },
      messages,
    });
  } catch (error: any) {
    console.error('Error fetching conversation details:', error);
    return NextResponse.json(
      { success: false, error: 'মেসেজ ইতিহাস লোড করতে সমস্যা হয়েছে।' },
      { status: 500 }
    );
  }
}

/**
 * Send manual human reply
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth(req);
  if ('response' in auth) return auth.response;

  try {
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: params.id,
        userId: auth.user.id,
      },
      include: {
        page: true,
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { success: false, error: 'কথোপকথনটি খুঁজে পাওয়া যায়নি।' },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { messageText } = body;

    if (!messageText || !messageText.trim()) {
      return NextResponse.json(
        { success: false, error: 'মেসেজের বিষয়বস্তু খালি হতে পারে না।' },
        { status: 400 }
      );
    }

    const cleanText = messageText.trim();
    const pageAccessToken = decrypt(conversation.page.pageAccessTokenEncrypted);

    // Send to Facebook Messenger Send API
    let fbResult = { success: true };
    if (pageAccessToken && !conversation.senderPsid.startsWith('demo_')) {
      fbResult = await sendMessengerText(conversation.senderPsid, cleanText, pageAccessToken);
      if (!fbResult.success) {
        return NextResponse.json(
          {
            success: false,
            error: `Messenger-এ মেসেজ পাঠাতে ব্যর্থ হয়েছে: ${(fbResult as any).error}`,
          },
          { status: 500 }
        );
      }
    }

    // Save outgoing human message to DB
    const savedMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        userId: auth.user.id,
        pageId: conversation.pageId,
        senderPsid: conversation.senderPsid,
        direction: 'OUTGOING',
        messageType: 'TEXT',
        messageText: cleanText,
        aiGenerated: false,
      },
    });

    // Update conversation last message
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        lastMessage: cleanText,
        lastMessageAt: new Date(),
      },
    });

    await logActivity({
      userId: auth.user.id,
      pageId: conversation.pageId,
      action: 'HUMAN_REPLY_SENT',
      description: `ম্যানুয়াল মেসেজ পাঠানো হয়েছে গ্রাহক ${conversation.customerName || conversation.senderPsid}-কে`,
    });

    return NextResponse.json({
      success: true,
      message: 'মেসেজ পাঠানো হয়েছে!',
      savedMessage,
    });
  } catch (error: any) {
    console.error('Error sending human message:', error);
    return NextResponse.json(
      { success: false, error: 'মেসেজ পাঠাতে সমস্যা হয়েছে।' },
      { status: 500 }
    );
  }
}

/**
 * Toggle AI Active / Human Mode
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth(req);
  if ('response' in auth) return auth.response;

  try {
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: params.id,
        userId: auth.user.id,
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { success: false, error: 'কথোপকথনটি খুঁজে পাওয়া যায়নি।' },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { aiEnabled, status } = body;

    const updateData: any = {};
    if (aiEnabled !== undefined) {
      updateData.aiEnabled = Boolean(aiEnabled);
      updateData.status = aiEnabled ? 'ACTIVE' : 'HUMAN_MODE';
    }
    if (status !== undefined) {
      updateData.status = status;
      if (status === 'HUMAN_MODE') updateData.aiEnabled = false;
      if (status === 'ACTIVE') updateData.aiEnabled = true;
    }

    const updated = await prisma.conversation.update({
      where: { id: params.id },
      data: updateData,
    });

    await logActivity({
      userId: auth.user.id,
      pageId: updated.pageId,
      action: updated.aiEnabled ? 'AI_RESUMED' : 'AI_PAUSED',
      description: `কথোপকথনে AI ${updated.aiEnabled ? 'চালু' : 'স্থগিত'} করা হয়েছে: ${updated.customerName || updated.senderPsid}`,
    });

    return NextResponse.json({
      success: true,
      message: updated.aiEnabled ? 'AI পুনরায় সক্রিয় করা হয়েছে।' : 'AI স্থগিত করা হয়েছে (Human Mode সক্রিয়)।',
      conversation: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে।' },
      { status: 500 }
    );
  }
}
