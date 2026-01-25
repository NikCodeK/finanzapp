export function calculateHealthScore({
  savingsRate,
  debtToIncomeRatio,
  emergencyMonths,
}: {
  savingsRate: number;
  debtToIncomeRatio: number;
  emergencyMonths: number;
}) {
  let score = 50;

  if (savingsRate >= 0.2) score += 25;
  else if (savingsRate >= 0.1) score += 15;
  else if (savingsRate > 0) score += 5;
  else score -= 10;

  if (debtToIncomeRatio === 0) score += 15;
  else if (debtToIncomeRatio <= 0.2) score += 10;
  else if (debtToIncomeRatio <= 0.35) score += 5;
  else score -= 10;

  if (emergencyMonths >= 6) score += 10;
  else if (emergencyMonths >= 3) score += 5;
  else score -= 5;

  return Math.min(Math.max(score, 0), 100);
}
