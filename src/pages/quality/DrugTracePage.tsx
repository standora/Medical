import { useState, useEffect, useCallback } from 'react';
import { Card, Drawer, Timeline, Descriptions, message, Space } from 'antd';
import { EnvironmentOutlined, UserOutlined, ClockCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { DrugTrace, DrugTraceNode } from '../../types/quality.types';
import { qualityService } from '../../services/quality.service';
import { formatDateTime } from '../../utils/date';
import PageHeader from '../../components/common/PageHeader';
import SearchForm from '../../components/common/SearchForm';
import type { SearchField } from '../../components/common/SearchForm';
import DataTable from '../../components/common/DataTable';

const searchFields: SearchField[] = [
  {
    name: 'traceCode',
    label: '追溯码',
    type: 'input',
    placeholder: '请输入追溯码',
  },
  {
    name: 'drugName',
    label: '药品名称',
    type: 'input',
    placeholder: '请输入药品名称',
  },
];

export default function DrugTracePage() {
  const [data, setData] = useState<DrugTrace[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState<Record<string, string>>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentTrace, setCurrentTrace] = useState<DrugTrace | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await qualityService.getTraces();
      setData(res);
    } catch {
      message.error('获取追溯数据失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredData = (data || []).filter((item) => {
    if (searchParams.traceCode && !item.traceCode.includes(searchParams.traceCode)) return false;
    if (searchParams.drugName && !item.drugName.includes(searchParams.drugName)) return false;
    return true;
  });

  const handleViewTrace = (record: DrugTrace) => {
    setCurrentTrace(record);
    setDrawerOpen(true);
  };

  const sortedNodes = (nodes: DrugTraceNode[]): DrugTraceNode[] =>
    [...nodes].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );

  const columns: ColumnsType<DrugTrace> = [
    {
      title: '追溯码',
      dataIndex: 'traceCode',
      key: 'traceCode',
      width: 200,
    },
    {
      title: '药品名称',
      dataIndex: 'drugName',
      key: 'drugName',
      width: 200,
    },
    {
      title: '追溯节点数',
      dataIndex: 'nodes',
      key: 'nodeCount',
      width: 120,
      render: (nodes: DrugTraceNode[]) => nodes.length,
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_: unknown, record: DrugTrace) => (
        <Space size="small">
          <a onClick={() => handleViewTrace(record)}>查看追溯链</a>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="药品追溯" description="追踪药品从生产到使用的全链路信息" />

      <Card size="small" style={{ marginBottom: 16 }}>
        <SearchForm
          fields={searchFields}
          onSearch={(values) => setSearchParams(values)}
          onReset={() => setSearchParams({})}
        />
      </Card>

      <Card>
        <DataTable<DrugTrace>
          rowKey="id"
          columns={columns}
          dataSource={filteredData}
          loading={loading}
          scroll={{ x: 700 }}
        />
      </Card>

      <Drawer
        title="追溯链详情"
        placement="right"
        width={520}
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setCurrentTrace(null);
        }}
      >
        {currentTrace && (
          <>
            <Descriptions column={1} bordered size="small" style={{ marginBottom: 24 }}>
              <Descriptions.Item label="追溯码">{currentTrace.traceCode}</Descriptions.Item>
              <Descriptions.Item label="药品名称">{currentTrace.drugName}</Descriptions.Item>
            </Descriptions>

            <Card title="追溯节点" size="small">
              <Timeline
                items={sortedNodes(currentTrace.nodes).map((node, idx) => ({
                  color: idx === currentTrace.nodes.length - 1 ? 'green' : 'blue',
                  children: (
                    <div>
                      <div style={{ fontWeight: 500, marginBottom: 4 }}>{node.node}</div>
                      <div style={{ color: '#8c8c8c', fontSize: 13 }}>
                        <Space orientation="vertical" size={2}>
                          <span>
                            <ClockCircleOutlined style={{ marginRight: 6 }} />
                            {formatDateTime(node.timestamp)}
                          </span>
                          <span>
                            <UserOutlined style={{ marginRight: 6 }} />
                            {node.operator}
                          </span>
                          <span>
                            <EnvironmentOutlined style={{ marginRight: 6 }} />
                            {node.location}
                          </span>
                        </Space>
                      </div>
                    </div>
                  ),
                }))}
              />
            </Card>
          </>
        )}
      </Drawer>
    </div>
  );
}
