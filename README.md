# EduFlow

> Hệ thống Quản lý đăng ký môn học và thu học phí — đồ án **SE104** (UIT)

Monorepo gồm 2 package: **frontend** (React + Vite) và **backend** (Express + Prisma + MySQL).
Chỉ cần 1 lệnh để chạy cả hai cùng lúc.

---

## 🚀 Khởi chạy lần đầu

### Yêu cầu
- **Node.js 20+** ([download](https://nodejs.org/))
- **MySQL 8** đang chạy (XAMPP, Docker, hoặc MySQL Server)

### Setup nhanh (3 bước)

```bash
# 1. Cài tất cả dependencies (root + frontend + backend)
npm run install:all

# 2. Copy file môi trường cho cả 2 project + tạo DB schema + seed dữ liệu mẫu
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# → Mở backend/.env và sửa DATABASE_URL theo MySQL local của bạn

npm run db:migrate   # Tạo bảng trong DB
npm run db:seed      # Tạo tài khoản admin/admin + dữ liệu mẫu

# 3. Chạy cả frontend và backend cùng lúc
npm run dev
```

**Kết quả**:
- Backend → http://localhost:8000 (REST API)
- Frontend → http://localhost:5173 (UI)
- Mở **http://localhost:5173** để dùng app

### Tài khoản mặc định

| Username | Password | Vai trò |
|----------|----------|---------|
| `admin` | `admin` | Quản trị viên |
| `pdt` | `pdt` | Phòng đào tạo |
| `ketoan` | `ketoan` | Phòng tài chính |

---

## 📁 Cấu trúc monorepo

```
eduflow/
├── package.json              ← Root workspace
├── README.md                 ← File này
├── .gitignore
├── frontend/                 ← React + TypeScript + Tailwind + shadcn/ui
│   ├── package.json
│   ├── README.md             ← Chi tiết frontend
│   └── src/
└── backend/                  ← Express + Prisma + MySQL + JWT
    ├── package.json
    ├── README.md             ← Chi tiết backend
    ├── prisma/
    │   ├── schema.prisma     ← 14 bảng (13 từ chương 4 + TaiKhoan)
    │   └── seed.js
    └── src/
```

Mỗi package có README riêng giải thích chi tiết cấu trúc folder và API.

---

## 📜 Scripts ở root

```bash
# === DEV ===
npm run dev               # Chạy cả 2 (BE port 8000 + FE port 5173)
npm run dev:backend       # Chỉ backend
npm run dev:frontend      # Chỉ frontend

# === BUILD & PRODUCTION ===
npm run build             # Build frontend ra static files
npm start                 # Chạy backend production

# === DATABASE ===
npm run db:migrate        # Tạo migration mới (dev)
npm run db:seed           # Seed dữ liệu mẫu
npm run db:reset          # ⚠️ Xoá DB và migrate lại từ đầu
npm run db:studio         # Mở Prisma Studio (GUI cho DB)

# === SETUP ===
npm run install:all       # Cài deps cho root + frontend + backend
```

---

## 🏗️ Cách FE và BE giao tiếp

```
Browser (localhost:5173)            Server (localhost:8000)
  ┌─────────────────┐                  ┌─────────────────┐
  │   Frontend      │  HTTP/JSON       │    Backend      │
  │   React + Vite  │ ───────────────► │ Express + JWT   │
  │                 │                  │                 │
  │  - UI/UX        │ ◄─────────────── │  - REST API     │
  │  - State        │     Bearer JWT   │  - Business     │
  │  - Routing      │                  │    logic        │
  └─────────────────┘                  └────────┬────────┘
                                                │ Prisma
                                                ▼
                                       ┌─────────────────┐
                                       │     MySQL       │
                                       │   14 tables     │
                                       └─────────────────┘
```

- Frontend gọi backend qua axios (xem `frontend/src/services/api-client.ts`)
- Backend cấp JWT khi login (xem `backend/src/modules/auth/`)
- Mọi request sau đó phải có header `Authorization: Bearer <token>`
- Frontend lưu token trong localStorage và tự attach vào mỗi request

---

## 🐛 Troubleshooting

**`Error: connect ECONNREFUSED 127.0.0.1:3306`**
→ MySQL chưa chạy. Mở XAMPP / Docker / Service và start MySQL.

**`Error: Database 'eduflow' doesn't exist`**
→ Tạo database trống trước rồi mới chạy migrate:
```bash
mysql -u root -p -e "CREATE DATABASE eduflow CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
npm run db:migrate
```

**`Port 8000 / 5173 đang được dùng`**
→ Có process khác đang dùng. Tắt nó hoặc đổi port:
- Backend: sửa `PORT` trong `backend/.env`
- Frontend: sửa trong `frontend/vite.config.ts` (mục `server.port`)

**Frontend không kết nối được với backend**
→ Kiểm tra `frontend/.env`:
- `VITE_API_BASE_URL=http://localhost:8000/api` (đúng URL backend)
- `VITE_USE_MOCK=false` (để gọi BE thật, không dùng mock)

**Lỗi CORS**
→ Kiểm tra `backend/.env`:
- `FRONTEND_URL=http://localhost:5173` (đúng origin của FE)

---

## 🚢 Deploy

Project có thể deploy theo nhiều cách. Phổ biến nhất:

### Cách 1 — Tách 2 services (recommend)
- **Backend** → Render / Railway / DigitalOcean App / VPS (cần MySQL)
- **Frontend** → Vercel / Netlify / Cloudflare Pages (chỉ static files)
- Sửa `frontend/.env`: `VITE_API_BASE_URL=https://your-backend.com/api`

### Cách 2 — Cùng 1 server (VPS)
1. Build frontend: `npm run build`
2. Copy `frontend/dist/` vào VPS
3. Cấu hình Nginx: 
   - `/api/*` → proxy về `http://localhost:8000`
   - `/*` → serve static `frontend/dist/`
4. Chạy backend với PM2: `pm2 start backend/src/server.js --name eduflow-api`

### Cách 3 — Docker (advanced)
- Cần thêm `docker-compose.yml` (chưa setup sẵn, có thể thêm sau)
- 3 containers: mysql, backend, frontend (Nginx serve static)

---

## 📚 Tài liệu chi tiết

- **Frontend**: [`frontend/README.md`](./frontend/README.md) — chi tiết cấu trúc folder, design tokens, scripts
- **Backend**: [`backend/README.md`](./backend/README.md) — chi tiết API endpoints, phân quyền, business logic
- **Báo cáo Chương 4**: `Chuong4_ThietKeDuLieu.docx` — thiết kế CSDL 13 bảng

---

## 👥 Đóng góp

Project là đồ án SE104 — UIT.

© 2025
