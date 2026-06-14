import { useState, useEffect, useCallback } from 'react';
import { Card, Tag, Button, Modal, Form, DatePicker, message } from 'antd';
import { EyeOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { PurchasePlan, PurchasePlanItem } from '../../types/purchase.types';
import type { PaginatedResult } from '../../types/common.types';
import { purchaseService } from '../../services/purchase.service';
import PageHeader from '../../components/common/PageHeader';
import SearchForm from '../../components/common/SearchForm';
import type { SearchField } from '../../components/common/SearchForm';
import DataTable from '../../components/common/DataTable';
import StatusTag from '../../components/common/StatusTag';
import OrgTreeSelect from '../../components/common/OrgTreeSelect';
import { formatDate, formatDateTime } from '../../utils/date';
import { formatQty } from '../../utils/format';

const PLAN_STATUS_OPTIONS = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已提交', value: 'SUBMITTED' },
  { label: '已审批', value: 'APPROVED' },
  { label: '已拒绝', value: 'REJECTED' },
];

const PLAN_STATUS_COLOR_MAP: Record<string, string> = {
  DRAFT: 'default',
  SUBMITTED: 'processing',
  APPROVED: 'green',
  REJECTED: 'red',
};

const PLAN_STATUS_LABEL_MAP: Record<string, string> = {
  DRAFT: '草稿',
  SUBMITTED: '已提交',
  APPROVED: '已审批',
  REJECTED: '已拒绝',
};

const searchFields: SearchField[] = [
  { name: 'planNo', label: '计划编号', type: 'input' },
  { name: 'status', label: '状态', type: 'select', options: PLAN_STATUS_OPTIONS },
];

export default function PurchasePlanPage() {
  const [data, setData] = useState<PaginatedResult<PurchasePlan> | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState<Record<string, string>>({});
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createForm] = Form.useForm();
  const [createLoading, setCreateLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await purchaseService.getPlans();
      setData(result);
    } catch {
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

  const handleCreatePlan = async () => {
    try {
      const values = await createForm.validateFields();
      setCreateLoading(true);
      await purchaseService.createPlan({
        ...values,
        periodStart: values.period[0].toISOString(),
        periodEnd: values.period[1].toISOString(),
        status: 'DRAFT',
        planNo: 'PLAN-' + Date.now(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      message.success('新增采购计划成功');
      setCreateModalOpen(false);
      createForm.resetFields();
      fetchData();
    } catch {
      // form validation failed or API error
    } finally {
      setCreateLoading(false);
    }
  };

  const filteredItems = data?.items.filter((item) => {
    if (searchParams.planNo && !item.planNo.includes(searchParams.planNo)) return false;
    if (searchParams.orgId && item.orgId !== searchParams.orgId) return false;
    if (searchParams.status && item.status !== searchParams.status) return false;
    return true;
  }) || [];

  const itemColumns: ColumnsType<PurchasePlanItem> = [
    { title: '药品名称', dataIndex: 'drugName', key: 'drugName' },
    { title: '申请数量', dataIndex: 'requestedQty', key: 'requestedQty', render: (v: number) => formatQty(v) },
    {
      title: 'AI建议数量',
      dataIndex: 'suggestedQty',
      key: 'suggestedQty',
      render: (v?: number) => v != null ? formatQty(v) : '-',
    },
    {
      title: '是否AI推荐',
      dataIndex: 'isAiRecommended',
      key: 'isAiRecommended',
      render: (v: boolean) => v ? <Tag color="blue">AI推荐</Tag> : <Tag>否</Tag>,
    },
  ];

  const columns: ColumnsType<PurchasePlan> = [
    { title: '计划编号', dataIndex: 'planNo', key: 'planNo', width: 160 },
    { title: '机构名称', dataIndex: 'orgName', key: 'orgName', width: 200 },
    {
      title: '计划周期',
      key: 'period',
      width: 220,
      render: (_, record) => `${formatDate(record.periodStart)} ~ ${formatDate(record.periodEnd)}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <StatusTag
          status={status}
          customColor={PLAN_STATUS_COLOR_MAP[status]}
          customLabel={PLAN_STATUS_LABEL_MAP[status]}
        />
      ),
    },
    { title: '创建人', dataIndex: 'createdBy', key: 'createdBy', width: 120 },
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 180, render: (v: string) => formatDateTime(v) },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) => (
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
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="采购计划"
        description="管理医共体各机构的采购计划"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalOpen(true)}>
            新增采购计划
          </Button>
        }
      />

      <Card style={{ marginBottom: 16 }}>
        <SearchForm
          fields={searchFields}
          onSearch={handleSearch}
          onReset={handleReset}
          extra={
            <OrgTreeSelect
              value={searchParams.orgId}
              onChange={(val) => setSearchParams((prev) => ({ ...prev, orgId: val }))}
              placeholder="选择机构"
            />
          }
        />
      </Card>

      <Card>
        <DataTable<PurchasePlan>
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
              <DataTable<PurchasePlanItem>
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

      <Modal
        title="新增采购计划"
        open={createModalOpen}
        onOk={handleCreatePlan}
        onCancel={() => {
          setCreateModalOpen(false);
          createForm.resetFields();
        }}
        confirmLoading={createLoading}
        destroyOnHidden
      >
        <Form form={createForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="orgId"
            label="机构"
            rules={[{ required: true, message: '请选择机构' }]}
          >
            <OrgTreeSelect placeholder="请选择机构" />
          </Form.Item>
          <Form.Item
            name="period"
            label="计划周期"
            rules={[{ required: true, message: '请选择计划周期' }]}
          >
            <DatePicker.RangePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
