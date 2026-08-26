import { NextRequest } from 'next/server';

/**
 * Get the application's base URL dynamically.
 * Works seamlessly across Localhost, Ngrok/Cloudflare tunnels, and Netlify production.
 */
export function getAppUrl(req?: NextRequest): string {
  // 1. Explicitly configured APP_URL or NEXT_PUBLIC_APP_URL
  const configuredAppUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL;
  if (configuredAppUrl && configuredAppUrl.trim()) {
    return configuredAppUrl.trim().replace(/\/+$/, '');
  }

  // 2. Netlify automated production / deploy environment variables
  if (process.env.URL && process.env.URL.trim()) {
    return process.env.URL.trim().replace(/\/+$/, '');
  }
  if (process.env.DEPLOY_PRIME_URL && process.env.DEPLOY_PRIME_URL.trim()) {
    return process.env.DEPLOY_PRIME_URL.trim().replace(/\/+$/, '');
  }

  // 3. Extract dynamically from incoming HTTP request headers if provided
  if (req) {
    const forwardedProto = req.headers.get('x-forwarded-proto') || 'https';
    const forwardedHost = req.headers.get('x-forwarded-host') || req.headers.get('host');
    if (forwardedHost) {
      // Determine protocol: if localhost, use http unless proto specified
      const proto = forwardedHost.includes('localhost') || forwardedHost.includes('127.0.0.1')
        ? (req.headers.get('x-forwarded-proto') || 'http')
        : (forwardedProto || 'https');
      return `${proto}://${forwardedHost}`.replace(/\/+$/, '');
    }

    if (req.nextUrl && req.nextUrl.origin) {
      return req.nextUrl.origin.replace(/\/+$/, '');
    }
  }

  // 4. Default fallback for local development
  return 'http://localhost:3000';
}

/**
 * Get the Webhook Base URL.
 * Supports overriding via WEBHOOK_BASE_URL (for ngrok, cloudflared, local tunnels).
 */
export function getWebhookBaseUrl(req?: NextRequest): string {
  if (process.env.WEBHOOK_BASE_URL && process.env.WEBHOOK_BASE_URL.trim()) {
    return process.env.WEBHOOK_BASE_URL.trim().replace(/\/+$/, '');
  }
  return getAppUrl(req);
}

/**
 * Get the full Facebook Messenger Webhook endpoint URL.
 */
export function getFacebookWebhookUrl(req?: NextRequest): string {
  const base = getWebhookBaseUrl(req);
  return `${base}/api/webhooks/facebook`;
}
