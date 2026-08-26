import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { logActivity } from '@/lib/logger';

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if ('response' in auth) {
    return auth.response;
  }

  return NextResponse.json({
    success: true,
    user: auth.user,
  });
}

export async function PUT(req: NextRequest) {
  const auth = await requireAuth(req);
  if ('response' in auth) {
    return auth.response;
  }

  try {
    const body = await req.json();
    const { fullName, businessName, phone } = body;

    const updatedUser = await prisma.user.update({
      where: { id: auth.user.id },
      data: {
        ...(fullName && { fullName: fullName.trim() }),
        ...(businessName && { businessName: businessName.trim() }),
        ...(phone !== undefined && { phone: phone ? phone.trim() : null }),
      },
      select: {
        id: true,
        fullName: true,
        businessName: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        plan: true,
        planStatus: true,
      },
    });

    await logActivity({
      userId: auth.user.id,
      action: 'USER_PROFILE_UPDATED',
      description: `প্রোফাইল তথ্য আপডেট করা হয়েছে: ${updatedUser.fullName}`,
    });

    return NextResponse.json({
      success: true,
      message: 'প্রোফাইল তথ্য সফলভাবে আপডেট হয়েছে!',
      user: updatedUser,
    });
  } catch (error: any) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { success: false, error: 'প্রোফাইল আপডেট করতে সমস্যা হয়েছে।' },
      { status: 500 }
    );
  }
}
