import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { env, isDev } from './config/env.js';
import { errorMiddleware, notFoundMiddleware } from './middlewares/error.js';
import { auditMiddleware } from './middlewares/audit.js';

// Module routers
import authRouter from './modules/auth/auth.routes.js';
import sinhVienRouter from './modules/sinh-vien/sinh-vien.routes.js';
import monHocRouter from './modules/mon-hoc/mon-hoc.routes.js';
import dangKyRouter from './modules/dang-ky/dang-ky.routes.js';
import hocPhiRouter from './modules/hoc-phi/hoc-phi.routes.js';
import baoCaoRouter from './modules/bao-cao/bao-cao.routes.js';
import dashboardRouter from './modules/bao-cao/dashboard.routes.js';
import adminRouter from './modules/admin/admin.routes.js';
import masterDataRouter from './modules/master-data/master-data.routes.js';
import monHocMoRouter from './modules/mon-hoc-mo/mon-hoc-mo.routes.js';
import phanCongRouter from './modules/phan-cong/phan-cong.routes.js';
import giangVienRouter from './modules/giang-vien/giang-vien.routes.js';
import chuongTrinhHocRouter from './modules/chuong-trinh-hoc/chuong-trinh-hoc.routes.js';
import donGiaHanRouter from './modules/don-gia-han/don-gia-han.routes.js';

const app = express();

// ---------- Security & infra middleware ----------
app.use(helmet());
app.use(
  cors({
    origin: isDev
      ? (origin, callback) => {
          // Cho phép mọi localhost:* trong dev (Vite có thể dùng port bất kỳ)
          if (!origin || origin.startsWith('http://localhost')) {
            callback(null, true);
          } else {
            callback(new Error('Not allowed by CORS'));
          }
        }
      : env.FRONTEND_URL,
    credentials: true,
  }),
);
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan(isDev ? 'dev' : 'combined'));
app.use(auditMiddleware);

// ---------- Rate limiting ----------
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: isDev ? 50 : 10,
  message: { message: 'Quá nhiều lần đăng nhập, thử lại sau 15 phút.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ---------- Health check ----------
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ---------- API Routes ----------
app.use('/api/auth/login', loginLimiter);
app.use('/api/auth', authRouter);
app.use('/api/sinh-vien', sinhVienRouter);
app.use('/api/mon-hoc', monHocRouter);
app.use('/api/dang-ky', dangKyRouter);
app.use('/api/hoc-phi', hocPhiRouter);
app.use('/api/bao-cao', baoCaoRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/admin', adminRouter);
app.use('/api/mon-hoc-mo', monHocMoRouter);
app.use('/api/phan-cong', phanCongRouter);
app.use('/api/giang-vien', giangVienRouter);
app.use('/api/chuong-trinh-hoc', chuongTrinhHocRouter);
app.use('/api/don-gia-han', donGiaHanRouter);
app.use('/api', masterDataRouter); // /api/hoc-ky, /api/que-quan, /api/cau-hinh/gia, ...

// ---------- 404 + Error handler (PHẢI ĐẶT CUỐI) ----------
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
