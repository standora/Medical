import dayjs from 'dayjs';

export const formatDate = (date: string | Date, format = 'YYYY-MM-DD') => dayjs(date).format(format);
export const formatDateTime = (date: string | Date) => dayjs(date).format('YYYY-MM-DD HH:mm:ss');
export const isExpired = (date: string) => dayjs(date).isBefore(dayjs(), 'day');
export const daysUntil = (date: string) => dayjs(date).diff(dayjs(), 'day');
