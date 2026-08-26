import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

function getDatabaseUrl(): string {
  const envUrl = process.env.DATABASE_URL;

  // Detect serverless or production environment
  const isServerless =
    process.env.NETLIFY ||
    process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.NODE_ENV === 'production';

  if (isServerless) {
    const tmpDir = '/tmp';
    if (fs.existsSync(tmpDir)) {
      const targetDbPath = path.join(tmpDir, 'replyx_dev.db');
      const seedDbPath = path.join(process.cwd(), 'prisma', 'dev.db');

      if (!fs.existsSync(targetDbPath) && fs.existsSync(seedDbPath)) {
        try {
          fs.copyFileSync(seedDbPath, targetDbPath);
        } catch (e) {
          console.error('Failed to copy dev.db to /tmp:', e);
        }
      }
      return `file:${targetDbPath}`;
    }
  }

  if (envUrl) {
    return envUrl;
  }

  const localDb = path.join(process.cwd(), 'prisma', 'dev.db');
  return `file:${localDb}`;
}

const dbUrl = getDatabaseUrl();
process.env.DATABASE_URL = dbUrl;

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
