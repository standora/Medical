import { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Statistic, Tag, Button, Space, Tooltip, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingCartOutlined,
  AuditOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  EyeOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { PurchaseOrder, PurchaseOrderItem } from '../../types/purchase.types';
import type { PaginatedResult } from '../../types/common.types';
import { PurchaseOrderStatus, PURCHASE_ORDER_STATUS_LABELS } from '../../constants/order-status';
import { purchaseService } from '../../services/purchase.service';
import PageHeader from '../../components/common/PageHeader';
import SearchForm from '../../components/common/SearchForm';
import type { SearchField } from '../../components/common/SearchForm';
import DataTable from '../../components/common/DataTable';
import StatusTag from '../../components/common/StatusTag';
import { formatDateTime } from '../../utils/date';
import { formatMoney } from '../../utils/format';

const ORDER_STATUS_OPTIONS = Object.values(PurchaseOrderStatus).map((s) => ({
  label: PURCHASE_ORDER_STATUS_LABELS[s],
  value: s,
}));

const OVERDUE_OPTIONS = [
  { label: '是', value: 'true' },
  { label: '否', value: 'false' },
];

const ORDER_STATUS_COLOR_MAP: Record<string, string> = {
  PENDING_REVIEW: 'orange',
  APPROVED: 'blue',
  PLACED: 'processing',
  SHIPPED: 'cyan',
  RECEIVED: 'green',
  CANCELLED: 'default',
};

const searchFields: SearchField[] = [
  { name: 'orderNo', label: '订单编号', type: 'input' },
  { name: 'supplierName', label: '供应商名称', type: 'input' },
  { name: 'status', label: '状态', type: 'select', options: ORDER_STATUS_OPTIONS },
  { name: 'isOverdue', label: '是否逾期', type: 'select', options: OVERDUE_OPTIONS },
];

export default function PurchaseOrderPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<PaginatedResult<PurchaseOrder> | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState<Record<string, string>>({});
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await purchaseService.getOrders();
      setData(result);
    } catch {
      message.error('获取采购订单数据失败');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = (values: Record<string, string>) => {
    setSearchParams(values);
  };

  const handleReset = () => {
    setSearchParams({});
  };

  const handleReceiveOrder = async (record: PurchaseOrder) => {
    try {
      await purchaseService.receiveOrder(record.id);
      message.success(`订单 ${record.orderNo} 已确认收货`);
      fetchData();
    } catch {
      message.error('确认收货失败');
    }
  };

  const filteredItems = data?.items.filter((item) => {
    if (searchParams.orderNo && !item.orderNo.includes(searchParams.orderNo)) return false;
    if (searchParams.supplierName && !item.supplierName.includes(searchParams.supplierName)) return false;
    if (searchParams.status && item.status !== searchParams.status) return false;
    if (searchParams.isOverdue !== undefined && searchParams.isOverdue !== '') {
      const isOverdue = searchParams.isOverdue === 'true';
      if (item.isOverdue !== isOverdue) return false;
    }
    return true;
  }) || [];

  const totalCount = filteredItems.length;
  const pendingReviewCount = filteredItems.filter((i) => i.status === PurchaseOrderStatus.PENDING_REVIEW).length;
  const receivedCount = filteredItems.filter((i) => i.status === PurchaseOrderStatus.RECEIVED).length;
  const overdueCount = filteredItems.filter((i) => i.isOverdue).length;

  const itemColumns: ColumnsType<PurchaseOrderItem> = [
    { title: '药品名称', dataIndex: 'drugName', key: 'drugName' },
    { title: '数量', dataIndex: 'quantity', key: 'quantity' },
    { title: '单价', dataIndex: 'unitPrice', key: 'unitPrice', render: (v: number) => formatMoney(v) },
    { title: '金额', dataIndex: 'amount', key: 'amount', render: (v: number) => formatMoney(v) },
  ];

  const columns: ColumnsType<PurchaseOrder> = [
    { title: '订单编号', dataIndex: 'orderNo', key: 'orderNo', width: 160 },
    { title: '供应商', dataIndex: 'supplierName', key: 'supplierName', width: 200 },
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
        <StatusTag
          status={status}
          customColor={ORDER_STATUS_COLOR_MAP[status]}
          customLabel={PURCHASE_ORDER_STATUS_LABELS[status as PurchaseOrderStatus]}
        />
      ),
    },
    {
      title: '是否逾期',
      dataIndex: 'isOverdue',
      key: 'isOverdue',
      width: 100,
      render: (v: boolean) => v ? <Tag color="red">逾期</Tag> : <Tag>否</Tag>,
    },
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 180, render: (v: string) => formatDateTime(v) },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setExpandedRowKeys((prev) =>
                prev.includes(record.id) ? prev.filter((k) => k !== record.id) : [...prev, record.id]
              );
            }}
          >
            查看详情
          </Button>
          {record.status === PurchaseOrderStatus.RECEIVED && (
            <Tooltip title="查看入库记录">
              <Button
                type="link"
                size="small"
                icon={<DatabaseOutlined />}
                onClick={() => navigate('/inventory/overview')}
              >
                查看库存
              </Button>
            </Tooltip>
          )}
          {record.status === PurchaseOrderStatus.SHIPPED && (
            <Button
              type="link"
              size="small"
              style={{ color: '#52c41a' }}
              onClick={() => handleReceiveOrder(record)}
            >
              确认收货
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="采购订单" description="管理医共体统一采购订单" />

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="总订单数"
              value={totalCount}
              prefix={<ShoppingCartOutlined />}
              styles={{ content: { color: '#1677ff' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="待审核数"
              value={pendingReviewCount}
              prefix={<AuditOutlined />}
              styles={{ content: { color: '#faad14' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="已签收数"
              value={receivedCount}
              prefix={<CheckCircleOutlined />}
              styles={{ content: { color: '#52c41a' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="逾期订单数"
              value={overdueCount}
              prefix={<WarningOutlined />}
              styles={{ content: { color: '#ff4d4f' } }}
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginBottom: 16 }}>
        <SearchForm
          fields={searchFields}
          onSearch={handleSearch}
          onReset={handleReset}
        />
      </Card>

      <Card>
        <DataTable<PurchaseOrder>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={filteredItems}
          pagination={data}
          onPageChange={() => {}}
          expandable={{
            expandedRowKeys,
            onExpandedRowsChange: (keys) => setExpandedRowKeys(keys as string[]),
            expandedRowRender: (record) => (
              <DataTable<PurchaseOrderItem>
                rowKey="drugId"
                columns={itemColumns}
                dataSource={record.items || []}
                pagination={false}
                size="small"
              />
            ),
          }}
        />
      </Card>
    </div>
  );
}
