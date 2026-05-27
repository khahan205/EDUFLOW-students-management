/**
 * Seed dữ liệu mẫu khớp với mock data của frontend.
 * Chạy: npm run db:seed
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Bắt đầu seed dữ liệu...\n');

  // -----------------------------------------------------------------------
  // 1. TÀI KHOẢN MẶC ĐỊNH (cán bộ)
  // -----------------------------------------------------------------------
  console.log('📋 Tạo tài khoản mặc định...');
  const adminPassword = await bcrypt.hash('admin', 10);
  const pdtPassword = await bcrypt.hash('pdt', 10);
  const ketoanPassword = await bcrypt.hash('ketoan', 10);

  await prisma.taiKhoan.upsert({
    where: { Username: 'admin' },
    update: {},
    create: {
      Username: 'admin',
      PasswordHash: adminPassword,
      HoTen: 'Quản trị viên',
      Email: 'admin@eduflow.uit.edu.vn',
      VaiTro: 'ADMIN',
    },
  });
  await prisma.taiKhoan.upsert({
    where: { Username: 'pdt' },
    update: {},
    create: {
      Username: 'pdt',
      PasswordHash: pdtPassword,
      HoTen: 'Phòng đào tạo',
      Email: 'pdt@eduflow.uit.edu.vn',
      VaiTro: 'PHONG_DAO_TAO',
    },
  });
  await prisma.taiKhoan.upsert({
    where: { Username: 'ketoan' },
    update: {},
    create: {
      Username: 'ketoan',
      PasswordHash: ketoanPassword,
      HoTen: 'Phòng tài chính',
      Email: 'ketoan@eduflow.uit.edu.vn',
      VaiTro: 'PHONG_TAI_CHINH',
    },
  });
  console.log('  ✓ admin/admin · pdt/pdt · ketoan/ketoan\n');

  // -----------------------------------------------------------------------
  // 2. MASTER DATA — Huyện, Quê quán, Ngành, Đối tượng UT, Loại môn
  // -----------------------------------------------------------------------
  console.log('📋 Tạo master data...');

  await prisma.huyen.createMany({
    skipDuplicates: true,
    data: [
      { MaHuyen: 'HUYEN_HCM_1', TenHuyen: 'Quận 1', LaVungSauVungXa: false },
      { MaHuyen: 'HUYEN_HN_BD', TenHuyen: 'Ba Đình', LaVungSauVungXa: false },
      { MaHuyen: 'HUYEN_SL_DM', TenHuyen: 'Đăk Mil', LaVungSauVungXa: true },
    ],
  });

  await prisma.queQuan.createMany({
    skipDuplicates: true,
    data: [
      { MaQueQuan: 'QQ_HCM', TenTinh: 'TP. Hồ Chí Minh', MaHuyen: 'HUYEN_HCM_1' },
      { MaQueQuan: 'QQ_HN',  TenTinh: 'Hà Nội',          MaHuyen: 'HUYEN_HN_BD' },
      { MaQueQuan: 'QQ_SL',  TenTinh: 'Sơn La',          MaHuyen: 'HUYEN_SL_DM' },
    ],
  });

  await prisma.doiTuongUuTien.createMany({
    skipDuplicates: true,
    data: [
      { MaDoiTuong: 'DT_KHONG',        TenDoiTuong: 'Không thuộc đối tượng', TiLeGiamHocPhi: 0    },
      { MaDoiTuong: 'DT_TOPDAU',       TenDoiTuong: 'Top đầu khoa',          TiLeGiamHocPhi: 0.5  },
      { MaDoiTuong: 'DT_VUNGSAUVUNGXA', TenDoiTuong: 'Vùng sâu vùng xa',     TiLeGiamHocPhi: 0.3  },
    ],
  });

  await prisma.nganhHoc.createMany({
    skipDuplicates: true,
    data: [
      { MaNganh: 'NG_CNTT', TenNganh: 'Công nghệ thông tin', MaKhoa: 'KHOA_CNTT' },
      { MaNganh: 'NG_KHKT', TenNganh: 'Khoa học máy tính',   MaKhoa: 'KHOA_CNTT' },
    ],
  });

  await prisma.loaiMon.createMany({
    skipDuplicates: true,
    data: [
      { MaLoaiMon: 'LT', TenLoaiMon: 'Lý thuyết', HeSoTinChi: 1.0 },
      { MaLoaiMon: 'TH', TenLoaiMon: 'Thực hành', HeSoTinChi: 1.5 },
    ],
  });
  console.log('  ✓ Master data done\n');

  // -----------------------------------------------------------------------
  // 3. HỌC KỲ
  // -----------------------------------------------------------------------
  console.log('📋 Tạo học kỳ...');
  await prisma.hocKy.createMany({
    skipDuplicates: true,
    data: [
      { MaHK: 'HK_2024_2025_1', TenHK: 'HK1',      NamHoc: '2024-2025', LaHienTai: true,  NgayBatDau: new Date('2024-08-15'), NgayKetThuc: new Date('2024-12-31') },
      { MaHK: 'HK_2024_2025_2', TenHK: 'HK2',      NamHoc: '2024-2025', LaHienTai: false, NgayBatDau: new Date('2025-01-15'), NgayKetThuc: new Date('2025-05-31') },
      { MaHK: 'HK_2024_2025_3', TenHK: 'HK3 (Hè)', NamHoc: '2024-2025', LaHienTai: false, NgayBatDau: new Date('2025-06-15'), NgayKetThuc: new Date('2025-08-15') },
    ],
  });
  console.log('  ✓ 3 học kỳ\n');

  // -----------------------------------------------------------------------
  // 4. SINH VIÊN
  // -----------------------------------------------------------------------
  console.log('📋 Tạo sinh viên...');
  await prisma.sinhVien.createMany({
    skipDuplicates: true,
    data: [
      {
        MaSV: 'S001',
        TenSV: 'Test Student',
        NgaySinh: new Date('2003-05-10'),
        GioiTinh: 'Nam',
        TenLop: 'A',
        Email: 't@t.com',
        TrangThai: 'DANG_HOC',
        MaQueQuan: 'QQ_HCM',
        MaDoiTuong: 'DT_KHONG',
        MaNganh: 'NG_CNTT',
      },
      {
        MaSV: 'SV002',
        TenSV: 'Nguyễn Văn A',
        NgaySinh: new Date('2003-08-22'),
        GioiTinh: 'Nam',
        TenLop: 'CNTT01',
        Email: 'a@example.com',
        TrangThai: 'DANG_HOC',
        MaQueQuan: 'QQ_HN',
        MaDoiTuong: 'DT_KHONG',
        MaNganh: 'NG_CNTT',
      },
    ],
  });
  console.log('  ✓ 2 sinh viên\n');

  // -----------------------------------------------------------------------
  // 5. MÔN HỌC
  // -----------------------------------------------------------------------
  console.log('📋 Tạo môn học...');
  await prisma.monHoc.createMany({
    skipDuplicates: true,
    data: [
      { MaMH: 'MATH102', TenMH: 'Toán cao cấp 1', MaLoaiMon: 'LT', SoTiet: 45, SoTinChi: 3, HocPhi: 1_500_000, HocKy: 'HK1',      TenKhoa: 'Công nghệ thông tin', SiSoToiDa: 50,  SiSoHienTai: 1 },
      { MaMH: 'SHI350',  TenMH: 'meomeo',          MaLoaiMon: 'LT', SoTiet: 60, SoTinChi: 4, HocPhi: 2_000_000, HocKy: 'HK2',      TenKhoa: 'Khoa Khoa học và KTTT', SiSoToiDa: 100, SiSoHienTai: 0 },
      { MaMH: 'TOAN101', TenMH: 'Toán A1',         MaLoaiMon: 'LT', SoTiet: 60, SoTinChi: 4, HocPhi: 2_000_000, HocKy: 'HK1',      TenKhoa: 'CNTT',                  SiSoToiDa: 50,  SiSoHienTai: 0 },
      { MaMH: 'TOAN102', TenMH: 'Toán A2',         MaLoaiMon: 'LT', SoTiet: 60, SoTinChi: 4, HocPhi: 3_000_000, HocKy: 'HK3 (Hè)', TenKhoa: 'CNTT',                  SiSoToiDa: 50,  SiSoHienTai: 0 },
      { MaMH: 'TEST01',  TenMH: 'Test',            MaLoaiMon: 'LT', SoTiet: 45, SoTinChi: 3, HocPhi: 1_500_000, HocKy: 'HK1',      TenKhoa: 'CNTT',                  SiSoToiDa: 50,  SiSoHienTai: 0 },
      { MaMH: 'T01',     TenMH: 'Test 1',          MaLoaiMon: 'LT', SoTiet: 45, SoTinChi: 3, HocPhi: 1_500_000, HocKy: 'HK1',      TenKhoa: 'CNTT',                  SiSoToiDa: 50,  SiSoHienTai: 1 },
      { MaMH: 'T02',     TenMH: 'Test 2',          MaLoaiMon: 'LT', SoTiet: 45, SoTinChi: 3, HocPhi: 2_250_000, HocKy: 'HK3 (Hè)', TenKhoa: 'CNTT',                  SiSoToiDa: 50,  SiSoHienTai: 0 },
    ],
  });
  console.log('  ✓ 7 môn học\n');

  // -----------------------------------------------------------------------
  // 6. MÔN HỌC MỞ trong HK1
  // -----------------------------------------------------------------------
  console.log('📋 Mở môn học...');
  await prisma.monHocMo.createMany({
    skipDuplicates: true,
    data: [
      { MaHK: 'HK_2024_2025_1', MaMH: 'MATH102' },
      { MaHK: 'HK_2024_2025_1', MaMH: 'TOAN101' },
      { MaHK: 'HK_2024_2025_1', MaMH: 'TEST01'  },
      { MaHK: 'HK_2024_2025_1', MaMH: 'T01'     },
      { MaHK: 'HK_2024_2025_2', MaMH: 'SHI350'  },
      { MaHK: 'HK_2024_2025_3', MaMH: 'TOAN102' },
      { MaHK: 'HK_2024_2025_3', MaMH: 'T02'     },
    ],
  });
  console.log('  ✓ Đã mở môn cho cả 3 HK\n');

  // -----------------------------------------------------------------------
  // 7. PHIẾU HỌC PHÍ (đã đăng ký)
  // -----------------------------------------------------------------------
  console.log('📋 Tạo phiếu học phí mẫu...');
  await prisma.phieuHocPhi.createMany({
    skipDuplicates: true,
    data: [
      { MaPhieu: 'HP001', MaSV: 'S001',  MaMH: 'T01',     MaHK: 'HK_2024_2025_1', SoTienDangKy: 1_500_000, SoTienPhaiDong: 1_500_000, NgayLap: new Date('2024-08-15') },
      { MaPhieu: 'HP002', MaSV: 'SV002', MaMH: 'MATH102', MaHK: 'HK_2024_2025_1', SoTienDangKy: 1_500_000, SoTienPhaiDong: 1_500_000, NgayLap: new Date('2024-08-16') },
    ],
  });
  console.log('  ✓ 2 phiếu học phí\n');

  // -----------------------------------------------------------------------
  // 8. PHIẾU THU (đã đóng tiền)
  // -----------------------------------------------------------------------
  console.log('📋 Tạo phiếu thu mẫu...');
  await prisma.phieuThu.createMany({
    skipDuplicates: true,
    data: [
      { MaPhieuThu: 'PT001', MaSV: 'S001',  MaHK: 'HK_2024_2025_1', SoTienThu: 1_500_000, NgayThu: new Date('2024-09-15'), GhiChu: 'Đóng hết HK1' },
      { MaPhieuThu: 'PT002', MaSV: 'SV002', MaHK: 'HK_2024_2025_1', SoTienThu: 1_000_000, NgayThu: new Date('2024-09-20'), GhiChu: 'Đóng đợt 1' },
    ],
  });
  console.log('  ✓ 2 phiếu thu\n');

  // -----------------------------------------------------------------------
  // 9. THAM SỐ HỆ THỐNG
  // -----------------------------------------------------------------------
  console.log('📋 Tạo tham số hệ thống...');
  const thamSos = [
    { TenThamSo: 'don_gia_tin_chi',              GiaTri: '500000',  KieuDuLieu: 'number',  MoTa: 'Đơn giá / 1 tín chỉ (VND)' },
    { TenThamSo: 'he_so_lt',                     GiaTri: '1.0',     KieuDuLieu: 'number',  MoTa: 'Hệ số môn lý thuyết' },
    { TenThamSo: 'he_so_th',                     GiaTri: '1.5',     KieuDuLieu: 'number',  MoTa: 'Hệ số môn thực hành' },
    { TenThamSo: 'ti_le_mien_giam_top_dau',      GiaTri: '0.5',     KieuDuLieu: 'number',  MoTa: 'Tỉ lệ miễn giảm cho top đầu khoa' },
    { TenThamSo: 'ti_le_mien_giam_vung_sau_xa',  GiaTri: '0.3',     KieuDuLieu: 'number',  MoTa: 'Tỉ lệ miễn giảm cho vùng sâu vùng xa' },
    { TenThamSo: 'si_so_toi_da_mac_dinh',        GiaTri: '50',      KieuDuLieu: 'number',  MoTa: 'Sĩ số tối đa mặc định khi tạo môn mới' },
  ];
  for (const ts of thamSos) {
    await prisma.thamSo.upsert({
      where: { TenThamSo: ts.TenThamSo },
      update: { GiaTri: ts.GiaTri, MoTa: ts.MoTa },
      create: ts,
    });
  }
  console.log('  ✓ 6 tham số\n');

  console.log('✅ Seed hoàn tất!');
  console.log('\n👤 Tài khoản mặc định:');
  console.log('  admin   / admin   (Quản trị viên)');
  console.log('  pdt     / pdt     (Phòng đào tạo)');
  console.log('  ketoan  / ketoan  (Phòng tài chính)\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed thất bại:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
