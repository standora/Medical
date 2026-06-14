export const PurchaseOrderStatus = {
  PENDING_REVIEW: 'PENDING_REVIEW',
  APPROVED: 'APPROVED',
  PLACED: 'PLACED',
  SHIPPED: 'SHIPPED',
  RECEIVED: 'RECEIVED',
  CANCELLED: 'CANCELLED',
} as const;

export type PurchaseOrderStatus = (typeof PurchaseOrderStatus)[keyof typeof PurchaseOrderStatus];

export const PURCHASE_ORDER_STATUS_LABELS: Record<PurchaseOrderStatus, string> = {
  [PurchaseOrderStatus.PENDING_REVIEW]: '待审核',
  [PurchaseOrderStatus.APPROVED]: '已审核',
  [PurchaseOrderStatus.PLACED]: '已下单',
  [PurchaseOrderStatus.SHIPPED]: '已发货',
  [PurchaseOrderStatus.RECEIVED]: '已签收',
  [PurchaseOrderStatus.CANCELLED]: '已取消',
};
