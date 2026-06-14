import { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Statistic, Tag, Button, Descriptions, Drawer, message, Space, Tooltip } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  MedicineBoxOutlined,
  StockOutlined,
  CheckCircleOutlined,
  LockOutlined,
  CarOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Inventory } from '../../types/inventory.types';
import { useInventoryStore } from '../../stores/inventory.store';
import { inventoryService } from '../../services/inventory.service';
import PageHeader from '../../components/common/PageHeader';
import SearchForm from '../../components/common/SearchForm';
import type { SearchField } from '../../components/common/SearchForm';
import DataTable from '../../components/common/DataTable';
import OrgTreeSelect from '../../components/common/OrgTreeSelect';
import { formatDate, daysUntil } from '../../utils/date';
import { formatQty } from '../../utils/format';
import { simulateDelay } from '../../utils/simulate-delay';

const searchFields: SearchField[] = [
  { name: 'drugName', label: '药品名称', type: 'input', placeholder: '请输入药品名称' },
  { name: 'batchNo', label: '批号', type: 'input', placeholder: '请输入批号' },
];

export default function InventoryOverviewPage() {
  const navigate = useNavigate();
  const { inventories, loading, setInventories, setLoading } = useInventoryStore();
  const [orgId, setOrgId] = useState<string | undefined>();
  const [searchParams, setSearchParams] = useState<Record<string, string>>({});
  const [pagination, setPagination] = useState<{ page: number; pageSize: number; total: number; items: Inventory[]; totalPages: number }>({ page: 1, pageSize: 10, total: 0, items: [], totalPages: 0 });
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [detailRecord, setDetailRecord] = useState<Inventory | null>(null);

  const handleViewDetail = (record: Inventory) => {
    setDetailRecord(record);
    setDetailDrawerOpen(true);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      await simulateDelay();
      const res = await inventoryService.getList({
        orgId,
        page: pagination.page,
        pageSize: pagination.pageSize,
      });
      setInventories(res.items);
      setPagination((prev) => ({ ...prev, total: res.total }));
    } catch {
      message.error('获取库存数据失败');
    } finally {
      setLoading(false);
    }
  }, [orgId, pagination.page, pagination.pageSize, setInventories, setLoading]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredData = (inventories || []).filter((item) => {
    if (searchParams.drugName && !item.drugName.includes(searchParams.drugName)) return false;
    if (searchParams.batchNo && !item.batchNo.includes(searchParams.batchNo)) return false;
    return true;
  });

  const totalVarieties = filteredData.length;
  const totalQuantity = filteredData.reduce((sum, item) => sum + item.quantity, 0);
  const totalAvailable = filteredData.reduce((sum, item) => sum + item.availableQty, 0);
  const totalLocked = filteredData.reduce((sum, item) => sum + item.lockedQty, 0);

  const getRowClassName = (record: Inventory) => {
    if (record.quantity < record.lowerLimit) return 'row-lower-limit';
    if (record.quantity > record.upperLimit) return 'row-upper-limit';
    return '';
  };

  const getExpiryTag = (expiryDate?: string) => {
    if (!expiryDate) return '-';
    const days = daysUntil(expiryDate);
    if (days <= 30) return <Tag color="red">{formatDate(expiryDate)}</Tag>;
    if (days <= 90) return <Tag color="orange">{formatDate(expiryDate)}</Tag>;
    return <span>{formatDate(expiryDate)}</span>;
  };

  const columns: ColumnsType<Inventory> = [
    { title: '机构名称', dataIndex: 'orgName', key: 'orgName', width: 180, ellipsis: true },
    { title: '药品名称', dataIndex: 'drugName', key: 'drugName', width: 180, ellipsis: true },
    { title: '批号', dataIndex: 'batchNo', key: 'batchNo', width: 130 },
    {
      title: '库存量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      align: 'right',
      render: (val: number, record: Inventory) => {
        if (val < record.lowerLimit) return <span style={{ color: '#ff4d4f', fontWeight: 600 }}>{formatQty(val)}</span>;
        if (val > record.upperLimit) return <span style={{ color: '#faad14', fontWeight: 600 }}>{formatQty(val)}</span>;
        return formatQty(val);
      },
    },
    {
      title: '可用量',
      dataIndex: 'availableQty',
      key: 'availableQty',
      width: 100,
      align: 'right',
      render: (val: number) => formatQty(val),
    },
    {
      title: '锁定量',
      dataIndex: 'lockedQty',
      key: 'lockedQty',
      width: 100,
      align: 'right',
      render: (val: number) => formatQty(val),
    },
    {
      title: '上下限',
      key: 'limit',
      width: 140,
      render: (_: unknown, record: Inventory) => (
        <span>
          <span style={{ color: '#faad14' }}>{record.upperLimit}</span>
          {' / '}
          <span style={{ color: '#ff4d4f' }}>{record.lowerLimit}</span>
        </span>
      ),
    },
    {
      title: '效期',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      width: 130,
      render: (val?: string) => getExpiryTag(val),
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right',
      render: (_: unknown, record: Inventory) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => handleViewDetail(record)}>
            详情
          </Button>
          <Tooltip title="发起配送">
            <Button
              type="link"
              size="small"
              icon={<CarOutlined />}
              onClick={() => navigate('/delivery/list')}
            >
              配送
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="库存总览" description="医共体统一库存管理——实时掌握各机构药品库存动态" />

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
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="总品种数"
              value={totalVarieties}
              prefix={<MedicineBoxOutlined />}
              styles={{ content: { color: '#1677ff' } }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="总库存量"
              value={totalQuantity}
              prefix={<StockOutlined />}
              styles={{ content: { color: '#52c41a' } }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="可用量"
              value={totalAvailable}
              prefix={<CheckCircleOutlined />}
              styles={{ content: { color: '#13c2c2' } }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="锁定量"
              value={totalLocked}
              prefix={<LockOutlined />}
              styles={{ content: { color: '#faad14' } }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <DataTable<Inventory>
          rowKey="id"
          columns={columns}
          dataSource={filteredData}
          loading={loading}
          rowClassName={getRowClassName}
          scroll={{ x: 1200 }}
          pagination={pagination}
          onPageChange={(page, pageSize) =>
            setPagination((prev) => ({ ...prev, page, pageSize }))
          }
        />
      </Card>

      <Drawer
        title="库存详情"
        open={detailDrawerOpen}
        onClose={() => setDetailDrawerOpen(false)}
        width={480}
      >
        {detailRecord && (
          <Descriptions bordered size="small" column={1}>
            <Descriptions.Item label="机构名称">{detailRecord.orgName}</Descriptions.Item>
            <Descriptions.Item label="药品名称">{detailRecord.drugName}</Descriptions.Item>
            <Descriptions.Item label="批号">{detailRecord.batchNo}</Descriptions.Item>
            <Descriptions.Item label="库存量">{formatQty(detailRecord.quantity)}</Descriptions.Item>
            <Descriptions.Item label="可用量">{formatQty(detailRecord.availableQty)}</Descriptions.Item>
            <Descriptions.Item label="锁定量">{formatQty(detailRecord.lockedQty)}</Descriptions.Item>
            <Descriptions.Item label="上限">
              <span style={{ color: '#faad14' }}>{detailRecord.upperLimit}</span>
            </Descriptions.Item>
            <Descriptions.Item label="下限">
              <span style={{ color: '#ff4d4f' }}>{detailRecord.lowerLimit}</span>
            </Descriptions.Item>
            <Descriptions.Item label="效期">{detailRecord.expiryDate ? formatDate(detailRecord.expiryDate) : '-'}</Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>

      <style>{`
        .row-lower-limit td { background: #fff1f0 !important; }
        .row-upper-limit td { background: #fffbe6 !important; }
      `}</style>
    </div>
  );
}
