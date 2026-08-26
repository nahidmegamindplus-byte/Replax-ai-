import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const methods = await prisma.paymentMethod.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({
      success: true,
      paymentMethods: methods,
    });
  } catch (error: any) {
    console.error('Error fetching payment methods:', error);
    return NextResponse.json(
      { success: false, error: 'পেমেন্ট মেথড তালিকা লোড করতে সমস্যা হয়েছে।' },
      { status: 500 }
    );
  }
}
