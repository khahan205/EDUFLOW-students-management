# EduFlow — Backend

> REST API cho hệ thống Quản lý đăng ký môn học và thu học phí — đồ án **SE104** (UIT)

Node.js + Express + Prisma + MySQL. Kiến trúc module-based khớp với frontend.

---

## 🚀 Khởi chạy lần đầu

```bash
# 1. Cài dependencies
npm install

# 2. Cấu hình môi trường
cp .env.example .env
# → Mở .env và sửa DATABASE_URL với MySQL local của bạn

# 3. Tạo DB schema + tables (chạy migration)
npm run db:migrate

# 4. Seed dữ liệu mẫu (admin/admin, sinh viên, môn học, ...)
npm run db:seed

# 5. Chạy dev server (auto-reload khi sửa code)
npm run dev
```

Server chạy ở **http://localhost:8000**.

Health check: `GET http://localhost:8000/api/health` → `{"status":"ok"}`

### Tài khoản mặc định (sau khi seed)

| Username | Password | Vai trò |
|----------|----------|---------|
| `admin` | `admin` | Quản trị viên |
| `pdt` | `pdt` | Phòng đào tạo |
| `ketoan` | `ketoan` | Phòng tài chính |

---

## 🛠️ Tech Stack

| Layer | Lựa chọn |
|-------|----------|
| Runtime | **Node.js 20+** (sử dụng ESM, `--env-file` flag) |
| Framework | **Express 4** |
| ORM | **Prisma 5** — auto-gen migration, type-safe queries |
| DB | **MySQL 8** |
| Auth | **JWT** (jsonwebtoken) + **bcrypt** |
| Validation | **Zod** (cùng lib với frontend → có thể share schema) |
| Security | helmet, cors, compression |
| Logging | morgan |

---

## 📁 Cấu trúc thư mục

```
eduflow-backend/
├── prisma/
│   ├── schema.prisma         # Định nghĩa 14 bảng (13 từ chương 4 + TaiKhoan)
│   ├── migrations/           # Auto-gen khi chạy db:migrate
│   └── seed.js               # Dữ liệu mẫu
├── src/
│   ├── config/
│   │   ├── env.js            # Validate biến môi trường — fail fast
│   │   └── prisma.js         # Prisma singleton client
│   ├── middlewares/
│   │   ├── auth.js           # Verify JWT, attach req.user
│   │   ├── require-role.js   # Phân quyền theo vai trò
│   │   └── error.js          # Error handler + 404 handler
│   ├── utils/
│   │   ├── api-error.js      # Custom ApiError class
│   │   ├── async-handler.js  # Wrap async để bắt error tự động
│   │   ├── validate.js       # Validate body/query với Zod
│   │   ├── jwt.js            # sign / verify token
│   │   ├── hash.js           # bcrypt wrap
│   │   ├── role-map.js       # Convert UPPER_SNAKE ↔ kebab-case
│   │   └── id-generator.js   # Sinh mã phiếu (HP/PT + YYYYMMDD)
│   ├── modules/              # === FEATURE-BASED giống frontend ===
│   │   ├── auth/             # login, me, change-password
│   │   ├── sinh-vien/        # CRUD sinh viên
│   │   ├── mon-hoc/          # CRUD môn học + pricing config
│   │   ├── dang-ky/          # Đăng ký môn (tính học phí + transaction)
│   │   ├── hoc-phi/          # Thu nhiều đợt, không vượt nợ
│   │   ├── bao-cao/          # Báo cáo thống kê
│   │   ├── admin/            # Quản lý tài khoản (chỉ admin)
│   │   └── master-data/      # Học kỳ, quê quán, ngành, pricing
│   ├── app.js                # Setup Express, middleware, routes
│   └── server.js             # Entry point + graceful shutdown
├── .env.example
└── package.json
```

Mỗi module có cùng pattern:
- `<module>.schema.js` — Zod schemas
- `<module>.service.js` — Business logic (gọi Prisma)
- `<module>.controller.js` — HTTP layer
- `<module>.routes.js` — Mount routes + middleware

---

## 🔌 API Endpoints

### Auth

| Method | Path | Quyền | Mô tả |
|--------|------|-------|-------|
| POST | `/api/auth/login` | public | Đăng nhập, trả `{user, accessToken}` |
| GET | `/api/auth/me` | authenticated | Thông tin user hiện tại |
| POST | `/api/auth/change-password` | authenticated | Đổi mật khẩu |
| POST | `/api/auth/logout` | authenticated | (Stateless — FE xoá token) |

### Sinh viên

| Method | Path | Quyền | Mô tả |
|--------|------|-------|-------|
| GET | `/api/sinh-vien` | mọi user | Danh sách SV |
| GET | `/api/sinh-vien/:maSV` | mọi user | Chi tiết SV |
| POST | `/api/sinh-vien` | admin, pdt | Thêm SV |
| PUT | `/api/sinh-vien/:maSV` | admin, pdt | Sửa SV |
| DELETE | `/api/sinh-vien/:maSV` | admin, pdt | Xoá SV (chỉ khi chưa có phiếu HP) |

### Môn học

| Method | Path | Quyền | Mô tả |
|--------|------|-------|-------|
| GET | `/api/mon-hoc` | mọi user | Danh sách môn |
| GET | `/api/mon-hoc/:maMH` | mọi user | Chi tiết môn |
| POST | `/api/mon-hoc` | admin, pdt | Thêm môn |
| PUT | `/api/mon-hoc/:maMH` | admin, pdt | Sửa môn |
| DELETE | `/api/mon-hoc/:maMH` | admin, pdt | Xoá môn (chỉ khi chưa có đăng ký) |
| GET | `/api/cau-hinh/gia` | mọi user | Lấy cấu hình giá (đơn giá tín chỉ, hệ số, tỉ lệ miễn giảm) |
| PUT | `/api/cau-hinh/gia` | admin, pdt | Cập nhật cấu hình giá |

### Đăng ký môn

| Method | Path | Quyền | Mô tả |
|--------|------|-------|-------|
| GET | `/api/dang-ky/:maSV/mon-mo?ma_hk=...` | mọi user | Môn được mở + đã đăng ký |
| POST | `/api/dang-ky` | admin, pdt | Đăng ký môn cho SV |
| DELETE | `/api/dang-ky` | admin, pdt | Huỷ đăng ký (chỉ khi chưa thu tiền) |

### Học phí

| Method | Path | Quyền | Mô tả |
|--------|------|-------|-------|
| GET | `/api/hoc-phi` | mọi user | Danh sách tình trạng HP của các SV |
| GET | `/api/hoc-phi/:maSV/lich-su?ma_hk=...` | mọi user | Lịch sử phiếu thu |
| POST | `/api/hoc-phi/thu` | admin, ketoan | Lập phiếu thu (không vượt nợ) |

### Dashboard / Báo cáo

| Method | Path | Quyền | Mô tả |
|--------|------|-------|-------|
| GET | `/api/dashboard/stats` | authenticated | 5 stat cards |
| GET | `/api/dashboard/revenue-by-semester` | authenticated | Doanh thu theo HK |
| GET | `/api/dashboard/overdue-debts` | authenticated | Công nợ quá hạn |
| GET | `/api/bao-cao/trang-thai-hoc-phi` | authenticated | Breakdown trạng thái HP |
| GET | `/api/bao-cao/dang-ky-mon` | authenticated | Thống kê đăng ký môn |
| GET | `/api/bao-cao/doanh-thu-trend` | authenticated | Trend 6 tháng |

### Admin

| Method | Path | Quyền | Mô tả |
|--------|------|-------|-------|
| GET | `/api/admin/tai-khoan` | admin | Danh sách tài khoản |
| POST | `/api/admin/tai-khoan` | admin | Tạo tài khoản mới |
| PUT | `/api/admin/tai-khoan/:id` | admin | Sửa thông tin tài khoản |
| POST | `/api/admin/tai-khoan/:id/reset-password` | admin | Reset password |
| DELETE | `/api/admin/tai-khoan/:id` | admin | Xoá tài khoản |

### Master Data (dropdowns cho form)

| Method | Path | Mô tả |
|--------|------|-------|
| GET | `/api/hoc-ky` | Tất cả học kỳ |
| GET | `/api/hoc-ky/current` | Học kỳ đang active |
| GET | `/api/que-quan` | Danh sách quê quán |
| GET | `/api/huyen` | Danh sách huyện |
| GET | `/api/doi-tuong-uu-tien` | Đối tượng ưu tiên |
| GET | `/api/nganh-hoc` | Ngành học |
| GET | `/api/loai-mon` | Loại môn (LT/TH) |

---

## 🔒 Phân quyền (Authorization)

5 vai trò:
- **ADMIN** — toàn quyền
- **PHONG_DAO_TAO** — quản lý SV, môn học, đăng ký, mở môn
- **PHONG_TAI_CHINH** — thu học phí, xem báo cáo
- **GIANG_VIEN** — read-only (sẽ implement chi tiết sau)
- **CO_VAN** — read-only (sẽ implement chi tiết sau)

Mọi endpoint (trừ `/auth/login` và `/health`) đều yêu cầu JWT trong header:
```
Authorization: Bearer <accessToken>
```

---

## 💡 Business Logic đáng chú ý

### Tính học phí (`dang-ky.service.js`)
- Lấy `HocPhi` của môn
- Áp tỉ lệ miễn giảm theo đối tượng ưu tiên của SV
- Nếu SV thuộc huyện vùng sâu vùng xa, áp thêm tỉ lệ giảm (từ ThamSo)
- Round xuống đơn vị 1000đ

### Thu học phí nhiều đợt (`hoc-phi.service.js`)
- Tổng = sum của `PhieuHocPhi.SoTienPhaiDong`
- Đã đóng = sum của `PhieuThu.SoTienThu`
- Còn lại = Tổng - Đã đóng
- **Không cho thu vượt số nợ còn lại** — validate trong transaction để tránh race condition

### Huỷ đăng ký (`dang-ky.service.js`)
- Cho huỷ nếu CHƯA có phiếu thu nào trong HK
- Nếu đã đóng tiền → bắt liên hệ phòng tài chính để xử lý hoàn tiền

### Tham số hoá quy định (`mon-hoc.service.js`)
- Mọi tham số (đơn giá tín chỉ, hệ số, tỉ lệ miễn giảm) lưu trong bảng `ThamSo`
- Sửa quy định = sửa 1 row, không deploy lại code

---

## 📜 Scripts

```bash
npm run dev              # Dev server (auto-reload, đọc .env tự động)
npm start                # Production server
npm run db:generate      # Sinh Prisma Client
npm run db:migrate       # Tạo migration mới (dev)
npm run db:migrate:deploy # Apply migration trên production
npm run db:seed          # Seed dữ liệu mẫu
npm run db:studio        # Mở Prisma Studio (GUI cho DB)
npm run db:reset         # ⚠️ Xoá toàn bộ DB và migrate lại từ đầu
npm run lint             # ESLint
```

---

## 🐛 Troubleshooting

**Lỗi "Thiếu biến môi trường"**
→ Bạn chưa copy `.env.example` sang `.env` hoặc chưa điền `DATABASE_URL` / `JWT_SECRET`.

**Lỗi "Can't reach database server"**
→ MySQL chưa chạy. Khởi động MySQL (XAMPP, Docker, MySQL service). Kiểm tra `DATABASE_URL` đúng format: `mysql://user:password@host:port/database_name`.

**Lỗi "Migration failed"**
→ DB hiện tại có schema cũ xung đột. Chạy `npm run db:reset` để xoá và migrate lại từ đầu (chỉ làm khi không quan tâm dữ liệu hiện tại).

**Lỗi "JWT expired"**
→ Token hết hạn. Đăng nhập lại. Có thể tăng `JWT_EXPIRES_IN` trong `.env` (vd "30d").

**CORS error từ frontend**
→ Kiểm tra `FRONTEND_URL` trong `.env` khớp với origin của frontend (vd `http://localhost:5173`).

---

## 🚢 Deploy

### Production checklist

1. Đổi `JWT_SECRET` thành chuỗi ngẫu nhiên dài (≥32 ký tự)
2. Đặt `NODE_ENV=production`
3. Đặt `BCRYPT_ROUNDS=12` (chậm hơn nhưng an toàn hơn)
4. `npm run db:migrate:deploy` thay vì `db:migrate`
5. Dùng process manager (PM2) hoặc Docker
6. Đặt reverse proxy (Nginx/Caddy) trước Express

### Ví dụ với PM2

```bash
npm install -g pm2
pm2 start src/server.js --name eduflow-api
pm2 startup        # Tự khởi động sau reboot
pm2 save
```

---

## 👥 Liên hệ

Project là đồ án SE104 — UIT.

© 2025
