import { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Statistic, Switch, Button, Modal, Form, Select, message, Steps, Descriptions, Tag, Table, Space, Typography } from 'antd';
import {
  BankOutlined,
  SafetyCertificateOutlined,
  PartitionOutlined,
  PlusOutlined,
  PlayCircleOutlined,
  FileTextOutlined,
  MedicineBoxOutlined,
  CarOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';

const { Text } = Typography;
import type { ColumnsType } from 'antd/es/table';
import type { ZeroInventoryConfig } from '../../types/inventory.types';
import { useInventoryStore } from '../../stores/inventory.store';
import { inventoryService } from '../../services/inventory.service';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import StatusTag from '../../components/common/StatusTag';
import OrgTreeSelect from '../../components/common/OrgTreeSelect';
import { formatDateTime } from '../../utils/date';
import type { Prescription, PrescriptionItem } from '../../types/prescription.types';
import { prescriptionService } from '../../services/prescription.service';
import { orgs } from '../../mock/data/orgs';
import { useAuthStore } from '../../stores/auth-store';

export default function ZeroInventoryPage() {
  const { zeroInventoryConfigs, loading, setZeroInventoryConfigs, setLoading } = useInventoryStore();
  const user = useAuthStore((s) => s.user);
  const isVillageDoctor = user?.role === 'VILLAGE_DOCTOR';
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [flowVisible, setFlowVisible] = useState(false);
  const [flowStep, setFlowStep] = useState(0);
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [loadingFlow, setLoadingFlow] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await inventoryService.getZeroInventoryConfigs();
      setZeroInventoryConfigs(res as unknown as ZeroInventoryConfig[]);
    } catch {
      message.error('获取零库存托管数据失败');
    } finally {
      setLoading(false);
    }
  }, [setZeroInventoryConfigs, setLoading]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalVillages = (zeroInventoryConfigs || []).length;
  const fullHostCount = (zeroInventoryConfigs || []).filter((c) => c.hostMode === 'FULL_HOST').length;
  const partialHostCount = (zeroInventoryConfigs || []).filter((c) => c.hostMode === 'PARTIAL_HOST').length;

  const handleToggleEnabled = async (record: ZeroInventoryConfig) => {
    try {
      await inventoryService.updateZeroInventoryConfig(record.id, { enabled: !record.enabled });
      setZeroInventoryConfigs(
        zeroInventoryConfigs.map((c) =>
          c.id === record.id ? { ...c, enabled: !c.enabled } : c,
        ),
      );
      message.success(record.enabled ? '已停用托管' : '已启用托管');
    } catch {
      message.error('操作失败');
    }
  };

  const handleAddConfig = async () => {
    try {
      const values = await form.validateFields();
      setConfirmLoading(true);
      const villageOrg = orgs.find(o => o.id === values.villageOrgId);
      const hostOrg = orgs.find(o => o.id === values.hostOrgId);
      const newConfig: ZeroInventoryConfig = {
        id: `zic-${Date.now()}`,
        villageOrgId: values.villageOrgId,
        villageOrgName: villageOrg?.name ?? values.villageOrgId,
        hostOrgId: values.hostOrgId,
        hostOrgName: hostOrg?.name ?? values.hostOrgId,
        hostMode: values.hostMode,
        enabled: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await inventoryService.createZeroInventoryConfig(newConfig);
      setZeroInventoryConfigs([...zeroInventoryConfigs, newConfig]);
      message.success('新增托管配置成功');
      setModalOpen(false);
      form.resetFields();
    } catch {
      // form validation failed or API error
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleDemoFlow = async () => {
    setFlowVisible(true);
    setFlowStep(0);
    setLoadingFlow(true);
    try {
      // Step 1: 加载一个mock处方数据
      const res = await prescriptionService.getList();
      const prescriptions = res.items || [];
      const demoPrescription = prescriptions.find((p) => p.status === 'SUBMITTED' || p.status === 'REVIEWING') || prescriptions[0];
      setPrescription(demoPrescription || null);
      setFlowStep(1);
      // Step 2 & 3 & 4 will be triggered by user clicking "下一步"
    } catch {
      message.error('加载演示数据失败');
    } finally {
      setLoadingFlow(false);
    }
  };

  const handleFlowNext = () => {
    if (flowStep < 3) {
      setFlowStep(flowStep + 1);
    }
  };

  const handleFlowPrev = () => {
    if (flowStep > 0) {
      setFlowStep(flowStep - 1);
    }
  };

  const handleFlowClose = () => {
    setFlowVisible(false);
    setFlowStep(0);
    setPrescription(null);
  };

  const flowSteps = [
    {
      title: '村医开方',
      icon: <FileTextOutlined />,
      description: '村医为患者开具处方，无需管理药品库存',
    },
    {
      title: '药房调配',
      icon: <MedicineBoxOutlined />,
      description: '托管医院药房接收处方，完成药品调配',
    },
    {
      title: '配送中',
      icon: <CarOutlined />,
      description: '药品通过冷链配送至村卫生室',
    },
    {
      title: '村医签收',
      icon: <CheckCircleOutlined />,
      description: '村医确认签收，患者取药完成',
    },
  ];

  const drugColumns: ColumnsType<PrescriptionItem> = [
    { title: '药品名称', dataIndex: 'drugName', key: 'drugName' },
    { title: '用法', dataIndex: 'usage', key: 'usage' },
    { title: '用量', dataIndex: 'dosage', key: 'dosage' },
    { title: '频次', dataIndex: 'frequency', key: 'frequency' },
    { title: '天数', dataIndex: 'days', key: 'days' },
  ];

  const columns: ColumnsType<ZeroInventoryConfig> = [
    {
      title: '村卫生室名称',
      dataIndex: 'villageOrgName',
      key: 'villageOrgName',
      width: 180,
      ellipsis: true,
    },
    {
      title: '托管医院',
      dataIndex: 'hostOrgName',
      key: 'hostOrgName',
      width: 180,
      ellipsis: true,
    },
    {
      title: '托管模式',
      dataIndex: 'hostMode',
      key: 'hostMode',
      width: 120,
      render: (val: string) => <StatusTag status={val} />,
    },
    {
      title: '是否启用',
      dataIndex: 'enabled',
      key: 'enabled',
      width: 100,
      align: 'center',
      render: (val: boolean, record: ZeroInventoryConfig) => (
        <Switch
          checked={val}
          onChange={() => handleToggleEnabled(record)}
          checkedChildren="启用"
          unCheckedChildren="停用"
        />
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 170,
      render: (val: string) => formatDateTime(val),
    },
  ];

  return (
    <div>
      <PageHeader
        title="零库存托管"
        description={isVillageDoctor ? '零库存托管——无需备货，专注诊疗，药品由上级医院统一托管配送' : '零库存托管模式——村卫生室无需备货，由上级医院统一托管配送'}
        extra={
          <Button type="primary" icon={<PlayCircleOutlined />} onClick={handleDemoFlow}>
            演示全流程
          </Button>
        }
      />

      {isVillageDoctor && (
        <Card style={{ marginBottom: 16, background: '#e6f7ff', borderColor: '#91d5ff' }} size="small">
          <Space>
            <BankOutlined style={{ color: '#1677ff', fontSize: 18 }} />
            <span style={{ fontWeight: 500 }}>
              您所在村卫生室享受零库存托管服务，无需自行备货管理，药品由托管医院统一保障
            </span>
          </Space>
        </Card>
      )}

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={8}>
          <Card>
            <Statistic
              title="托管村卫生室数"
              value={totalVillages}
              prefix={<BankOutlined />}
              styles={{ content: { color: '#1677ff' } }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card>
            <Statistic
              title="全托管数"
              value={fullHostCount}
              prefix={<SafetyCertificateOutlined />}
              styles={{ content: { color: '#1677ff' } }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card>
            <Statistic
              title="部分托管数"
              value={partialHostCount}
              prefix={<PartitionOutlined />}
              styles={{ content: { color: '#13c2c2' } }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        extra={
          !isVillageDoctor && (
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
              新增托管配置
            </Button>
          )
        }
      >
        <DataTable<ZeroInventoryConfig>
          rowKey="id"
          columns={columns}
          dataSource={zeroInventoryConfigs}
          loading={loading}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* 演示全流程 Modal */}
      <Modal
        title="零库存托管全流程演示"
        open={flowVisible}
        onCancel={handleFlowClose}
        width={720}
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button onClick={handleFlowClose}>关闭</Button>
            <Space>
              {flowStep > 0 && <Button onClick={handleFlowPrev}>上一步</Button>}
              {flowStep < 3 && (
                <Button type="primary" onClick={handleFlowNext} loading={loadingFlow}>
                  下一步
                </Button>
              )}
            </Space>
          </div>
        }
      >
        <Steps
          current={flowStep}
          items={flowSteps.map((s) => ({
            title: s.title,
            icon: s.icon,
            description: s.description,
          }))}
          style={{ marginBottom: 24 }}
        />

        {/* Step 1: 村医开方 */}
        {flowStep === 0 && (
          <div>
            <div style={{ marginBottom: 16, padding: 16, background: '#f6f8fa', borderRadius: 8 }}>
              <Descriptions title="演示说明" column={1} size="small">
                <Descriptions.Item>
                  村医只需专注诊疗开方，药品管理由托管医院全权负责。点击"下一步"查看处方信息。
                </Descriptions.Item>
              </Descriptions>
            </div>
          </div>
        )}

        {/* Step 1: 处方信息 */}
        {flowStep === 1 && prescription && (
          <div>
            <div style={{ marginBottom: 16, padding: 16, background: '#e6f7ff', borderRadius: 8 }}>
              <Descriptions title="处方信息" column={2} size="small" bordered>
                <Descriptions.Item label="处方号">{prescription.prescriptionNo}</Descriptions.Item>
                <Descriptions.Item label="状态">
                  <StatusTag status={prescription.status} />
                </Descriptions.Item>
                <Descriptions.Item label="患者姓名">{prescription.patientName}</Descriptions.Item>
                <Descriptions.Item label="医生姓名">{prescription.doctorName}</Descriptions.Item>
                <Descriptions.Item label="机构">{prescription.orgName}</Descriptions.Item>
                <Descriptions.Item label="处方类型">
                  <Tag color={prescription.prescriptionType === 'WESTERN' ? 'blue' : 'green'}>
                    {prescription.prescriptionType === 'WESTERN' ? '西药' : '中药'}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            </div>

            <div style={{ marginBottom: 16 }}>
              <h4 style={{ marginBottom: 8 }}>处方药品</h4>
              <Table<PrescriptionItem>
                columns={drugColumns}
                dataSource={prescription.items}
                rowKey="drugId"
                pagination={false}
                size="small"
                bordered
              />
            </div>

            <div style={{ padding: 12, background: '#fffbe6', borderRadius: 8, border: '1px solid #ffe58f' }}>
              <Text type="warning">
                <strong>零库存模式：</strong>村医只开方，不碰药——处方自动发送至托管医院药房进行调配
              </Text>
            </div>
          </div>
        )}

        {/* Step 2: 药房调配 */}
        {flowStep === 2 && (
          <div>
            <div style={{ marginBottom: 16, padding: 16, background: '#f6ffed', borderRadius: 8 }}>
              <Descriptions title="药房调配信息" column={2} size="small" bordered>
                <Descriptions.Item label="托管医院">中心卫生院药房</Descriptions.Item>
                <Descriptions.Item label="调剂药师">张药师</Descriptions.Item>
                <Descriptions.Item label="调配状态">
                  <Tag color="processing">调配中</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="预计完成">
                  {formatDateTime(new Date(Date.now() + 30 * 60000).toISOString())}
                </Descriptions.Item>
              </Descriptions>
              <div style={{ marginTop: 12 }}>
                <Text type="success">
                  <strong>零库存托管机制：</strong>上级医院药房根据处方从库存中调配药品，无需村级备货。
                </Text>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: 配送中 */}
        {flowStep === 3 && (
          <div>
            <div style={{ marginBottom: 16, padding: 16, background: '#e6f7ff', borderRadius: 8 }}>
              <Descriptions title="配送信息" column={2} size="small" bordered>
                <Descriptions.Item label="配送公司">顺丰医药</Descriptions.Item>
                <Descriptions.Item label="配送单号">DLV-2025-0142</Descriptions.Item>
                <Descriptions.Item label="配送状态">
                  <Tag color="processing">配送中</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="预计送达">
                  {formatDateTime(new Date(Date.now() + 2 * 3600000).toISOString())}
                </Descriptions.Item>
                <Descriptions.Item label="当前温度">4.5°C</Descriptions.Item>
                <Descriptions.Item label="冷链状态">
                  <Tag color="success">正常</Tag>
                </Descriptions.Item>
              </Descriptions>
              <div style={{ marginTop: 12, padding: 12, background: '#f6f8fa', borderRadius: 8 }}>
                <Text type="secondary">
                  <strong>冷链保障：</strong>全程温度监控，确保药品在2-8°C环境下安全配送至村卫生室。
                </Text>
              </div>
            </div>

            <div style={{ padding: 12, background: '#f6ffed', borderRadius: 8, border: '1px solid #b7eb8f', textAlign: 'center' }}>
              <CheckCircleOutlined style={{ fontSize: 32, color: '#52c41a', marginBottom: 8 }} />
              <div>
                <Text strong style={{ fontSize: 15 }}>
                  村医只需签收，患者即可取药
                </Text>
              </div>
              <Text type="secondary">关闭演示窗口查看完整流程总结</Text>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title="新增托管配置"
        open={modalOpen}
        onOk={handleAddConfig}
        onCancel={() => {
          setModalOpen(false);
          form.resetFields();
        }}
        confirmLoading={confirmLoading}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="villageOrgId"
            label="村卫生室"
            rules={[{ required: true, message: '请选择村卫生室' }]}
          >
            <OrgTreeSelect placeholder="请选择村卫生室" />
          </Form.Item>
          <Form.Item
            name="hostOrgId"
            label="托管医院"
            rules={[{ required: true, message: '请选择托管医院' }]}
          >
            <OrgTreeSelect placeholder="请选择托管医院" />
          </Form.Item>
          <Form.Item
            name="hostMode"
            label="托管模式"
            rules={[{ required: true, message: '请选择托管模式' }]}
          >
            <Select
              placeholder="请选择托管模式"
              options={[
                { label: '全托管', value: 'FULL_HOST' },
                { label: '部分托管', value: 'PARTIAL_HOST' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
