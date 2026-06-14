import type { DrugInteractionRule, DrugTrace, DrugTraceNode } from '../../types/quality.types';
import { drugs } from './drugs';
import { nextId, randomDate, randomInt, randomItems } from '../utils';
import dayjs from 'dayjs';

const activeDrugs = drugs.filter(d => d.status === 'ACTIVE');

const ruleTypes: DrugInteractionRule['ruleType'][] = ['CONTRAINDICATION', 'DOSAGE', 'DUPLICATE', 'THERAPY'];
const interceptLevels: DrugInteractionRule['interceptLevel'][] = ['WARNING', 'BLOCK'];

const ruleMessages: Record<DrugInteractionRule['ruleType'], string[]> = {
  CONTRAINDICATION: [
    '头孢类药物与酒精合用可致双硫仑样反应',
    '氨基糖苷类与呋塞米合用增加耳肾毒性',
    '华法林与阿司匹林合用增加出血风险',
    '甲硝唑与酒精合用可致双硫仑样反应',
    '氯霉素与大环内酯类合用竞争结合位点',
    '四环素类与钙/铁/镁离子形成络合物',
    '左氧氟沙星与铝/镁制剂合用降低吸收',
    '青霉素类与四环素类合用降低疗效',
    '阿莫西林与甲氨蝶呤合用增加毒性',
    '红霉素与西咪替丁合用影响吸收',
    '卡马西平与红霉素合用增加卡马西平血药浓度',
    '地高辛与胺碘酮合用增加地高辛血药浓度',
    '氨氯地平与辛伐他汀合用增加肌病风险',
    '氯吡格雷与奥美拉唑合用降低抗血小板效果',
  ],
  DOSAGE: [
    '阿莫西林单次剂量超过1g需分次服用',
    '头孢克肟日剂量不超过400mg',
    '布洛芬日剂量不超过1.2g（非处方）',
    '对乙酰氨基酚日剂量不超过2g',
    '地塞米松长期使用需逐渐减量',
    '阿托伐他汀日剂量不超过80mg',
    '二甲双胍起始剂量宜小，逐步加量',
    '氨氯地平起始剂量5mg，最大10mg',
    '硝苯地平控释片不可掰开服用',
    '辛伐他汀与氨氯地平合用剂量不超过20mg',
    '美托洛尔缓释片不可掰开或咀嚼',
    '左氧氟沙星肾功能不全需调整剂量',
  ],
  DUPLICATE: [
    '同时开具两种NSAIDs类药物',
    '同时开具两种ACEI类药物',
    '同时开具两种ARB类药物',
    '同时开具两种他汀类药物',
    '同时开具两种头孢类抗生素',
    '同时开具两种质子泵抑制剂',
    '同时开具两种钙通道阻滞剂',
    '同时开具含对乙酰氨基酚的复方制剂',
  ],
  THERAPY: [
    '急性上呼吸道感染不建议常规使用抗生素',
    '普通感冒无需抗病毒治疗',
    '无并发症的急性支气管炎不建议使用抗生素',
    '高血压患者需长期规律用药',
    '糖尿病患者二甲双胍为一线用药',
    '他汀类药物需长期使用',
    '抗血小板治疗需评估出血风险',
    '质子泵抑制剂不宜长期大剂量使用',
    '糖皮质激素不宜突然停药',
    '抗菌药物疗程不宜超过14天',
    '降压药物不宜频繁更换',
    '哮喘控制期应规律使用吸入激素',
    '心衰患者需联合使用ACEI/ARB+β受体阻滞剂',
    '房颤患者需抗凝治疗',
    '痛风急性期不宜使用降尿酸药物',
    '消化性溃疡需根除幽门螺杆菌',
  ],
};

export const drugInteractionRules: DrugInteractionRule[] = Array.from({ length: 55 }, (_, i) => {
  const ruleType = ruleTypes[i % ruleTypes.length];
  const messages = ruleMessages[ruleType];
  const message = messages[i % messages.length];

  // 为配伍禁忌和重复用药选择药品组合
  let drugCombination: string[];
  if (ruleType === 'CONTRAINDICATION' || ruleType === 'DUPLICATE') {
    const selected = randomItems(activeDrugs, 2);
    drugCombination = selected.map(d => d.tradeName);
  } else {
    const selected = randomItems(activeDrugs, randomInt(1, 2));
    drugCombination = selected.map(d => d.tradeName);
  }

  return {
    id: nextId(),
    ruleType,
    drugCombination,
    interceptLevel: interceptLevels[i % interceptLevels.length],
    message,
    enabled: i < 50,
    createdAt: randomDate('2024-01-01', '2024-12-31') + ' 08:00:00',
    updatedAt: randomDate('2025-01-01', '2025-06-01') + ' 10:00:00',
  };
});

// 药品追溯数据
const traceNodes = ['生产入库', '出厂检验', '供应商入库', '供应商出库', '医院入库', '药房上架', '处方调配', '患者签收'];
const traceOperators = ['生产线A', '质检部', '仓库管理员', '配送员', '药房管理员', '药师', '配送员'];
const traceLocations = ['扬子江药业生产车间', '扬子江药业仓库', '国药物流中心', '县人民医院药库', '县人民医院药房', '城关镇卫生院药房', '患者家中'];

export const drugTraces: DrugTrace[] = activeDrugs.slice(0, 40).map((drug, i) => {
  const nodeCount = randomInt(4, 8);
  const baseDate = randomDate('2025-01-01', '2025-05-01');

  const nodes: DrugTraceNode[] = Array.from({ length: nodeCount }, (_, j) => ({
    node: traceNodes[j],
    timestamp: dayjs(baseDate).add(j * 3, 'day').format('YYYY-MM-DD HH:mm:ss'),
    operator: traceOperators[j % traceOperators.length],
    location: traceLocations[j % traceLocations.length],
  }));

  return {
    id: nextId(),
    traceCode: `TRC-${String(i + 1).padStart(6, '0')}`,
    drugId: drug.id,
    drugName: drug.tradeName,
    nodes,
    createdAt: baseDate + ' 08:00:00',
    updatedAt: dayjs(baseDate).add(nodeCount * 3, 'day').format('YYYY-MM-DD HH:mm:ss'),
  };
});
