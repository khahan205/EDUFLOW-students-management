import { forwardRef } from 'react';
import { formatCurrencyVND, formatDate } from '@/lib/format';
import type { PhieuThu } from '@/types';
import type { ThuHocPhiRow } from '@/types';

interface Props {
  row: ThuHocPhiRow;
  receipts: PhieuThu[];
}

export const PhieuThuPrintView = forwardRef<HTMLDivElement, Props>(({ row, receipts }, ref) => {
  return (
    <div ref={ref} className="hidden print:block p-8 font-sans text-sm text-black">
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold uppercase tracking-wide">Phiếu Thu Học Phí</h1>
        <p className="text-gray-600 mt-1">EduFlow — Hệ thống Quản lý Đào tạo</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6 border rounded p-4">
        <div>
          <p><span className="font-semibold">Sinh viên:</span> {row.TenSV}</p>
          <p><span className="font-semibold">Mã SV:</span> {row.MaSV}</p>
        </div>
        <div>
          <p><span className="font-semibold">Học kỳ:</span> {row.TenHK}</p>
          <p><span className="font-semibold">Ngày in:</span> {formatDate(new Date().toISOString())}</p>
        </div>
      </div>

      <div className="mb-6">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-black">
              <th className="text-left py-2 pr-4">Mã phiếu</th>
              <th className="text-left py-2 pr-4">Ngày thu</th>
              <th className="text-right py-2">Số tiền</th>
            </tr>
          </thead>
          <tbody>
            {receipts.map((p) => (
              <tr key={p.MaPhieuThu} className="border-b border-gray-200">
                <td className="py-1.5 pr-4 font-mono">{p.MaPhieuThu}</td>
                <td className="py-1.5 pr-4">{formatDate(p.NgayThu)}</td>
                <td className="py-1.5 text-right font-mono">{formatCurrencyVND(p.SoTienThu)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t-2 border-black pt-4 space-y-1 text-right">
        <p><span className="font-semibold">Tổng học phí phải đóng:</span> {formatCurrencyVND(row.Tong)}</p>
        <p><span className="font-semibold">Đã đóng:</span> {formatCurrencyVND(row.DaDong)}</p>
        <p className="text-lg font-bold">
          Còn lại: {formatCurrencyVND(row.ConLai)}
        </p>
      </div>
    </div>
  );
});

PhieuThuPrintView.displayName = 'PhieuThuPrintView';
