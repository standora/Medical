import { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Statistic, Tag, Switch, Modal, Form, Select, Input, message, Space } from 'antd';
import {
  SafetyCertificateOutlined,
  WarningOutlined,
  StopOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { DrugInteractionRule } from '../../types/quality.types';
import { qualityService } from '../../services/quality.service';
import PageHeader from '../../components/common/PageHeader';
import SearchForm from '../../components/common/SearchForm';
import type { SearchField } from '../../components/common/SearchForm';
import DataTable from '../../components/common/DataTable';
import StatusTag from '../../components/common/StatusTag';

const ruleTypeLabelMap: Record<string, string> = {
  CONTRAINDICATION: '禁忌',
  DOSAGE: '剂量',
  DUPLICATE: '重复用药',
  THERAPY: '配伍禁忌',
};

const ruleTypeColorMap: Record<string, string> = {
  CONTRAINDICATION: 'red',
  DOSAGE: 'orange',
  DUPLICATE: 'blue',
  THERAPY: 'purple',
};

const interceptLevelLabelMap: Record<string, string> = {
  WARNING: '警告',
  BLOCK: '阻断',
};

const interceptLevelColorMap: Record<string, string> = {
  WARNING: 'orange',
  BLOCK: 'red',
};

const searchFields: SearchField[] = [
  {
    name: 'ruleType',
    label: '规则类型',
    type: 'select',
    placeholder: '请选择规则类型',
    options: [
      { label: '禁忌', value: 'CONTRAINDICATION' },
      { label: '剂量', value: 'DOSAGE' },
      { label: '重复用药', value: 'DUPLICATE' },
      { label: '配伍禁忌', value: 'THERAPY' },
    ],
  },
  {
    name: 'interceptLevel',
    label: '拦截级别',
    type: 'select',
    placeholder: '请选择拦截级别',
    options: [
      { label: '警告', value: 'WARNING' },
      { label: '阻断', value: 'BLOCK' },
    ],
  },
  {
    name: 'enabled',
    label: '启用状态',
    type: 'select',
    placeholder: '请选择启用状态',
    options: [
      { label: '启用', value: 'true' },
      { label: '停用', value: 'false' },
    ],
  },
];

export default function DrugInteractionPage() {
  const [data, setData] = useState<DrugInteractionRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState<Record<string, string>>({});
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DrugInteractionRule | null>(null);
  const [editForm] = Form.useForm();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await qualityService.getRules();
      setData(res.items);
    } catch {
      message.error('获取规则数据失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredData = data.filter((item) => {
    if (searchParams.ruleType && item.ruleType !== searchParams.ruleType) return false;
    if (searchParams.interceptLevel && item.interceptLevel !== searchParams.interceptLevel) return false;
    if (searchParams.enabled !== undefined && searchParams.enabled !== '') {
      if (String(item.enabled) !== searchParams.enabled) return false;
    }
    return true;
  });

  const totalCount = (data || []).length;
  const warningCount = (data || []).filter((r) => r.interceptLevel === 'WARNING').length;
  const blockCount = (data || []).filter((r) => r.interceptLevel === 'BLOCK').length;

  const handleToggleEnabled = async (record: DrugInteractionRule) => {
    try {
      await qualityService.updateRule(record.id, { enabled: !record.enabled });
      setData(
        data.map((r) =>
          r.id === record.id ? { ...r, enabled: !r.enabled } : r,
        ),
      );
      message.success(record.enabled ? '已停用规则' : '已启用规则');
    } catch {
      message.error('操作失败');
    }
  };

  const handleEdit = (record: DrugInteractionRule) => {
    setEditingRecord(record);
    editForm.setFieldsValue({
      ruleType: record.ruleType,
      interceptLevel: record.interceptLevel,
      message: record.message,
      enabled: record.enabled,
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async () => {
    try {
      const values = await editForm.validateFields();
      if (editingRecord) {
        await qualityService.updateRule(editingRecord.id, values);
        setData(
          data.map((r) =>
            r.id === editingRecord.id ? { ...r, ...values } : r,
          ),
        );
      }
      setEditModalOpen(false);
      setEditingRecord(null);
      editForm.resetFields();
      message.success('规则更新成功');
    } catch {
      // form validation failed
    }
  };

  const columns: ColumnsType<DrugInteractionRule> = [
    {
      title: '规则类型',
      dataIndex: 'ruleType',
      key: 'ruleType',
      width: 120,
      render: (val: DrugInteractionRule['ruleType']) => (
        <Tag color={ruleTypeColorMap[val]}>{ruleTypeLabelMap[val]}</Tag>
      ),
    },
    {
      title: '药物组合',
      dataIndex: 'drugCombination',
      key: 'drugCombination',
      width: 280,
      render: (drugs: string[]) => (
        <Space size={[4, 4]} wrap>
          {drugs.map((drug, idx) => (
            <Tag key={idx}>{drug}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '拦截级别',
      dataIndex: 'interceptLevel',
      key: 'interceptLevel',
      width: 100,
      render: (val: DrugInteractionRule['interceptLevel']) => (
        <Tag color={interceptLevelColorMap[val]}>{interceptLevelLabelMap[val]}</Tag>
      ),
    },
    {
      title: '拦截消息',
      dataIndex: 'message',
      key: 'message',
      width: 260,
      ellipsis: true,
    },
    {
      title: '是否启用',
      dataIndex: 'enabled',
      key: 'enabled',
      width: 100,
      render: (enabled: boolean, record: DrugInteractionRule) => (
        <Switch checked={enabled} onChange={() => handleToggleEnabled(record)} size="small" />
      ),
    },
    {
      title: '状态',
      dataIndex: 'enabled',
      key: 'status',
      width: 80,
      render: (enabled: boolean) => (
        <StatusTag status={enabled ? 'ENABLED' : 'DISABLED'} />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_: unknown, record: DrugInteractionRule) => (
        <Space size="small">
          <a onClick={() => handleEdit(record)}>编辑</a>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="药物相互作用规则" description="管理药物相互作用拦截规则，保障用药安全" />

      <Card size="small" style={{ marginBottom: 16 }}>
        <SearchForm
          fields={searchFields}
          onSearch={(values) => setSearchParams(values)}
          onReset={() => setSearchParams({})}
        />
      </Card>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="总规则数"
              value={totalCount}
              prefix={<SafetyCertificateOutlined />}
              styles={{ content: { color: '#1677ff' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="警告级规则"
              value={warningCount}
              prefix={<WarningOutlined />}
              styles={{ content: { color: '#fa8c16' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="阻断级规则"
              value={blockCount}
              prefix={<StopOutlined />}
              styles={{ content: { color: '#ff4d4f' } }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <DataTable<DrugInteractionRule>
          rowKey="id"
          columns={columns}
          dataSource={filteredData}
          loading={loading}
          scroll={{ x: 1100 }}
        />
      </Card>

      <Modal
        title="编辑规则"
        open={editModalOpen}
        onOk={handleEditSubmit}
        onCancel={() => {
          setEditModalOpen(false);
          setEditingRecord(null);
          editForm.resetFields();
        }}
        destroyOnHidden
      >
        <Form form={editForm} layout="vertical">
          <Form.Item name="ruleType" label="规则类型" rules={[{ required: true }]}>
            <Select
              options={[
                { label: '禁忌', value: 'CONTRAINDICATION' },
                { label: '剂量', value: 'DOSAGE' },
                { label: '重复用药', value: 'DUPLICATE' },
                { label: '配伍禁忌', value: 'THERAPY' },
              ]}
            />
          </Form.Item>
          <Form.Item name="interceptLevel" label="拦截级别" rules={[{ required: true }]}>
            <Select
              options={[
                { label: '警告', value: 'WARNING' },
                { label: '阻断', value: 'BLOCK' },
              ]}
            />
          </Form.Item>
          <Form.Item name="message" label="拦截消息" rules={[{ required: true }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="enabled" label="是否启用" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
