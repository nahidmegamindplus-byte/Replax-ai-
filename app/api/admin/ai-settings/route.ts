import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { encrypt, decrypt, maskToken } from '@/lib/crypto';
import { logActivity } from '@/lib/logger';

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if ('response' in auth) return auth.response;

  try {
    const settings = await prisma.systemSetting.findMany({
      where: {
        key: {
          in: [
            'ADMIN_AI_PROVIDER',
            'ADMIN_AI_MODEL',
            'ADMIN_GOROUTER_KEY_ENCRYPTED',
            'ADMIN_GOROUTER_BASE_URL',
            'ADMIN_DEEPSEEK_KEY_ENCRYPTED',
            'ADMIN_GEMINI_KEY_ENCRYPTED',
            'ADMIN_OPENAI_KEY_ENCRYPTED',
            'ADMIN_AI_TEMPERATURE',
            'ADMIN_AI_MAX_TOKENS',
          ],
        },
      },
    });

    const map: Record<string, string> = {};
    settings.forEach((s) => {
      map[s.key] = s.value;
    });

    const provider = (map.ADMIN_AI_PROVIDER || process.env.AI_PROVIDER || 'GEMINI').toUpperCase();
    const model = map.ADMIN_AI_MODEL || (provider === 'GOROUTER' || provider === 'OPENROUTER' ? 'deepseek/deepseek-chat' : provider === 'DEEPSEEK' ? 'deepseek-chat' : provider === 'OPENAI' ? 'gpt-4o-mini' : 'gemini-1.5-flash');

    const gorouterKeyRaw = map.ADMIN_GOROUTER_KEY_ENCRYPTED ? decrypt(map.ADMIN_GOROUTER_KEY_ENCRYPTED) : (process.env.GOROUTER_API_KEY || process.env.OPENROUTER_API_KEY || '');
    const gorouterBaseUrl = map.ADMIN_GOROUTER_BASE_URL || process.env.GOROUTER_BASE_URL || 'https://openrouter.ai/api/v1';

    const deepseekKeyRaw = map.ADMIN_DEEPSEEK_KEY_ENCRYPTED ? decrypt(map.ADMIN_DEEPSEEK_KEY_ENCRYPTED) : (process.env.DEEPSEEK_API_KEY || '');
    const geminiKeyRaw = map.ADMIN_GEMINI_KEY_ENCRYPTED ? decrypt(map.ADMIN_GEMINI_KEY_ENCRYPTED) : (process.env.GEMINI_API_KEY || '');
    const openaiKeyRaw = map.ADMIN_OPENAI_KEY_ENCRYPTED ? decrypt(map.ADMIN_OPENAI_KEY_ENCRYPTED) : (process.env.OPENAI_API_KEY || '');

    return NextResponse.json({
      success: true,
      settings: {
        provider,
        model,
        temperature: map.ADMIN_AI_TEMPERATURE ? parseFloat(map.ADMIN_AI_TEMPERATURE) : 0.7,
        maxTokens: map.ADMIN_AI_MAX_TOKENS ? parseInt(map.ADMIN_AI_MAX_TOKENS, 10) : 800,
        gorouter: {
          hasKey: Boolean(gorouterKeyRaw),
          maskedKey: gorouterKeyRaw ? maskToken(gorouterKeyRaw) : '',
          baseUrl: gorouterBaseUrl,
        },
        deepseek: {
          hasKey: Boolean(deepseekKeyRaw),
          maskedKey: deepseekKeyRaw ? maskToken(deepseekKeyRaw) : '',
        },
        gemini: {
          hasKey: Boolean(geminiKeyRaw),
          maskedKey: geminiKeyRaw ? maskToken(geminiKeyRaw) : '',
        },
        openai: {
          hasKey: Boolean(openaiKeyRaw),
          maskedKey: openaiKeyRaw ? maskToken(openaiKeyRaw) : '',
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching admin AI settings:', error);
    return NextResponse.json({ success: false, error: 'AI সেটিংস লোড করতে সমস্যা হয়েছে।' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if ('response' in auth) return auth.response;

  try {
    const body = await req.json();
    const {
      provider,
      model,
      temperature,
      maxTokens,
      gorouterKey,
      gorouterBaseUrl,
      deepseekKey,
      geminiKey,
      openaiKey,
    } = body;

    const updates: Array<{ key: string; value: string }> = [];

    if (provider) {
      updates.push({ key: 'ADMIN_AI_PROVIDER', value: provider.toUpperCase() });
    }
    if (model) {
      updates.push({ key: 'ADMIN_AI_MODEL', value: model });
    }
    if (gorouterBaseUrl) {
      updates.push({ key: 'ADMIN_GOROUTER_BASE_URL', value: gorouterBaseUrl.trim() });
    }
    if (temperature !== undefined) {
      updates.push({ key: 'ADMIN_AI_TEMPERATURE', value: String(temperature) });
    }
    if (maxTokens !== undefined) {
      updates.push({ key: 'ADMIN_AI_MAX_TOKENS', value: String(maxTokens) });
    }

    if (gorouterKey && gorouterKey.trim()) {
      updates.push({
        key: 'ADMIN_GOROUTER_KEY_ENCRYPTED',
        value: encrypt(gorouterKey.trim()),
      });
    }
    if (deepseekKey && deepseekKey.trim()) {
      updates.push({
        key: 'ADMIN_DEEPSEEK_KEY_ENCRYPTED',
        value: encrypt(deepseekKey.trim()),
      });
    }
    if (geminiKey && geminiKey.trim()) {
      updates.push({
        key: 'ADMIN_GEMINI_KEY_ENCRYPTED',
        value: encrypt(geminiKey.trim()),
      });
    }
    if (openaiKey && openaiKey.trim()) {
      updates.push({
        key: 'ADMIN_OPENAI_KEY_ENCRYPTED',
        value: encrypt(openaiKey.trim()),
      });
    }

    // Upsert into SystemSetting
    for (const item of updates) {
      await prisma.systemSetting.upsert({
        where: { key: item.key },
        update: { value: item.value },
        create: { key: item.key, value: item.value },
      });
    }

    await logActivity({
      userId: auth.user.id,
      action: 'ADMIN_AI_SETTINGS_UPDATED',
      description: `অ্যাডমিন AI কনফিগারেশন আপডেট করা হয়েছে: Provider=${provider}, Model=${model}`,
    });

    return NextResponse.json({
      success: true,
      message: 'AI প্রোভাইডার ও API সেটিংস সফলভাবে আপডেট হয়েছে!',
    });
  } catch (error: any) {
    console.error('Error saving admin AI settings:', error);
    return NextResponse.json({ success: false, error: 'AI সেটিংস সংরক্ষণে ত্রুটি হয়েছে।' }, { status: 500 });
  }
}
