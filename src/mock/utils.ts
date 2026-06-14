import dayjs from 'dayjs';

let idCounter = 1;
export const nextId = () => `id-${String(idCounter++).padStart(6, '0')}`;
export const resetId = () => { idCounter = 1; };

export const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
export const randomFloat = (min: number, max: number, decimals = 2) =>
  Number((Math.random() * (max - min) + min).toFixed(decimals));
export const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
export const randomItems = <T>(arr: T[], count: number): T[] => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};
export const randomDate = (start: string, end: string) =>
  dayjs(start).add(randomInt(0, dayjs(end).diff(dayjs(start), 'day')), 'day').format('YYYY-MM-DD');
export const now = () => dayjs().format('YYYY-MM-DD HH:mm:ss');
export const paginate = <T>(items: T[], page = 1, pageSize = 20) => {
  const start = (page - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), total: items.length, page, pageSize, totalPages: Math.ceil(items.length / pageSize) };
};
