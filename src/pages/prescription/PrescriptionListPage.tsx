import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Tag, Drawer, Descriptions, Table, Timeline, Space, Button, Modal, message } from 'antd';
import {
  FileTextOutlined,
  AuditOutlined,
  CheckCircleOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import PageHeader from '../../components/common/PageHeader';
import SearchForm from '../../components/common/SearchForm';
import type { SearchField } from '../../components/common/SearchForm';
import DataTable from '../../components/common/DataTable';
import StatusTag from '../../components/common/StatusTag';
import { prescriptionService } from '../../services/prescription.service';
import type { Prescription, PrescriptionItem } from '../../types/prescription.types';
import type { PaginatedResult } from '../../types/common.types';
import { PRESCRIPTION_STATUS_LIST } from '../../constants/prescription-status';
import { formatDateTime } from '../../utils/date';
import { useAuthStore } from '../../stores/auth-store';

const PRESCRIPTION_TYPE_OPTIONS = [
  { label: '西药', value: 'WESTERN' },
  { label: '中药', value: 'CHINESE' },
];

const STATUS_OPTIONS = PRESCRIPTION_STATUS_LIST.map((s) => ({
  label: s.label,
  value: s.value,
}));

const prescriptionTypeTagMap: Record<string, { label: string; color: string }> = {
  WESTERN: { label: '西药', color: 'blue' },
  CHINESE: { label: '中药', color: 'green' },
};

const statusMap = Object.fromEntries(
  PRESCRIPTION_STATUS_LIST.map((s) => [s.value, { label: s.label, color: s.color }]),
);

const searchFields: SearchField[] = [
  { name: 'prescriptionNo', label: '处方号' },
  { name: 'patientName', label: '患者姓名' },
  { name: 'prescriptionType', label: '处方类型', type: 'select', options: PRESCRIPTION_TYPE_OPTIONS },
  { name: 'status', label: '状态', type: 'select', options: STATUS_OPTIONS },
];

const itemColumns: ColumnsType<PrescriptionItem> = [
  { title: '药品名称', dataIndex: 'drugName', key: 'drugName' },
  { title: '用法', dataIndex: 'usage', key: 'usage' },
  { title: '用量', dataIndex: 'dosage', key: 'dosage' },
  { title: '频次', dataIndex: 'frequency', key: 'frequency' },
  { title: '天数', dataIndex: 'days', key: 'days' },
];

export default function PrescriptionListPage() {
  const user = useAuthStore((s) => s.user);
  const [loading, setLoading] = useState(false);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [pagination, setPagination] = useState<PaginatedResult<Prescription> | null>(null);
  const [searchParams, setSearchParams] = useState<Record<string, string>>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<Prescription | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await prescriptionService.getList();
        if (cancelled) return;
        let filtered = res.items || [];
        if (searchParams.prescriptionNo) {
          filtered = filtered.filter((p) =>
            p.prescriptionNo.toLowerCase().includes(searchParams.prescriptionNo.toLowerCase()),
          );
        }
        if (searchParams.patientName) {
          filtered = filtered.filter((p) =>
            p.patientName.includes(searchParams.patientName),
          );
        }
        if (searchParams.prescriptionType) {
          filtered = filtered.filter((p) => p.prescriptionType === searchParams.prescriptionType);
        }
        if (searchParams.status) {
          filtered = filtered.filter((p) => p.status === searchParams.status);
        }
        setPrescriptions(filtered);
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

  const handleViewDetail = (record: Prescription) => {
    setCurrentRecord(record);
    setDrawerOpen(true);
  };

  const handleReview = (record: Prescription) => {
    Modal.confirm({
      title: '审核处方',
      content: `对处方 ${record.prescriptionNo} 进行审核操作`,
      okText: '审核通过',
      cancelText: '审核驳回',
      okButtonProps: { style: { background: '#52c41a', borderColor: '#52c41a' } },
      cancelButtonProps: { danger: true },
      onOk: async () => {
        try {
          await prescriptionService.review(record.id, { result: 'PASSED', opinion: '审核通过' });
          message.success(`处方 ${record.prescriptionNo} 审核通过`);
          setSearchParams((prev) => ({ ...prev }));
        } catch {
          message.error('审核操作失败');
        }
      },
      onCancel: async () => {
        try {
          await prescriptionService.review(record.id, { result: 'REJECTED', opinion: '审核驳回' });
          message.success(`处方 ${record.prescriptionNo} 已驳回`);
          setSearchParams((prev) => ({ ...prev }));
        } catch {
          message.error('审核操作失败');
        }
      },
    });
  };

  const totalCount = (prescriptions || []).length;
  const reviewingCount = (prescriptions || []).filter((p) => p.status === 'REVIEWING').length;
  const reviewPassedCount = (prescriptions || []).filter(
    (p) => p.status === 'REVIEW_PASSED' || p.status === 'DISPENSING' || p.status === 'DISPENSED' || p.status === 'DELIVERING' || p.status === 'COMPLETED',
  ).length;
  const reviewedTotal = (prescriptions || []).filter(
    (p) => ['REVIEW_PASSED', 'REVIEW_REJECTED', 'DISPENSING', 'DISPENSED', 'DELIVERING', 'COMPLETED'].includes(p.status),
  ).length;
  const reviewPassRate = reviewedTotal > 0 ? Math.round((reviewPassedCount / reviewedTotal) * 1000) / 10 : 0;
  const completedCount = (prescriptions || []).filter((p) => p.status === 'COMPLETED').length;

  const columns: ColumnsType<Prescription> = [
    {
      title: '处方号',
      dataIndex: 'prescriptionNo',
      key: 'prescriptionNo',
      width: 180,
    },
    {
      title: '患者姓名',
      dataIndex: 'patientName',
      key: 'patientName',
      width: 100,
    },
    {
      title: '医生',
      dataIndex: 'doctorName',
      key: 'doctorName',
      width: 100,
    },
    {
      title: '机构名称',
      dataIndex: 'orgName',
      key: 'orgName',
      width: 160,
      ellipsis: true,
    },
    {
      title: '处方类型',
      dataIndex: 'prescriptionType',
      key: 'prescriptionType',
      width: 100,
      render: (type: string) => {
        const info = prescriptionTypeTagMap[type];
        return info ? <Tag color={info.color}>{info.label}</Tag> : type;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const info = statusMap[status];
        return (
          <StatusTag
            status={status}
            customColor={info?.color}
            customLabel={info?.label}
          />
        );
      },
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
      width: user?.role === 'PHARMACIST' ? 200 : 180,
      render: (_: unknown, record: Prescription) => (
        <Space size="small">
          <a onClick={() => handleViewDetail(record)}>查看详情</a>
          {record.status === 'REVIEWING' && (user?.role === 'PHARMACIST' || user?.role === 'ADMIN') && (
            <Button
              type="link"
              size="small"
              onClick={() => handleReview(record)}
              style={{ color: '#52c41a', fontWeight: 600 }}
            >
              审核
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const isPharmacist = user?.role === 'PHARMACIST';

  return (
    <div>
      <PageHeader
        title={isPharmacist ? '处方审核' : '处方列表'}
        description={isPharmacist ? '待审核处方处理与处方流转追踪' : '处方流转全流程管理与追踪'}
      />

      {isPharmacist && reviewingCount > 0 && (
        <Card
          style={{ marginBottom: 16, background: '#fffbe6', borderColor: '#ffe58f' }}
          size="small"
        >
          <Space>
            <AuditOutlined style={{ color: '#faad14', fontSize: 18 }} />
            <span style={{ fontWeight: 500 }}>
              当前有 <span style={{ color: '#faad14', fontWeight: 700, fontSize: 16 }}>{reviewingCount}</span> 张处方待审核，请及时处理
            </span>
          </Space>
        </Card>
      )}

      <Card style={{ marginBottom: 16 }}>
        <SearchForm fields={searchFields} onSearch={handleSearch} onReset={handleReset} />
      </Card>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="总处方数"
              value={totalCount}
              prefix={<FileTextOutlined />}
              styles={{ content: { color: '#1677ff' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="审核中"
              value={reviewingCount}
              prefix={<AuditOutlined />}
              styles={{ content: { color: '#faad14' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="审核通过率"
              value={reviewPassRate}
              suffix="%"
              prefix={<SafetyCertificateOutlined />}
              styles={{ content: { color: '#52c41a' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="已完成数"
              value={completedCount}
              prefix={<CheckCircleOutlined />}
              styles={{ content: { color: '#52c41a' } }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <DataTable<Prescription>
          columns={columns}
          dataSource={prescriptions}
          rowKey="id"
          loading={loading}
          pagination={pagination}
        />
      </Card>

      <Drawer
        title="处方详情"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={640}
      >
        {currentRecord && (
          <>
            <Descriptions
              title="基本信息"
              bordered
              size="small"
              column={2}
              style={{ marginBottom: 24 }}
            >
              <Descriptions.Item label="处方号">{currentRecord.prescriptionNo}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <StatusTag
                  status={currentRecord.status}
                  customColor={statusMap[currentRecord.status]?.color}
                  customLabel={statusMap[currentRecord.status]?.label}
                />
              </Descriptions.Item>
              <Descriptions.Item label="患者姓名">{currentRecord.patientName}</Descriptions.Item>
              <Descriptions.Item label="患者ID">{currentRecord.patientId}</Descriptions.Item>
              <Descriptions.Item label="医生">{currentRecord.doctorName}</Descriptions.Item>
              <Descriptions.Item label="机构">{currentRecord.orgName}</Descriptions.Item>
              <Descriptions.Item label="处方类型">
                <Tag color={prescriptionTypeTagMap[currentRecord.prescriptionType]?.color}>
                  {prescriptionTypeTagMap[currentRecord.prescriptionType]?.label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">{formatDateTime(currentRecord.createdAt)}</Descriptions.Item>
            </Descriptions>

            <div style={{ marginBottom: 24 }}>
              <h4 style={{ marginBottom: 12 }}>处方药品</h4>
              <Table<PrescriptionItem>
                columns={itemColumns}
                dataSource={currentRecord.items}
                rowKey="drugId"
                pagination={false}
                size="small"
                bordered
              />
            </div>

            {currentRecord.reviewResult && (
              <Descriptions
                title="审核结果"
                bordered
                size="small"
                column={1}
                style={{ marginBottom: 24 }}
              >
                <Descriptions.Item label="审核类型">
                  {currentRecord.reviewResult.reviewType === 'SYSTEM' ? '系统审核' : '人工审核'}
                </Descriptions.Item>
                <Descriptions.Item label="审核结果">
                  <Tag color={currentRecord.reviewResult.result === 'PASSED' ? 'green' : 'red'}>
                    {currentRecord.reviewResult.result === 'PASSED' ? '通过' : '驳回'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="审核意见">
                  {currentRecord.reviewResult.opinion}
                </Descriptions.Item>
                {currentRecord.reviewResult.rejectedRules && currentRecord.reviewResult.rejectedRules.length > 0 && (
                  <Descriptions.Item label="拦截规则">
                    {currentRecord.reviewResult.rejectedRules.map((rule) => (
                      <Tag key={rule} color="orange">{rule}</Tag>
                    ))}
                  </Descriptions.Item>
                )}
              </Descriptions>
            )}

            <div>
              <h4 style={{ marginBottom: 12 }}>流转记录</h4>
              {currentRecord.flowRecords.length > 0 ? (
                <Timeline
                  items={currentRecord.flowRecords.map((record, idx) => ({
                    key: idx,
                    color: record.status === '已完成' ? 'green' : 'blue',
                    children: (
                      <div>
                        <div style={{ fontWeight: 500 }}>
                          {record.node}
                          <Tag
                            color={record.status === '已完成' ? 'green' : 'processing'}
                            style={{ marginLeft: 8 }}
                          >
                            {record.status}
                          </Tag>
                        </div>
                        <div style={{ color: '#666', fontSize: 13 }}>操作人：{record.operator}</div>
                        <div style={{ color: '#999', fontSize: 12 }}>{formatDateTime(record.timestamp)}</div>
                      </div>
                    ),
                  }))}
                />
              ) : (
                <span style={{ color: '#999' }}>暂无流转记录</span>
              )}
            </div>
          </>
        )}
      </Drawer>
    </div>
  );
}
