export const PRESCRIPTION_STATUS_LIST = [
  { value: 'DRAFT', label: '草稿', color: 'default' },
  { value: 'SUBMITTED', label: '已提交', color: 'processing' },
  { value: 'REVIEWING', label: '审核中', color: 'processing' },
  { value: 'REVIEW_PASSED', label: '审核通过', color: 'success' },
  { value: 'REVIEW_REJECTED', label: '审核驳回', color: 'error' },
  { value: 'DISPENSING', label: '调配中', color: 'processing' },
  { value: 'DISPENSED', label: '已调配', color: 'success' },
  { value: 'DELIVERING', label: '配送中', color: 'processing' },
  { value: 'COMPLETED', label: '已完成', color: 'success' },
  { value: 'CANCELLED', label: '已取消', color: 'default' },
] as const;
