import { Card, Row, Col, Typography, Avatar } from 'antd';
import {
  UserOutlined,
  MedicineBoxOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth-store';
import type { UserRole } from '../../stores/auth-store';
import { BRAND } from '../../theme/design-tokens';

const { Title, Text } = Typography;

const roles: { key: UserRole; title: string; desc: string; icon: React.ReactNode; color: string; bgColor: string }[] = [
  {
    key: 'ADMIN',
    title: '管理员',
    desc: '系统管理、全局配置、数据统计',
    icon: <UserOutlined style={{ fontSize: 36, color: BRAND[500] }} />,
    color: BRAND[500],
    bgColor: BRAND[50],
  },
  {
    key: 'PHARMACIST',
    title: '药师',
    desc: '药品管理、处方审核、库存管理',
    icon: <MedicineBoxOutlined style={{ fontSize: 36, color: '#059669' }} />,
    color: '#059669',
    bgColor: '#ECFDF5',
  },
  {
    key: 'VILLAGE_DOCTOR',
    title: '村医',
    desc: '开具处方、查看库存、药品申领',
    icon: <HomeOutlined style={{ fontSize: 36, color: '#D97706' }} />,
    color: '#D97706',
    bgColor: '#FEF3C7',
  },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const handleLogin = (role: UserRole) => {
    login(role);
    navigate('/dashboard');
  };

  return (
    <div className="login-page">
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <Title level={2} style={{ color: '#fff', marginBottom: 8, fontWeight: 700, letterSpacing: 2 }}>
          医共体智慧药房协同平台
        </Title>
        <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 16, display: 'block', marginBottom: 4 }}>
          县域医共体药品统一管理解决方案
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
          v1.0.0
        </Text>
      </div>
      <Row gutter={24} justify="center">
        {roles.map((role) => (
          <Col key={role.key} xs={24} sm={8} md={7}>
            <Card
              hoverable
              className="login-role-card"
              style={{
                textAlign: 'center',
                cursor: 'pointer',
                borderRadius: 12,
                borderLeft: `4px solid ${role.color}`,
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.06)',
                transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              styles={{ body: { padding: '32px 24px' } }}
              onClick={() => handleLogin(role.key)}
            >
              <Avatar
                size={80}
                icon={role.icon}
                style={{
                  backgroundColor: role.bgColor,
                  marginBottom: 20,
                }}
              />
              <Title level={4} style={{ marginBottom: 8, color: role.color }}>{role.title}</Title>
              <Text type="secondary" style={{ fontSize: 13 }}>{role.desc}</Text>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
