import { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Statistic, Tag, Button, message, Space, Tooltip } from 'antd';
import {
  AlertOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { InventoryAlert } from '../../types/inventory.types';
import type { PaginatedResult } from '../../types/common.types';
import { AlertLevel, AlertType } from '../../constants/alert-level';
import { useInventoryStore } from '../../stores/inventory.store';
import { inventoryService } from '../../services/inventory.service';
import PageHeader from '../../components/common/PageHeader';
import SearchForm from '../../components/common/SearchForm';
import { AlertAlgorithm } from '../../algorithms/alert.algorithm';
import type { AlertInput } from '../../algorithms/alert.algorithm';
import { inventories } from '../../mock/data/inventory';
import type { SearchField } from '../../components/common/SearchForm';
import DataTable from '../../components/common/DataTable';
import StatusTag from '../../components/common/StatusTag';

const alertTypeLabelMap: Record<string, string> = {
  [AlertType.UPPER_LIMIT]: '超上限',
  [AlertType.LOWER_LIMIT]: '低于下限',
  [AlertType.NEAR_EXPIRY]: '近效期',
  [AlertType.STOCKOUT_PREDICTION]: '缺货预测',
};

const alertTypeColorMap: Record<string, string> = {
  [AlertType.UPPER_LIMIT]: 'orange',
  [AlertType.LOWER_LIMIT]: 'red',
  [AlertType.NEAR_EXPIRY]: 'volcano',
  [AlertType.STOCKOUT_PREDICTION]: 'purple',
};

const alertLevelColorMap: Record<string, string> = {
  [AlertLevel.INFO]: 'blue',
  [AlertLevel.WARNING]: 'orange',
  [AlertLevel.CRITICAL]: 'red',
};

const alertLevelLabelMap: Record<string, string> = {
  [AlertLevel.INFO]: '信息',
  [AlertLevel.WARNING]: '预警',
  [AlertLevel.CRITICAL]: '严重',
};

const searchFields: SearchField[] = [
  {
    name: 'alertType',
    label: '预警类型',
    type: 'select',
    placeholder: '请选择预警类型',
    options: [
      { label: '超上限', value: AlertType.UPPER_LIMIT },
      { label: '低于下限', value: AlertType.LOWER_LIMIT },
      { label: '近效期', value: AlertType.NEAR_EXPIRY },
      { label: '缺货预测', value: AlertType.STOCKOUT_PREDICTION },
    ],
  },
  {
    name: 'alertLevel',
    label: '预警级别',
    type: 'select',
    placeholder: '请选择预警级别',
    options: [
      { label: '信息', value: AlertLevel.INFO },
      { label: '预警', value: AlertLevel.WARNING },
      { label: '严重', value: AlertLevel.CRITICAL },
    ],
  },
  {
    name: 'status',
    label: '状态',
    type: 'select',
    placeholder: '请选择状态',
    options: [
      { label: '待处理', value: 'PENDING' },
      { label: '已确认', value: 'ACKNOWLEDGED' },
      { label: '已解决', value: 'RESOLVED' },
    ],
  },
];

export default function InventoryAlertPage() {
  const { alerts, loading, setAlerts, setLoading } = useInventoryStore();
  const [searchParams, setSearchParams] = useState<Record<string, string>>({});
  const [pagination, setPagination] = useState<PaginatedResult<InventoryAlert>>({ page: 1, pageSize: 10, total: 0, items: [], totalPages: 0 });
  const [runningAlgo, setRunningAlgo] = useState(false);
  // 标记算法生成的预警ID
  const [algorithmAlertIds, setAlgorithmAlertIds] = useState<string[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await inventoryService.getAlerts();
      setAlerts(res.items);
      setPagination((prev) => ({ ...prev, total: res.total, items: res.items }));
    } catch {
      message.error('获取预警数据失败');
    } finally {
      setLoading(false);
    }
  }, [setAlerts, setLoading]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredData = (alerts || []).filter((item) => {
    if (searchParams.alertType && item.alertType !== searchParams.alertType) return false;
    if (searchParams.alertLevel && item.alertLevel !== searchParams.alertLevel) return false;
    if (searchParams.status && item.status !== searchParams.status) return false;
    return true;
  });

  const pendingCount = (alerts || []).filter((a) => a.status === 'PENDING').length;
  const warningCount = (alerts || []).filter((a) => a.alertLevel === AlertLevel.WARNING).length;
  const criticalCount = (alerts || []).filter((a) => a.alertLevel === AlertLevel.CRITICAL).length;

  const handleAcknowledge = async (record: InventoryAlert) => {
    try {
      await inventoryService.updateAlert(record.id, { status: 'ACKNOWLEDGED' });
      setAlerts(
        alerts.map((a) => (a.id === record.id ? { ...a, status: 'ACKNOWLEDGED' as const } : a)),
      );
      message.success('已确认预警');
    } catch {
      message.error('操作失败');
    }
  };

  const handleResolve = async (record: InventoryAlert) => {
    try {
      await inventoryService.updateAlert(record.id, { status: 'RESOLVED' });
      setAlerts(
        alerts.map((a) => (a.id === record.id ? { ...a, status: 'RESOLVED' as const } : a)),
      );
      message.success('已标记为解决');
    } catch {
      message.error('操作失败');
    }
  };

  // 触发预警算法
  const handleRunAlgorithm = async () => {
    setRunningAlgo(true);
    try {
      // 调用真实预警算法
      const algorithmAlerts: InventoryAlert[] = [];
      for (const inv of inventories.slice(0, 15)) {
        const input: AlertInput = {
          orgId: inv.orgId,
          drugId: inv.drugId,
          currentQty: inv.quantity,
          upperLimit: inv.upperLimit,
          lowerLimit: inv.lowerLimit,
          expiryDate: inv.expiryDate || null,
          dailyConsumption: [5, 6, 4, 7, 5, 6, 5], // 模拟近7日消耗
        };
        const result = AlertAlgorithm.check(input);
        for (const r of result) {
          algorithmAlerts.push({
            id: `alert-algo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            orgId: r.orgId,
            orgName: inv.orgName,
            drugId: r.drugId,
            drugName: inv.drugName,
            alertType: r.alertType,
            alertLevel: r.alertLevel,
            message: r.message,
            status: 'PENDING',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      }
      setAlerts([...algorithmAlerts, ...alerts]);
      setAlgorithmAlertIds(algorithmAlerts.map((a) => a.id));
      message.success(`预警算法执行完成，新增${algorithmAlerts.length}条预警`);
    } catch {
      message.error('算法执行失败');
    } finally {
      setRunningAlgo(false);
    }
  };

  const columns: ColumnsType<InventoryAlert> = [
    {
      title: '机构名称',
      dataIndex: 'orgName',
      key: 'orgName',
      width: 180,
      ellipsis: true,
    },
    {
      title: '药品名称',
      dataIndex: 'drugName',
      key: 'drugName',
      width: 160,
      ellipsis: true,
    },
    {
      title: '预警类型',
      dataIndex: 'alertType',
      key: 'alertType',
      width: 110,
      render: (val: AlertType) => (
        <Tag color={alertTypeColorMap[val]}>{alertTypeLabelMap[val]}</Tag>
      ),
    },
    {
      title: '预警级别',
      dataIndex: 'alertLevel',
      key: 'alertLevel',
      width: 100,
      render: (val: AlertLevel) => (
        <Tag color={alertLevelColorMap[val]}>{alertLevelLabelMap[val]}</Tag>
      ),
    },
    {
      title: '预警消息',
      dataIndex: 'message',
      key: 'message',
      width: 240,
      ellipsis: true,
      render: (msg: string, record: InventoryAlert) => (
        <Space>
          <span>{msg}</span>
          {algorithmAlertIds.includes(record.id) && (
            <Tag color="purple" style={{ marginLeft: 4 }}>算法</Tag>
          )}
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => <StatusTag status={status} />,
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      fixed: 'right',
      render: (_: unknown, record: InventoryAlert) => (
        <Space size="small">
          {record.status === 'PENDING' && (
            <Button type="link" size="small" onClick={() => handleAcknowledge(record)}>
              确认
            </Button>
          )}
          {(record.status === 'PENDING' || record.status === 'ACKNOWLEDGED') && (
            <Button type="link" size="small" onClick={() => handleResolve(record)}>
              标记解决
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="库存预警"
        description="实时监控库存异常，及时预警处理"
        extra={
          <Tooltip title="运行AI预警算法，检测库存异常">
            <Button
              type="primary"
              icon={<ThunderboltOutlined />}
              onClick={handleRunAlgorithm}
              loading={runningAlgo}
            >
              运行预警算法
            </Button>
          </Tooltip>
        }
      />

      <Card size="small" style={{ marginBottom: 16 }}>
        <SearchForm
          fields={searchFields}
          onSearch={(values) => setSearchParams(values)}
          onReset={() => setSearchParams({})}
        />
      </Card>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={8}>
          <Card>
            <Statistic
              title="待处理数"
              value={pendingCount}
              prefix={<AlertOutlined />}
              styles={{ content: { color: '#faad14' } }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card>
            <Statistic
              title="预警数"
              value={warningCount}
              prefix={<WarningOutlined />}
              styles={{ content: { color: '#fa8c16' } }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card>
            <Statistic
              title="严重数"
              value={criticalCount}
              prefix={<ExclamationCircleOutlined />}
              styles={{ content: { color: '#ff4d4f' } }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <DataTable<InventoryAlert>
          rowKey="id"
          columns={columns}
          dataSource={filteredData}
          loading={loading}
          scroll={{ x: 1000 }}
          pagination={pagination}
          onPageChange={(page, pageSize) => {
            setPagination((prev) => ({ ...prev, page, pageSize }));
            fetchData();
          }}
        />
      </Card>
    </div>
  );
}
