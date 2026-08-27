import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    let methods = await prisma.paymentMethod.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
    });

    if (methods.length === 0) {
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

      methods = await prisma.paymentMethod.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'asc' },
      });
    }

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
