import { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Statistic, Tag, Progress, message, Button, Space, Tooltip } from 'antd';
import {
  RobotOutlined,
  CheckCircleOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { AutoReplenishment } from '../../types/inventory.types';
import { useInventoryStore } from '../../stores/inventory.store';
import { useAuthStore } from '../../stores/auth-store';
import { inventoryService } from '../../services/inventory.service';
import PageHeader from '../../components/common/PageHeader';
import SearchForm from '../../components/common/SearchForm';
import type { SearchField } from '../../components/common/SearchForm';
import DataTable from '../../components/common/DataTable';
import StatusTag from '../../components/common/StatusTag';
import OrgTreeSelect from '../../components/common/OrgTreeSelect';
import AlgorithmResult from '../../components/business/AlgorithmResult';
import { formatQty } from '../../utils/format';
import { ReplenishmentAlgorithm } from '../../algorithms/replenishment.algorithm';
import { simulateDelay } from '../../utils/simulate-delay';

const triggerTypeLabelMap: Record<string, string> = {
  THRESHOLD: '阈值触发',
  SCHEDULED: '定时触发',
};

const triggerTypeColorMap: Record<string, string> = {
  THRESHOLD: 'orange',
  SCHEDULED: 'blue',
};

const searchFields: SearchField[] = [
  {
    name: 'triggerType',
    label: '触发类型',
    type: 'select',
    placeholder: '请选择触发类型',
    options: [
      { label: '阈值触发', value: 'THRESHOLD' },
      { label: '定时触发', value: 'SCHEDULED' },
    ],
  },
  {
    name: 'confirmStatus',
    label: '确认状态',
    type: 'select',
    placeholder: '请选择确认状态',
    options: [
      { label: '待确认', value: 'PENDING' },
      { label: '已确认', value: 'CONFIRMED' },
      { label: '已拒绝', value: 'REJECTED' },
    ],
  },
];

export default function AutoReplenishmentPage() {
  const { autoReplenishments, loading, setAutoReplenishments, setLoading } = useInventoryStore();
  const user = useAuthStore((s) => s.user);
  const isPharmacist = user?.role === 'PHARMACIST';
  const [orgId, setOrgId] = useState<string | undefined>();
  const [searchParams, setSearchParams] = useState<Record<string, string>>({});
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);
  const [pagination, setPagination] = useState<{ page: number; pageSize: number; total: number; items: AutoReplenishment[]; totalPages: number }>({ page: 1, pageSize: 10, total: 0, items: [], totalPages: 0 });
  const [triggering, setTriggering] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await inventoryService.getAutoReplenishments();
      setAutoReplenishments(res.items);
      setPagination((prev) => ({ ...prev, total: res.total }));
    } catch {
      message.error('获取自动补货数据失败');
    } finally {
      setLoading(false);
    }
  }, [setAutoReplenishments, setLoading]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredData = (autoReplenishments || []).filter((item) => {
    if (orgId && item.orgId !== orgId) return false;
    if (searchParams.triggerType && item.triggerType !== searchParams.triggerType) return false;
    if (searchParams.confirmStatus && item.confirmStatus !== searchParams.confirmStatus) return false;
    return true;
  });

  const pendingCount = (autoReplenishments || []).filter((a) => a.confirmStatus === 'PENDING').length;
  const confirmedCount = (autoReplenishments || []).filter((a) => a.confirmStatus === 'CONFIRMED').length;
  const avgConfidence =
    (autoReplenishments || []).length > 0
      ? (autoReplenishments || []).reduce((sum, a) => sum + a.confidence, 0) / (autoReplenishments || []).length
      : 0;

  const handleConfirm = async (record: AutoReplenishment) => {
    try {
      await inventoryService.updateAutoReplenishment(record.id, { confirmStatus: 'CONFIRMED', confirmedBy: 'current-user' });
      setAutoReplenishments(
        autoReplenishments.map((a) =>
          a.id === record.id ? { ...a, confirmStatus: 'CONFIRMED' as const, confirmedBy: 'current-user' } : a,
        ),
      );
      message.success('已确认补货建议');
    } catch {
      message.error('操作失败');
    }
  };

  const handleReject = async (record: AutoReplenishment) => {
    try {
      await inventoryService.updateAutoReplenishment(record.id, { confirmStatus: 'REJECTED' });
      setAutoReplenishments(
        autoReplenishments.map((a) =>
          a.id === record.id ? { ...a, confirmStatus: 'REJECTED' as const } : a,
        ),
      );
      message.info('已拒绝补货建议');
    } catch {
      message.error('操作失败');
    }
  };

  // 手动触发补货算法
  const handleTriggerAlgorithm = async () => {
    setTriggering(true);
    try {
      // 模拟延迟
      await simulateDelay(1500);
      // 使用补货算法计算几个示例
      const newSuggestions = autoReplenishments.slice(0, 3).map((item) => {
        const result = ReplenishmentAlgorithm.calculate({
          drugId: item.drugId,
          orgId: item.orgId,
          currentQty: Math.floor(Math.random() * 100),
          lowerLimit: 30,
          dailyConsumption: Array.from({ length: 14 }, () => Math.floor(Math.random() * 10 + 1)),
          seasonFactors: [1.0, 1.0, 1.1, 1.1, 1.0, 0.9, 0.9, 0.9, 1.0, 1.0, 1.1, 1.2],
          safetyStockDays: 7,
          leadTimeDays: 3,
        });
        return result
          ? { ...item, suggestedQty: result.suggestedQty, confidence: result.confidence, reason: result.reason }
          : item;
      });
      setAutoReplenishments(
        autoReplenishments.map((item) => {
          const updated = newSuggestions.find((s) => s.id === item.id);
          return updated || item;
        }),
      );
      message.success('AI补货算法执行完成，已更新补货建议');
    } catch {
      message.error('算法执行失败');
    } finally {
      setTriggering(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    const percent = Math.round(confidence * 100);
    if (percent >= 80) return '#52c41a';
    if (percent >= 60) return '#faad14';
    return '#ff4d4f';
  };

  const columns: ColumnsType<AutoReplenishment> = [
    { title: '机构名称', dataIndex: 'orgName', key: 'orgName', width: 180, ellipsis: true },
    { title: '药品名称', dataIndex: 'drugName', key: 'drugName', width: 160, ellipsis: true },
    {
      title: '建议补货量',
      dataIndex: 'suggestedQty',
      key: 'suggestedQty',
      width: 110,
      align: 'right',
      render: (val: number) => <span style={{ fontWeight: 600 }}>{formatQty(val)}</span>,
    },
    {
      title: '触发类型',
      dataIndex: 'triggerType',
      key: 'triggerType',
      width: 110,
      render: (val: string) => (
        <Tag color={triggerTypeColorMap[val] || 'default'}>{triggerTypeLabelMap[val] || val}</Tag>
      ),
    },
    {
      title: '置信度',
      dataIndex: 'confidence',
      key: 'confidence',
      width: 180,
      render: (val: number) => {
        const percent = Math.round(val * 100);
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Progress
              percent={percent}
              size="small"
              strokeColor={getConfidenceColor(val)}
              style={{ width: 100, marginBottom: 0 }}
            />
            <span style={{ color: getConfidenceColor(val), fontSize: 12 }}>{percent}%</span>
          </div>
        );
      },
    },
    {
      title: '确认状态',
      dataIndex: 'confirmStatus',
      key: 'confirmStatus',
      width: 100,
      render: (status: string) => <StatusTag status={status} />,
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      fixed: 'right',
      render: (_: unknown, record: AutoReplenishment) => (
        <a
          onClick={() => {
            const keys = expandedRowKeys.includes(record.id)
              ? expandedRowKeys.filter((k) => k !== record.id)
              : [...expandedRowKeys, record.id];
            setExpandedRowKeys(keys);
          }}
        >
          {expandedRowKeys.includes(record.id) ? '收起' : '详情'}
        </a>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="AI智能补货"
        description={isPharmacist ? 'AI智能补货建议确认——审核并确认系统推荐的补货方案' : 'AI智能补货——基于历史用药数据和季节性分析，自动计算补货建议'}
        extra={
          <Space>
            <Tooltip title={user?.role === 'PHARMACIST' || user?.role === 'ADMIN' ? '手动触发AI补货算法，重新计算补货建议' : '需要药师或管理员权限'}>
              <Button
                type="primary"
                icon={<ThunderboltOutlined />}
                onClick={handleTriggerAlgorithm}
                loading={triggering}
                disabled={user?.role !== 'ADMIN' && user?.role !== 'PHARMACIST'}
              >
                触发算法
              </Button>
            </Tooltip>
          </Space>
        }
      />

      {isPharmacist && pendingCount > 0 && (
        <Card
          style={{ marginBottom: 16, background: '#f6ffed', borderColor: '#b7eb8f' }}
          size="small"
        >
          <Space>
            <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 18 }} />
            <span style={{ fontWeight: 500 }}>
              有 <span style={{ color: '#52c41a', fontWeight: 700, fontSize: 16 }}>{pendingCount}</span> 条补货建议待确认，请审核处理
            </span>
          </Space>
        </Card>
      )}

      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8} lg={6}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ whiteSpace: 'nowrap', color: '#666' }}>机构：</span>
              <OrgTreeSelect value={orgId} onChange={(val) => setOrgId(val)} placeholder="请选择机构" />
            </div>
          </Col>
          <Col xs={24} sm={24} md={16} lg={18}>
            <SearchForm
              fields={searchFields}
              onSearch={(values) => setSearchParams(values)}
              onReset={() => setSearchParams({})}
            />
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={8}>
          <Card>
            <Statistic
              title="待确认数"
              value={pendingCount}
              prefix={<ThunderboltOutlined />}
              styles={{ content: { color: '#faad14' } }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card>
            <Statistic
              title="已确认数"
              value={confirmedCount}
              prefix={<CheckCircleOutlined />}
              styles={{ content: { color: '#52c41a' } }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card>
            <Statistic
              title="平均置信度"
              value={avgConfidence * 100}
              suffix="%"
              precision={1}
              prefix={<RobotOutlined />}
              styles={{ content: { color: '#1677ff' } }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <DataTable<AutoReplenishment>
          rowKey="id"
          columns={columns}
          dataSource={filteredData}
          loading={loading}
          scroll={{ x: 1000 }}
          expandable={{
            expandedRowKeys,
            onExpandedRowsChange: (keys) => setExpandedRowKeys(keys as string[]),
            expandedRowRender: (record) => (
              <AlgorithmResult
                confidence={record.confidence}
                reason={record.reason}
                onConfirm={() => handleConfirm(record)}
                onReject={() => handleReject(record)}
                loading={loading}
              />
            ),
          }}
          pagination={pagination}
          onPageChange={(page, pageSize) =>
            setPagination((prev) => ({ ...prev, page, pageSize }))
          }
        />
      </Card>
    </div>
  );
}
