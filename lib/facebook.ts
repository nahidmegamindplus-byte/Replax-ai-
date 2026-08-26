import crypto from 'crypto';
import { serverLogger } from './logger';

export const GRAPH_API_VERSION = process.env.FACEBOOK_GRAPH_API_VERSION || 'v20.0';
const GRAPH_BASE_URL = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

/**
 * Verify incoming Facebook Webhook payload signature against App Secret using HMAC-SHA256
 */
export function verifyFacebookSignature(
  rawBody: string,
  signatureHeader: string | null,
  appSecret: string
): boolean {
  if (!signatureHeader || !appSecret) {
    serverLogger.warn('Signature verification failed: Missing signature or app secret');
    return false;
  }

  const [method, signature] = signatureHeader.split('=');
  if (method !== 'sha256' || !signature) {
    serverLogger.warn(`Signature verification failed: Unsupported method ${method}`);
    return false;
  }

  try {
    const expectedSignature = crypto
      .createHmac('sha256', appSecret)
      .update(rawBody, 'utf8')
      .digest('hex');

    const signatureBuffer = Buffer.from(signature, 'hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');

    if (signatureBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
  } catch (error) {
    serverLogger.error('Error during signature verification', error);
    return false;
  }
}

/**
 * Test Facebook Page access token and connection by calling the Graph API
 */
export async function testPageConnection(
  facebookPageId: string,
  accessToken: string
): Promise<{ success: boolean; pageName?: string; pageUsername?: string; error?: string }> {
  try {
    if (!accessToken) {
      return { success: false, error: 'Page Access Token প্রয়োজন।' };
    }

    const res = await fetch(
      `${GRAPH_BASE_URL}/${facebookPageId}?fields=id,name,username,picture&access_token=${encodeURIComponent(accessToken)}`,
      { method: 'GET' }
    );

    const data = await res.json();

    if (!res.ok || data.error) {
      const fbError = data.error?.message || 'Facebook API এর সাথে সংযোগ করা যায়নি।';
      return {
        success: false,
        error: `Page Access Token সঠিক নয় অথবা মেয়াদ শেষ হয়েছে: ${fbError}`,
      };
    }

    return {
      success: true,
      pageName: data.name,
      pageUsername: data.username,
    };
  } catch (error: any) {
    serverLogger.error('Facebook connection test failed', error);
    return {
      success: false,
      error: 'Facebook সার্ভারের সাথে যোগাযোগ করা সম্ভব হয়নি। অনুগ্রহ করে পরে চেষ্টা করুন।',
    };
  }
}

/**
 * Send Messenger sender action (typing_on, typing_off, mark_seen)
 */
export async function sendMessengerAction(
  senderPsid: string,
  action: 'typing_on' | 'typing_off' | 'mark_seen',
  accessToken: string
): Promise<boolean> {
  try {
    if (!accessToken || !senderPsid) return false;

    const res = await fetch(`${GRAPH_BASE_URL}/me/messages?access_token=${encodeURIComponent(accessToken)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipient: { id: senderPsid },
        sender_action: action,
      }),
    });

    return res.ok;
  } catch (error) {
    // Non-blocking error for typing indicator
    serverLogger.warn('Messenger sender action non-fatal error', error);
    return false;
  }
}

/**
 * Send text message reply to a customer via Facebook Messenger Send API
 */
export async function sendMessengerText(
  senderPsid: string,
  text: string,
  accessToken: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    if (!accessToken) {
      return { success: false, error: 'Missing access token' };
    }

    const res = await fetch(`${GRAPH_BASE_URL}/me/messages?access_token=${encodeURIComponent(accessToken)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipient: { id: senderPsid },
        messaging_type: 'RESPONSE',
        message: { text },
      }),
    });

    const data = await res.json();

    if (!res.ok || data.error) {
      const errMsg = data.error?.message || 'Failed to send Messenger message';
      serverLogger.error('Facebook Send API error', data.error);
      return { success: false, error: errMsg };
    }

    return { success: true, messageId: data.message_id };
  } catch (error: any) {
    serverLogger.error('Network error calling Facebook Send API', error);
    return { success: false, error: error?.message || 'Network error' };
  }
}

/**
 * Send an image attachment to a customer via Facebook Messenger Send API
 */
export async function sendMessengerImage(
  senderPsid: string,
  imageUrl: string,
  accessToken: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    if (!accessToken || !imageUrl) {
      return { success: false, error: 'Missing token or image URL' };
    }

    const res = await fetch(`${GRAPH_BASE_URL}/me/messages?access_token=${encodeURIComponent(accessToken)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipient: { id: senderPsid },
        messaging_type: 'RESPONSE',
        message: {
          attachment: {
            type: 'image',
            payload: {
              url: imageUrl,
              is_reusable: true,
            },
          },
        },
      }),
    });

    const data = await res.json();

    if (!res.ok || data.error) {
      serverLogger.warn('Image sending failed via Messenger API, falling back', data.error);
      return { success: false, error: data.error?.message };
    }

    return { success: true, messageId: data.message_id };
  } catch (error: any) {
    serverLogger.warn('Network error sending image attachment', error);
    return { success: false, error: error.message };
  }
}
