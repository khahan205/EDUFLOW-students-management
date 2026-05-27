# EduFlow — Frontend

> Hệ thống Quản lý đăng ký môn học và thu học phí — đồ án **SE104** (UIT)

Frontend được viết bằng **React 18 + TypeScript + Vite**, styling với **Tailwind CSS + shadcn/ui**, kiến trúc feature-based để dễ mở rộng. Hiện đang chạy với **mock data trong bộ nhớ**; khi backend live, chỉ cần đổi `VITE_USE_MOCK=false` là tất cả request tự động chuyển sang axios.

---

## 🚀 Khởi chạy nhanh

```bash
# 1. Cài đặt dependencies
npm install

# 2. Tạo file môi trường
cp .env.example .env

# 3. Chạy dev server
npm run dev
# → mở http://localhost:5173
```

### Tài khoản demo (mock mode)

| Username | Password | Vai trò             |
|----------|----------|---------------------|
| `admin`  | `admin`  | Quản trị viên       |
| `pdt`    | `pdt`    | Phòng đào tạo       |
| `ketoan` | `ketoan` | Phòng tài chính     |

---

## 🛠️ Tech Stack

| Layer            | Lựa chọn                                      |
|------------------|-----------------------------------------------|
| Build tool       | **Vite 5**                                    |
| Language         | **TypeScript 5** (strict mode)                |
| UI               | **React 18** + **shadcn/ui** + **Tailwind 3** |
| Routing          | **React Router v6**                           |
| Client state     | **Zustand** (auth, UI state)                  |
| Server state     | **TanStack Query v5**                         |
| HTTP             | **Axios** (JWT interceptor sẵn)               |
| Forms            | **React Hook Form** + **Zod**                 |
| Icons            | **Tabler Icons React**                        |
| Font             | **Be Vietnam Pro** (self-hosted, @fontsource) |
| Charts           | **Recharts**                                  |
| Toast            | **Sonner**                                    |

---

## 📁 Cấu trúc thư mục

```
eduflow-frontend/
├── public/                       # Static assets
│   └── favicon.svg
├── src/
│   ├── styles/globals.css        # Tailwind + shadcn CSS variables
│   ├── lib/                      # Helpers thuần (pure)
│   │   ├── utils.ts              #   cn() — merge className
│   │   ├── format.ts             #   formatCurrencyVND, formatDate, ...
│   │   ├── constants.ts          #   ROUTES, NAV_ITEMS, MOCK toggle
│   │   └── delay.ts              #   delay() cho mock API
│   ├── types/index.ts            # Tất cả domain types (13 entities + view models)
│   ├── services/
│   │   ├── api-client.ts         # Axios instance + JWT interceptor
│   │   └── query-client.ts       # TanStack Query config
│   ├── stores/
│   │   └── auth-store.ts         # Zustand store (persist to localStorage)
│   ├── hooks/
│   │   └── use-debounce.ts
│   ├── routes/
│   │   ├── index.tsx             # createBrowserRouter
│   │   ├── ProtectedRoute.tsx
│   │   └── PublicRoute.tsx
│   ├── components/
│   │   ├── ui/                   # shadcn primitives (button, input, dialog, ...)
│   │   ├── layout/               # AppLayout, AuthLayout, Navbar, PageHeader
│   │   └── common/               # StatCard, ActionButton, ConfirmDialog, ...
│   ├── features/                 # === FEATURE MODULES (mỗi feature tự chứa) ===
│   │   ├── auth/
│   │   │   ├── api/              #   gọi backend
│   │   │   ├── components/       #   LoginForm
│   │   │   ├── pages/            #   LoginPage
│   │   │   └── schemas/          #   Zod schema cho form
│   │   ├── dashboard/
│   │   │   ├── api/
│   │   │   ├── components/       #   DashboardStats, RevenueBySemester, OverdueDebts
│   │   │   ├── pages/            #   DashboardPage
│   │   │   └── mocks/            #   dữ liệu mẫu
│   │   ├── sinh-vien/            # CRUD đầy đủ
│   │   ├── mon-hoc/              # CRUD + cấu hình giá
│   │   ├── hoc-phi/              # Thu nhiều đợt + lịch sử
│   │   ├── bao-cao/              # Thống kê + biểu đồ
│   │   ├── dang-ky/              # 🚧 Stub
│   │   └── admin/                # 🚧 Stub
│   ├── App.tsx                   # (không cần — main.tsx render router trực tiếp)
│   ├── main.tsx                  # Entry point
│   └── vite-env.d.ts
├── index.html
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts
├── package.json
└── README.md
```

### Tại sao **feature-based**?

Mỗi feature chứa toàn bộ những gì nó cần (API, components, schemas, mocks). Khi thêm tính năng mới, bạn tạo 1 folder mới, không phải đi sửa 5 chỗ trong codebase. Khi xoá tính năng, bạn xoá 1 folder.

---

## 🎨 Hệ màu (Design tokens)

| Mục đích          | Màu                          | Class Tailwind             |
|-------------------|------------------------------|----------------------------|
| Primary (CTA)     | Teal 700 `#0F766E`           | `bg-teal-700`              |
| Accent            | Coral 500 `#F97316`          | `bg-coral-500`             |
| Background        | Off-white gradient           | (body, set in globals.css) |
| Success           | `#10B981`                    | `bg-success`               |
| Warning           | `#F59E0B`                    | `bg-warning`               |
| Danger            | `#EF4444`                    | `bg-danger`                |
| Info              | `#0EA5E9`                    | `bg-info`                  |

Font: **Be Vietnam Pro** (dấu tiếng Việt chuẩn) + **JetBrains Mono** cho số liệu.

---

## 🔌 Chuyển từ Mock sang Real API

Hiện tại flag `VITE_USE_MOCK=true` trong `.env`. Mỗi API function check flag này:

```ts
// src/features/sinh-vien/api/sinh-vien-api.ts
export async function fetchSinhVienList(): Promise<SinhVien[]> {
  if (USE_MOCK) {
    await delay();
    return sinhVienStore.list();                   // ← in-memory mock
  }
  const { data } = await apiClient.get('/sinh-vien'); // ← real backend
  return data;
}
```

Khi backend ready:

1. Đặt `VITE_USE_MOCK=false` trong `.env`
2. Đặt `VITE_API_BASE_URL=http://your-backend/api`
3. Restart dev server

Không cần sửa bất kỳ component nào.

### REST endpoints kỳ vọng

| Method | Path                                  | Mô tả                             |
|--------|---------------------------------------|-----------------------------------|
| POST   | `/auth/login`                         | Đăng nhập, trả `{user, accessToken}` |
| GET    | `/auth/me`                            | Lấy thông tin user hiện tại       |
| GET    | `/dashboard/stats`                    | Thống kê tổng quan                |
| GET    | `/dashboard/revenue-by-semester`      | Doanh thu theo HK                 |
| GET    | `/dashboard/overdue-debts`            | Công nợ quá hạn                   |
| GET    | `/sinh-vien`                          | Danh sách SV                      |
| POST   | `/sinh-vien`                          | Thêm SV                           |
| PUT    | `/sinh-vien/:maSV`                    | Sửa SV                            |
| DELETE | `/sinh-vien/:maSV`                    | Xoá SV                            |
| GET    | `/mon-hoc`                            | Danh sách môn                     |
| POST   | `/mon-hoc`                            | Thêm môn                          |
| PUT    | `/mon-hoc/:maMH`                      | Sửa môn                           |
| DELETE | `/mon-hoc/:maMH`                      | Xoá môn                           |
| GET    | `/cau-hinh/gia`                       | Lấy cấu hình giá tham số          |
| PUT    | `/cau-hinh/gia`                       | Cập nhật cấu hình giá             |
| GET    | `/hoc-phi`                            | Bảng học phí của các SV           |
| GET    | `/hoc-phi/:maSV/lich-su?ma_hk=...`    | Lịch sử thu của 1 SV trong 1 HK   |
| POST   | `/hoc-phi/thu`                        | Lập phiếu thu mới                 |
| GET    | `/bao-cao/trang-thai-hoc-phi`         | Breakdown trạng thái HP           |
| GET    | `/bao-cao/dang-ky-mon`                | Thống kê đăng ký môn              |
| GET    | `/bao-cao/doanh-thu-trend`            | Trend doanh thu 6 tháng           |

---

## 📜 Scripts

```bash
npm run dev       # Dev server với HMR
npm run build     # Type-check + build production
npm run preview   # Preview bản build
npm run lint      # ESLint
npm run format    # Prettier format
```

---

## ✅ Tình trạng tính năng (vòng đầu)

| Trang        | Trạng thái     | Ghi chú                                              |
|--------------|----------------|------------------------------------------------------|
| Login        | ✅ Full        | Mock 3 tài khoản, validate Zod, toast notification   |
| Dashboard    | ✅ Full        | 5 stat cards + 2 content cards                       |
| Sinh viên    | ✅ Full CRUD   | Thêm/sửa/xoá với modal form + confirm dialog         |
| Môn học      | ✅ Full CRUD   | + Dialog cấu hình giá học phí (tham số hệ thống)    |
| Học phí      | ✅ Full        | Thu nhiều đợt, không cho thu vượt nợ, xem lịch sử   |
| Báo cáo      | ✅ Full        | Progress bar trạng thái + bảng đăng ký + chart trend |
| Đăng ký môn  | 🚧 Stub        | Sẽ làm khi backend ready                             |
| Admin        | 🚧 Stub        | Sẽ làm khi backend ready                             |

---

## 🚢 Deploy

Project build ra tĩnh, deploy được lên bất kỳ host nào:

- **Vercel / Netlify**: kết nối repo → auto-deploy
- **GitHub Pages**: chạy `npm run build`, push `dist/` lên branch `gh-pages`
- **Nginx**: copy `dist/` vào `/var/www/`, config SPA fallback `try_files $uri /index.html`

---

## 📚 Tham khảo nội bộ

- Chương 4 Báo cáo: schema 13 bảng — `Chuong4_ThietKeDuLieu.docx`
- Landing page: `landing-preview/index.html`

---

## 👥 Đóng góp

Project là đồ án môn SE104 — Đại học Công nghệ Thông tin (UIT).

© 2025
