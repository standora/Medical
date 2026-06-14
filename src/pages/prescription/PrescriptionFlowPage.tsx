import { useState } from 'react';
import { Card, Input, Button, Steps, Descriptions, Tag, Empty, Space, Spin } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import PageHeader from '../../components/common/PageHeader';
import StatusTag from '../../components/common/StatusTag';
import { prescriptionService } from '../../services/prescription.service';
import type { Prescription } from '../../types/prescription.types';
import { PRESCRIPTION_STATUS_LIST } from '../../constants/prescription-status';
import { formatDateTime } from '../../utils/date';

const statusMap = Object.fromEntries(
  PRESCRIPTION_STATUS_LIST.map((s) => [s.value, { label: s.label, color: s.color }]),
);

const prescriptionTypeTagMap: Record<string, { label: string; color: string }> = {
  WESTERN: { label: '西药', color: 'blue' },
  CHINESE: { label: '中药', color: 'green' },
};

export default function PrescriptionFlowPage() {
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    const trimmed = searchValue.trim();
    if (!trimmed) return;

    setLoading(true);
    setSearched(true);
    try {
      const res = await prescriptionService.getList();
      const found = res.items.find((p) =>
        p.prescriptionNo.toLowerCase() === trimmed.toLowerCase(),
      );
      setPrescription(found ?? null);
    } catch {
      setPrescription(null);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentStep = () => {
    if (!prescription) return 0;
    const currentIdx = prescription.flowRecords.findIndex(
      (r) => r.status === '处理中',
    );
    if (currentIdx >= 0) return currentIdx;
    return prescription.flowRecords.length;
  };

  return (
    <div>
      <PageHeader title="处方流转追踪" description="查询处方流转全过程，实时追踪各节点状态" />

      <Card style={{ marginBottom: 16 }}>
        <Space.Compact style={{ width: '100%', maxWidth: 500 }}>
          <Input
            placeholder="请输入处方号"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onPressEnter={handleSearch}
            allowClear
          />
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch} loading={loading}>
            查询
          </Button>
        </Space.Compact>
      </Card>

      {loading && (
        <Card style={{ textAlign: 'center', padding: 60 }}>
          <Spin size="large" tip="查询中..." />
        </Card>
      )}

      {!loading && searched && !prescription && (
        <Card>
          <Empty description="未找到该处方，请确认处方号是否正确" />
        </Card>
      )}

      {!loading && !searched && (
        <Card>
          <Empty description="请输入处方号查询流转信息" />
        </Card>
      )}

      {!loading && prescription && (
        <>
          <Card style={{ marginBottom: 16 }}>
            <Descriptions title="处方基本信息" bordered size="small" column={2}>
              <Descriptions.Item label="处方号">{prescription.prescriptionNo}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <StatusTag
                  status={prescription.status}
                  customColor={statusMap[prescription.status]?.color}
                  customLabel={statusMap[prescription.status]?.label}
                />
              </Descriptions.Item>
              <Descriptions.Item label="患者姓名">{prescription.patientName}</Descriptions.Item>
              <Descriptions.Item label="患者ID">{prescription.patientId}</Descriptions.Item>
              <Descriptions.Item label="医生">{prescription.doctorName}</Descriptions.Item>
              <Descriptions.Item label="机构">{prescription.orgName}</Descriptions.Item>
              <Descriptions.Item label="处方类型">
                <Tag color={prescriptionTypeTagMap[prescription.prescriptionType]?.color}>
                  {prescriptionTypeTagMap[prescription.prescriptionType]?.label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">{formatDateTime(prescription.createdAt)}</Descriptions.Item>
            </Descriptions>
          </Card>

          <Card>
            <h4 style={{ marginBottom: 24 }}>流转过程</h4>
            {prescription.flowRecords.length > 0 ? (
              <Steps
                current={getCurrentStep()}
                orientation="vertical"
                items={prescription.flowRecords.map((record, idx) => ({
                  key: idx,
                  title: record.node,
                  description: (
                    <div>
                      <div>
                        <span style={{ color: '#666' }}>操作人：</span>
                        {record.operator}
                      </div>
                      <div>
                        <span style={{ color: '#666' }}>时间：</span>
                        {formatDateTime(record.timestamp)}
                      </div>
                      <div style={{ marginTop: 4 }}>
                        <Tag color={record.status === '已完成' ? 'green' : 'processing'}>
                          {record.status}
                        </Tag>
                      </div>
                    </div>
                  ),
                  status: record.status === '已完成'
                    ? 'finish'
                    : record.status === '处理中'
                      ? 'process'
                      : 'wait',
                }))}
              />
            ) : (
              <Empty description="暂无流转记录" />
            )}
          </Card>
        </>
      )}
    </div>
  );
}
