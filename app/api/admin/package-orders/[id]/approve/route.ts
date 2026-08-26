import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { logActivity } from '@/lib/logger';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin(req);
  if ('response' in auth) return auth.response;

  try {
    const { id } = params;

    const order = await prisma.packageOrder.findUnique({
      where: { id },
      include: {
        package: true,
        user: true,
      },
    });

    if (!order) {
      return NextResponse.json({ success: false, error: 'অর্ডারটি পাওয়া যায়নি।' }, { status: 404 });
    }

    if (order.status === 'APPROVED') {
      return NextResponse.json({ success: false, error: 'এই অর্ডারটি ইতিমধ্যে অনুমোদিত।' }, { status: 400 });
    }

    const durationDays = order.package.durationDays || 30;
    const expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);

    // 1. Update order status
    const updatedOrder = await prisma.packageOrder.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
      },
    });

    // 2. Activate user package & plan
    await prisma.user.update({
      where: { id: order.userId },
      data: {
        planStatus: 'ACTIVE',
        plan: order.package.slug.toUpperCase(),
        activePackageId: order.package.id,
        monthlyMessageLimit: order.package.messageLimit,
        planExpiresAt: expiresAt,
      },
    });

    await logActivity({
      userId: auth.user.id,
      action: 'PACKAGE_ORDER_APPROVED',
      description: `প্যাকেজ অর্ডার অনুমোদিত: ${order.user.businessName} (${order.user.email}) -> ${order.package.name} (৳${order.amount}) | TrxID: ${order.transactionId}`,
    });

    return NextResponse.json({
      success: true,
      message: `অর্ডার ${order.orderNumber} সফলভাবে অনুমোদিত হয়েছে এবং গ্রাহকের অ্যাকাউন্ট সক্রিয় করা হয়েছে!`,
      order: updatedOrder,
    });
  } catch (error: any) {
    console.error('Error approving package order:', error);
    return NextResponse.json(
      { success: false, error: 'অর্ডার অনুমোদন করতে সমস্যা হয়েছে।' },
      { status: 500 }
    );
  }
}
