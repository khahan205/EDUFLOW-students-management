import { listPhanCong, assignGiangVien, removeGiangVien, listGiangVienAccounts, listMyClasses } from './phan-cong.service.js';

export async function listPhanCongCtrl(req, res, next) {
  try {
    res.json(await listPhanCong());
  } catch (err) { next(err); }
}

export async function listGiangVienCtrl(req, res, next) {
  try {
    res.json(await listGiangVienAccounts(req.query.maHK));
  } catch (err) { next(err); }
}

export async function assignCtrl(req, res, next) {
  try {
    const { maHK, maMH, maTK } = req.body;
    res.json(await assignGiangVien({ maHK, maMH, maTK: Number(maTK) }));
  } catch (err) { next(err); }
}

export async function listMyClassesCtrl(req, res, next) {
  try {
    res.json(await listMyClasses(req.user.MaTK));
  } catch (err) { next(err); }
}

export async function removeCtrl(req, res, next) {
  try {
    const { maHK, maMH } = req.params;
    await removeGiangVien(maHK, maMH);
    res.json({ ok: true });
  } catch (err) { next(err); }
}
