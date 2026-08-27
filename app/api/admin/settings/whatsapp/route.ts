import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { logActivity } from '@/lib/logger';

export async function GET(req: NextRequest) {
  const adminAuth = await requireAdmin(req);
  if ('response' in adminAuth) return adminAuth.response;

  try {
    const settingsList = await prisma.systemSetting.findMany({
      where: {
        key: {
          in: [
            'whatsapp_enabled',
            'whatsapp_number',
            'whatsapp_message',
            'whatsapp_position',
          ],
        },
      },
    });

    const settingsMap: Record<string, string> = {};
    settingsList.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    const isExplicitlyDisabled = settingsMap['whatsapp_enabled'] === 'false';
    const isEnabled = !isExplicitlyDisabled;

    return NextResponse.json({
      success: true,
      settings: {
        enabled: isEnabled,
        number: settingsMap['whatsapp_number'] || '+8801521716613',
        message:
          settingsMap['whatsapp_message'] ||
          'আসসালামু আলাইকুম, আমি ReplyX AI সম্পর্কে তথ্য জানতে চাই।',
        position: settingsMap['whatsapp_position'] || 'RIGHT',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'WhatsApp সেটিংস লোড করতে সমস্যা হয়েছে।' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const adminAuth = await requireAdmin(req);
  if ('response' in adminAuth) return adminAuth.response;

  try {
    const body = await req.json();
    const { enabled, number, message, position } = body;

    const cleanEnabled = Boolean(enabled).toString();
    const cleanNumber = (number || '').trim();
    const cleanMessage = (message || '').trim();
    const cleanPosition = position === 'LEFT' ? 'LEFT' : 'RIGHT';

    const updates = [
      { key: 'whatsapp_enabled', value: cleanEnabled },
      { key: 'whatsapp_number', value: cleanNumber },
      { key: 'whatsapp_message', value: cleanMessage },
      { key: 'whatsapp_position', value: cleanPosition },
    ];

    for (const item of updates) {
      await prisma.systemSetting.upsert({
        where: { key: item.key },
        update: { value: item.value },
        create: { key: item.key, value: item.value },
      });
    }

    await logActivity({
      userId: adminAuth.user.id,
      action: 'WHATSAPP_SETTINGS_UPDATED',
      description: `WhatsApp সাপোর্ট সেটিংস আপডেট করা হয়েছে (সক্রিয়: ${cleanEnabled}, নম্বর: ${cleanNumber}, পজিশন: ${cleanPosition})`,
    });

    return NextResponse.json({
      success: true,
      message: 'WhatsApp সাপোর্ট সেটিংস সফলভাবে সংরক্ষণ করা হয়েছে!',
    });
  } catch (error: any) {
    console.error('Error saving WhatsApp settings:', error);
    return NextResponse.json(
      { success: false, error: 'সেটিংস সংরক্ষণ করতে ব্যর্থ হয়েছে।' },
      { status: 500 }
    );
  }
}
