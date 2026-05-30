# EduFlow — Hệ thống Quản lý Sinh viên

> Đồ án **SE104** · Trường Đại học Công nghệ Thông tin (UIT)

Hệ thống quản lý đăng ký môn học và thu học phí dành cho cán bộ nhà trường.  
Chạy hoàn toàn trên **máy tính cá nhân (localhost)** — không cần server hay internet.

---

## ⚠️ Lưu ý quan trọng trước khi bắt đầu

Đây là project **chạy local**, không có bản demo online. Để chạy được, máy tính cần:

| Phần mềm | Phiên bản | Tải về |
|----------|-----------|--------|
| **Node.js** | 20 trở lên | [nodejs.org](https://nodejs.org/) |
| **MySQL** | 8 trở lên | [XAMPP](https://www.apachefriends.org/) *(khuyến nghị)* hoặc [MySQL Server](https://dev.mysql.com/downloads/) |
| **npm** | 10 trở lên | Đi kèm Node.js |

> **Với XAMPP:** Mở XAMPP Control Panel → Start **Apache** và **MySQL** trước khi chạy project.

---

## Hướng dẫn cài đặt và chạy

### Bước 1 — Clone project về máy

```bash
git clone https://github.com/khahan205/EDUFLOW---students-management.git
cd EDUFLOW---students-management
```

### Bước 2 — Cài đặt tất cả dependencies

```bash
npm run install:all
```

> Lệnh này cài dependencies cho cả frontend và backend cùng lúc. Chờ đến khi hoàn tất.

### Bước 3 — Tạo file cấu hình môi trường

**Windows (Command Prompt):**
```cmd
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env
```

**macOS / Linux:**
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Sau đó mở file `backend/.env` và chỉnh lại **DATABASE_URL** theo MySQL của bạn:

```env
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/eduflow"
JWT_SECRET="eduflow-secret-key"
PORT=8000
```

- Nếu MySQL **không có mật khẩu**: `mysql://root:@localhost:3306/eduflow`
- Nếu dùng **XAMPP mặc định**: `mysql://root:@localhost:3306/eduflow`
- Nếu đặt mật khẩu riêng: thay `YOUR_PASSWORD` bằng mật khẩu đó

### Bước 4 — Tạo database và nhập dữ liệu mẫu

```bash
# Tạo database trống (chỉ cần chạy 1 lần duy nhất)
mysql -u root -p -e "CREATE DATABASE eduflow CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Tạo toàn bộ bảng trong database
cd backend
npx prisma migrate deploy

# Nhập dữ liệu mẫu (40 sinh viên, 15 môn học, 7 tài khoản,...)
npm run db:seed

cd ..
```

### Bước 5 — Khởi động ứng dụng

Mở **2 terminal riêng biệt** và chạy:

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```
Đợi thấy dòng: `EduFlow Backend đang chạy ở: http://localhost:8000`

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```
Đợi thấy dòng: `Local: http://localhost:5173/`

Sau đó mở trình duyệt vào **http://localhost:5173**

---

## Tài khoản đăng nhập mẫu

Mật khẩu tất cả tài khoản: **`363636`**

> Nhập **username** hoặc **email** đều được.

| Username | Email | Vai trò |
|----------|-------|---------|
| `admin` | admin@gmail.com | Quản trị viên |
| `pdt` | pdt@gmail.com | Phòng Đào tạo |
| `ketoan` | ketoan@gmail.com | Phòng Tài chính |
| `gv_mai` | mai.nt@gmail.com | Giảng viên |
| `gv_hung` | hung.tv@gmail.com | Giảng viên |
| `gv_thu` | thu.lt@gmail.com | Giảng viên |
| `gv_duc` | duc.pv@gmail.com | Giảng viên |

---

## Tính năng theo vai trò

| Vai trò | Chức năng |
|---------|-----------|
| **Admin** | Toàn bộ hệ thống · Quản lý tài khoản · Tham số hệ thống · Lịch sử hoạt động |
| **Phòng Đào tạo** | Sinh viên · Môn học · Lớp học phần · Chương trình học · Giảng viên · Thu học phí · Báo cáo · Xét duyệt gia hạn HP |
| **Phòng Tài chính** | Thu học phí · Tra cứu phiếu đăng ký & phiếu thu · Báo cáo tài chính · Xét duyệt gia hạn HP |
| **Giảng viên** | Hồ sơ cá nhân · Lớp học được phân công |

---

## Xử lý lỗi thường gặp

**❌ `ECONNREFUSED 127.0.0.1:3306`**
→ MySQL chưa chạy. Mở XAMPP → Start MySQL. Hoặc khởi động MySQL Service trên Windows.

**❌ `Database 'eduflow' doesn't exist`**
→ Chưa tạo database. Chạy lại lệnh tạo database ở Bước 4.

**❌ Login báo "Tên đăng nhập hoặc mật khẩu không đúng"**
→ Chưa chạy seed. Thực hiện: `cd backend && npm run db:seed`  
→ Hoặc nhập sai username — dùng đúng `admin`, `pdt`, `ketoan`, `gv_mai`... mật khẩu `363636`

**❌ `Port 8000 hoặc 5173 đang bị dùng`**
```bash
taskkill /F /IM node.exe    # Windows — tắt toàn bộ Node.js
```

**❌ Prisma lỗi EPERM khi migrate**
→ Backend đang chạy khóa file. Dừng backend (Ctrl+C) → chạy migrate → khởi động lại.

**❌ Sau khi kéo code mới từ GitHub bị lỗi**
→ Chạy lại migrate để cập nhật schema mới:
```bash
cd backend
npx prisma migrate deploy
npx prisma generate
npm run dev
```

---

## Cấu trúc thư mục

```
EDUFLOW---students-management/
├── frontend/              # React 18 + TypeScript + Vite
│   └── src/
│       ├── components/    # UI components (Sidebar, PageHeader,...)
│       ├── features/      # Các module (sinh-vien, hoc-phi, admin,...)
│       ├── routes/        # Định tuyến + phân quyền theo vai trò
│       └── stores/        # Zustand state (auth)
│
├── backend/               # Express + Prisma ORM + MySQL
│   ├── prisma/
│   │   ├── schema.prisma  # Định nghĩa 15+ bảng CSDL
│   │   ├── migrations/    # Lịch sử thay đổi schema
│   │   └── seed.js        # Script tạo dữ liệu mẫu
│   └── src/
│       ├── modules/       # Auth, SinhVien, MonHoc, HocPhi, BaoCao,...
│       └── middlewares/   # Xác thực JWT, phân quyền RBAC
│
└── package.json           # Root workspace — quản lý cả 2 project
```

---

## Scripts hữu ích

```bash
# Từ thư mục gốc
npm run install:all    # Cài dependencies cho cả frontend + backend

# Từ thư mục backend/
npm run db:migrate     # Cập nhật schema database
npm run db:seed        # Nhập lại dữ liệu mẫu
npm run db:reset       # ⚠️ Xóa sạch DB và tạo lại từ đầu
npm run db:studio      # Mở giao diện quản lý DB trực quan (Prisma Studio)
```

---

## Công nghệ sử dụng

**Frontend:** React 18 · TypeScript · Vite · Tailwind CSS · shadcn/ui · TanStack Query · Zustand · Recharts

**Backend:** Node.js · Express · Prisma ORM · MySQL · JWT · bcrypt · Zod

---

*Đồ án SE104 — UIT · 2025*
