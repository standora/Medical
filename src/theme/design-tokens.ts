/**
 * 医共体智慧药房协同平台 — 全局设计规范
 *
 * 设计理念：医疗行业专业感 + 现代化简洁风格
 * 主色调：深海蓝 (#0B3D91) — 专业、可信赖
 * 辅助色：翡翠绿 (#10B981) — 健康、生命力
 * 警示色：琥珀橙 (#F59E0B) / 珊瑚红 (#EF4444)
 */

// ==================== 色彩体系 ====================

/** 品牌主色 — 深海蓝系 */
export const BRAND = {
  50: '#EFF6FF',
  100: '#DBEAFE',
  200: '#BFDBFE',
  300: '#93C5FD',
  400: '#60A5FA',
  500: '#3B82F6',   // 主色（替代默认 #1677ff）
  600: '#2563EB',
  700: '#1D4ED8',
  800: '#1E40AF',
  900: '#0B3D91',   // 深色品牌
} as const;

/** 语义色 */
export const SEMANTIC = {
  success: '#10B981',    // 翡翠绿 — 正常/完成/通过
  warning: '#F59E0B',    // 琥珀橙 — 预警/待处理
  error:   '#EF4444',    // 珊瑚红 — 严重/异常/拒绝
  info:    '#6366F1',    // 靛蓝 — 信息/提示
} as const;

/** 中性色 */
export const NEUTRAL = {
  50:  '#F9FAFB',
  100: '#F3F4F6',
  200: '#E5E7EB',
  300: '#D1D5DB',
  400: '#9CA3AF',
  500: '#6B7280',
  600: '#4B5563',
  700: '#374151',
  800: '#1F2937',
  900: '#111827',
} as const;

/** 功能色 — 业务场景 */
export const BUSINESS = {
  // 目录类型
  essential:    '#3B82F6',  // 国家基本药物 — 蓝
  insurance:    '#8B5CF6',  // 医保目录 — 紫
  centralized:  '#06B6D4',  // 集采药品 — 青
  keyMonitor:   '#F59E0B',  // 重点监控 — 橙
  antibiotic:   '#EF4444',  // 抗菌药物 — 红

  // 配送类型
  toHospital:   '#3B82F6',  // 医院配送 — 蓝
  toVillage:    '#10B981',  // 村卫生室配送 — 绿
  toHome:       '#F59E0B',  // 到家配送 — 橙

  // 托管模式
  fullHost:     '#3B82F6',  // 全托管 — 蓝
  partialHost:  '#06B6D4',  // 部分托管 — 青

  // 处方类型
  western:      '#3B82F6',  // 西药 — 蓝
  chinese:      '#10B981',  // 中药 — 绿

  // 预警级别
  info:         '#6366F1',  // INFO — 靛蓝
  warning:      '#F59E0B',  // WARNING — 琥珀
  critical:     '#EF4444',  // CRITICAL — 珊瑚红

  // 算法置信度
  high:         '#10B981',  // >=80% — 绿
  medium:       '#F59E0B',  // >=60% — 橙
  low:          '#EF4444',  // <60% — 红
} as const;

// ==================== 间距体系 ====================

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

// ==================== 圆角体系 ====================

export const RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

// ==================== 阴影体系 ====================

export const SHADOW = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.05)',
  card: '0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.06)',
  hover: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
} as const;

// ==================== 字体体系 ====================

export const TYPOGRAPHY = {
  fontFamily: `"Inter", "PingFang SC", "Microsoft YaHei", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`,
  fontSize: {
    xs: 12,
    sm: 13,
    base: 14,
    lg: 16,
    xl: 18,
    '2xl': 20,
    '3xl': 24,
    '4xl': 30,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
} as const;

// ==================== 动效体系 ====================

export const MOTION = {
  durationFast: '150ms',
  durationNormal: '250ms',
  durationSlow: '350ms',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
} as const;

// ==================== 统计卡片颜色映射 ====================

/** 统计卡片图标背景色 + 文字色 */
export const STAT_CARD_COLORS = [
  { bg: '#EFF6FF', text: '#2563EB', icon: '#3B82F6' },  // 蓝
  { bg: '#ECFDF5', text: '#059669', icon: '#10B981' },  // 绿
  { bg: '#FEF3C7', text: '#D97706', icon: '#F59E0B' },  // 橙
  { bg: '#FEE2E2', text: '#DC2626', icon: '#EF4444' },  // 红
  { bg: '#EDE9FE', text: '#7C3AED', icon: '#8B5CF6' },  // 紫
  { bg: '#CFFAFE', text: '#0891B2', icon: '#06B6D4' },  // 青
] as const;

// ==================== Ant Design Theme Token ====================

export const ANT_THEME = {
  token: {
    colorPrimary: BRAND[500],
    colorSuccess: SEMANTIC.success,
    colorWarning: SEMANTIC.warning,
    colorError: SEMANTIC.error,
    colorInfo: SEMANTIC.info,
    colorBgLayout: NEUTRAL[50],
    colorBgContainer: '#FFFFFF',
    colorBorder: NEUTRAL[200],
    colorBorderSecondary: NEUTRAL[100],
    borderRadius: RADIUS.md,
    borderRadiusLG: RADIUS.lg,
    borderRadiusSM: RADIUS.sm,
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: TYPOGRAPHY.fontSize.base,
    controlHeight: 36,
    controlHeightLG: 44,
    controlHeightSM: 28,
  },
  components: {
    Card: {
      borderRadiusLG: RADIUS.lg,
      boxShadowTertiary: SHADOW.card,
    },
    Table: {
      borderRadiusLG: RADIUS.lg,
      headerBg: NEUTRAL[50],
      headerColor: NEUTRAL[700],
      rowHoverBg: BRAND[50],
    },
    Menu: {
      itemBorderRadius: RADIUS.md,
      itemMarginInline: 8,
      itemHeight: 44,
      subMenuItemHeight: 40,
      iconSize: 18,
    },
    Statistic: {
      titleFontSize: TYPOGRAPHY.fontSize.sm,
      contentFontSize: TYPOGRAPHY.fontSize['2xl'],
    },
    Button: {
      borderRadius: RADIUS.md,
      controlHeight: 36,
    },
    Input: {
      borderRadius: RADIUS.md,
    },
    Select: {
      borderRadius: RADIUS.md,
    },
    Modal: {
      borderRadiusLG: RADIUS.xl,
    },
    Drawer: {
      borderRadiusLG: RADIUS.xl,
    },
  },
} as const;
