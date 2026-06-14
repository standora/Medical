import { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Statistic, Progress } from 'antd';
import {
  AuditOutlined,
  CheckCircleOutlined,
  PercentageOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { CentralizedProcurementStats } from '../../types/purchase.types';
import { purchaseService } from '../../services/purchase.service';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import { formatQty, formatMoney, formatPercent } from '../../utils/format';

function getExecutionRateColor(rate: number): string {
  if (rate >= 80) return '#52c41a';
  if (rate >= 60) return '#faad14';
  return '#ff4d4f';
}

export default function CentralizedStatsPage() {
  const [data, setData] = useState<CentralizedProcurementStats[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await purchaseService.getCentralizedStats();
      setData(result);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalAgreedQty = data.reduce((sum, item) => sum + item.agreedQty, 0);
  const totalActualQty = data.reduce((sum, item) => sum + item.actualQty, 0);
  const avgExecutionRate = data.length > 0
    ? data.reduce((sum, item) => sum + item.executionRate, 0) / data.length
    : 0;

  const columns: ColumnsType<CentralizedProcurementStats> = [
    { title: '药品名称', dataIndex: 'drugName', key: 'drugName', width: 200 },
    {
      title: '约定量',
      dataIndex: 'agreedQty',
      key: 'agreedQty',
      width: 120,
      render: (v: number) => formatQty(v),
    },
    {
      title: '实际执行量',
      dataIndex: 'actualQty',
      key: 'actualQty',
      width: 120,
      render: (v: number) => formatQty(v),
    },
    {
      title: '执行率',
      dataIndex: 'executionRate',
      key: 'executionRate',
      width: 200,
      render: (rate: number) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Progress
            percent={Math.min(rate, 100)}
            size="small"
            strokeColor={getExecutionRateColor(rate)}
            style={{ flex: 1, marginBottom: 0 }}
          />
          <span style={{ color: getExecutionRateColor(rate), whiteSpace: 'nowrap' }}>
            {formatPercent(rate)}
          </span>
        </div>
      ),
    },
    {
      title: '结余金额',
      dataIndex: 'surplusAmount',
      key: 'surplusAmount',
      width: 140,
      render: (v: number) => formatMoney(v),
    },
  ];

  return (
    <div>
      <PageHeader title="集采执行统计" description="集中采购执行情况统计与监控" />

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="总约定量"
              value={totalAgreedQty}
              prefix={<AuditOutlined />}
              styles={{ content: { color: '#1677ff' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="总执行量"
              value={totalActualQty}
              prefix={<CheckCircleOutlined />}
              styles={{ content: { color: '#52c41a' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="平均执行率"
              value={avgExecutionRate}
              suffix="%"
              precision={1}
              prefix={<PercentageOutlined />}
              styles={{ content: { color: getExecutionRateColor(avgExecutionRate) } }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <DataTable<CentralizedProcurementStats>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          pagination={false}
        />
      </Card>
    </div>
  );
}
