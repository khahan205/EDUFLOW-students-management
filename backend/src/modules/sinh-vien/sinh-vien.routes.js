import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.js';
import { requireRole } from '../../middlewares/require-role.js';
import {
  listCtrl,
  getByMaCtrl,
  createCtrl,
  updateCtrl,
  removeCtrl,
} from './sinh-vien.controller.js';
import { asyncHandler } from '../../utils/async-handler.js';
import { prisma } from '../../config/prisma.js';

const router = Router();

// Mọi route yêu cầu đăng nhập
router.use(authenticate);

// Báo cáo sinh viên miễn giảm học phí
router.get('/bao-cao/mien-giam', requireRole('ADMIN','PHONG_DAO_TAO','PHONG_TAI_CHINH'), asyncHandler(async (req, res) => {
  const { maHK } = req.query;
  // Lấy SV có đối tượng ưu tiên hoặc ở vùng sâu vùng xa
  const svList = await prisma.sinhVien.findMany({
    where: { TrangThai: 'DANG_HOC' },
    include: { doiTuongUuTien: true, queQuan: { include: { huyen: true } }, nganh: true },
  });
  const eligible = svList.filter(sv => {
    const hasDoiTuong = sv.doiTuongUuTien && Number(sv.doiTuongUuTien.TiLeGiamHocPhi) > 0;
    const isVungSau = sv.queQuan?.huyen?.LaVungSauVungXa;
    return hasDoiTuong || isVungSau;
  });
  // Nếu có maHK, tính số tiền tiết kiệm thực tế
  let phieuMap = {};
  if (maHK) {
    const phieus = await prisma.phieuHocPhi.findMany({
      where: { MaHK: maHK, MaSV: { in: eligible.map(s => s.MaSV) }, TrangThai: 'ACTIVE' },
    });
    phieus.forEach(p => {
      if (!phieuMap[p.MaSV]) phieuMap[p.MaSV] = { dangKy: 0, phaiDong: 0 };
      phieuMap[p.MaSV].dangKy += Number(p.SoTienDangKy);
      phieuMap[p.MaSV].phaiDong += Number(p.SoTienPhaiDong);
    });
  }
  res.json(eligible.map(sv => {
    const tileGiam = sv.queQuan?.huyen?.LaVungSauVungXa
      ? Math.max(Number(sv.doiTuongUuTien?.TiLeGiamHocPhi || 0), 0.3)
      : Number(sv.doiTuongUuTien?.TiLeGiamHocPhi || 0);
    const pm = phieuMap[sv.MaSV];
    return {
      MaSV: sv.MaSV, TenSV: sv.TenSV, TenLop: sv.TenLop,
      TenNganh: sv.nganh?.TenNganh,
      TenDoiTuong: sv.doiTuongUuTien?.TenDoiTuong ?? (sv.queQuan?.huyen?.LaVungSauVungXa ? 'Vùng sâu vùng xa' : ''),
      IsVungSau: !!sv.queQuan?.huyen?.LaVungSauVungXa,
      TiLeGiam: tileGiam,
      PhanTramGiam: `${(tileGiam * 100).toFixed(0)}%`,
      SoTienGoc: pm?.dangKy ?? null,
      SoTienPhaiDong: pm?.phaiDong ?? null,
      TietKiem: pm ? pm.dangKy - pm.phaiDong : null,
    };
  }));
}));

// Read: ai cũng xem được
router.get('/', listCtrl);
router.get('/:maSV', getByMaCtrl);

// Write: chỉ admin + phòng đào tạo
const canWrite = requireRole('ADMIN', 'PHONG_DAO_TAO');
router.post('/', canWrite, createCtrl);
router.put('/:maSV', canWrite, updateCtrl);
router.delete('/:maSV', canWrite, removeCtrl);

export default router;
