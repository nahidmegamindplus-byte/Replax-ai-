import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(req: NextRequest) {
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

    return NextResponse.json({
      success: true,
      settings: {
        enabled: settingsMap['whatsapp_enabled'] === 'true',
        number: settingsMap['whatsapp_number'] || '+8801700000000',
        message:
          settingsMap['whatsapp_message'] ||
          'আসসালামু আলাইকুম, আমি ReplyX AI সম্পর্কে তথ্য জানতে চাই।',
        position: settingsMap['whatsapp_position'] || 'RIGHT',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        settings: {
          enabled: false,
          number: '+8801700000000',
          message: 'আসসালামু আলাইকুম',
          position: 'RIGHT',
        },
      },
      { status: 200 }
    );
  }
}
