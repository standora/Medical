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

const FORM_ITEM_STYLE: React.CSSProperties = {
  marginBottom: 0,
  width: '100%',
};

const LABEL_STYLE: React.CSSProperties = {
  minWidth: 64,
  whiteSpace: 'nowrap',
  color: '#4B5563',
  fontSize: 14,
};

function SearchFormItem({ field }: { field: SearchField }) {
  const inputNode = field.type === 'select' ? (
    <Select
      placeholder={field.placeholder || `请选择${field.label}`}
      allowClear
      options={field.options}
      style={{ width: '100%', minWidth: 140 }}
    />
  ) : (
    <Input
      placeholder={field.placeholder || `请输入${field.label}`}
      allowClear
      style={{ width: '100%', minWidth: 140 }}
    />
  );

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
      <span style={LABEL_STYLE}>{field.label}</span>
      <div style={{ flex: 1 }}>{inputNode}</div>
    </div>
  );
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
    <Form form={form} component={false}>
      <Row gutter={[16, 12]} align="middle">
        {fields.map((field) => (
          <Col key={field.name} xs={24} sm={12} md={8} lg={6}>
            <Form.Item name={field.name} style={FORM_ITEM_STYLE}>
              <SearchFormItem field={field} />
            </Form.Item>
          </Col>
        ))}
        <Col xs={24} sm={12} md={8} lg={6}>
          <Form.Item style={FORM_ITEM_STYLE}>
            <Space>
              <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                搜索
              </Button>
              <Button icon={<ReloadOutlined />} onClick={handleReset}>
                重置
              </Button>
              {extra}
            </Space>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
}
