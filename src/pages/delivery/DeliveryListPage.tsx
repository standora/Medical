import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Tag, Timeline, Table, Space, Button, message } from 'antd';
import {
  CarOutlined,
  LoadingOutlined,
  CheckCircleOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import PageHeader from '../../components/common/PageHeader';
import SearchForm from '../../components/common/SearchForm';
import type { SearchField } from '../../components/common/SearchForm';
import DataTable from '../../components/common/DataTable';
import StatusTag from '../../components/common/StatusTag';
import { deliveryService } from '../../services/delivery.service';
import type { DeliveryOrder, DeliveryItem, DeliveryTrack } from '../../types/delivery.types';
import type { PaginatedResult } from '../../types/common.types';
import { formatDateTime } from '../../utils/date';
import { formatQty } from '../../utils/format';

const DELIVERY_TYPE_OPTIONS = [
  { label: '配送到医院', value: 'TO_HOSPITAL' },
  { label: '配送到村', value: 'TO_VILLAGE' },
  { label: '配送到家', value: 'TO_HOME' },
];

const STATUS_OPTIONS = [
  { label: '已创建', value: 'CREATED' },
  { label: '已取件', value: 'PICKED_UP' },
  { label: '运输中', value: 'IN_TRANSIT' },
  { label: '已送达', value: 'DELIVERED' },
  { label: '异常', value: 'EXCEPTION' },
  { label: '已取消', value: 'CANCELLED' },
];

const deliveryTypeLabelMap: Record<string, string> = {
  TO_HOSPITAL: '医院配送',
  TO_VILLAGE: '村卫生室配送',
  TO_HOME: '到家配送',
};

const deliveryTypeTagColorMap: Record<string, string> = {
  TO_HOSPITAL: 'blue',
  TO_VILLAGE: 'green',
  TO_HOME: 'orange',
};

const statusColorMap: Record<string, string> = {
  CREATED: 'default',
  PICKED_UP: 'processing',
  IN_TRANSIT: 'blue',
  DELIVERED: 'green',
  EXCEPTION: 'red',
  CANCELLED: 'default',
};

const statusLabelMap: Record<string, string> = {
  CREATED: '已创建',
  PICKED_UP: '已取件',
  IN_TRANSIT: '运输中',
  DELIVERED: '已送达',
  EXCEPTION: '异常',
  CANCELLED: '已取消',
};

const searchFields: SearchField[] = [
  { name: 'orderNo', label: '配送单号' },
  { name: 'deliveryType', label: '配送类型', type: 'select', options: DELIVERY_TYPE_OPTIONS },
  { name: 'status', label: '状态', type: 'select', options: STATUS_OPTIONS },
];

const itemColumns: ColumnsType<DeliveryItem> = [
  { title: '药品名称', dataIndex: 'drugName', key: 'drugName' },
  { title: '数量', dataIndex: 'quantity', key: 'quantity', render: (v: number) => formatQty(v) },
  { title: '批号', dataIndex: 'batchNo', key: 'batchNo' },
];

export default function DeliveryListPage() {
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [pagination, setPagination] = useState<PaginatedResult<DeliveryOrder> | null>(null);
  const [searchParams, setSearchParams] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await deliveryService.getOrders();
        if (cancelled) return;
        let filtered = res.items || [];
        if (searchParams.orderNo) {
          filtered = filtered.filter((o) =>
            o.orderNo.toLowerCase().includes(searchParams.orderNo.toLowerCase()),
          );
        }
        if (searchParams.deliveryType) {
          filtered = filtered.filter((o) => o.deliveryType === searchParams.deliveryType);
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

  const handleConfirmDelivery = async (record: DeliveryOrder) => {
    try {
      await deliveryService.updateOrder(record.id, { status: 'DELIVERED' });
      setOrders((prev) =>
        prev.map((o) => (o.id === record.id ? { ...o, status: 'DELIVERED' as const } : o)),
      );
      message.success(`配送单 ${record.orderNo} 已确认签收`);
    } catch {
      message.error('签收失败');
    }
  };

  const totalCount = (orders || []).length;
  const inTransitCount = (orders || []).filter((o) => o.status === 'IN_TRANSIT').length;
  const deliveredCount = (orders || []).filter((o) => o.status === 'DELIVERED').length;
  const exceptionCount = (orders || []).filter((o) => o.status === 'EXCEPTION').length;

  const columns: ColumnsType<DeliveryOrder> = [
    {
      title: '配送单号',
      dataIndex: 'orderNo',
      key: 'orderNo',
      width: 180,
    },
    {
      title: '配送类型',
      dataIndex: 'deliveryType',
      key: 'deliveryType',
      width: 140,
      render: (type: string) => (
        <Tag color={deliveryTypeTagColorMap[type]}>{deliveryTypeLabelMap[type] || type}</Tag>
      ),
    },
    {
      title: '起始机构',
      dataIndex: 'fromOrgName',
      key: 'fromOrgName',
      width: 160,
    },
    {
      title: '目的机构',
      dataIndex: 'toOrgName',
      key: 'toOrgName',
      width: 160,
    },
    {
      title: '物流商',
      dataIndex: 'logisticsProvider',
      key: 'logisticsProvider',
      width: 120,
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
      render: (_: unknown, record: DeliveryOrder) => (
        <Space size="small">
          <a>查看详情</a>
          {(record.status === 'IN_TRANSIT' || record.status === 'PICKED_UP') && (
            <Button
              type="link"
              size="small"
              style={{ color: '#52c41a' }}
              onClick={() => handleConfirmDelivery(record)}
            >
              确认签收
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const renderExpandedRow = (record: DeliveryOrder) => (
    <div style={{ padding: '0 48px' }}>
      <Row gutter={24}>
        <Col span={12}>
          <h4 style={{ marginBottom: 12 }}>配送明细</h4>
          <Table<DeliveryItem>
            columns={itemColumns}
            dataSource={record.items || []}
            rowKey="drugId"
            pagination={false}
            size="small"
            bordered
          />
        </Col>
        <Col span={12}>
          <h4 style={{ marginBottom: 12 }}>物流轨迹</h4>
          {(record.tracks && record.tracks.length > 0) ? (
            <Timeline
              items={record.tracks.map((track: DeliveryTrack, idx: number) => ({
                key: idx,
                color: track.isException ? 'red' : 'blue',
                children: (
                  <div>
                    <div style={{ fontWeight: 500 }}>
                      {track.status}
                      {track.isException && <Tag color="red" style={{ marginLeft: 8 }}>异常</Tag>}
                    </div>
                    <div style={{ color: '#666', fontSize: 13 }}>{track.location}</div>
                    <div style={{ color: '#999', fontSize: 12 }}>{formatDateTime(track.timestamp)}</div>
                  </div>
                ),
              }))}
            />
          ) : (
            <span style={{ color: '#999' }}>暂无物流轨迹</span>
          )}
        </Col>
      </Row>
    </div>
  );

  return (
    <div>
      <PageHeader title="配送单管理" description="统一配送单据管理与物流追踪" />

      <Card style={{ marginBottom: 16 }}>
        <SearchForm fields={searchFields} onSearch={handleSearch} onReset={handleReset} />
      </Card>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="总配送单数"
              value={totalCount}
              prefix={<CarOutlined />}
              styles={{ content: { color: '#1677ff' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="运输中"
              value={inTransitCount}
              prefix={<LoadingOutlined />}
              styles={{ content: { color: '#1677ff' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="已送达"
              value={deliveredCount}
              prefix={<CheckCircleOutlined />}
              styles={{ content: { color: '#52c41a' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="异常单数"
              value={exceptionCount}
              prefix={<WarningOutlined />}
              styles={{ content: { color: '#ff4d4f' } }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <DataTable<DeliveryOrder>
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
