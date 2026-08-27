import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

function getDatabaseUrl(): string {
  const envUrl = process.env.DATABASE_URL;

  if (envUrl && envUrl.trim() !== '') {
    // If it's a relative file URL like "file:./dev.db" or "file:dev.db", resolve to absolute path
    if (envUrl.startsWith('file:./') || envUrl.startsWith('file:dev.db') || envUrl.startsWith('file:prisma/')) {
      const cleanPath = envUrl.replace(/^file:(\.\/)?(prisma\/)?/, '');
      const resolved = path.resolve(process.cwd(), 'prisma', cleanPath);
      return `file:${resolved}`;
    }
    return envUrl;
  }

  // Fallback to local prisma/dev.db
  const localDb = path.resolve(process.cwd(), 'prisma', 'dev.db');
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
