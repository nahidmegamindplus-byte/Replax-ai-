import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

function getDatabaseUrl(): string {
  const envUrl = process.env.DATABASE_URL;

  // If a remote database URL is configured (PostgreSQL, MySQL, Turso/LibSQL, etc.), use it directly
  if (envUrl && !envUrl.startsWith('file:') && !envUrl.startsWith('./') && !envUrl.includes('dev.db')) {
    return envUrl;
  }

  // Detect serverless environment (Vercel, Netlify, AWS Lambda)
  const isServerless =
    Boolean(process.env.VERCEL) ||
    Boolean(process.env.NETLIFY) ||
    Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME) ||
    Boolean(process.env.LAMBDA_TASK_ROOT) ||
    process.env.NODE_ENV === 'production';

  if (isServerless) {
    try {
      const tmpDir = '/tmp';
      const tmpDbPath = path.join(tmpDir, 'replyx_dev.db');

      if (!fs.existsSync(tmpDbPath)) {
        // Look for source seed db in package bundle
        const sourcePaths = [
          path.resolve(process.cwd(), 'prisma', 'dev.db'),
          path.resolve(process.cwd(), 'dev.db'),
          path.join(__dirname, '..', '..', 'prisma', 'dev.db'),
          path.join(__dirname, '..', 'prisma', 'dev.db'),
        ];

        let copied = false;
        for (const src of sourcePaths) {
          if (fs.existsSync(src)) {
            try {
              fs.copyFileSync(src, tmpDbPath);
              fs.chmodSync(tmpDbPath, 0o666);
              copied = true;
              break;
            } catch (err) {
              console.warn('Failed to copy seed db to /tmp:', err);
            }
          }
        }

        if (!copied) {
          // Create empty file in /tmp so SQLite can open and write schema
          fs.writeFileSync(tmpDbPath, '');
          fs.chmodSync(tmpDbPath, 0o666);
        }
      }

      return `file:${tmpDbPath}`;
    } catch (e) {
      console.warn('Serverless /tmp db setup fallback:', e);
    }
  }

  // Local environment fallback
  const localPrismaDir = path.resolve(process.cwd(), 'prisma');
  if (!fs.existsSync(localPrismaDir)) {
    try {
      fs.mkdirSync(localPrismaDir, { recursive: true });
    } catch (e) {}
  }
  const localDb = path.resolve(localPrismaDir, 'dev.db');
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
