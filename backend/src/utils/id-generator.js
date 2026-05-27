/**
 * Sinh mã phiếu theo format: <prefix><YYYYMMDD><sequence 3 digit>
 * VD: HP20250915001, PT20250915002
 *
 * Lưu ý: trong production thực nên dùng sequence từ DB hoặc UUID,
 * function này đủ dùng cho đồ án.
 */
export function generateReceiptId(prefix, sequence) {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');
  const seq = String(sequence).padStart(3, '0');
  return `${prefix}${y}${m}${d}${seq}`;
}
