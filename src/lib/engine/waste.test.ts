import { describe, expect, it } from "vitest";
import { canAdvanceWasteStatus, labourValueOfMinutes, releasedMinutes } from "./waste";

describe("canAdvanceWasteStatus", () => {
  it("allows LOGGED -> ROOT_CAUSE_CONFIRMED with no baseline yet", () => {
    const result = canAdvanceWasteStatus("LOGGED", "ROOT_CAUSE_CONFIRMED", {
      baselineMinutes: null,
      postMinutes: null,
    });
    expect(result.allowed).toBe(true);
  });

  it("blocks skipping a step", () => {
    const result = canAdvanceWasteStatus("LOGGED", "INTERVENTION_PLANNED", {
      baselineMinutes: null,
      postMinutes: null,
    });
    expect(result.allowed).toBe(false);
  });

  it("blocks moving backward", () => {
    const result = canAdvanceWasteStatus("MEASURED", "LOGGED", { baselineMinutes: 15, postMinutes: 5 });
    expect(result.allowed).toBe(false);
  });

  it("blocks planning an intervention without a frozen baseline", () => {
    const result = canAdvanceWasteStatus("ROOT_CAUSE_CONFIRMED", "INTERVENTION_PLANNED", {
      baselineMinutes: null,
      postMinutes: null,
    });
    expect(result.allowed).toBe(false);
  });

  it("allows planning once a baseline is frozen", () => {
    const result = canAdvanceWasteStatus("ROOT_CAUSE_CONFIRMED", "INTERVENTION_PLANNED", {
      baselineMinutes: 15,
      postMinutes: null,
    });
    expect(result.allowed).toBe(true);
  });

  it("blocks MEASURED without post-intervention minutes", () => {
    const result = canAdvanceWasteStatus("INTERVENTION_ACTIVE", "MEASURED", {
      baselineMinutes: 15,
      postMinutes: null,
    });
    expect(result.allowed).toBe(false);
  });

  it("allows MEASURED once post-intervention minutes exist", () => {
    const result = canAdvanceWasteStatus("INTERVENTION_ACTIVE", "MEASURED", {
      baselineMinutes: 15,
      postMinutes: 5,
    });
    expect(result.allowed).toBe(true);
  });
});

describe("releasedMinutes", () => {
  it("computes the drop from baseline to post", () => {
    expect(releasedMinutes(15, 5)).toBe(10);
  });

  it("can be negative when the intervention made things worse", () => {
    expect(releasedMinutes(15, 20)).toBe(-5);
  });
});

describe("labourValueOfMinutes", () => {
  it("converts minutes to a dollar value at the given hourly rate", () => {
    expect(labourValueOfMinutes(30, 60)).toBe(30);
  });
});
