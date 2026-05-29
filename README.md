# EduFlow — Hệ thống Quản lý Sinh viên

> Đồ án **SE104** · Trường Đại học Công nghệ Thông tin (UIT)

Hệ thống quản lý đăng ký môn học và thu học phí dành cho cán bộ nhà trường. Monorepo gồm **Frontend** (React + Vite) và **Backend** (Express + Prisma + MySQL).

---

## Yêu cầu hệ thống

| Công cụ | Phiên bản | Tải về                                                                                        |
| ------- | --------- | --------------------------------------------------------------------------------------------- |
| Node.js | 20+       | [nodejs.org](https://nodejs.org/)                                                             |
| MySQL   | 8+        | [XAMPP](https://www.apachefriends.org/) hoặc [MySQL Server](https://dev.mysql.com/downloads/) |
| npm     | 10+       | Đi kèm Node.js                                                                                |

---

## Cài đặt và chạy (5 bước)

### Bước 1 — Clone project

```bash
git clone https://github.com/khahan205/EDUFLOW-students-management.git
cd EDUFLOW-students-management
```

### Bước 2 — Cài dependencies

```bash
npm run install:all
```

### Bước 3 — Cấu hình môi trường

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Mở file `backend/.env`, sửa dòng `DATABASE_URL` cho khớp với MySQL local:

```env
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/eduflow"
JWT_SECRET="eduflow-secret-key"
PORT=8000
```

> **Lưu ý:** Thay `YOUR_PASSWORD` bằng mật khẩu MySQL của bạn. Nếu không có mật khẩu thì để trống: `mysql://root:@localhost:3306/eduflow`

### Bước 4 — Khởi tạo cơ sở dữ liệu

```bash
# Tạo database (chạy 1 lần duy nhất)
mysql -u root -p -e "CREATE DATABASE eduflow CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Tạo bảng và nhập dữ liệu mẫu
npm run db:migrate
npm run db:seed
```

### Bước 5 — Chạy ứng dụng

Mở **2 terminal riêng biệt**:

```bash
# Terminal 1 — Backend
cd backend
npm run dev
```

```bash
# Terminal 2 — Frontend
cd frontend
npm run dev
```

Hoặc chạy cả hai cùng lúc từ thư mục gốc:

```bash
npm run dev
```

Sau đó mở trình duyệt vào **http://localhost:5173**

---

## Tài khoản mặc định

Mật khẩu tất cả tài khoản: **`363636`**

| Tài khoản | Email             | Vai trò         |
| --------- | ----------------- | --------------- |
| `admin`   | admin@gmail.com   | Quản trị viên   |
| `pdt`     | pdt@gmail.com     | Phòng Đào tạo   |
| `ketoan`  | ketoan@gmail.com  | Phòng Tài chính |
| `gv_mai`  | mai.nt@gmail.com  | Giảng viên      |
| `gv_hung` | hung.tv@gmail.com | Giảng viên      |
| `gv_thu`  | thu.lt@gmail.com  | Giảng viên      |
| `gv_duc`  | duc.pv@gmail.com  | Giảng viên      |

> **Lưu ý:** Ô đăng nhập chấp nhận cả **username** lẫn **email**.

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
│   │   └── seed.js             # Dữ liệu mẫu (40 SV, 15 môn, 7 tài khoản...)
│   └── src/
│       ├── config/             # Cấu hình môi trường, Prisma
│       ├── middlewares/        # Auth, RBAC, error handling
│       ├── modules/            # Các module API
│       └── utils/              # Helpers, JWT, hash
│
└── package.json                # Root workspace scripts
```

---

## Scripts

```bash
# Chạy ứng dụng
npm run dev               # Chạy cả Frontend và Backend cùng lúc
npm run dev:backend       # Chỉ Backend (port 8000)
npm run dev:frontend      # Chỉ Frontend (port 5173)

# Cơ sở dữ liệu
npm run db:migrate        # Tạo/cập nhật bảng trong DB
npm run db:seed           # Nhập dữ liệu mẫu
npm run db:reset          # ⚠️ Xoá toàn bộ và khởi tạo lại DB
npm run db:studio         # Mở Prisma Studio (giao diện quản lý DB)

# Cài đặt
npm run install:all       # Cài dependencies cho toàn bộ project
```

---

## Phân quyền

| Vai trò             | Quyền truy cập                                                          |
| ------------------- | ----------------------------------------------------------------------- |
| **Admin**           | Toàn bộ hệ thống + quản lý tài khoản + tham số hệ thống                 |
| **Phòng Đào tạo**   | Sinh viên, Môn học, Lớp học phần, Chương trình học, Giảng viên, Báo cáo |
| **Phòng Tài chính** | Thu học phí, Tra cứu phiếu, Báo cáo tài chính                           |
| **Giảng viên**      | Hồ sơ cá nhân, Danh sách lớp được phân công                             |

---

## Xử lý sự cố

**`ECONNREFUSED 127.0.0.1:3306`** — MySQL chưa chạy. Khởi động XAMPP hoặc MySQL Service.

**`Database 'eduflow' doesn't exist`** — Chạy lệnh tạo database ở Bước 4.

**`Port 8000/5173 đang bị dùng`** — Tắt process cũ:

```bash
taskkill /F /IM node.exe   # Windows
kill -9 $(lsof -ti:8000)   # macOS/Linux
```

**Login báo sai tài khoản** — Đảm bảo đã chạy `npm run db:seed`. Dùng **username** (vd: `admin`) hoặc **email** (vd: `admin@gmail.com`), mật khẩu `363636`.

**Prisma generate lỗi EPERM** — Backend đang chạy, cần dừng trước rồi chạy `npm run db:migrate`.

---

## Công nghệ sử dụng

**Frontend:** React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, TanStack Query, Zustand, React Hook Form, Recharts

**Backend:** Node.js, Express, Prisma ORM, MySQL, JWT, bcrypt, Zod

---

_Đồ án SE104 — UIT · 2025_
