import { describe, expect, it } from "vitest";
import { formatCurrency, formatDupr, formatWinPct } from "@/lib/utils";

describe("formatCurrency", () => {
  it("formats INR without decimals", () => {
    expect(formatCurrency(500)).toMatch(/500/);
    expect(formatCurrency(500)).toMatch(/₹|INR/);
  });
});

describe("formatDupr", () => {
  it("shows two decimal places", () => {
    expect(formatDupr(4.1)).toBe("4.10");
    expect(formatDupr(3.875)).toBe("3.88");
  });
});

describe("formatWinPct", () => {
  it("rounds win percentage", () => {
    expect(formatWinPct(3, 4)).toBe(75);
    expect(formatWinPct(0, 0)).toBe(0);
  });
});
