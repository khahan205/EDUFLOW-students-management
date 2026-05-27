import app from './app.js';
import { env } from './config/env.js';
import { prisma } from './config/prisma.js';

const server = app.listen(env.PORT, () => {
  console.log(`\n🚀 EduFlow Backend đang chạy ở: http://localhost:${env.PORT}`);
  console.log(`   • Môi trường: ${env.NODE_ENV}`);
  console.log(`   • Frontend:   ${env.FRONTEND_URL}`);
  console.log(`   • Health:     http://localhost:${env.PORT}/api/health\n`);
});

// Graceful shutdown — đóng connection pool khi nhận signal
const shutdown = async (signal) => {
  console.log(`\n📛 Nhận tín hiệu ${signal}, đang tắt server...`);
  server.close(async () => {
    await prisma.$disconnect();
    console.log('   ✓ DB connections closed');
    process.exit(0);
  });
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
