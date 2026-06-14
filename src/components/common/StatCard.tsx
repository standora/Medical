import { Card, Statistic } from 'antd';
import type { ReactNode } from 'react';
import { STAT_CARD_COLORS } from '../../theme/design-tokens';

interface StatCardProps {
  title: string;
  value: number | string;
  icon?: ReactNode;
  suffix?: string;
  prefix?: ReactNode;
  colorIndex?: number; // 0-5，对应STAT_CARD_COLORS
  loading?: boolean;
  trend?: 'up' | 'down' | 'flat'; // 趋势方向
  trendValue?: string; // 趋势值，如 "12.5%"
}

export default function StatCard({
  title, value, icon, suffix, prefix,
  colorIndex = 0, loading, trend, trendValue
}: StatCardProps) {
  const colors = STAT_CARD_COLORS[colorIndex % STAT_CARD_COLORS.length];

  return (
    <Card
      loading={loading}
      className="stat-card"
      styles={{ body: { padding: '20px 24px' } }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ flex: 1 }}>
          <div style={{ color: 'var(--color-text-secondary)', fontSize: 13, marginBottom: 8 }}>
            {title}
          </div>
          <Statistic
            value={value}
            suffix={suffix}
            prefix={prefix}
            styles={{ content: { color: colors.text, fontSize: 28, fontWeight: 600 } }}
          />
          {trend && trendValue && (
            <div style={{ marginTop: 4, fontSize: 12 }}>
              <span style={{
                color: trend === 'up' ? '#10B981' : trend === 'down' ? '#EF4444' : '#9CA3AF'
              }}>
                {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: colors.bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
            color: colors.icon,
          }}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
