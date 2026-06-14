import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Tag, Table, Space, Button, message } from 'antd';
import {
  DollarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import PageHeader from '../../components/common/PageHeader';
import SearchForm from '../../components/common/SearchForm';
import type { SearchField } from '../../components/common/SearchForm';
import DataTable from '../../components/common/DataTable';
import StatusTag from '../../components/common/StatusTag';
import { settlementService } from '../../services/settlement.service';
import type { SettlementOrder, SettlementItem } from '../../types/settlement.types';
import type { PaginatedResult } from '../../types/common.types';
import { formatDateTime } from '../../utils/date';
import { formatMoney } from '../../utils/format';

const SETTLEMENT_MODE_OPTIONS = [
  { label: '集中结算', value: 'CENTRALIZED' },
  { label: '独立结算', value: 'INDEPENDENT' },
];

const SETTLEMENT_DIMENSION_OPTIONS = [
  { label: '按产品', value: 'PRODUCT' },
  { label: '按仓库', value: 'WAREHOUSE' },
  { label: '按供应商', value: 'SUPPLIER' },
  { label: '按周期', value: 'PERIOD' },
];

const STATUS_OPTIONS = [
  { label: '待确认', value: 'PENDING' },
  { label: '已确认', value: 'CONFIRMED' },
  { label: '已支付', value: 'PAID' },
];

const settlementModeLabelMap: Record<string, string> = {
  CENTRALIZED: '集中结算',
  INDEPENDENT: '独立结算',
};

const settlementModeColorMap: Record<string, string> = {
  CENTRALIZED: 'blue',
  INDEPENDENT: 'green',
};

const dimensionLabelMap: Record<string, string> = {
  PRODUCT: '按产品',
  WAREHOUSE: '按仓库',
  SUPPLIER: '按供应商',
  PERIOD: '按周期',
};

const dimensionColorMap: Record<string, string> = {
  PRODUCT: 'blue',
  WAREHOUSE: 'cyan',
  SUPPLIER: 'purple',
  PERIOD: 'geekblue',
};

const statusColorMap: Record<string, string> = {
  PENDING: 'orange',
  CONFIRMED: 'blue',
  PAID: 'green',
};

const statusLabelMap: Record<string, string> = {
  PENDING: '待确认',
  CONFIRMED: '已确认',
  PAID: '已支付',
};

const searchFields: SearchField[] = [
  { name: 'orderNo', label: '结算单号' },
  { name: 'settlementMode', label: '结算模式', type: 'select', options: SETTLEMENT_MODE_OPTIONS },
  { name: 'settlementDimension', label: '结算维度', type: 'select', options: SETTLEMENT_DIMENSION_OPTIONS },
  { name: 'status', label: '状态', type: 'select', options: STATUS_OPTIONS },
];

const itemColumns: ColumnsType<SettlementItem> = [
  { title: '药品名称', dataIndex: 'drugName', key: 'drugName' },
  { title: '数量', dataIndex: 'quantity', key: 'quantity' },
  { title: '单价', dataIndex: 'unitPrice', key: 'unitPrice', render: (v: number) => formatMoney(v) },
  { title: '金额', dataIndex: 'amount', key: 'amount', render: (v: number) => formatMoney(v) },
  { title: '机构名称', dataIndex: 'orgName', key: 'orgName' },
];

export default function SettlementListPage() {
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<SettlementOrder[]>([]);
  const [pagination, setPagination] = useState<PaginatedResult<SettlementOrder> | null>(null);
  const [searchParams, setSearchParams] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await settlementService.getOrders();
        if (cancelled) return;
        let filtered = res.items || [];
        if (searchParams.orderNo) {
          filtered = filtered.filter((o) =>
            o.orderNo.toLowerCase().includes(searchParams.orderNo.toLowerCase()),
          );
        }
        if (searchParams.settlementMode) {
          filtered = filtered.filter((o) => o.settlementMode === searchParams.settlementMode);
        }
        if (searchParams.settlementDimension) {
          filtered = filtered.filter((o) => o.settlementDimension === searchParams.settlementDimension);
        }
        if (searchParams.status) {
          filtered = filtered.filter((o) => o.status === searchParams.status);
        }
        setOrders(filtered);
        setPagination({ ...res, items: filtered, total: filtered.length });
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, [searchParams]);

  const handleSearch = (values: Record<string, string>) => {
    setSearchParams(values);
  };

  const handleReset = () => {
    setSearchParams({});
  };

  const handleConfirmOrder = async (record: SettlementOrder) => {
    try {
      await settlementService.updateOrder(record.id, { status: 'CONFIRMED' });
      setOrders((prev) =>
        prev.map((o) => (o.id === record.id ? { ...o, status: 'CONFIRMED' as const } : o)),
      );
      message.success(`结算单 ${record.orderNo} 已确认`);
    } catch {
      message.error('确认失败');
    }
  };

  const totalAmount = (orders || []).reduce((sum, o) => sum + o.totalAmount, 0);
  const pendingCount = (orders || []).filter((o) => o.status === 'PENDING').length;
  const paidCount = (orders || []).filter((o) => o.status === 'PAID').length;

  const columns: ColumnsType<SettlementOrder> = [
    {
      title: '结算单号',
      dataIndex: 'orderNo',
      key: 'orderNo',
      width: 180,
    },
    {
      title: '结算模式',
      dataIndex: 'settlementMode',
      key: 'settlementMode',
      width: 120,
      render: (mode: string) => (
        <Tag color={settlementModeColorMap[mode]}>{settlementModeLabelMap[mode] || mode}</Tag>
      ),
    },
    {
      title: '结算维度',
      dataIndex: 'settlementDimension',
      key: 'settlementDimension',
      width: 120,
      render: (dim: string) => (
        <Tag color={dimensionColorMap[dim]}>{dimensionLabelMap[dim] || dim}</Tag>
      ),
    },
    {
      title: '周期',
      dataIndex: 'period',
      key: 'period',
      width: 120,
    },
    {
      title: '总金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 140,
      render: (v: number) => formatMoney(v),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <StatusTag status={status} customColor={statusColorMap[status]} customLabel={statusLabelMap[status]} />
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
      width: 180,
      render: (_: unknown, record: SettlementOrder) => (
        <Space size="small">
          <a>查看详情</a>
          {record.status === 'PENDING' && (
            <Button
              type="link"
              size="small"
              style={{ color: '#52c41a' }}
              onClick={() => handleConfirmOrder(record)}
            >
              确认结算
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const renderExpandedRow = (record: SettlementOrder) => (
    <div style={{ padding: '0 48px' }}>
      <h4 style={{ marginBottom: 12 }}>结算明细</h4>
      <Table<SettlementItem>
        columns={itemColumns}
        dataSource={record.items || []}
        rowKey="drugId"
        pagination={false}
        size="small"
        bordered
      />
    </div>
  );

  return (
    <div>
      <PageHeader title="结算单管理" description="医共体统一结算单据管理" />

      <Card style={{ marginBottom: 16 }}>
        <SearchForm fields={searchFields} onSearch={handleSearch} onReset={handleReset} />
      </Card>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="总结算金额"
              value={totalAmount}
              prefix={<DollarOutlined />}
              precision={2}
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
              title="已支付数"
              value={paidCount}
              prefix={<CheckCircleOutlined />}
              styles={{ content: { color: '#52c41a' } }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <DataTable<SettlementOrder>
          columns={columns}
          dataSource={orders}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          expandable={{
            expandedRowRender: renderExpandedRow,
          }}
        />
      </Card>
    </div>
  );
}
