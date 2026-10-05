/**
 * Monthly repayment on a vehicle loan with an optional balloon (residual), as quoted by SA
 * banks: the balloon is discounted back to today and the rest is amortised over the term.
 */
export function monthlyRepayment(
  price: number,
  depositPct: number,
  months: number,
  annualRatePct: number,
  balloonPct: number,
): number {
  const principal = price * (1 - depositPct / 100);
  const balloon = price * (balloonPct / 100);
  const r = annualRatePct / 1200;
  if (months <= 0) return 0;
  if (r === 0) return (principal - balloon) / months;
  return ((principal - balloon / (1 + r) ** months) * r) / (1 - (1 + r) ** -months);
}
