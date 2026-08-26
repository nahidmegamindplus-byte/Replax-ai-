import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const packages = await prisma.package.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' },
    });

    return NextResponse.json({
      success: true,
      packages: packages.map((p) => ({
        ...p,
        features: typeof p.features === 'string' ? JSON.parse(p.features || '[]') : p.features,
      })),
    });
  } catch (error: any) {
    console.error('Error fetching public packages:', error);
    return NextResponse.json(
      { success: false, error: 'প্যাকেজ তালিকা লোড করতে সমস্যা হয়েছে।' },
      { status: 500 }
    );
  }
}
