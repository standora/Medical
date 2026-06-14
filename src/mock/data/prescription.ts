import type { Prescription, PrescriptionItem, PrescriptionFlowRecord } from '../../types/prescription.types';
import { countyOrgList, townOrgList } from './orgs';
import { drugs } from './drugs';
import { nextId, randomDate, randomInt, randomItem, randomItems } from '../utils';
import dayjs from 'dayjs';

const activeDrugs = drugs.filter(d => d.status === 'ACTIVE');
const prescriptionOrgs = [...countyOrgList, ...townOrgList];

const doctors = ['张医生', '李医生', '王医生', '刘医生', '陈医生', '赵医生', '孙医生', '周医生', '吴医生', '郑医生'];
const patients = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十', '郑十一', '冯十二',
  '陈明', '杨华', '朱丽', '秦刚', '许强', '何雪', '吕伟', '施芳', '张伟', '李娜',
  '王小明', '刘洋', '陈静', '赵磊', '黄丽华', '孙志强', '周美玲', '吴国平', '郑秀英', '冯国庆'];

const dosages = ['1片/次', '2片/次', '1粒/次', '2粒/次', '5ml/次', '10ml/次', '0.5片/次', '1袋/次'];
const usages = ['口服', '口服', '口服', '舌下含服', '外用', '雾化吸入'];
const frequencies = ['一日一次', '一日两次', '一日三次', '一日四次', '隔日一次', '必要时'];

const prescriptionStatuses: Prescription['status'][] = [
  'DRAFT', 'SUBMITTED', 'REVIEWING', 'REVIEW_PASSED', 'REVIEW_REJECTED',
  'DISPENSING', 'DISPENSED', 'DELIVERING', 'COMPLETED', 'CANCELLED',
];

const flowNodes = ['开方', '提交', '系统审核', '药师审核', '调配', '发药', '配送', '签收'];

export const prescriptions: Prescription[] = Array.from({ length: 120 }, (_, i) => {
  const org = randomItem(prescriptionOrgs);
  const doctor = randomItem(doctors);
  const patient = randomItem(patients);
  const selectedDrugs = randomItems(activeDrugs, randomInt(1, 5));
  const status = prescriptionStatuses[i % prescriptionStatuses.length];

  const items: PrescriptionItem[] = selectedDrugs.map(d => ({
    drugId: d.id,
    drugName: d.tradeName,
    dosage: randomItem(dosages),
    usage: randomItem(usages),
    frequency: randomItem(frequencies),
    days: randomInt(1, 14),
  }));

  const baseDate = randomDate('2025-04-01', '2025-06-14');

  // 根据状态确定流程记录的深度
  const statusIndex = prescriptionStatuses.indexOf(status);
  const flowCount = Math.min(statusIndex + 1, flowNodes.length);
  const flowRecords: PrescriptionFlowRecord[] = Array.from({ length: flowCount }, (_, j) => ({
    node: flowNodes[j],
    timestamp: dayjs(baseDate).add(j * 20, 'minute').format('YYYY-MM-DD HH:mm:ss'),
    operator: j === 0 ? doctor : j === 2 ? '系统' : `药师${randomInt(1, 5)}`,
    status: j < flowCount - 1 ? '已完成' : '处理中',
  }));

  const reviewResult = status === 'REVIEW_REJECTED' ? {
    reviewType: Math.random() > 0.5 ? ('SYSTEM' as const) : ('MANUAL' as const),
    result: 'REJECTED' as const,
    opinion: '存在配伍禁忌，请修改处方',
    rejectedRules: ['配伍禁忌规则-001'],
  } : status === 'REVIEW_PASSED' || status === 'DISPENSING' || status === 'DISPENSED' || status === 'DELIVERING' || status === 'COMPLETED' ? {
    reviewType: 'SYSTEM' as const,
    result: 'PASSED' as const,
    opinion: '审核通过',
  } : undefined;

  return {
    id: nextId(),
    prescriptionNo: `RX-2025-${String(i + 1).padStart(5, '0')}`,
    orgId: org.id,
    orgName: org.name,
    doctorName: doctor,
    patientName: patient,
    patientId: `PAT-${String(randomInt(1, 500)).padStart(6, '0')}`,
    prescriptionType: i % 4 === 0 ? 'CHINESE' : 'WESTERN',
    status,
    items,
    reviewResult,
    flowRecords,
    createdAt: baseDate + ' 08:30:00',
    updatedAt: dayjs(baseDate).add(flowCount * 20, 'minute').format('YYYY-MM-DD HH:mm:ss'),
  };
});
