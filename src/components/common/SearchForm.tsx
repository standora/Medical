import { Form, Input, Select, Button, Row, Col, Space } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ReactNode } from 'react';

export interface SearchField {
  name: string;
  label: string;
  type?: 'input' | 'select';
  placeholder?: string;
  options?: { label: string; value: string }[];
}

interface SearchFormProps {
  fields: SearchField[];
  onSearch: (values: Record<string, string>) => void;
  onReset?: () => void;
  extra?: ReactNode;
}

export default function SearchForm({ fields, onSearch, onReset, extra }: SearchFormProps) {
  const [form] = Form.useForm();

  const handleSearch = () => {
    const values = form.getFieldsValue();
    onSearch(values);
  };

  const handleReset = () => {
    form.resetFields();
    onReset?.();
  };

  return (
    <Form form={form} layout="inline">
      <Row gutter={[16, 16]} style={{ width: '100%' }}>
        {fields.map((field) => (
          <Col key={field.name} xs={24} sm={12} md={8} lg={6}>
            <Form.Item name={field.name} label={field.label} style={{ marginBottom: 0 }}>
              {field.type === 'select' ? (
                <Select
                  placeholder={field.placeholder || `请选择${field.label}`}
                  allowClear
                  options={field.options}
                  style={{ width: '100%' }}
                />
              ) : (
                <Input placeholder={field.placeholder || `请输入${field.label}`} allowClear />
              )}
            </Form.Item>
          </Col>
        ))}
        <Col xs={24} sm={12} md={8} lg={6}>
          <Space>
            <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
              搜索
            </Button>
            <Button icon={<ReloadOutlined />} onClick={handleReset}>
              重置
            </Button>
            {extra}
          </Space>
        </Col>
      </Row>
    </Form>
  );
}
