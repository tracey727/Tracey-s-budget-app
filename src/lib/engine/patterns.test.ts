import { describe, expect, it } from "vitest";
import { isAlreadyLinked, rankPatternsByImpact } from "./patterns";

describe("rankPatternsByImpact", () => {
  it("ranks highest combined impact first", () => {
    const result = rankPatternsByImpact(
      [
        { id: "low", estimatedImpactMinutes: 10, estimatedImpactCurrency: 0 },
        { id: "high", estimatedImpactMinutes: 0, estimatedImpactCurrency: 500 },
      ],
      60,
    );
    expect(result.map((r) => r.id)).toEqual(["high", "low"]);
  });

  it("treats missing impact fields as zero", () => {
    const result = rankPatternsByImpact([{ id: "a", estimatedImpactMinutes: null, estimatedImpactCurrency: null }], 60);
    expect(result[0].combinedImpactValue).toBe(0);
  });
});

describe("isAlreadyLinked", () => {
  it("detects an existing link by source type + id", () => {
    const existing = [{ sourceType: "WASTE_EVENT", sourceId: "w1" }];
    expect(isAlreadyLinked(existing, { sourceType: "WASTE_EVENT", sourceId: "w1" })).toBe(true);
    expect(isAlreadyLinked(existing, { sourceType: "WASTE_EVENT", sourceId: "w2" })).toBe(false);
  });
});
