export interface ReplenishmentInput {
  drugId: string;
  orgId: string;
  currentQty: number;
  lowerLimit: number;
  dailyConsumption: number[];
  seasonFactors: number[];
  safetyStockDays: number;
  leadTimeDays: number;
}

export interface ReplenishmentOutput {
  drugId: string;
  orgId: string;
  suggestedQty: number;
  confidence: number;
  reason: string;
}

export class ReplenishmentAlgorithm {
  static calculate(input: ReplenishmentInput): ReplenishmentOutput | null {
    const { currentQty, dailyConsumption, seasonFactors, safetyStockDays, leadTimeDays } = input;

    if (dailyConsumption.length === 0) return null;

    // 加权移动平均日消耗量
    const weights = dailyConsumption.map((_, i) => i + 1);
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    const weightedAvg = dailyConsumption.reduce((sum, val, i) => sum + val * weights[i], 0) / totalWeight;

    // 应用季节因子
    const currentMonth = new Date().getMonth();
    const seasonFactor = seasonFactors[currentMonth] || 1.0;
    const adjustedDaily = weightedAvg * seasonFactor;

    // 安全库存
    const safetyStock = adjustedDaily * safetyStockDays;

    // 补货点
    const reorderPoint = adjustedDaily * leadTimeDays + safetyStock;

    if (currentQty > reorderPoint) return null;

    const suggestedQty = Math.max(Math.ceil(reorderPoint + safetyStock - currentQty), 0);
    const confidence = Math.min(dailyConsumption.length / 30, 1.0);

    return {
      drugId: input.drugId,
      orgId: input.orgId,
      suggestedQty,
      confidence,
      reason: `当前库存${currentQty}低于补货点${Math.round(reorderPoint)}，日均消耗${adjustedDaily.toFixed(1)}，季节因子${seasonFactor}，建议补货${suggestedQty}`,
    };
  }
}
