import { useState, useMemo, useEffect } from 'react';
import { Card, Row, Col, Tag, Button, message, Space, Tooltip } from 'antd';
import { RobotOutlined, BulbOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { InventoryTransfer } from '../../types/inventory.types';
import PageHeader from '../../components/common/PageHeader';
import SearchForm from '../../components/common/SearchForm';
import type { SearchField } from '../../components/common/SearchForm';
import DataTable from '../../components/common/DataTable';
import StatusTag from '../../components/common/StatusTag';
import OrgTreeSelect from '../../components/common/OrgTreeSelect';
import { formatDateTime } from '../../utils/date';
import { formatQty } from '../../utils/format';
import { TransferAlgorithm } from '../../algorithms/transfer.algorithm';
import { simulateDelay } from '../../utils/simulate-delay';
import { useInventoryStore } from '../../stores/inventory.store';
import { inventoryService } from '../../services/inventory.service';

const searchFields: SearchField[] = [
  {
    name: 'status',
    label: '状态',
    type: 'select',
    placeholder: '请选择状态',
    options: [
      { label: '待审批', value: 'PENDING' },
      { label: '已审批', value: 'APPROVED' },
      { label: '运输中', value: 'IN_TRANSIT' },
      { label: '已完成', value: 'COMPLETED' },
      { label: '已取消', value: 'CANCELLED' },
    ],
  },
  {
    name: 'isSmartRecommended',
    label: '智能推荐',
    type: 'select',
    placeholder: '请选择',
    options: [
      { label: '是', value: 'true' },
      { label: '否', value: 'false' },
    ],
  },
];

const initialTransfers: InventoryTransfer[] = [
  {
    id: 'tf-001',
    fromOrgId: 'org-town-01',
    fromOrgName: '中心卫生院',
    toOrgId: 'org-village-01',
    toOrgName: '东村卫生室',
    drugId: 'drug-001',
    drugName: '阿莫西林胶囊',
    quantity: 50,
    reason: '东村卫生室库存不足，需紧急调拨',
    status: 'PENDING',
    isSmartRecommended: true,
    createdAt: '2025-06-10 09:00:00',
    updatedAt: '2025-06-10 09:00:00',
  },
  {
    id: 'tf-002',
    fromOrgId: 'org-town-02',
    fromOrgName: '南镇卫生院',
    toOrgId: 'org-village-03',
    toOrgName: '西村卫生室',
    drugId: 'drug-005',
    drugName: '布洛芬片',
    quantity: 30,
    reason: '常规调剂补充',
    status: 'APPROVED',
    isSmartRecommended: false,
    createdAt: '2025-06-09 14:00:00',
    updatedAt: '2025-06-10 08:00:00',
  },
  {
    id: 'tf-003',
    fromOrgId: 'org-town-01',
    fromOrgName: '中心卫生院',
    toOrgId: 'org-village-02',
    toOrgName: '南村卫生室',
    drugId: 'drug-012',
    drugName: '头孢克洛胶囊',
    quantity: 20,
    reason: 'AI推荐：南村卫生室近7日用量激增，建议调拨',
    status: 'IN_TRANSIT',
    isSmartRecommended: true,
    createdAt: '2025-06-08 10:30:00',
    updatedAt: '2025-06-09 16:00:00',
  },
  {
    id: 'tf-004',
    fromOrgId: 'org-county-01',
    fromOrgName: '县人民医院',
    toOrgId: 'org-town-02',
    toOrgName: '南镇卫生院',
    drugId: 'drug-020',
    drugName: '奥美拉唑肠溶胶囊',
    quantity: 100,
    reason: '南镇卫生院库存低于安全线',
    status: 'COMPLETED',
    isSmartRecommended: false,
    createdAt: '2025-06-05 11:00:00',
    updatedAt: '2025-06-07 09:00:00',
  },
  {
    id: 'tf-005',
    fromOrgId: 'org-town-03',
    fromOrgName: '北镇卫生院',
    toOrgId: 'org-village-05',
    toOrgName: '北村卫生室',
    drugId: 'drug-008',
    drugName: '对乙酰氨基酚片',
    quantity: 40,
    reason: 'AI推荐：季节性用药需求预测',
    status: 'PENDING',
    isSmartRecommended: true,
    createdAt: '2025-06-11 08:00:00',
    updatedAt: '2025-06-11 08:00:00',
  },
  {
    id: 'tf-006',
    fromOrgId: 'org-county-01',
    fromOrgName: '县人民医院',
    toOrgId: 'org-town-01',
    toOrgName: '中心卫生院',
    drugId: 'drug-015',
    drugName: '氯雷他定片',
    quantity: 60,
    reason: '常规调剂',
    status: 'CANCELLED',
    isSmartRecommended: false,
    createdAt: '2025-06-04 15:00:00',
    updatedAt: '2025-06-05 10:00:00',
  },
];

export default function InventoryTransferPage() {
  const { inventoryTransfers, updateInventoryTransfer } = useInventoryStore();
  const [transfers, setTransfers] = useState<InventoryTransfer[]>([]);
  const [fromOrgId, setFromOrgId] = useState<string | undefined>();
  const [toOrgId, setToOrgId] = useState<string | undefined>();
  const [searchParams, setSearchParams] = useState<Record<string, string>>({});
  const [recommending, setRecommending] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (inventoryTransfers.length > 0) {
      setTransfers(inventoryTransfers);
    } else {
      setTransfers(initialTransfers as InventoryTransfer[]);
    }
    const timer = setTimeout(() => setPageLoading(false), 800);
    return () => clearTimeout(timer);
  }, [inventoryTransfers]);

  const filteredData = useMemo(() => {
    return (transfers || []).filter((item) => {
      if (fromOrgId && item.fromOrgId !== fromOrgId) return false;
      if (toOrgId && item.toOrgId !== toOrgId) return false;
      if (searchParams.status && item.status !== searchParams.status) return false;
      if (searchParams.isSmartRecommended !== undefined && searchParams.isSmartRecommended !== '') {
        const isSmart = searchParams.isSmartRecommended === 'true';
        if (item.isSmartRecommended !== isSmart) return false;
      }
      return true;
    });
  }, [transfers, fromOrgId, toOrgId, searchParams]);

  const handleApprove = async (record: InventoryTransfer) => {
    try {
      await inventoryService.updateTransfer(record.id, { status: 'APPROVED' });
      updateInventoryTransfer(record.id, { status: 'APPROVED' });
      setTransfers((prev) =>
        prev.map((t) => (t.id === record.id ? { ...t, status: 'APPROVED' as const } : t)),
      );
      message.success('已审批通过');
    } catch {
      message.error('审批失败');
    }
  };

  const handleShip = async (record: InventoryTransfer) => {
    try {
      await inventoryService.updateTransfer(record.id, { status: 'IN_TRANSIT' });
      updateInventoryTransfer(record.id, { status: 'IN_TRANSIT' });
      setTransfers((prev) =>
        prev.map((t) => (t.id === record.id ? { ...t, status: 'IN_TRANSIT' as const } : t)),
      );
      message.success('已发货，运输中');
    } catch {
      message.error('发货失败');
    }
  };

  const handleReceive = async (record: InventoryTransfer) => {
    try {
      await inventoryService.updateTransfer(record.id, { status: 'COMPLETED' });
      updateInventoryTransfer(record.id, { status: 'COMPLETED' });
      setTransfers((prev) =>
        prev.map((t) => (t.id === record.id ? { ...t, status: 'COMPLETED' as const } : t)),
      );
      message.success('已确认收货');
    } catch {
      message.error('确认收货失败');
    }
  };

  // 智能推荐：使用调剂算法推荐
  const handleSmartRecommend = async () => {
    setRecommending(true);
    try {
      await simulateDelay(1200);
      // 对 PENDING 状态的记录应用算法
      setTransfers((prev) =>
        prev.map((t) => {
          if (t.status !== 'PENDING') return t;
          const result = TransferAlgorithm.calculate({
            drugId: t.drugId,
            fromOrgId: t.fromOrgId,
            toOrgId: t.toOrgId,
            fromOrgQty: Math.floor(Math.random() * 200 + 50),
            toOrgQty: Math.floor(Math.random() * 30),
            toOrgLowerLimit: 40,
            distance: Math.floor(Math.random() * 30 + 5),
            urgency: t.reason.includes('紧急') ? 'HIGH' : t.reason.includes('季节') ? 'MEDIUM' : 'LOW',
          });
          const updated = {
            ...t,
            quantity: result.suggestedQty,
            reason: result.reason,
            isSmartRecommended: true,
          };
          inventoryService.updateTransfer(t.id, updated).catch(() => {});
          return updated;
        }),
      );
      message.success('AI智能调剂推荐已完成');
    } catch {
      message.error('智能推荐失败');
    } finally {
      setRecommending(false);
    }
  };

  const getRowClassName = (record: InventoryTransfer) => {
    if (record.isSmartRecommended) return 'row-smart-recommended';
    return '';
  };

  const columns: ColumnsType<InventoryTransfer> = [
    { title: '调出机构', dataIndex: 'fromOrgName', key: 'fromOrgName', width: 150, ellipsis: true },
    { title: '调入机构', dataIndex: 'toOrgName', key: 'toOrgName', width: 150, ellipsis: true },
    { title: '药品名称', dataIndex: 'drugName', key: 'drugName', width: 160, ellipsis: true },
    {
      title: '调剂数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      align: 'right',
      render: (val: number) => formatQty(val),
    },
    { title: '调剂原因', dataIndex: 'reason', key: 'reason', width: 240, ellipsis: true },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => <StatusTag status={status} />,
    },
    {
      title: '智能推荐',
      dataIndex: 'isSmartRecommended',
      key: 'isSmartRecommended',
      width: 100,
      align: 'center',
      render: (val: boolean) =>
        val ? (
          <Tag color="blue" icon={<RobotOutlined />}>
            是
          </Tag>
        ) : (
          <Tag>否</Tag>
        ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 170,
      render: (val: string) => formatDateTime(val),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_: unknown, record: InventoryTransfer) => (
        <Space size="small">
          {record.status === 'PENDING' && (
            <Button type="link" size="small" onClick={() => handleApprove(record)}>
              审批
            </Button>
          )}
          {record.status === 'APPROVED' && (
            <Button type="link" size="small" onClick={() => handleShip(record)}>
              发货
            </Button>
          )}
          {record.status === 'IN_TRANSIT' && (
            <Button type="link" size="small" onClick={() => handleReceive(record)}>
              确认收货
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="库存调剂"
        description="医共体内部药品调剂——优化库存分布，保障基层用药需求"
        extra={
          <Tooltip title="基于智能算法推荐最优调剂方案">
            <Button
              type="primary"
              icon={<BulbOutlined />}
              onClick={handleSmartRecommend}
              loading={recommending}
            >
              智能推荐
            </Button>
          </Tooltip>
        }
      />

      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8} lg={6}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ whiteSpace: 'nowrap', color: '#666' }}>调出机构：</span>
              <OrgTreeSelect value={fromOrgId} onChange={(val) => setFromOrgId(val)} placeholder="请选择调出机构" />
            </div>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ whiteSpace: 'nowrap', color: '#666' }}>调入机构：</span>
              <OrgTreeSelect value={toOrgId} onChange={(val) => setToOrgId(val)} placeholder="请选择调入机构" />
            </div>
          </Col>
          <Col xs={24} sm={24} md={8} lg={12}>
            <SearchForm
              fields={searchFields}
              onSearch={(values) => setSearchParams(values)}
              onReset={() => setSearchParams({})}
            />
          </Col>
        </Row>
      </Card>

      <Card>
        <DataTable<InventoryTransfer>
          rowKey="id"
          columns={columns}
          dataSource={filteredData}
          loading={pageLoading}
          rowClassName={getRowClassName}
          scroll={{ x: 1300 }}
        />
      </Card>

      <style>{`
        .row-smart-recommended td { background: #e6f4ff !important; }
      `}</style>
    </div>
  );
}
