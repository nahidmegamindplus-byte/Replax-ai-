import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if ('response' in auth) return auth.response;

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = status.toUpperCase();
    }

    const orders = await prisma.packageOrder.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            businessName: true,
            email: true,
            phone: true,
            plan: true,
            planStatus: true,
          },
        },
        package: {
          select: {
            id: true,
            name: true,
            price: true,
            durationDays: true,
            messageLimit: true,
            pageLimit: true,
          },
        },
      },
    });

    const pendingCount = await prisma.packageOrder.count({ where: { status: 'PENDING' } });
    const approvedCount = await prisma.packageOrder.count({ where: { status: 'APPROVED' } });
    const rejectedCount = await prisma.packageOrder.count({ where: { status: 'REJECTED' } });

    return NextResponse.json({
      success: true,
      counts: {
        total: orders.length,
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
      },
      orders,
    });
  } catch (error: any) {
    console.error('Error fetching admin package orders:', error);
    return NextResponse.json(
      { success: false, error: 'প্যাকেজ অর্ডার তালিকা লোড করতে সমস্যা হয়েছে।' },
      { status: 500 }
    );
  }
}
