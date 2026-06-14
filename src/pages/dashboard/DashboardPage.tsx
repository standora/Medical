import { Row, Col, Card, Statistic } from 'antd';
import {
  BankOutlined,
  TeamOutlined,
  AlertOutlined,
  ShoppingCartOutlined,
  FileTextOutlined,
  SafetyOutlined,
  MedicineBoxOutlined,
  DatabaseOutlined,
  CarOutlined,
  PayCircleOutlined,
  BarChartOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useInventoryStore } from '../../stores/alert.store';
import PageHeader from '../../components/common/PageHeader';
import { STAT_CARD_COLORS } from '../../theme/design-tokens';
import { Typography } from 'antd';

const { Text } = Typography;

const statCards = [
  { title: '机构总数', value: 22, icon: <BankOutlined />, trend: 5.2, trendUp: true },
  { title: '医疗人员总数', value: 186, icon: <TeamOutlined />, trend: 3.8, trendUp: true },
  { title: '库存预警数', value: -1, icon: <AlertOutlined />, trend: 12.5, trendUp: false, useAlert: true },
  { title: '待处理订单数', value: 12, icon: <ShoppingCartOutlined />, trend: 2.1, trendUp: false },
  { title: '今日处方量', value: 47, icon: <FileTextOutlined />, trend: 8.6, trendUp: true },
  { title: '零库存托管覆盖率', value: 86.7, suffix: '%', icon: <SafetyOutlined />, trend: 1.5, trendUp: true },
];

const quickEntries = [
  { key: '/catalog', label: '用药目录', icon: <MedicineBoxOutlined style={{ fontSize: 24 }} /> },
  { key: '/purchase/plan', label: '采购计划', icon: <ShoppingCartOutlined style={{ fontSize: 24 }} /> },
  { key: '/inventory/overview', label: '库存总览', icon: <DatabaseOutlined style={{ fontSize: 24 }} /> },
  { key: '/inventory/alert', label: '库存预警', icon: <AlertOutlined style={{ fontSize: 24 }} /> },
  { key: '/delivery/list', label: '配送列表', icon: <CarOutlined style={{ fontSize: 24 }} /> },
  { key: '/settlement/list', label: '结算列表', icon: <PayCircleOutlined style={{ fontSize: 24 }} /> },
  { key: '/prescription/list', label: '处方列表', icon: <FileTextOutlined style={{ fontSize: 24 }} /> },
  { key: '/stats', label: '统计分析', icon: <BarChartOutlined style={{ fontSize: 24 }} /> },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const alertCount = useInventoryStore((s) => s.alertCount);

  return (
    <div>
      <PageHeader title="首页总览" description="医共体智慧药房协同平台数据概览" />

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {statCards.map((card, index) => {
          const colorConfig = STAT_CARD_COLORS[index % STAT_CARD_COLORS.length];
          const displayValue = card.useAlert ? alertCount : card.value;
          return (
            <Col key={card.title} xs={24} sm={12} md={8} lg={4}>
              <Card
                className="stat-card"
                style={{
                  borderRadius: 12,
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.06)',
                  transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                styles={{ body: { padding: '20px 20px 16px' } }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: colorConfig.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 22,
                      color: colorConfig.icon,
                      flexShrink: 0,
                    }}
                  >
                    {card.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Statistic
                      title={card.title}
                      value={displayValue}
                      suffix={card.suffix}
                      styles={{
                        content: {
                          color: colorConfig.text,
                          fontSize: 24,
                          fontWeight: 600,
                          lineHeight: 1.3,
                        },
                      }}
                    />
                    <div style={{ marginTop: 4, fontSize: 12 }}>
                      {card.trendUp ? (
                        <Text style={{ color: '#10B981', fontSize: 12 }}>
                          <ArrowUpOutlined style={{ fontSize: 10 }} /> {card.trend}%
                        </Text>
                      ) : (
                        <Text style={{ color: '#EF4444', fontSize: 12 }}>
                          <ArrowDownOutlined style={{ fontSize: 10 }} /> {card.trend}%
                        </Text>
                      )}
                      <Text style={{ color: '#9CA3AF', fontSize: 12, marginLeft: 4 }}>较上周</Text>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>

      <div style={{ marginBottom: 12 }}>
        <Text style={{ fontSize: 16, fontWeight: 600, color: '#1F2937' }}>快捷入口</Text>
      </div>
      <Row gutter={[16, 16]}>
        {quickEntries.map((entry) => (
          <Col key={entry.key} xs={12} sm={8} md={6} lg={3}>
            <Card
              hoverable
              style={{
                textAlign: 'center',
                borderRadius: 12,
                cursor: 'pointer',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.06)',
                transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              styles={{ body: { padding: '20px 12px' } }}
              onClick={() => navigate(entry.key)}
            >
              <div style={{ color: '#3B82F6', marginBottom: 8 }}>{entry.icon}</div>
              <Text style={{ fontSize: 13, color: '#374151' }}>{entry.label}</Text>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
