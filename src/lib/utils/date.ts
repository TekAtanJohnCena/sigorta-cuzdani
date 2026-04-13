// ============================================
// Date Formatting Utilities (Turkish)
// ============================================

const MONTH_NAMES_TR = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
];

const MONTH_NAMES_SHORT_TR = [
  'Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz',
  'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara',
];

const DAY_NAMES_TR = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
const DAY_NAMES_SHORT_TR = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getDate()} ${MONTH_NAMES_TR[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getFullYear()}`;
}

export function formatMonthYear(dateStr: string): string {
  const d = new Date(dateStr);
  return `${MONTH_NAMES_TR[d.getMonth()]} ${d.getFullYear()}`;
}

export function getMonthName(month: number): string {
  return MONTH_NAMES_TR[month];
}

export function getMonthNameShort(month: number): string {
  return MONTH_NAMES_SHORT_TR[month];
}

export function getDayName(day: number): string {
  return DAY_NAMES_TR[day];
}

export function getDayNameShort(day: number): string {
  return DAY_NAMES_SHORT_TR[day];
}

export function daysUntil(dateStr: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function isExpiringSoon(dateStr: string, days = 30): boolean {
  const remaining = daysUntil(dateStr);
  return remaining >= 0 && remaining <= days;
}

export function isExpired(dateStr: string): boolean {
  return daysUntil(dateStr) < 0;
}

export function getRelativeTime(dateStr: string): string {
  const days = daysUntil(dateStr);
  if (days < 0) return `${Math.abs(days)} gün önce sona erdi`;
  if (days === 0) return 'Bugün';
  if (days === 1) return 'Yarın';
  if (days <= 7) return `${days} gün kaldı`;
  if (days <= 30) return `${Math.ceil(days / 7)} hafta kaldı`;
  return `${Math.ceil(days / 30)} ay kaldı`;
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(year: number, month: number): number {
  // 0 = Sunday, adjust to Monday = 0
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}
