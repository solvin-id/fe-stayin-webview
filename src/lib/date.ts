export const toIsoDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const parseIsoDate = (iso: string): Date => {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const addDays = (iso: string, days: number): string => {
  const date = parseIsoDate(iso);
  date.setDate(date.getDate() + days);
  return toIsoDate(date);
};

export const diffInNights = (checkIn: string, checkOut: string): number => {
  if (!checkIn || !checkOut) {
    return 0;
  }
  const start = parseIsoDate(checkIn).getTime();
  const end = parseIsoDate(checkOut).getTime();
  return Math.max(1, Math.round((end - start) / 86_400_000));
};

export const addMonths = (
  year: number,
  month: number,
  offset: number
): { year: number; month: number } => {
  const date = new Date(year, month + offset, 1);
  return { year: date.getFullYear(), month: date.getMonth() };
};

export const buildMonthCells = (year: number, month: number): Array<string | null> => {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Array<string | null> = [];

  for (let index = 0; index < firstDay; index += 1) {
    cells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(toIsoDate(new Date(year, month, day)));
  }
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }
  return cells;
};

const MONTHS_LONG = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export const monthLabel = (year: number, month: number): string =>
  `${MONTHS_LONG[month]} ${year}`;

export const monthKey = (year: number, month: number): string =>
  `${year}-${(month + 1).toString().padStart(2, '0')}`;

export const resolveCalendarMonth = (
  iso: string,
  minIso: string
): { year: number; month: number } => {
  const target = iso < minIso ? minIso : iso;
  const [year, month] = target.split('-').map(Number);
  return { year, month: month - 1 };
};
