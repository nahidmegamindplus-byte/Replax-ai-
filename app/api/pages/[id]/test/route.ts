import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { decrypt } from '@/lib/crypto';
import { testPageConnection } from '@/lib/facebook';

export async function POST(
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

    const accessToken = decrypt(page.pageAccessTokenEncrypted);
    const testResult = await testPageConnection(page.facebookPageId, accessToken);

    // Update connection status in DB
    const newStatus = testResult.success ? 'CONNECTED' : 'TOKEN_EXPIRED';
    await prisma.page.update({
      where: { id: page.id },
      data: {
        connectionStatus: newStatus,
        pageName: testResult.pageName || page.pageName,
        pageUsername: testResult.pageUsername || page.pageUsername,
      },
    });

    if (testResult.success) {
      return NextResponse.json({
        success: true,
        message: 'Facebook Page সফলভাবে connected। Graph API এক্সেস সক্রিয় আছে।',
        pageName: testResult.pageName,
        pageUsername: testResult.pageUsername,
      });
    } else {
      return NextResponse.json({
        success: false,
        error: testResult.error || 'Facebook connection-এ সমস্যা হয়েছে। অনুগ্রহ করে Page settings থেকে Token যাচাই করুন।',
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'কানেকশন টেস্ট প্রক্রিয়ায় ত্রুটি ঘটেছে।' },
      { status: 500 }
    );
  }
}
