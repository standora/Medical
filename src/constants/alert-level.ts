export const AlertLevel = {
  INFO: 'INFO',
  WARNING: 'WARNING',
  CRITICAL: 'CRITICAL',
} as const;

export type AlertLevel = (typeof AlertLevel)[keyof typeof AlertLevel];

export const AlertType = {
  UPPER_LIMIT: 'UPPER_LIMIT',
  LOWER_LIMIT: 'LOWER_LIMIT',
  NEAR_EXPIRY: 'NEAR_EXPIRY',
  STOCKOUT_PREDICTION: 'STOCKOUT_PREDICTION',
} as const;

export type AlertType = (typeof AlertType)[keyof typeof AlertType];
