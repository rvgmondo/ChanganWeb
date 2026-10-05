import { describe, expect, it } from "vitest";

import { monthlyRepayment } from "./finance";

describe("monthlyRepayment", () => {
  it("matches a standard amortised loan with no balloon", () => {
    // R389 900, 10% deposit, 72 months at 11.75%: about R6 815 a month.
    expect(Math.round(monthlyRepayment(389900, 10, 72, 11.75, 0))).toBe(6815);
  });
  it("is lower with a balloon", () => {
    expect(monthlyRepayment(389900, 10, 72, 11.75, 30)).toBeLessThan(
      monthlyRepayment(389900, 10, 72, 11.75, 0),
    );
  });
  it("handles a zero rate", () => {
    expect(monthlyRepayment(120000, 0, 12, 0, 0)).toBe(10000);
  });
});
