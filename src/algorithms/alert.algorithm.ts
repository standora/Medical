import { AlertLevel, AlertType } from '../constants/alert-level';

export interface AlertInput {
  orgId: string;
  drugId: string;
  currentQty: number;
  upperLimit: number;
  lowerLimit: number;
  expiryDate: string | null;
  dailyConsumption: number[];
}

export interface AlertOutput {
  orgId: string;
  drugId: string;
  alertType: AlertType;
  alertLevel: AlertLevel;
  message: string;
}

export class AlertAlgorithm {
  static check(input: AlertInput): AlertOutput[] {
    const alerts: AlertOutput[] = [];
    const { currentQty, upperLimit, lowerLimit, expiryDate, dailyConsumption } = input;

    if (currentQty > upperLimit) {
      alerts.push({ orgId: input.orgId, drugId: input.drugId, alertType: AlertType.UPPER_LIMIT, alertLevel: AlertLevel.WARNING, message: `库存${currentQty}超过上限${upperLimit}` });
    }

    if (currentQty < lowerLimit) {
      const level = currentQty === 0 ? AlertLevel.CRITICAL : AlertLevel.WARNING;
      alerts.push({ orgId: input.orgId, drugId: input.drugId, alertType: AlertType.LOWER_LIMIT, alertLevel: level, message: `库存${currentQty}低于下限${lowerLimit}` });
    }

    if (expiryDate) {
      const daysToExpiry = Math.ceil((new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      if (daysToExpiry <= 30 && daysToExpiry > 0) {
        alerts.push({ orgId: input.orgId, drugId: input.drugId, alertType: AlertType.NEAR_EXPIRY, alertLevel: daysToExpiry <= 7 ? AlertLevel.CRITICAL : AlertLevel.WARNING, message: `药品将于${daysToExpiry}天后过期` });
      }
    }

    if (dailyConsumption.length > 0 && currentQty > 0) {
      const avgDaily = dailyConsumption.reduce((a, b) => a + b, 0) / dailyConsumption.length;
      const daysOfStock = Math.floor(currentQty / avgDaily);
      if (daysOfStock < 7) {
        alerts.push({ orgId: input.orgId, drugId: input.drugId, alertType: AlertType.STOCKOUT_PREDICTION, alertLevel: daysOfStock < 3 ? AlertLevel.CRITICAL : AlertLevel.WARNING, message: `按当前消耗速度，预计${daysOfStock}天后缺货` });
      }
    }

    return alerts;
  }
}
