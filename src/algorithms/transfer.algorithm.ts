export interface TransferInput {
  drugId: string;
  fromOrgId: string;
  toOrgId: string;
  fromOrgQty: number;
  toOrgQty: number;
  toOrgLowerLimit: number;
  distance: number;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface TransferOutput {
  fromOrgId: string;
  toOrgId: string;
  drugId: string;
  suggestedQty: number;
  priority: number;
  reason: string;
}

export class TransferAlgorithm {
  static calculate(input: TransferInput): TransferOutput {
    const { fromOrgQty, toOrgQty, toOrgLowerLimit, distance, urgency } = input;

    const shortage = Math.max(toOrgLowerLimit - toOrgQty, 0);
    const availableForTransfer = Math.max(fromOrgQty - Math.ceil(fromOrgQty * 0.3), 0);
    const suggestedQty = Math.min(shortage, availableForTransfer);

    const urgencyScore = { LOW: 20, MEDIUM: 50, HIGH: 80 }[urgency];
    const distanceScore = Math.max(0, 100 - distance * 2);
    const shortageScore = shortage > 0 ? Math.min((shortage / toOrgLowerLimit) * 100, 100) : 0;
    const priority = Math.round(urgencyScore * 0.4 + distanceScore * 0.3 + shortageScore * 0.3);

    return {
      fromOrgId: input.fromOrgId,
      toOrgId: input.toOrgId,
      drugId: input.drugId,
      suggestedQty,
      priority,
      reason: `缺口${shortage}，可调剂${availableForTransfer}，距离${distance}km，紧急度${urgency}，优先级${priority}`,
    };
  }
}
