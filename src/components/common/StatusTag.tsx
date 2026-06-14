import { Tag } from 'antd';
import { SEMANTIC, NEUTRAL, BRAND } from '../../theme/design-tokens';

/** 状态颜色映射 — 使用设计规范中的颜色 */
const statusColorMap: Record<string, string> = {
  // 采购订单状态
  PENDING_REVIEW: SEMANTIC.warning,       // 待审核 → 橙
  APPROVED: SEMANTIC.success,              // 已审批 → 绿
  PLACED: SEMANTIC.warning,               // 已下单 → 橙
  SHIPPED: SEMANTIC.warning,              // 已发货 → 橙
  RECEIVED: SEMANTIC.success,             // 已收货 → 绿
  CANCELLED: SEMANTIC.error,              // 已取消 → 红

  // 采购计划状态
  DRAFT: BRAND[500],                      // 草稿 → 蓝
  SUBMITTED: BRAND[500],                  // 已提交 → 蓝
  // APPROVED 已定义
  REJECTED: SEMANTIC.error,               // 已拒绝 → 红

  // 库存预警状态
  // PENDING 已定义
  ACKNOWLEDGED: SEMANTIC.info,            // 已确认 → 靛蓝
  RESOLVED: SEMANTIC.success,             // 已解决 → 绿

  // 调剂状态
  // PENDING 已定义
  // APPROVED 已定义
  IN_TRANSIT: BRAND[500],                 // 运输中 → 蓝
  COMPLETED: SEMANTIC.success,            // 已完成 → 绿
  // CANCELLED 已定义

  // 结算状态
  // PENDING 已定义
  CONFIRMED: SEMANTIC.success,            // 已确认 → 绿
  PAID: SEMANTIC.success,                 // 已支付 → 绿

  // 对账状态
  // PENDING 已定义
  // CONFIRMED 已定义
  DISPUTED: SEMANTIC.error,               // 有争议 → 红

  // 处方状态
  // DRAFT 已定义
  // SUBMITTED 已定义
  REVIEWING: BRAND[500],                  // 审核中 → 蓝
  REVIEW_PASSED: SEMANTIC.success,        // 审核通过 → 绿
  REVIEW_REJECTED: SEMANTIC.error,        // 审核拒绝 → 红
  DISPENSING: BRAND[500],                 // 调配中 → 蓝
  DISPENSED: SEMANTIC.success,            // 已调配 → 绿
  DELIVERING: BRAND[500],                 // 配送中 → 蓝
  // COMPLETED 已定义
  // CANCELLED 已定义

  // 配送状态
  CREATED: BRAND[500],                    // 已创建 → 蓝
  PICKED_UP: BRAND[500],                  // 已取件 → 蓝
  // IN_TRANSIT 已定义
  DELIVERED: SEMANTIC.success,            // 已送达 → 绿
  EXCEPTION: SEMANTIC.error,              // 异常 → 红
  // CANCELLED 已定义

  // 目录状态
  ACTIVE: SEMANTIC.success,               // 启用 → 绿
  INACTIVE: NEUTRAL[400],                 // 停用 → 灰

  // 托管模式
  FULL_HOST: BRAND[500],                  // 全托管 → 蓝
  PARTIAL_HOST: SEMANTIC.success,         // 部分托管 → 绿

  // 确认状态
  // PENDING 已定义
  // CONFIRMED 已定义
  // REJECTED 已定义

  // 预警级别
  INFO: SEMANTIC.info,                    // 信息 → 靛蓝
  WARNING: SEMANTIC.warning,              // 警告 → 橙
  CRITICAL: SEMANTIC.error,               // 严重 → 红

  // 预警类型
  UPPER_LIMIT: SEMANTIC.warning,          // 上限 → 橙
  LOWER_LIMIT: SEMANTIC.error,            // 下限 → 红
  NEAR_EXPIRY: SEMANTIC.warning,          // 近效期 → 橙
  STOCKOUT_PREDICTION: SEMANTIC.error,    // 缺货预测 → 红

  // 触发类型
  THRESHOLD: SEMANTIC.warning,            // 阈值 → 橙
  SCHEDULED: BRAND[500],                  // 定时 → 蓝

  // 拦截级别
  // WARNING 已定义
  BLOCK: SEMANTIC.error,                  // 拦截 → 红

  // 规则类型
  CONTRAINDICATION: SEMANTIC.error,       // 禁忌 → 红
  DOSAGE: SEMANTIC.warning,               // 用量 → 橙
  DUPLICATE: BRAND[500],                  // 重复 → 蓝
  THERAPY: '#8B5CF6',                     // 疗程 → 紫

  // 配送类型
  TO_HOSPITAL: BRAND[500],                // 医院配送 → 蓝
  TO_VILLAGE: SEMANTIC.success,           // 村卫生室配送 → 绿
  TO_HOME: SEMANTIC.warning,              // 到家配送 → 橙

  // 结算模式
  CENTRALIZED: BRAND[500],                // 集中结算 → 蓝
  INDEPENDENT: SEMANTIC.success,          // 独立结算 → 绿

  // 结算维度
  PRODUCT: BRAND[500],                    // 按产品 → 蓝
  WAREHOUSE: BRAND[500],                  // 按仓库 → 蓝
  SUPPLIER: BRAND[500],                   // 按供应商 → 蓝
  PERIOD: BRAND[500],                     // 按周期 → 蓝

  // 处方类型
  WESTERN: BRAND[500],                    // 西药 → 蓝
  CHINESE: SEMANTIC.success,              // 中药 → 绿

  // 审核结果
  PASSED: SEMANTIC.success,               // 通过 → 绿
  // REJECTED 已定义

  // 启用状态
  ENABLED: SEMANTIC.success,              // 启用 → 绿
  DISABLED: NEUTRAL[400],                 // 停用 → 灰
};

/** 状态标签映射 */
const statusLabelMap: Record<string, string> = {
  // 采购订单状态
  PENDING_REVIEW: '待审核',
  APPROVED: '已审批',
  PLACED: '已下单',
  SHIPPED: '已发货',
  RECEIVED: '已收货',
  CANCELLED: '已取消',

  // 采购计划状态
  DRAFT: '草稿',
  SUBMITTED: '已提交',
  REJECTED: '已拒绝',

  // 库存预警状态
  PENDING: '待处理',
  ACKNOWLEDGED: '已确认',
  RESOLVED: '已解决',

  // 调剂状态
  IN_TRANSIT: '运输中',
  COMPLETED: '已完成',

  // 结算状态
  CONFIRMED: '已确认',
  PAID: '已支付',

  // 对账状态
  DISPUTED: '有争议',

  // 处方状态
  REVIEWING: '审核中',
  REVIEW_PASSED: '审核通过',
  REVIEW_REJECTED: '审核拒绝',
  DISPENSING: '调配中',
  DISPENSED: '已调配',
  DELIVERING: '配送中',

  // 配送状态
  CREATED: '已创建',
  PICKED_UP: '已取件',
  DELIVERED: '已送达',
  EXCEPTION: '异常',

  // 目录状态
  ACTIVE: '启用',
  INACTIVE: '停用',

  // 托管模式
  FULL_HOST: '全托管',
  PARTIAL_HOST: '部分托管',

  // 预警级别
  INFO: '信息',
  WARNING: '警告',
  CRITICAL: '严重',

  // 预警类型
  UPPER_LIMIT: '上限预警',
  LOWER_LIMIT: '下限预警',
  NEAR_EXPIRY: '近效期预警',
  STOCKOUT_PREDICTION: '缺货预测',

  // 触发类型
  THRESHOLD: '阈值触发',
  SCHEDULED: '定时触发',

  // 拦截级别
  BLOCK: '拦截',

  // 规则类型
  CONTRAINDICATION: '禁忌',
  DOSAGE: '用量',
  DUPLICATE: '重复',
  THERAPY: '疗程',

  // 配送类型
  TO_HOSPITAL: '医院配送',
  TO_VILLAGE: '村卫生室配送',
  TO_HOME: '到家配送',

  // 结算模式
  CENTRALIZED: '集中结算',
  INDEPENDENT: '独立结算',

  // 结算维度
  PRODUCT: '按产品',
  WAREHOUSE: '按仓库',
  SUPPLIER: '按供应商',
  PERIOD: '按周期',

  // 处方类型
  WESTERN: '西药',
  CHINESE: '中药',

  // 审核结果
  PASSED: '通过',

  // 启用状态
  ENABLED: '启用',
  DISABLED: '停用',
};

interface StatusTagProps {
  status: string;
  customColor?: string;
  customLabel?: string;
}

export default function StatusTag({ status, customColor, customLabel }: StatusTagProps) {
  const color = customColor || statusColorMap[status] || NEUTRAL[400];
  const label = customLabel || statusLabelMap[status] || status;
  return <Tag color={color}>{label}</Tag>;
}
