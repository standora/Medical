import { useState, useEffect, useMemo } from 'react';
import { Card, Row, Col, Statistic, Tag } from 'antd';
import { AlertOutlined, DashboardOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import type { ColumnsType } from 'antd/es/table';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import { deliveryService } from '../../services/delivery.service';
import type { ColdChainData } from '../../types/delivery.types';
import type { PaginatedResult } from '../../types/common.types';
import { formatDateTime } from '../../utils/date';

export default function ColdChainPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ColdChainData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await deliveryService.getColdChainData();
        setData(res);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalCount = (data || []).length;
  const abnormalCount = (data || []).filter((d) => d.isAbnormal).length;

  const temperatures = useMemo(() => data.map((d) => d.temperature), [data]);
  const maxTemp = temperatures.length > 0 ? Math.max(...temperatures) : 0;
  const minTemp = temperatures.length > 0 ? Math.min(...temperatures) : 0;

  const chartOption = useMemo(() => {
    if (data.length === 0) return {};
    const timestamps = data.map((d) => formatDateTime(d.timestamp));
    const temps = data.map((d) => d.temperature);
    const humidities = data.map((d) => d.humidity);
    return {
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        data: ['温度 (°C)', '湿度 (%)'],
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: timestamps,
        axisLabel: {
          rotate: 30,
          fontSize: 11,
        },
      },
      yAxis: [
        {
          type: 'value',
          name: '温度 (°C)',
          position: 'left',
        },
        {
          type: 'value',
          name: '湿度 (%)',
          position: 'right',
        },
      ],
      series: [
        {
          name: '温度 (°C)',
          type: 'line',
          yAxisIndex: 0,
          data: temps,
          smooth: true,
          itemStyle: { color: '#ff4d4f' },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(255,77,79,0.25)' },
                { offset: 1, color: 'rgba(255,77,79,0.02)' },
              ],
            },
          },
          markLine: {
            silent: true,
            data: [
              { yAxis: 8, name: '下限', lineStyle: { color: '#1677ff', type: 'dashed' } },
              { yAxis: 20, name: '上限', lineStyle: { color: '#1677ff', type: 'dashed' } },
            ],
          },
        },
        {
          name: '湿度 (%)',
          type: 'line',
          yAxisIndex: 1,
          data: humidities,
          smooth: true,
          itemStyle: { color: '#1677ff' },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(22,119,255,0.15)' },
                { offset: 1, color: 'rgba(22,119,255,0.02)' },
              ],
            },
          },
        },
      ],
    };
  }, [data]);

  const pagination: PaginatedResult<ColdChainData> = {
    items: data,
    total: data.length,
    page: 1,
    pageSize: 10,
    totalPages: Math.ceil(data.length / 10),
  };

  const columns: ColumnsType<ColdChainData> = [
    {
      title: '时间戳',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 200,
      render: (v: string) => formatDateTime(v),
    },
    {
      title: '温度 (°C)',
      dataIndex: 'temperature',
      key: 'temperature',
      width: 120,
      render: (v: number, record: ColdChainData) => (
        <span style={{ color: record.isAbnormal ? '#ff4d4f' : undefined, fontWeight: record.isAbnormal ? 600 : 400 }}>
          {v}
        </span>
      ),
    },
    {
      title: '湿度 (%)',
      dataIndex: 'humidity',
      key: 'humidity',
      width: 120,
      render: (v: number, record: ColdChainData) => (
        <span style={{ color: record.isAbnormal ? '#ff4d4f' : undefined, fontWeight: record.isAbnormal ? 600 : 400 }}>
          {v}
        </span>
      ),
    },
    {
      title: '是否异常',
      dataIndex: 'isAbnormal',
      key: 'isAbnormal',
      width: 100,
      render: (v: boolean) =>
        v ? <Tag color="red">异常</Tag> : <Tag color="green">正常</Tag>,
    },
  ];

  return (
    <div>
      <PageHeader title="冷链监控" description="冷链温湿度实时监控——保障药品储存运输安全" />

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="总监控点数"
              value={totalCount}
              prefix={<DashboardOutlined />}
              styles={{ content: { color: '#1677ff' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="异常数据点数"
              value={abnormalCount}
              prefix={<AlertOutlined />}
              styles={{ content: { color: '#ff4d4f' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="最高温度"
              value={maxTemp}
              suffix="°C"
              styles={{ content: { color: '#ff4d4f' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="最低温度"
              value={minTemp}
              suffix="°C"
              styles={{ content: { color: '#1677ff' } }}
            />
          </Card>
        </Col>
      </Row>

      {data.length > 0 && (
        <Card title="温湿度趋势图" style={{ marginBottom: 16 }}>
          <ReactECharts option={chartOption} style={{ height: 350 }} />
        </Card>
      )}

      <Card title="监控数据明细">
        <DataTable<ColdChainData>
          columns={columns}
          dataSource={data}
          rowKey={(record) => `${record.timestamp}-${record.temperature}`}
          loading={loading}
          pagination={pagination}
          rowClassName={(record) => (record.isAbnormal ? 'row-abnormal' : '')}
        />
      </Card>

      <style>{`
        .row-abnormal td {
          background-color: #fff1f0 !important;
        }
      `}</style>
    </div>
  );
}
