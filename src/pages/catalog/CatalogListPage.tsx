import { useState, useEffect, useCallback } from 'react';
import { Card, Button, Space, Tag, Drawer, Modal, Form, Input, Select, Descriptions, Switch, message, List, Empty, Divider } from 'antd';
import { PlusOutlined, EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { DrugCatalog, CatalogOrgRelation, CatalogChangeApproval } from '../../types/drug.types';
import type { PaginatedResult } from '../../types/common.types';
import { DrugCatalogType } from '../../types/drug.types';
import { DRUG_CATALOG_TYPE_LABELS } from '../../constants/drug-catalog-type';
import { catalogService } from '../../services/catalog.service';
import { useCatalogStore } from '../../stores/catalog.store';
import PageHeader from '../../components/common/PageHeader';
import SearchForm from '../../components/common/SearchForm';
import type { SearchField } from '../../components/common/SearchForm';
import DataTable from '../../components/common/DataTable';
import StatusTag from '../../components/common/StatusTag';
import { formatDate } from '../../utils/date';
import { simulateDelay } from '../../utils/simulate-delay';

const CATALOG_TYPE_OPTIONS = Object.values(DrugCatalogType).map((v) => ({
  label: DRUG_CATALOG_TYPE_LABELS[v],
  value: v,
}));

const CATALOG_TYPE_TAG_COLORS: Record<DrugCatalogType, string> = {
  [DrugCatalogType.ESSENTIAL]: 'blue',
  [DrugCatalogType.INSURANCE]: 'green',
  [DrugCatalogType.CENTRALIZED]: 'orange',
  [DrugCatalogType.KEY_MONITOR]: 'red',
  [DrugCatalogType.ANTIBIOTIC]: 'purple',
};

const PERMISSION_LEVEL_MAP: Record<string, { label: string; color: string }> = {
  FULL: { label: '完全授权', color: 'blue' },
  PARTIAL: { label: '部分授权', color: 'orange' },
  VIEW_ONLY: { label: '仅查看', color: 'default' },
};

const CHANGE_TYPE_MAP: Record<string, string> = {
  ADD: '新增',
  REMOVE: '移除',
  MODIFY: '修改',
};

const APPROVAL_STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING: { label: '待审批', color: 'orange' },
  APPROVED: { label: '已通过', color: 'green' },
  REJECTED: { label: '已拒绝', color: 'red' },
};

const SEARCH_FIELDS: SearchField[] = [
  { name: 'keyword', label: '关键词', placeholder: '通用名/编码' },
  {
    name: 'catalogType',
    label: '目录类型',
    type: 'select',
    placeholder: '请选择目录类型',
    options: CATALOG_TYPE_OPTIONS,
  },
  {
    name: 'status',
    label: '状态',
    type: 'select',
    placeholder: '请选择状态',
    options: [
      { label: '启用', value: 'ACTIVE' },
      { label: '停用', value: 'INACTIVE' },
    ],
  },
];

export default function CatalogListPage() {
  const { catalogs, loading, selectedCatalog, setCatalogs, setLoading, setSelectedCatalog } =
    useCatalogStore();

  const [pagination, setPagination] = useState<PaginatedResult<DrugCatalog> | null>(null);
  const [searchParams, setSearchParams] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [form] = Form.useForm();

  // 详情关联数据（模拟）
  const [orgRelations, setOrgRelations] = useState<CatalogOrgRelation[]>([]);
  const [changeApprovals, setChangeApprovals] = useState<CatalogChangeApproval[]>([]);

  const fetchData = useCallback(
    async (page = currentPage, size = pageSize, params = searchParams) => {
      setLoading(true);
      try {
      await simulateDelay();
      const res = await catalogService.getList({
          page,
          pageSize: size,
          keyword: params.keyword,
          catalogType: params.catalogType,
          status: params.status,
        });
        setCatalogs(res.items);
        setPagination(res);
      } catch {
        message.error('获取用药目录列表失败');
      } finally {
        setLoading(false);
      }
    },
    [currentPage, pageSize, searchParams, setCatalogs, setLoading],
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = (values: Record<string, string>) => {
    setSearchParams(values);
    setCurrentPage(1);
    fetchData(1, pageSize, values);
  };

  const handleReset = () => {
    setSearchParams({});
    setCurrentPage(1);
    fetchData(1, pageSize, {});
  };

  const handlePageChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
    fetchData(page, size);
  };

  // 查看详情
  const handleViewDetail = async (record: DrugCatalog) => {
    setSelectedCatalog(record);
    setDrawerOpen(true);
    // 模拟加载关联数据
    setOrgRelations([]);
    setChangeApprovals([]);
    try {
      const detail = await catalogService.getById(record.id);
      setSelectedCatalog(detail);
    } catch {
      // 使用列表数据展示
    }
  };

  // 切换状态
  const handleToggleStatus = async (record: DrugCatalog) => {
    const newStatus = record.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await catalogService.updateStatus(record.id, newStatus);
      message.success(`已${newStatus === 'ACTIVE' ? '启用' : '停用'}药品「${record.genericName}」`);
      fetchData();
    } catch {
      message.error('状态更新失败');
    }
  };

  // 新增药品
  const handleAdd = () => {
    form.resetFields();
    setModalOpen(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      setConfirmLoading(true);
      await catalogService.create(values);
      message.success('新增药品成功');
      setModalOpen(false);
      form.resetFields();
      fetchData();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'errorFields' in err) {
        // 表单验证失败，不提示
        return;
      }
      message.error('新增药品失败');
    } finally {
      setConfirmLoading(false);
    }
  };

  const columns: ColumnsType<DrugCatalog> = [
    {
      title: '药品编码',
      dataIndex: 'code',
      width: 130,
      ellipsis: true,
    },
    {
      title: '通用名',
      dataIndex: 'genericName',
      width: 150,
      ellipsis: true,
    },
    {
      title: '商品名',
      dataIndex: 'tradeName',
      width: 130,
      ellipsis: true,
    },
    {
      title: '剂型',
      dataIndex: 'dosageForm',
      width: 100,
      ellipsis: true,
    },
    {
      title: '规格',
      dataIndex: 'specification',
      width: 100,
      ellipsis: true,
    },
    {
      title: '生产厂家',
      dataIndex: 'manufacturer',
      width: 150,
      ellipsis: true,
    },
    {
      title: '目录类型',
      dataIndex: 'catalogTypes',
      width: 200,
      render: (types: DrugCatalogType[]) => (
        <Space size={[0, 4]} wrap>
          {types?.map((t) => (
            <Tag key={t} color={CATALOG_TYPE_TAG_COLORS[t]}>
              {DRUG_CATALOG_TYPE_LABELS[t]}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      render: (status: string) => <StatusTag status={status} />,
    },
    {
      title: '操作',
      width: 160,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
            详情
          </Button>
          <Switch
            size="small"
            checked={record.status === 'ACTIVE'}
            onChange={() => handleToggleStatus(record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="统一用药目录"
        description="管理医共体统一用药目录，维护药品信息及目录分类"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增药品
          </Button>
        }
      />

      <Card style={{ marginBottom: 16 }}>
        <SearchForm fields={SEARCH_FIELDS} onSearch={handleSearch} onReset={handleReset} />
      </Card>

      <Card>
        <DataTable<DrugCatalog>
          rowKey="id"
          columns={columns}
          dataSource={catalogs}
          loading={loading}
          pagination={pagination}
          onPageChange={handlePageChange}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 详情 Drawer */}
      <Drawer
        title="药品详情"
        open={drawerOpen}
        width={640}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedCatalog(null);
        }}
      >
        {selectedCatalog && (
          <>
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="药品编码">{selectedCatalog.code}</Descriptions.Item>
              <Descriptions.Item label="通用名">{selectedCatalog.genericName}</Descriptions.Item>
              <Descriptions.Item label="商品名">{selectedCatalog.tradeName}</Descriptions.Item>
              <Descriptions.Item label="剂型">{selectedCatalog.dosageForm}</Descriptions.Item>
              <Descriptions.Item label="规格">{selectedCatalog.specification}</Descriptions.Item>
              <Descriptions.Item label="生产厂家">{selectedCatalog.manufacturer}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <StatusTag status={selectedCatalog.status} />
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">
                {formatDate(selectedCatalog.createdAt, 'YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
            </Descriptions>

            <Divider orientation={'left' as any}>目录类型</Divider>
            <Space size={[8, 8]} wrap>
              {selectedCatalog.catalogTypes?.map((t) => (
                <Tag key={t} color={CATALOG_TYPE_TAG_COLORS[t]}>
                  {DRUG_CATALOG_TYPE_LABELS[t]}
                </Tag>
              ))}
            </Space>

            <Divider orientation={'left' as any}>机构授权关系</Divider>
            {orgRelations.length > 0 ? (
              <List
                size="small"
                dataSource={orgRelations}
                renderItem={(item) => {
                  const perm = PERMISSION_LEVEL_MAP[item.permissionLevel] || {
                    label: item.permissionLevel,
                    color: 'default',
                  };
                  return (
                    <List.Item>
                      <Space>
                        <span>机构ID: {item.orgId}</span>
                        <Tag color={perm.color}>{perm.label}</Tag>
                      </Space>
                    </List.Item>
                  );
                }}
              />
            ) : (
              <Empty description="暂无机构授权数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}

            <Divider orientation={'left' as any}>变更审批记录</Divider>
            {changeApprovals.length > 0 ? (
              <List
                size="small"
                dataSource={changeApprovals}
                renderItem={(item) => {
                  const approval = APPROVAL_STATUS_MAP[item.approvalStatus] || {
                    label: item.approvalStatus,
                    color: 'default',
                  };
                  return (
                    <List.Item>
                      <Space>
                        <Tag>{CHANGE_TYPE_MAP[item.changeType] || item.changeType}</Tag>
                        <Tag color={approval.color}>{approval.label}</Tag>
                        {item.approver && <span>审批人: {item.approver}</span>}
                        <span>{formatDate(item.createdAt)}</span>
                      </Space>
                    </List.Item>
                  );
                }}
              />
            ) : (
              <Empty description="暂无变更审批记录" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </>
        )}
      </Drawer>

      {/* 新增药品 Modal */}
      <Modal
        title="新增药品"
        open={modalOpen}
        onOk={handleModalOk}
        onCancel={() => setModalOpen(false)}
        confirmLoading={confirmLoading}
        width={640}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" autoComplete="off">
          <Form.Item
            name="code"
            label="药品编码"
            rules={[{ required: true, message: '请输入药品编码' }]}
          >
            <Input placeholder="请输入药品编码" />
          </Form.Item>
          <Form.Item
            name="genericName"
            label="通用名"
            rules={[{ required: true, message: '请输入通用名' }]}
          >
            <Input placeholder="请输入通用名" />
          </Form.Item>
          <Form.Item name="tradeName" label="商品名">
            <Input placeholder="请输入商品名" />
          </Form.Item>
          <Form.Item
            name="dosageForm"
            label="剂型"
            rules={[{ required: true, message: '请输入剂型' }]}
          >
            <Input placeholder="请输入剂型" />
          </Form.Item>
          <Form.Item
            name="specification"
            label="规格"
            rules={[{ required: true, message: '请输入规格' }]}
          >
            <Input placeholder="请输入规格" />
          </Form.Item>
          <Form.Item
            name="manufacturer"
            label="生产厂家"
            rules={[{ required: true, message: '请输入生产厂家' }]}
          >
            <Input placeholder="请输入生产厂家" />
          </Form.Item>
          <Form.Item
            name="catalogTypes"
            label="目录类型"
            rules={[{ required: true, message: '请选择目录类型' }]}
          >
            <Select
              mode="multiple"
              placeholder="请选择目录类型"
              options={CATALOG_TYPE_OPTIONS}
            />
          </Form.Item>
          <Form.Item
            name="status"
            label="状态"
            initialValue="ACTIVE"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select
              placeholder="请选择状态"
              options={[
                { label: '启用', value: 'ACTIVE' },
                { label: '停用', value: 'INACTIVE' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
