import type { ReactNode } from 'react';
import { Typography, Space } from 'antd';

const { Title, Paragraph } = Typography;

interface PageHeaderProps {
  title: string;
  description?: string;
  extra?: ReactNode;
}

export default function PageHeader({ title, description, extra }: PageHeaderProps) {
  return (
    <div style={{
      marginBottom: 20,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingBottom: 16,
      borderBottom: '1px solid var(--color-border)',
    }}>
      <div>
        <Title level={4} style={{ margin: 0, color: 'var(--color-text-primary)' }}>{title}</Title>
        {description && (
          <Paragraph type="secondary" style={{ margin: '4px 0 0', fontSize: 13 }}>
            {description}
          </Paragraph>
        )}
      </div>
      {extra && <Space>{extra}</Space>}
    </div>
  );
}
