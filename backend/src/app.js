import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { env, isDev } from './config/env.js';
import { errorMiddleware, notFoundMiddleware } from './middlewares/error.js';

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

const app = express();

// ---------- Security & infra middleware ----------
app.use(helmet());
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  }),
);
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan(isDev ? 'dev' : 'combined'));

// ---------- Health check ----------
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ---------- API Routes ----------
app.use('/api/auth', authRouter);
app.use('/api/sinh-vien', sinhVienRouter);
app.use('/api/mon-hoc', monHocRouter);
app.use('/api/dang-ky', dangKyRouter);
app.use('/api/hoc-phi', hocPhiRouter);
app.use('/api/bao-cao', baoCaoRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/admin', adminRouter);
app.use('/api', masterDataRouter); // /api/hoc-ky, /api/que-quan, /api/cau-hinh/gia, ...

// ---------- 404 + Error handler (PHẢI ĐẶT CUỐI) ----------
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
