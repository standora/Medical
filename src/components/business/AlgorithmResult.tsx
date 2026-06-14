import { Progress, Button, Space, Typography } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';

const { Text, Paragraph } = Typography;

interface AlgorithmResultProps {
  confidence: number;
  reason: string;
  onConfirm?: () => void;
  onReject?: () => void;
  loading?: boolean;
}

export default function AlgorithmResult({
  confidence,
  reason,
  onConfirm,
  onReject,
  loading,
}: AlgorithmResultProps) {
  const percent = Math.round(confidence * 100);
  const strokeColor = percent >= 80 ? '#52c41a' : percent >= 60 ? '#faad14' : '#ff4d4f';

  return (
    <div style={{ padding: '12px 0' }}>
      <div style={{ marginBottom: 8 }}>
        <Text type="secondary">置信度：</Text>
        <Progress
          percent={percent}
          strokeColor={strokeColor}
          size="small"
          style={{ display: 'inline-block', width: 200, marginLeft: 8 }}
        />
      </div>
      <Paragraph type="secondary" style={{ marginBottom: 12 }}>
        {reason}
      </Paragraph>
      <Space>
        <Button
          type="primary"
          size="small"
          icon={<CheckOutlined />}
          onClick={onConfirm}
          loading={loading}
        >
          确认
        </Button>
        <Button size="small" icon={<CloseOutlined />} onClick={onReject} danger>
          拒绝
        </Button>
      </Space>
    </div>
  );
}
