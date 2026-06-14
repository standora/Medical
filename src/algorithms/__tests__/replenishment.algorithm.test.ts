import { describe, it, expect } from 'vitest';
import { ReplenishmentAlgorithm } from '../replenishment.algorithm';
import type { ReplenishmentInput } from '../replenishment.algorithm';

describe('ReplenishmentAlgorithm', () => {
  const baseInput: ReplenishmentInput = {
    drugId: 'drug-1', orgId: 'org-1', currentQty: 10, lowerLimit: 20,
    dailyConsumption: [5, 6, 5, 7, 6, 5, 4, 6, 5, 7],
    seasonFactors: Array(12).fill(1.0), safetyStockDays: 7, leadTimeDays: 3,
  };

  it('should suggest replenishment when stock is below reorder point', () => {
    const result = ReplenishmentAlgorithm.calculate(baseInput);
    expect(result).not.toBeNull();
    expect(result!.suggestedQty).toBeGreaterThan(0);
  });

  it('should not suggest replenishment when stock is sufficient', () => {
    const result = ReplenishmentAlgorithm.calculate({ ...baseInput, currentQty: 500 });
    expect(result).toBeNull();
  });

  it('should return null for empty consumption data', () => {
    const result = ReplenishmentAlgorithm.calculate({ ...baseInput, dailyConsumption: [] });
    expect(result).toBeNull();
  });

  it('should increase confidence with more data points', () => {
    const shortInput = { ...baseInput, dailyConsumption: [5, 6] };
    const longInput = { ...baseInput, dailyConsumption: Array(30).fill(5) };
    const shortResult = ReplenishmentAlgorithm.calculate(shortInput);
    const longResult = ReplenishmentAlgorithm.calculate(longInput);
    if (shortResult && longResult) {
      expect(longResult.confidence).toBeGreaterThanOrEqual(shortResult.confidence);
    }
  });
});
