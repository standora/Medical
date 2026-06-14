import { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Statistic, Tabs, Table, message } from 'antd';
import {
  ShoppingOutlined,
  InboxOutlined,
  CarOutlined,
  FileTextOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { PurchaseStats, InventoryStats, DeliveryStats, PrescriptionStats } from '../../types/stats.types';
import { statsService } from '../../services/stats.service';
import { formatMoney, formatPercent } from '../../utils/format';
import PageHeader from '../../components/common/PageHeader';
import ReactECharts from 'echarts-for-react';

export default function StatsPage() {
  const [purchaseData, setPurchaseData] = useState<PurchaseStats | null>(null);
  const [inventoryData, setInventoryData] = useState<InventoryStats | null>(null);
  const [deliveryData, setDeliveryData] = useState<DeliveryStats | null>(null);
  const [prescriptionData, setPrescriptionData] = useState<PrescriptionStats | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [purchase, inventory, delivery, prescription] = await Promise.all([
        statsService.getPurchaseStats(),
        statsService.getInventoryStats(),
        statsService.getDeliveryStats(),
        statsService.getPrescriptionStats(),
      ]);
      // API may return array (per period) or single object
      const p = Array.isArray(purchase) ? purchase[purchase.length - 1] : purchase;
      const i = Array.isArray(inventory) ? inventory[inventory.length - 1] : inventory;
      const d = Array.isArray(delivery) ? delivery[delivery.length - 1] : delivery;
      const pr = Array.isArray(prescription) ? prescription[prescription.length - 1] : prescription;
      setPurchaseData(p ?? null);
      setInventoryData(i ?? null);
      setDeliveryData(d ?? null);
      setPrescriptionData(pr ?? null);
    } catch {
      message.error('获取统计数据失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- 采购统计 ---
  const purchaseAmountBySupplier = purchaseData?.bySupplier ?? [];
  const totalPurchaseAmount = purchaseAmountBySupplier.reduce((s, i) => s + i.amount, 0);

  const supplierColumns: ColumnsType<PurchaseStats['bySupplier'][0]> = [
    { title: '供应商名称', dataIndex: 'name', key: 'name' },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (v: number) => formatMoney(v),
    },
    {
      title: '占比',
      key: 'ratio',
      render: (_: unknown, record: PurchaseStats['bySupplier'][0]) =>
        totalPurchaseAmount > 0
          ? formatPercent((record.amount / totalPurchaseAmount) * 100)
          : '-',
    },
  ];

  const purchaseAmountByOrg = purchaseData?.byOrg ?? [];
  const totalOrgAmount = purchaseAmountByOrg.reduce((s, i) => s + i.amount, 0);

  const orgPurchaseColumns: ColumnsType<PurchaseStats['byOrg'][0]> = [
    { title: '机构名称', dataIndex: 'name', key: 'name' },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (v: number) => formatMoney(v),
    },
    {
      title: '占比',
      key: 'ratio',
      render: (_: unknown, record: PurchaseStats['byOrg'][0]) =>
        totalOrgAmount > 0
          ? formatPercent((record.amount / totalOrgAmount) * 100)
          : '-',
    },
  ];

  const purchaseBarOption = {
    tooltip: { trigger: 'axis' as const },
    xAxis: {
      type: 'category' as const,
      data: purchaseAmountByOrg.map((i) => i.name),
    },
    yAxis: { type: 'value' as const },
    series: [
      {
        type: 'bar' as const,
        data: purchaseAmountByOrg.map((i) => i.amount),
        itemStyle: { color: '#1677ff' },
      },
    ],
  };

  // --- 库存统计 ---
  const inventoryByOrg = inventoryData?.byOrg ?? [];

  const inventoryOrgColumns: ColumnsType<InventoryStats['byOrg'][0]> = [
    { title: '机构名称', dataIndex: 'name', key: 'name' },
    {
      title: '总库存',
      dataIndex: 'total',
      key: 'total',
    },
    {
      title: '预警数',
      dataIndex: 'alert',
      key: 'alert',
      render: (v: number) => (
        <span style={{ color: v > 0 ? '#ff4d4f' : undefined }}>{v}</span>
      ),
    },
  ];

  // --- 配送统计 ---

  // --- 处方统计 ---
  const prescriptionByOrg = prescriptionData?.byOrg ?? [];

  const prescriptionOrgColumns: ColumnsType<PrescriptionStats['byOrg'][0]> = [
    { title: '机构名称', dataIndex: 'name', key: 'name' },
    {
      title: '处方数',
      dataIndex: 'count',
      key: 'count',
    },
  ];

  const prescriptionBarOption = {
    tooltip: { trigger: 'axis' as const },
    xAxis: {
      type: 'category' as const,
      data: prescriptionByOrg.map((i) => i.name),
    },
    yAxis: { type: 'value' as const },
    series: [
      {
        type: 'bar' as const,
        data: prescriptionByOrg.map((i) => i.count),
        itemStyle: { color: '#52c41a' },
      },
    ],
  };

  const tabItems = [
    {
      key: 'purchase',
      label: '采购统计',
      icon: <ShoppingOutlined />,
      children: (
        <>
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={24} sm={12} md={8}>
              <Card loading={loading}>
                <Statistic
                  title="总金额"
                  value={purchaseData?.totalAmount ?? 0}
                  prefix={<DollarOutlined />}
                  formatter={(val) => formatMoney(val as number)}
                  styles={{ content: { color: '#1677ff' } }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card loading={loading}>
                <Statistic
                  title="订单数"
                  value={purchaseData?.orderCount ?? 0}
                  prefix={<FileTextOutlined />}
                  styles={{ content: { color: '#52c41a' } }}
                />
              </Card>
            </Col>
          </Row>

          {purchaseAmountByOrg.length > 0 && (
            <Card title="按机构采购分布" size="small" style={{ marginBottom: 16 }}>
              <ReactECharts option={purchaseBarOption} style={{ height: 300 }} />
            </Card>
          )}

          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card title="按供应商分布" size="small">
                <Table
                  rowKey="name"
                  columns={supplierColumns}
                  dataSource={purchaseAmountBySupplier}
                  pagination={false}
                  size="small"
                  bordered
                />
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="按机构分布" size="small">
                <Table
                  rowKey="name"
                  columns={orgPurchaseColumns}
                  dataSource={purchaseAmountByOrg}
                  pagination={false}
                  size="small"
                  bordered
                />
              </Card>
            </Col>
          </Row>
        </>
      ),
    },
    {
      key: 'inventory',
      label: '库存统计',
      icon: <InboxOutlined />,
      children: (
        <>
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={24} sm={8}>
              <Card loading={loading}>
                <Statistic
                  title="总品种数"
                  value={inventoryData?.totalItems ?? 0}
                  prefix={<InboxOutlined />}
                  styles={{ content: { color: '#1677ff' } }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card loading={loading}>
                <Statistic
                  title="预警数"
                  value={inventoryData?.alertCount ?? 0}
                  prefix={<ExclamationCircleOutlined />}
                  styles={{ content: { color: '#ff4d4f' } }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card loading={loading}>
                <Statistic
                  title="近效期数"
                  value={inventoryData?.nearExpiryCount ?? 0}
                  prefix={<ClockCircleOutlined />}
                  styles={{ content: { color: '#fa8c16' } }}
                />
              </Card>
            </Col>
          </Row>

          <Card title="按机构分布" size="small">
            <Table
              rowKey="name"
              columns={inventoryOrgColumns}
              dataSource={inventoryByOrg}
              pagination={false}
              size="small"
              bordered
            />
          </Card>
        </>
      ),
    },
    {
      key: 'delivery',
      label: '配送统计',
      icon: <CarOutlined />,
      children: (
        <>
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={24} sm={12} md={6}>
              <Card loading={loading}>
                <Statistic
                  title="总订单数"
                  value={deliveryData?.totalOrders ?? 0}
                  prefix={<CarOutlined />}
                  styles={{ content: { color: '#1677ff' } }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card loading={loading}>
                <Statistic
                  title="准时率"
                  value={deliveryData ? formatPercent(deliveryData.onTimeRate) : '-'}
                  prefix={<CheckCircleOutlined />}
                  styles={{ content: { color: '#52c41a' } }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card loading={loading}>
                <Statistic
                  title="异常率"
                  value={deliveryData ? formatPercent(deliveryData.exceptionRate) : '-'}
                  prefix={<ExclamationCircleOutlined />}
                  styles={{ content: { color: '#ff4d4f' } }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card loading={loading}>
                <Statistic
                  title="平均配送时长"
                  value={deliveryData?.avgDeliveryHours ?? 0}
                  suffix="小时"
                  prefix={<ClockCircleOutlined />}
                  styles={{ content: { color: '#fa8c16' } }}
                />
              </Card>
            </Col>
          </Row>
        </>
      ),
    },
    {
      key: 'prescription',
      label: '处方统计',
      icon: <FileTextOutlined />,
      children: (
        <>
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={24} sm={12}>
              <Card loading={loading}>
                <Statistic
                  title="总处方数"
                  value={prescriptionData?.totalCount ?? 0}
                  prefix={<FileTextOutlined />}
                  styles={{ content: { color: '#1677ff' } }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12}>
              <Card loading={loading}>
                <Statistic
                  title="审核通过率"
                  value={prescriptionData ? formatPercent(prescriptionData.reviewPassRate) : '-'}
                  prefix={<CheckCircleOutlined />}
                  styles={{ content: { color: '#52c41a' } }}
                />
              </Card>
            </Col>
          </Row>

          {prescriptionByOrg.length > 0 && (
            <Card title="按机构处方分布" size="small" style={{ marginBottom: 16 }}>
              <ReactECharts option={prescriptionBarOption} style={{ height: 300 }} />
            </Card>
          )}

          <Card title="按机构分布" size="small">
            <Table
              rowKey="name"
              columns={prescriptionOrgColumns}
              dataSource={prescriptionByOrg}
              pagination={false}
              size="small"
              bordered
            />
          </Card>
        </>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="统计分析" description="药事质控与运营数据统计分析总览" />

      <Card>
        <Tabs defaultActiveKey="purchase" items={tabItems} />
      </Card>
    </div>
  );
}
