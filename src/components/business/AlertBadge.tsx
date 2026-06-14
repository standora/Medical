import { Badge } from 'antd';
import { BellOutlined } from '@ant-design/icons';

interface AlertBadgeProps {
  count: number;
  onClick?: () => void;
}

export default function AlertBadge({ count, onClick }: AlertBadgeProps) {
  return (
    <Badge count={count} size="small" offset={[0, 0]}>
      <BellOutlined
        style={{ fontSize: 18, cursor: onClick ? 'pointer' : 'default' }}
        onClick={onClick}
      />
    </Badge>
  );
}
