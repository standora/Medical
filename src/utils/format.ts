export const formatMoney = (amount: number) => `¥${(amount ?? 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export const formatPercent = (value: number) => `${(value ?? 0).toFixed(1)}%`;
export const formatQty = (qty: number) => (qty ?? 0).toLocaleString('zh-CN');
