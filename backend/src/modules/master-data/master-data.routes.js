import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.js';
import { requireRole } from '../../middlewares/require-role.js';
import { asyncHandler } from '../../utils/async-handler.js';
import { validate } from '../../utils/validate.js';
import { prisma } from '../../config/prisma.js';
import { ApiError } from '../../utils/api-error.js';
import { pricingConfigSchema } from '../mon-hoc/mon-hoc.schema.js';
import { getPricingConfig, updatePricingConfig } from '../mon-hoc/mon-hoc.service.js';

const router = Router();
router.use(authenticate);

// ------------- HỌC KỲ -------------
router.get(
  '/hoc-ky',
  asyncHandler(async (_req, res) => {
    res.json(await prisma.hocKy.findMany({ orderBy: { MaHK: 'asc' } }));
  }),
);

router.post(
  '/hoc-ky',
  requireRole('ADMIN', 'PHONG_DAO_TAO'),
  asyncHandler(async (req, res) => {
    const { MaHK, TenHK, NamHoc, NgayBatDau, NgayKetThuc } = req.body;
    if (!MaHK || !TenHK || !NamHoc) return res.status(400).json({ message: 'Thieu thong tin hoc ky.' });
    const exists = await prisma.hocKy.findUnique({ where: { MaHK } });
    if (exists) return res.status(409).json({ message: `Mã học kỳ "${MaHK}" đã tồn tại.` });
    const hk = await prisma.hocKy.create({
      data: {
        MaHK, TenHK, NamHoc, LaHienTai: false,
        NgayBatDau: NgayBatDau ? new Date(NgayBatDau) : null,
        NgayKetThuc: NgayKetThuc ? new Date(NgayKetThuc) : null,
      },
    });
    res.status(201).json(hk);
  }),
);

router.put(
  '/hoc-ky/:maHK',
  requireRole('ADMIN', 'PHONG_DAO_TAO'),
  asyncHandler(async (req, res) => {
    const { TenHK, NamHoc, NgayBatDau, NgayKetThuc } = req.body;
    const hk = await prisma.hocKy.findUnique({ where: { MaHK: req.params.maHK } });
    if (!hk) return res.status(404).json({ message: 'Học kỳ không tồn tại.' });
    const updated = await prisma.hocKy.update({
      where: { MaHK: req.params.maHK },
      data: {
        TenHK: TenHK ?? hk.TenHK,
        NamHoc: NamHoc ?? hk.NamHoc,
        NgayBatDau: NgayBatDau ? new Date(NgayBatDau) : hk.NgayBatDau,
        NgayKetThuc: NgayKetThuc ? new Date(NgayKetThuc) : hk.NgayKetThuc,
      },
    });
    res.json(updated);
  }),
);

router.put(
  '/hoc-ky/:maHK/set-current',
  requireRole('ADMIN', 'PHONG_DAO_TAO'),
  asyncHandler(async (req, res) => {
    // Tắt tất cả HK hiện tại trước
    await prisma.hocKy.updateMany({ data: { LaHienTai: false } });
    const hk = await prisma.hocKy.update({
      where: { MaHK: req.params.maHK },
      data: { LaHienTai: true },
    });
    res.json(hk);
  }),
);

router.delete(
  '/hoc-ky/:maHK',
  requireRole('ADMIN'),
  asyncHandler(async (req, res) => {
    const hasData = await prisma.phieuHocPhi.count({ where: { MaHK: req.params.maHK } });
    if (hasData > 0) return res.status(409).json({ message: `Không thể xóa: học kỳ này đã có ${hasData} phiếu đăng ký.` });
    await prisma.hocKy.delete({ where: { MaHK: req.params.maHK } });
    res.json({ ok: true });
  }),
);

router.get(
  '/hoc-ky/current',
  asyncHandler(async (_req, res) => {
    const hk = await prisma.hocKy.findFirst({ where: { LaHienTai: true } });
    if (!hk) throw ApiError.notFound('Chưa cấu hình học kỳ hiện tại.');
    res.json({ MaHK: hk.MaHK, TenHK: hk.TenHK, NamHoc: hk.NamHoc });
  }),
);

// ------------- QUÊ QUÁN, HUYỆN, ĐỐI TƯỢNG, NGÀNH (dropdown cho FE form) -------------
router.get(
  '/que-quan',
  asyncHandler(async (_req, res) => {
    res.json(await prisma.queQuan.findMany({ include: { huyen: true } }));
  }),
);

router.get(
  '/huyen',
  asyncHandler(async (_req, res) => {
    res.json(await prisma.huyen.findMany());
  }),
);

router.get(
  '/doi-tuong-uu-tien',
  asyncHandler(async (_req, res) => {
    res.json(await prisma.doiTuongUuTien.findMany());
  }),
);

router.get(
  '/nganh-hoc',
  asyncHandler(async (_req, res) => {
    res.json(await prisma.nganhHoc.findMany());
  }),
);

router.get(
  '/loai-mon',
  asyncHandler(async (_req, res) => {
    res.json(await prisma.loaiMon.findMany());
  }),
);

// ------------- PRICING CONFIG (alias /api/cau-hinh/gia mà FE đang gọi) -------------
router.get(
  '/cau-hinh/gia',
  asyncHandler(async (_req, res) => {
    res.json(await getPricingConfig());
  }),
);

router.put(
  '/cau-hinh/gia',
  requireRole('ADMIN', 'PHONG_DAO_TAO'),
  asyncHandler(async (req, res) => {
    const input = validate(pricingConfigSchema, req.body);
    res.json(await updatePricingConfig(input));
  }),
);

// ------------- THAM SỐ HỆ THỐNG (BM15) -------------
router.get(
  '/tham-so',
  asyncHandler(async (_req, res) => {
    res.json(await prisma.thamSo.findMany({ orderBy: { TenThamSo: 'asc' } }));
  }),
);

router.put(
  '/tham-so/:ten',
  requireRole('ADMIN'),
  asyncHandler(async (req, res) => {
    const { ten } = req.params;
    const { giaTri } = req.body;
    if (giaTri === undefined) {
      return res.status(400).json({ message: 'Thiếu giá trị tham số.' });
    }
    const updated = await prisma.thamSo.update({
      where: { TenThamSo: ten },
      data: { GiaTri: String(giaTri) },
    });
    res.json(updated);
  }),
);

export default router;
