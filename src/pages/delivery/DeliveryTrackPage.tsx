import { useState } from 'react';
import { Card, Timeline, Tag, Descriptions, Empty, Row, Col } from 'antd';
import { EnvironmentOutlined, CarOutlined } from '@ant-design/icons';
import PageHeader from '../../components/common/PageHeader';
import SearchForm from '../../components/common/SearchForm';
import type { SearchField } from '../../components/common/SearchForm';
import StatusTag from '../../components/common/StatusTag';
import { deliveryService } from '../../services/delivery.service';
import type { DeliveryOrder, DeliveryTrack } from '../../types/delivery.types';
import { formatDateTime } from '../../utils/date';

const searchFields: SearchField[] = [
  { name: 'orderNo', label: '配送单号' },
];

const deliveryTypeLabelMap: Record<string, string> = {
  TO_HOSPITAL: '医院配送',
  TO_VILLAGE: '村卫生室配送',
  TO_HOME: '到家配送',
};

const deliveryTypeTagColorMap: Record<string, string> = {
  TO_HOSPITAL: 'blue',
  TO_VILLAGE: 'green',
  TO_HOME: 'orange',
};

const statusColorMap: Record<string, string> = {
  CREATED: 'default',
  PICKED_UP: 'processing',
  IN_TRANSIT: 'blue',
  DELIVERED: 'green',
  EXCEPTION: 'red',
  CANCELLED: 'default',
};

const statusLabelMap: Record<string, string> = {
  CREATED: '已创建',
  PICKED_UP: '已取件',
  IN_TRANSIT: '运输中',
  DELIVERED: '已送达',
  EXCEPTION: '异常',
  CANCELLED: '已取消',
};

export default function DeliveryTrackPage() {
  const [loading, setLoading] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<DeliveryOrder | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (values: Record<string, string>) => {
    if (!values.orderNo) {
      setCurrentOrder(null);
      setSearched(false);
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const res = await deliveryService.getOrders();
      const found = res.items.find(
        (o) => o.orderNo.toLowerCase() === values.orderNo.toLowerCase(),
      );
      setCurrentOrder(found || null);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCurrentOrder(null);
    setSearched(false);
  };

  return (
    <div>
      <PageHeader title="物流追踪" description="配送单物流轨迹实时查询" />

      <Card style={{ marginBottom: 16 }}>
        <SearchForm fields={searchFields} onSearch={handleSearch} onReset={handleReset} />
      </Card>

      {!searched && (
        <Card>
          <Empty
            description="请输入配送单号查询物流轨迹"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      )}

      {searched && !currentOrder && !loading && (
        <Card>
          <Empty description="未找到该配送单" />
        </Card>
      )}

      {currentOrder && (
        <>
          <Card style={{ marginBottom: 16 }}>
            <Descriptions
              title="配送单信息"
              bordered
              column={{ xs: 1, sm: 2, md: 3 }}
            >
              <Descriptions.Item label="配送单号">{currentOrder.orderNo}</Descriptions.Item>
              <Descriptions.Item label="配送类型">
                <Tag color={deliveryTypeTagColorMap[currentOrder.deliveryType]}>
                  {deliveryTypeLabelMap[currentOrder.deliveryType]}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <StatusTag
                  status={currentOrder.status}
                  customColor={statusColorMap[currentOrder.status]}
                  customLabel={statusLabelMap[currentOrder.status]}
                />
              </Descriptions.Item>
              <Descriptions.Item label="起始机构">
                <EnvironmentOutlined style={{ marginRight: 4 }} />
                {currentOrder.fromOrgName}
              </Descriptions.Item>
              <Descriptions.Item label="目的机构">
                <EnvironmentOutlined style={{ marginRight: 4 }} />
                {currentOrder.toOrgName}
              </Descriptions.Item>
              <Descriptions.Item label="物流商">
                <CarOutlined style={{ marginRight: 4 }} />
                {currentOrder.logisticsProvider}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="物流轨迹">
            {currentOrder.tracks && currentOrder.tracks.length > 0 ? (
              <Row justify="center">
                <Col xs={24} sm={20} md={16} lg={12}>
                  <Timeline
                    mode="left"
                    items={currentOrder.tracks.map((track: DeliveryTrack, idx: number) => ({
                      key: idx,
                      color: track.isException ? 'red' : 'blue',
                      label: formatDateTime(track.timestamp),
                      children: (
                        <div>
                          <div style={{ fontWeight: 500, fontSize: 14 }}>
                            {track.status}
                            {track.isException && (
                              <Tag color="red" style={{ marginLeft: 8 }}>异常</Tag>
                            )}
                          </div>
                          <div style={{ color: '#666', marginTop: 4 }}>
                            <EnvironmentOutlined style={{ marginRight: 4 }} />
                            {track.location}
                          </div>
                        </div>
                      ),
                    }))}
                  />
                </Col>
              </Row>
            ) : (
              <Empty description="暂无物流轨迹信息" />
            )}
          </Card>
        </>
      )}
    </div>
  );
}
