import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { hashPassword, signToken, AUTH_COOKIE_NAME } from '@/lib/auth';
import { logActivity } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, businessName, facebookPageUrl, email, password, confirmPassword, phone } = body;

    // Bangla validation messages
    if (!fullName || !businessName || !email || !password || !facebookPageUrl) {
      return NextResponse.json(
        { success: false, error: 'অনুগ্রহ করে ফেসবুক পেজ URL সহ সকল প্রয়োজনীয় তথ্য প্রদান করুন।' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' },
        { status: 400 }
      );
    }

    if (confirmPassword && password !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: 'পাসওয়ার্ড ও নিশ্চিতকরণ পাসওয়ার্ড মেলেনি।' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanFbUrl = facebookPageUrl.trim();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'এই ইমেইলটি ইতিমধ্যে ব্যবহৃত হয়েছে। অনুগ্রহ করে লগইন করুন।' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user profile
    const user = await prisma.user.create({
      data: {
        fullName: fullName.trim(),
        businessName: businessName.trim(),
        facebookPageUrl: cleanFbUrl,
        email: cleanEmail,
        passwordHash,
        phone: phone ? phone.trim() : null,
        role: 'USER',
        status: 'ACTIVE',
        plan: 'STARTER',
        planStatus: 'INACTIVE',
      },
    });

    // Create default AI settings for user
    await prisma.aiSetting.create({
      data: {
        userId: user.id,
        provider: 'GEMINI',
        model: 'gemini-1.5-flash',
        temperature: 0.7,
        maxTokens: 800,
      },
    });

    // Log activity
    await logActivity({
      userId: user.id,
      action: 'USER_SIGNUP',
      description: `নতুন অ্যাকাউন্ট তৈরি করা হয়েছে: ${user.fullName} (${user.businessName}) - Page: ${cleanFbUrl}`,
    });

    // Sign JWT token
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      message: 'রেজিস্ট্রেশন সফল হয়েছে!',
      user: {
        id: user.id,
        fullName: user.fullName,
        businessName: user.businessName,
        facebookPageUrl: user.facebookPageUrl,
        email: user.email,
        role: user.role,
        plan: user.plan,
        planStatus: user.planStatus,
      },
    });

    // Set HTTP-only Cookie
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { success: false, error: 'রেজিস্ট্রেশন প্রক্রিয়ায় ত্রুটি দেখা দিয়েছে। আবার চেষ্টা করুন।' },
      { status: 500 }
    );
  }
}
