import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { logActivity } from '@/lib/logger';

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if ('response' in auth) return auth.response;

  try {
    const body = await req.json();
    const { packageId, paymentMethodName, senderNumber, transactionId, paymentProofUrl } = body;

    if (!packageId || !paymentMethodName || !senderNumber || !transactionId) {
      return NextResponse.json(
        { success: false, error: 'অনুগ্রহ করে প্যাকেজ, পেমেন্ট মাধ্যম, প্রেরকের নম্বর এবং Transaction ID দিন।' },
        { status: 400 }
      );
    }

    const cleanSender = senderNumber.trim();
    const cleanTrx = transactionId.trim().toUpperCase();

    // Verify package exists
    const pkg = await prisma.package.findUnique({
      where: { id: packageId },
    });

    if (!pkg || !pkg.isActive) {
      return NextResponse.json(
        { success: false, error: 'নির্বাচিত প্যাকেজটি বর্তমানে সক্রিয় নেই।' },
        { status: 400 }
      );
    }

    // Check if duplicate TrxID exists in pending/approved orders
    const existingTrx = await prisma.packageOrder.findFirst({
      where: {
        transactionId: cleanTrx,
        status: { in: ['PENDING', 'APPROVED'] },
      },
    });

    if (existingTrx) {
      return NextResponse.json(
        { success: false, error: 'এই Transaction ID দিয়ে ইতিমধ্যে একটি অর্ডার জমা রয়েছে।' },
        { status: 400 }
      );
    }

    // Find payment method if exists
    const paymentMethod = await prisma.paymentMethod.findFirst({
      where: { name: paymentMethodName.toUpperCase() },
    });

    // Generate Order Number
    const orderNumber = `PKG-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const order = await prisma.packageOrder.create({
      data: {
        orderNumber,
        userId: auth.user.id,
        packageId: pkg.id,
        paymentMethodId: paymentMethod ? paymentMethod.id : null,
        paymentMethodName: paymentMethod ? paymentMethod.displayName : paymentMethodName,
        amount: pkg.price,
        senderNumber: cleanSender,
        transactionId: cleanTrx,
        paymentProofUrl: paymentProofUrl || null,
        status: 'PENDING',
      },
    });

    // Update User planStatus to PENDING_APPROVAL
    await prisma.user.update({
      where: { id: auth.user.id },
      data: {
        planStatus: 'PENDING_APPROVAL',
      },
    });

    await logActivity({
      userId: auth.user.id,
      action: 'PACKAGE_ORDER_SUBMITTED',
      description: `প্যাকেজ অর্ডার সাবমিট করা হয়েছে: ${pkg.name} (৳${pkg.price}) - TrxID: ${cleanTrx}`,
    });

    return NextResponse.json({
      success: true,
      message: 'আপনার প্যাকেজ অর্ডারটি সফলভাবে জমা হয়েছে! অ্যাডমিন যাচাই করে অনুমোদন দিলে আপনার ড্যাশবোর্ড সক্রিয় হবে।',
      order,
    });
  } catch (error: any) {
    console.error('Error creating package order:', error);
    return NextResponse.json(
      { success: false, error: 'অর্ডার সাবমিট করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।' },
      { status: 500 }
    );
  }
}
