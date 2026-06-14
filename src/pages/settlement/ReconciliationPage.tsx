import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Space, Button, Modal, message } from 'antd';
import {
  FileTextOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  CheckOutlined,
  FlagOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import PageHeader from '../../components/common/PageHeader';
import SearchForm from '../../components/common/SearchForm';
import type { SearchField } from '../../components/common/SearchForm';
import DataTable from '../../components/common/DataTable';
import StatusTag from '../../components/common/StatusTag';
import { settlementService } from '../../services/settlement.service';
import type { Reconciliation } from '../../types/settlement.types';
import type { PaginatedResult } from '../../types/common.types';
import { formatDateTime } from '../../utils/date';
import { formatMoney } from '../../utils/format';

const CONFIRM_STATUS_OPTIONS = [
  { label: '待确认', value: 'PENDING' },
  { label: '已确认', value: 'CONFIRMED' },
  { label: '有争议', value: 'DISPUTED' },
];

const confirmStatusColorMap: Record<string, string> = {
  PENDING: 'orange',
  CONFIRMED: 'green',
  DISPUTED: 'red',
};

const confirmStatusLabelMap: Record<string, string> = {
  PENDING: '待确认',
  CONFIRMED: '已确认',
  DISPUTED: '有争议',
};

const searchFields: SearchField[] = [
  { name: 'orderNo', label: '对账单号' },
  { name: 'confirmStatus', label: '确认状态', type: 'select', options: CONFIRM_STATUS_OPTIONS },
];

export default function ReconciliationPage() {
  const [loading, setLoading] = useState(false);
  const [reconciliations, setReconciliations] = useState<Reconciliation[]>([]);
  const [pagination, setPagination] = useState<PaginatedResult<Reconciliation> | null>(null);
  const [searchParams, setSearchParams] = useState<Record<string, string>>({});

  const fetchData = async (params: Record<string, string>) => {
    setLoading(true);
    try {
      const res = await settlementService.getReconciliations();
      let filtered = res.items || [];
      if (params.orderNo) {
        filtered = filtered.filter((r) =>
          r.orderNo.toLowerCase().includes(params.orderNo.toLowerCase()),
        );
      }
      if (params.confirmStatus) {
        filtered = filtered.filter((r) => r.confirmStatus === params.confirmStatus);
      }
      setReconciliations(filtered);
      setPagination({ ...res, items: filtered, total: filtered.length });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(searchParams);
  }, [searchParams]);

  const handleSearch = (values: Record<string, string>) => {
    setSearchParams(values);
  };

  const handleReset = () => {
    setSearchParams({});
  };

  const handleConfirm = (record: Reconciliation) => {
    Modal.confirm({
      title: '确认操作',
      content: `确认对账单 ${record.orderNo} 对账结果？`,
      onOk: async () => {
        try {
          await settlementService.updateReconciliation(record.id, { confirmStatus: 'CONFIRMED' });
          setReconciliations((prev) =>
            prev.map((r) => (r.id === record.id ? { ...r, confirmStatus: 'CONFIRMED' as const } : r)),
          );
          message.success('确认成功');
        } catch {
          message.error('确认失败');
        }
      },
    });
  };

  const handleDispute = (record: Reconciliation) => {
    Modal.confirm({
      title: '标记争议',
      content: `将对账单 ${record.orderNo} 标记为争议？`,
      onOk: async () => {
        try {
          await settlementService.updateReconciliation(record.id, { confirmStatus: 'DISPUTED' });
          setReconciliations((prev) =>
            prev.map((r) => (r.id === record.id ? { ...r, confirmStatus: 'DISPUTED' as const } : r)),
          );
          message.success('已标记为争议');
        } catch {
          message.error('标记失败');
        }
      },
    });
  };

  const totalCount = (reconciliations || []).length;
  const pendingCount = (reconciliations || []).filter((r) => r.confirmStatus === 'PENDING').length;
  const disputedCount = (reconciliations || []).filter((r) => r.confirmStatus === 'DISPUTED').length;

  const diffAmountStyle = (value: number): React.CSSProperties => {
    if (value > 0) return { color: '#52c41a' };
    if (value < 0) return { color: '#ff4d4f' };
    return {};
  };

  const columns: ColumnsType<Reconciliation> = [
    {
      title: '对账单号',
      dataIndex: 'orderNo',
      key: 'orderNo',
      width: 180,
    },
    {
      title: '差异金额',
      dataIndex: 'diffAmount',
      key: 'diffAmount',
      width: 140,
      render: (v: number) => (
        <span style={diffAmountStyle(v)}>{formatMoney(v)}</span>
      ),
    },
    {
      title: '差异原因',
      dataIndex: 'diffReason',
      key: 'diffReason',
      ellipsis: true,
    },
    {
      title: '确认状态',
      dataIndex: 'confirmStatus',
      key: 'confirmStatus',
      width: 100,
      render: (status: string) => (
        <StatusTag status={status} customColor={confirmStatusColorMap[status]} customLabel={confirmStatusLabelMap[status]} />
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (v: string) => formatDateTime(v),
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      render: (_: unknown, record: Reconciliation) => {
        if (record.confirmStatus !== 'PENDING') return null;
        return (
          <Space size="small">
            <Button
              type="link"
              size="small"
              icon={<CheckOutlined />}
              onClick={() => handleConfirm(record)}
            >
              确认
            </Button>
            <Button
              type="link"
              size="small"
              danger
              icon={<FlagOutlined />}
              onClick={() => handleDispute(record)}
            >
              标记争议
            </Button>
          </Space>
        );
      },
    },
  ];

  return (
    <div>
      <PageHeader title="对账管理" description="医共体对账差异处理与确认" />

      <Card style={{ marginBottom: 16 }}>
        <SearchForm fields={searchFields} onSearch={handleSearch} onReset={handleReset} />
      </Card>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="总对账单数"
              value={totalCount}
              prefix={<FileTextOutlined />}
              styles={{ content: { color: '#1677ff' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="待确认数"
              value={pendingCount}
              prefix={<ClockCircleOutlined />}
              styles={{ content: { color: '#fa8c16' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="有争议数"
              value={disputedCount}
              prefix={<WarningOutlined />}
              styles={{ content: { color: '#ff4d4f' } }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <DataTable<Reconciliation>
          columns={columns}
          dataSource={reconciliations}
          rowKey="id"
          loading={loading}
          pagination={pagination}
        />
      </Card>
    </div>
  );
}
