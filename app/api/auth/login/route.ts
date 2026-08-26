import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { ensureDatabaseReady } from '@/lib/db-init';
import { comparePassword, signToken, AUTH_COOKIE_NAME } from '@/lib/auth';
import { logActivity } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    await ensureDatabaseReady();

    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'ইমেইল এবং পাসওয়ার্ড প্রদান করুন।' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।' },
        { status: 401 }
      );
    }

    if (user.status === 'DISABLED') {
      return NextResponse.json(
        { success: false, error: 'আপনার অ্যাকাউন্টটি স্থগিত করা হয়েছে। সাপোর্টে যোগাযোগ করুন।' },
        { status: 403 }
      );
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: 'ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।' },
        { status: 401 }
      );
    }

    // Log login activity
    try {
      await logActivity({
        userId: user.id,
        action: 'USER_LOGIN',
        description: `ব্যবহারকারী সফলভাবে লগইন করেছেন: ${user.email}`,
      });
    } catch (e) {
      console.warn('Could not log login activity:', e);
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      message: 'লগইন সফল হয়েছে!',
      user: {
        id: user.id,
        fullName: user.fullName,
        businessName: user.businessName,
        email: user.email,
        role: user.role,
        plan: user.plan,
        planStatus: user.planStatus,
      },
    });

    // Set cookie
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'লগইন প্রক্রিয়ায় ত্রুটি দেখা দিয়েছে।' },
      { status: 500 }
    );
  }
}
