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
