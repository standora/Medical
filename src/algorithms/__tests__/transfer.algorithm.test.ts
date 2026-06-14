import { describe, it, expect } from 'vitest';
import { TransferAlgorithm } from '../transfer.algorithm';

describe('TransferAlgorithm', () => {
  it('should suggest transfer when there is a shortage', () => {
    const result = TransferAlgorithm.calculate({
      drugId: 'drug-1', fromOrgId: 'org-1', toOrgId: 'org-2',
      fromOrgQty: 200, toOrgQty: 5, toOrgLowerLimit: 50,
      distance: 10, urgency: 'HIGH',
    });
    expect(result.suggestedQty).toBeGreaterThan(0);
    expect(result.priority).toBeGreaterThan(0);
  });

  it('should suggest zero transfer when no shortage', () => {
    const result = TransferAlgorithm.calculate({
      drugId: 'drug-1', fromOrgId: 'org-1', toOrgId: 'org-2',
      fromOrgQty: 200, toOrgQty: 100, toOrgLowerLimit: 50,
      distance: 10, urgency: 'LOW',
    });
    expect(result.suggestedQty).toBe(0);
  });
});
