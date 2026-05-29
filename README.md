# EduFlow — Hệ thống Quản lý Sinh viên

> Đồ án **SE104** · Trường Đại học Công nghệ Thông tin (UIT)

Hệ thống quản lý đăng ký môn học và thu học phí dành cho cán bộ nhà trường. Monorepo gồm **Frontend** (React + Vite) và **Backend** (Express + Prisma + MySQL).

---

## Yêu cầu hệ thống

| Công cụ | Phiên bản |
|---------|-----------|
| Node.js | 20+ |
| MySQL | 8+ |
| npm | 10+ |

---

## Cài đặt và chạy

### 1. Clone và cài dependencies

```bash
git clone https://github.com/your-username/eduflow.git
cd eduflow
npm run install:all
```

### 2. Cấu hình môi trường

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Mở `backend/.env` và cập nhật `DATABASE_URL`:

```env
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/eduflow"
JWT_SECRET="your-secret-key"
```

### 3. Khởi tạo cơ sở dữ liệu

```bash
# Tạo database (nếu chưa có)
mysql -u root -p -e "CREATE DATABASE eduflow CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Chạy migration và seed dữ liệu mẫu
npm run db:migrate
npm run db:seed
```

### 4. Chạy ứng dụng

```bash
# Chạy cả Frontend và Backend cùng lúc
npm run dev
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| API Health | http://localhost:8000/api/health |

---

## Tài khoản mặc định

Mật khẩu tất cả tài khoản: **`363636`**

| Tài khoản | Email | Vai trò |
|-----------|-------|---------|
| `admin` | admin@gmail.com | Quản trị viên |
| `pdt` | pdt@gmail.com | Phòng Đào tạo |
| `ketoan` | ketoan@gmail.com | Phòng Tài chính |
| `gv_mai` | mai.nt@gmail.com | Giảng viên |
| `gv_hung` | hung.tv@gmail.com | Giảng viên |
| `gv_thu` | thu.lt@gmail.com | Giảng viên |
| `gv_duc` | duc.pv@gmail.com | Giảng viên |

---

## Cấu trúc dự án

```
eduflow/
├── frontend/                   # React + TypeScript + Tailwind + shadcn/ui
│   └── src/
│       ├── components/         # UI components dùng chung
│       ├── features/           # Các tính năng (admin, auth, hoc-phi, ...)
│       ├── routes/             # React Router + bảo vệ route theo vai trò
│       ├── services/           # API client (axios)
│       ├── stores/             # Zustand state management
│       └── types/              # TypeScript types
│
├── backend/                    # Express + Prisma + MySQL + JWT
│   ├── prisma/
│   │   ├── schema.prisma       # Schema CSDL
│   │   ├── migrations/         # Lịch sử migration
│   │   └── seed.js             # Dữ liệu mẫu
│   └── src/
│       ├── config/             # Cấu hình môi trường, Prisma
│       ├── middlewares/        # Auth, RBAC, error handling
│       ├── modules/            # Các module (auth, sinh-vien, hoc-phi, ...)
│       └── utils/              # Helpers, JWT, hash
│
├── docker-compose.yml          # Docker: MySQL + Backend + Frontend
└── package.json                # Root workspace scripts
```

---

## Scripts

```bash
# Phát triển
npm run dev               # Chạy cả Frontend và Backend
npm run dev:backend       # Chỉ Backend (port 8000)
npm run dev:frontend      # Chỉ Frontend (port 5173)

# Cơ sở dữ liệu
npm run db:migrate        # Chạy migration
npm run db:seed           # Seed dữ liệu mẫu
npm run db:reset          # Xoá và khởi tạo lại DB
npm run db:studio         # Mở Prisma Studio (GUI)

# Production
npm run build             # Build frontend
npm start                 # Chạy backend production
```

---

## Phân quyền

| Vai trò | Quyền truy cập |
|---------|----------------|
| **Admin** | Toàn bộ hệ thống + quản lý tài khoản |
| **Phòng Đào tạo** | Sinh viên, Môn học, Lớp học phần, Giảng viên, Báo cáo |
| **Phòng Tài chính** | Thu học phí, Báo cáo tài chính |
| **Giảng viên** | Hồ sơ cá nhân, Lớp được phân công |

---

## Deploy

### Backend → Railway

1. Tạo project tại [railway.app](https://railway.app) → Deploy từ GitHub → chọn thư mục `backend`
2. Add Plugin **MySQL**
3. Thêm Environment Variables:

```env
NODE_ENV=production
JWT_SECRET=your-strong-secret
FRONTEND_URL=https://your-app.vercel.app
```

4. Chạy migration sau khi deploy: `npm run db:migrate && npm run db:seed`

### Frontend → Vercel

1. Import repo tại [vercel.com](https://vercel.com) → Root Directory: `frontend`
2. Thêm Environment Variables:

```env
VITE_API_BASE_URL=https://your-backend.railway.app/api
VITE_USE_MOCK=false
VITE_USE_MOCK_AUTH=false
VITE_AUTH_STORAGE_KEY=eduflow_auth
```

3. Deploy — Vercel tự build Vite.

### Docker (Full Stack)

```bash
# Chỉ MySQL (phát triển local)
docker compose up -d mysql

# Toàn bộ stack
docker compose --profile full up -d --build
```

---

## Xử lý sự cố

**`ECONNREFUSED 127.0.0.1:3306`** — MySQL chưa chạy. Khởi động XAMPP/Docker/Service.

**`Database doesn't exist`** — Tạo database trước:
```bash
mysql -u root -p -e "CREATE DATABASE eduflow CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

**Port đang bị dùng** — Tắt process cũ:
```bash
taskkill /F /IM node.exe   # Windows
```

**Login báo sai tài khoản** — Đảm bảo đã chạy `npm run db:seed` và nhập đúng **username** (không phải email).

---

## Công nghệ sử dụng

**Frontend:** React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, TanStack Query, Zustand, React Hook Form, Recharts

**Backend:** Node.js, Express, Prisma ORM, MySQL, JWT, bcrypt, Zod

---

*Đồ án SE104 — UIT · 2025*
