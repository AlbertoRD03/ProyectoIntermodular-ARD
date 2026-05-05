const MONTHS_SHORT_ES = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic'
];

const toDate = (input) => {
  if (!input) return null;
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return null;
  return date;
};

export const formatToHuman = (date) => {
  const parsed = toDate(date);
  if (!parsed) return null;
  const day = parsed.getDate();
  const month = MONTHS_SHORT_ES[parsed.getMonth()];
  const year = parsed.getFullYear();
  return `${day} ${month} ${year}`;
};

export const formatToSQL = (date) => {
  const parsed = toDate(date);
  if (!parsed) return null;
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getRelativeTime = (date) => {
  const parsed = toDate(date);
  if (!parsed) return null;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
  const msPerDay = 24 * 60 * 60 * 1000;
  const diffDays = Math.round((today - target) / msPerDay);

  if (diffDays === 0) return 'Hoy';
  if (diffDays > 0) return `Hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;

  const futureDays = Math.abs(diffDays);
  return `En ${futureDays} ${futureDays === 1 ? 'día' : 'días'}`;
};

export const getStartOfWeek = () => {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMonday);
};
