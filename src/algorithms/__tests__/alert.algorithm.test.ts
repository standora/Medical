import { describe, it, expect } from 'vitest';
import { AlertAlgorithm } from '../alert.algorithm';
import { AlertType } from '../../constants/alert-level';

describe('AlertAlgorithm', () => {
  it('should detect lower limit alert', () => {
    const alerts = AlertAlgorithm.check({
      orgId: 'org-1', drugId: 'drug-1', currentQty: 5, upperLimit: 500,
      lowerLimit: 20, expiryDate: null, dailyConsumption: [10, 10, 10],
    });
    expect(alerts.some(a => a.alertType === AlertType.LOWER_LIMIT)).toBe(true);
  });

  it('should detect near expiry alert', () => {
    const futureDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString();
    const alerts = AlertAlgorithm.check({
      orgId: 'org-1', drugId: 'drug-1', currentQty: 100, upperLimit: 500,
      lowerLimit: 20, expiryDate: futureDate, dailyConsumption: [],
    });
    expect(alerts.some(a => a.alertType === AlertType.NEAR_EXPIRY)).toBe(true);
  });

  it('should detect stockout prediction', () => {
    const alerts = AlertAlgorithm.check({
      orgId: 'org-1', drugId: 'drug-1', currentQty: 20, upperLimit: 500,
      lowerLimit: 10, expiryDate: null, dailyConsumption: [10, 10, 10, 10],
    });
    expect(alerts.some(a => a.alertType === AlertType.STOCKOUT_PREDICTION)).toBe(true);
  });

  it('should return empty when no alerts', () => {
    const alerts = AlertAlgorithm.check({
      orgId: 'org-1', drugId: 'drug-1', currentQty: 200, upperLimit: 500,
      lowerLimit: 20, expiryDate: null, dailyConsumption: [1, 1, 1],
    });
    expect(alerts.length).toBe(0);
  });
});
