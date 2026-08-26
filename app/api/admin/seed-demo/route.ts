import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  return NextResponse.json(
    {
      success: false,
      message: 'ডেমো ডাটা সিডিং নিষ্ক্রিয় করা হয়েছে। ড্যাশবোর্ড এবং অ্যাডমিন প্যানেলে কোনো ডেমো ডাটা রাখা হবে না।',
    },
    { status: 400 }
  );
}
