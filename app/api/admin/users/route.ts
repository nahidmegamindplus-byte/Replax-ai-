import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAdmin, hashPassword } from '@/lib/auth';
import { logActivity } from '@/lib/logger';

export async function GET(req: NextRequest) {
  const adminAuth = await requireAdmin(req);
  if ('response' in adminAuth) return adminAuth.response;

  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fullName: true,
        businessName: true,
        facebookPageUrl: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        plan: true,
        planStatus: true,
        monthlyMessageLimit: true,
        messagesSentThisMonth: true,
        planExpiresAt: true,
        createdAt: true,
        _count: {
          select: {
            pages: true,
            products: true,
            conversations: true,
            orders: true,
            messages: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, users });
  } catch (error: any) {
    console.error('Error fetching admin users:', error);
    return NextResponse.json(
      { success: false, error: 'ব্যবহারকারী তালিকা লোড করতে সমস্যা হয়েছে।' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const adminAuth = await requireAdmin(req);
  if ('response' in adminAuth) return adminAuth.response;

  try {
    const body = await req.json();
    const { userId, fullName, businessName, facebookPageUrl, phone, status, role, plan, password } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID আবশ্যক।' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (fullName !== undefined) updateData.fullName = fullName.trim();
    if (businessName !== undefined) updateData.businessName = businessName.trim();
    if (facebookPageUrl !== undefined) updateData.facebookPageUrl = facebookPageUrl ? facebookPageUrl.trim() : null;
    if (phone !== undefined) updateData.phone = phone ? phone.trim() : null;
    if (status !== undefined) updateData.status = status;
    if (role !== undefined) updateData.role = role;
    if (plan !== undefined) updateData.plan = plan;

    let passwordChanged = false;
    if (password && typeof password === 'string' && password.trim().length > 0) {
      if (password.trim().length < 6) {
        return NextResponse.json(
          { success: false, error: 'নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' },
          { status: 400 }
        );
      }
      updateData.passwordHash = await hashPassword(password.trim());
      passwordChanged = true;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    await logActivity({
      userId: adminAuth.user.id,
      action: passwordChanged ? 'ADMIN_USER_PASSWORD_RESET' : 'ADMIN_USER_UPDATED',
      description: passwordChanged
        ? `অ্যাডমিন দ্বারা ব্যবহারকারী ${updatedUser.email}-এর পাসওয়ার্ড রিসেট করা হয়েছে`
        : `অ্যাডমিন দ্বারা ব্যবহারকারী ${updatedUser.email}-এর তথ্য আপডেট করা হয়েছে (${status || role || plan})`,
    });

    return NextResponse.json({
      success: true,
      message: passwordChanged
        ? 'ব্যবহারকারীর পাসওয়ার্ড ও তথ্য সফলভাবে আপডেট হয়েছে!'
        : 'ব্যবহারকারীর তথ্য সফলভাবে আপডেট হয়েছে!',
      user: updatedUser,
    });
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { success: false, error: 'ব্যবহারকারী আপডেট করতে সমস্যা হয়েছে।' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const adminAuth = await requireAdmin(req);
  if ('response' in adminAuth) return adminAuth.response;

  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID আবশ্যক।' },
        { status: 400 }
      );
    }

    // Prevent deleting self
    if (userId === adminAuth.user.id) {
      return NextResponse.json(
        { success: false, error: 'আপনি নিজের অ্যাকাউন্ট মুছতে পারবেন না।' },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    await logActivity({
      userId: adminAuth.user.id,
      action: 'ADMIN_USER_DELETED',
      description: `অ্যাডমিন দ্বারা ব্যবহারকারী অ্যাকাউন্ট মুছে ফেলা হয়েছে: ${userId}`,
    });

    return NextResponse.json({
      success: true,
      message: 'ব্যবহারকারী সফলভাবে মুছে ফেলা হয়েছে।',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'ব্যবহারকারী মুছতে ব্যর্থ হয়েছে।' },
      { status: 500 }
    );
  }
}
