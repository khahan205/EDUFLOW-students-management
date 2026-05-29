import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.js';
import { requireRole } from '../../middlewares/require-role.js';
import { prisma } from '../../config/prisma.js';
import { asyncHandler } from '../../utils/async-handler.js';
import { ApiError } from '../../utils/api-error.js';

const router = Router();
router.use(authenticate);

const canView = requireRole('ADMIN', 'PHONG_DAO_TAO');
const isGiangVien = requireRole('GIANG_VIEN');

async function buildGVResponse(tk) {
  const phanCongs = await prisma.phanCongGiangDay.findMany({
    where: { MaTK: tk.MaTK },
    include: { monHocMo: { include: { monHoc: { select: { SiSoHienTai: true } } } } },
  });
  const soLop = phanCongs.length;
  const tongSinhVien = phanCongs.reduce((sum, pc) => sum + (pc.monHocMo.monHoc.SiSoHienTai ?? 0), 0);

  return {
    MaTK: tk.MaTK,
    HoTen: tk.HoTen,
    Email: tk.Email,
    Username: tk.Username,
    profile: tk.giangVienProfile ?? null,
    stats: { soLop, tongSinhVien },
  };
}

/* ── Admin / PDT: danh sách tất cả giảng viên ── */
router.get(
  '/',
  canView,
  asyncHandler(async (_req, res) => {
    const rows = await prisma.taiKhoan.findMany({
      where: { VaiTro: 'GIANG_VIEN', TrangThai: 'ACTIVE' },
      include: { giangVienProfile: true },
      orderBy: { HoTen: 'asc' },
    });
    res.json(rows.map((tk) => ({
      MaTK: tk.MaTK,
      HoTen: tk.HoTen,
      Email: tk.Email,
      Username: tk.Username,
      profile: tk.giangVienProfile ?? null,
    })));
  }),
);

/* ── GiangVien: xem hồ sơ của chính mình ── */
router.get(
  '/profile',
  isGiangVien,
  asyncHandler(async (req, res) => {
    const tk = await prisma.taiKhoan.findUnique({
      where: { MaTK: req.user.MaTK },
      include: { giangVienProfile: true },
    });
    res.json(await buildGVResponse(tk));
  }),
);

/* ── GiangVien: cập nhật hồ sơ của chính mình ── */
router.put(
  '/profile',
  isGiangVien,
  asyncHandler(async (req, res) => {
    const maTK = req.user.MaTK;
    const { ngaySinh, khoa, boMon, hocVi, hocHam, namCongTac, quaTrinhCT, anhDaiDien } = req.body;
    const data = {
      NgaySinh: ngaySinh ? new Date(ngaySinh) : null,
      Khoa: khoa ?? null,
      BoMon: boMon ?? null,
      HocVi: hocVi ?? null,
      HocHam: hocHam ?? null,
      NamCongTac: namCongTac ? Number(namCongTac) : null,
      QuaTrinhCT: quaTrinhCT ?? null,
      AnhDaiDien: anhDaiDien ?? null,
    };
    const profile = await prisma.giangVienProfile.upsert({
      where: { MaTK: maTK },
      create: { MaTK: maTK, ...data },
      update: data,
    });
    res.json(profile);
  }),
);

/* ── Admin / PDT: xem hồ sơ 1 giảng viên cụ thể ── */
router.get(
  '/:maTK',
  canView,
  asyncHandler(async (req, res) => {
    const maTK = Number(req.params.maTK);
    if (isNaN(maTK)) throw ApiError.badRequest('maTK không hợp lệ.');
    const tk = await prisma.taiKhoan.findUnique({
      where: { MaTK: maTK },
      include: { giangVienProfile: true },
    });
    if (!tk || tk.VaiTro !== 'GIANG_VIEN') throw ApiError.notFound('Giảng viên không tồn tại.');
    res.json(await buildGVResponse(tk));
  }),
);

export default router;
