import { PrismaClient } from '@prisma/client';
import { isDev } from './env.js';

/**
 * Singleton Prisma client. Trong dev có log query để dễ debug.
 * Trong prod chỉ log error.
 */
export const prisma = new PrismaClient({
  log: isDev ? ['error', 'warn'] : ['error'],
});

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
