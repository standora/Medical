import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Form,
  Input,
  InputNumber,
  Radio,
  Select,
  Button,
  Space,
  Row,
  Col,
  Divider,
  message,
} from 'antd';
import { PlusOutlined, DeleteOutlined, SaveOutlined, SendOutlined } from '@ant-design/icons';
import PageHeader from '../../components/common/PageHeader';
import OrgTreeSelect from '../../components/common/OrgTreeSelect';
import DrugSelect from '../../components/business/DrugSelect';
import { useAuthStore } from '../../stores/auth-store';
import { prescriptionService } from '../../services/prescription.service';

const FREQUENCY_OPTIONS = [
  { label: 'qd（一日一次）', value: 'qd' },
  { label: 'bid（一日两次）', value: 'bid' },
  { label: 'tid（一日三次）', value: 'tid' },
  { label: 'qid（一日四次）', value: 'qid' },
];

interface PrescriptionFormValues {
  orgId: string;
  doctorName: string;
  patientName: string;
  patientId: string;
  prescriptionType: 'WESTERN' | 'CHINESE';
  items: {
    drugId?: string;
    drugName?: string;
    usage?: string;
    dosage?: string;
    frequency?: string;
    days?: number;
  }[];
}

export default function PrescriptionCreatePage() {
  const navigate = useNavigate();
  const [form] = Form.useForm<PrescriptionFormValues>();
  const [submitting, setSubmitting] = useState(false);
  const user = useAuthStore((s) => s.user);
  const isVillageDoctor = user?.role === 'VILLAGE_DOCTOR';

  const handleSaveDraft = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      await prescriptionService.create({
        ...values,
        items: values.items.map((item) => ({
          drugId: item.drugId || '',
          drugName: item.drugName || '',
          usage: item.usage || '',
          dosage: item.dosage || '',
          frequency: item.frequency || '',
          days: item.days || 1,
        })),
        status: 'DRAFT',
        prescriptionNo: 'RX-' + Date.now(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      message.success('处方草稿已保存');
      navigate('/prescription/list');
    } catch (err: any) {
      if (err?.errorFields) {
        message.warning('请完善处方信息');
      } else {
        message.error('保存失败');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      await prescriptionService.create({
        ...values,
        items: values.items.map((item) => ({
          drugId: item.drugId || '',
          drugName: item.drugName || '',
          usage: item.usage || '',
          dosage: item.dosage || '',
          frequency: item.frequency || '',
          days: item.days || 1,
        })),
        status: 'SUBMITTED',
        prescriptionNo: 'RX-' + Date.now(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      message.success('处方已提交审核');
      navigate('/prescription/list');
    } catch (err: any) {
      if (err?.errorFields) {
        message.warning('请完善处方信息');
      } else {
        message.error('提交失败');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="开具处方"
        description={isVillageDoctor ? '专注诊疗开方，药品调配由上级医院药房统一处理' : '填写处方信息并提交审核'}
        extra={
          <Space>
            <Button
              icon={<SaveOutlined />}
              onClick={handleSaveDraft}
              loading={submitting}
            >
              保存草稿
            </Button>
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSubmit}
              loading={submitting}
            >
              提交审核
            </Button>
          </Space>
        }
      />

      {isVillageDoctor && (
        <Card style={{ marginBottom: 16, background: '#e6f7ff', borderColor: '#91d5ff' }} size="small">
          <Space>
            <SendOutlined style={{ color: '#1677ff', fontSize: 18 }} />
            <span style={{ fontWeight: 500 }}>
              零库存托管模式：您只需开具处方，药品将由托管医院药房统一调配配送，无需管理库存
            </span>
          </Space>
        </Card>
      )}

      <Card>
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            prescriptionType: 'WESTERN',
            items: [{}],
          }}
        >
          <Divider {...{ orientation: 'left' as any }}>基本信息</Divider>
          <Row gutter={24}>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="orgId"
                label="机构"
                rules={[{ required: true, message: '请选择机构' }]}
              >
                <OrgTreeSelect placeholder="请选择开方机构" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="doctorName"
                label="医生姓名"
                rules={[{ required: true, message: '请输入医生姓名' }]}
              >
                <Input placeholder="请输入医生姓名" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="patientName"
                label="患者姓名"
                rules={[{ required: true, message: '请输入患者姓名' }]}
              >
                <Input placeholder="请输入患者姓名" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="patientId"
                label="患者ID"
                rules={[{ required: true, message: '请输入患者ID' }]}
              >
                <Input placeholder="请输入患者ID" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="prescriptionType"
                label="处方类型"
                rules={[{ required: true, message: '请选择处方类型' }]}
              >
                <Radio.Group>
                  <Radio value="WESTERN">西药</Radio>
                  <Radio value="CHINESE">中药</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
          </Row>

          <Divider {...{ orientation: 'left' as any }}>药品列表</Divider>
          <Form.List name="items">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Card
                    key={key}
                    size="small"
                    style={{ marginBottom: 16 }}
                    extra={
                      fields.length > 1 && (
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => remove(name)}
                        >
                          删除
                        </Button>
                      )
                    }
                  >
                    <Row gutter={24}>
                      <Col xs={24} sm={12} md={8}>
                        <Form.Item
                          {...restField}
                          name={[name, 'drugId']}
                          label="药品"
                          rules={[{ required: true, message: '请选择药品' }]}
                        >
                          <DrugSelect placeholder="请搜索选择药品" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12} md={8}>
                        <Form.Item
                          {...restField}
                          name={[name, 'usage']}
                          label="用法"
                          rules={[{ required: true, message: '请输入用法' }]}
                        >
                          <Input placeholder="如：口服" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12} md={8}>
                        <Form.Item
                          {...restField}
                          name={[name, 'dosage']}
                          label="用量"
                          rules={[{ required: true, message: '请输入用量' }]}
                        >
                          <Input placeholder="如：1片/次" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12} md={8}>
                        <Form.Item
                          {...restField}
                          name={[name, 'frequency']}
                          label="频次"
                          rules={[{ required: true, message: '请选择频次' }]}
                        >
                          <Select placeholder="请选择频次" options={FREQUENCY_OPTIONS} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12} md={8}>
                        <Form.Item
                          {...restField}
                          name={[name, 'days']}
                          label="天数"
                          rules={[{ required: true, message: '请输入天数' }]}
                        >
                          <InputNumber
                            placeholder="请输入天数"
                            min={1}
                            max={90}
                            style={{ width: '100%' }}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                ))}
                <Button
                  type="dashed"
                  onClick={() => add()}
                  icon={<PlusOutlined />}
                  style={{ width: '100%' }}
                >
                  添加药品
                </Button>
              </>
            )}
          </Form.List>
        </Form>
      </Card>
    </div>
  );
}
