import type { DeliveryOrder, ColdChainData } from '../../types/delivery.types';
import { countyOrgList, townOrgList, villageOrgList } from './orgs';
import { drugs } from './drugs';
import { nextId, randomDate, randomInt, randomItem, randomItems, randomFloat } from '../utils';
import dayjs from 'dayjs';

const activeDrugs = drugs.filter(d => d.status === 'ACTIVE');

const deliveryTypes: DeliveryOrder['deliveryType'][] = ['TO_HOSPITAL', 'TO_VILLAGE', 'TO_HOME'];
const deliveryStatuses: DeliveryOrder['status'][] = ['CREATED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'EXCEPTION', 'CANCELLED'];
const logisticsProviders = ['顺丰医药', '京东物流', '国药物流', '九州通物流', '华东医药物流'];

const locations = ['县人民医院仓库', '城关镇中转站', '太平镇配送点', '白鹤镇配送点', '石桥镇配送点', '龙亭镇配送点'];

export const deliveryOrders: DeliveryOrder[] = Array.from({ length: 35 }, (_, i) => {
  const deliveryType = deliveryTypes[i % deliveryTypes.length];
  let fromOrg, toOrg;
  if (deliveryType === 'TO_HOSPITAL') {
    fromOrg = randomItem(countyOrgList);
    toOrg = randomItem(townOrgList);
  } else if (deliveryType === 'TO_VILLAGE') {
    fromOrg = randomItem(townOrgList);
    toOrg = randomItem(villageOrgList);
  } else {
    fromOrg = randomItem(townOrgList);
    toOrg = randomItem(villageOrgList);
  }

  const selectedDrugs = randomItems(activeDrugs, randomInt(1, 5));
  const items = selectedDrugs.map(d => ({
    drugId: d.id,
    drugName: d.tradeName,
    quantity: randomInt(10, 100),
    batchNo: `BN${randomInt(2025001, 2025999)}`,
  }));

  const status = deliveryStatuses[i % deliveryStatuses.length];
  const baseDate = randomDate('2025-04-01', '2025-06-14');

  const tracks = Array.from({ length: randomInt(2, 5) }, (_, j) => ({
    location: locations[j % locations.length],
    timestamp: dayjs(baseDate).add(j * 4, 'hour').format('YYYY-MM-DD HH:mm:ss'),
    status: j === 0 ? '已揽收' : j === 1 ? '运输中' : j === 2 ? '派送中' : '已签收',
    isException: status === 'EXCEPTION' && j === 2,
  }));

  return {
    id: nextId(),
    orderNo: `DLV-2025-${String(i + 1).padStart(4, '0')}`,
    deliveryType,
    status,
    logisticsProvider: randomItem(logisticsProviders),
    fromOrgName: fromOrg.name,
    toOrgName: toOrg.name,
    items,
    tracks,
    createdAt: baseDate + ' 08:00:00',
    updatedAt: dayjs(baseDate).add(2, 'day').format('YYYY-MM-DD HH:mm:ss'),
  };
});

// 冷链时序数据
export const coldChainData: ColdChainData[] = Array.from({ length: 48 }, (_, i) => ({
  timestamp: dayjs('2025-06-14 00:00').add(i * 30, 'minute').format('YYYY-MM-DD HH:mm:ss'),
  temperature: randomFloat(2, 8, 1),
  humidity: randomFloat(40, 70, 1),
  isAbnormal: i === 15 || i === 32,
}));
