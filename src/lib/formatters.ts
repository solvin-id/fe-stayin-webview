const MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
];

const DAYS_SHORT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

const pad = (value: number): string => value.toString().padStart(2, '0');

export const formatCurrency = (value: number): string => {
  const rounded = Math.round(value);
  const sign = rounded < 0 ? '-' : '';
  const digits = Math.abs(rounded)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${sign}Rp ${digits}`;
};

export const formatShortPrice = (value: number): string => {
  if (value >= 1_000_000) {
    const millions = value / 1_000_000;
    return `${Number.isInteger(millions) ? millions : millions.toFixed(1)}jt`;
  }
  if (value >= 1_000) {
    return `${Math.round(value / 1_000)}rb`;
  }
  return `${value}`;
};

export const formatDateShort = (iso: string): string => {
  const [year, month, day] = iso.split('-').map(Number);
  return `${day} ${MONTHS_SHORT[month - 1]} ${year}`;
};

export const formatDateWithDay = (iso: string): string => {
  const [year, month, day] = iso.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return `${DAYS_SHORT[date.getDay()]}, ${day} ${MONTHS_SHORT[month - 1]} ${year}`;
};

export const formatDateRange = (checkIn: string, checkOut: string): string =>
  `${formatDateShort(checkIn)} - ${formatDateShort(checkOut)}`;

export const formatDateCompact = (iso: string): string => {
  const [, month, day] = iso.split('-').map(Number);
  return `${day} ${MONTHS_SHORT[month - 1]}`;
};

export const formatDateRangeCompact = (checkIn: string, checkOut: string): string =>
  `${formatDateCompact(checkIn)} - ${formatDateCompact(checkOut)}`;

export const getIsoYear = (iso: string): string => iso.slice(0, 4);

export const formatCountdown = (totalSeconds: number): string => {
  const safe = Math.max(0, Math.floor(totalSeconds));
  return `${pad(Math.floor(safe / 60))}:${pad(safe % 60)}`;
};

export const formatNights = (nights: number): string => `${nights} Malam`;

export const formatReviewCount = (count: number): string => {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1).replace('.', ',')}rb`;
  }
  return count.toString();
};

export const formatDecimal = (value: number): string => value.toFixed(1).replace('.', ',');
