import { describe, expect, it } from "vitest";
import { createDefaultEmergencyState } from "./blobEmergencyStore";

describe("Blob emergency store", () => {
  it("provides safe default pricing and empty availability", () => {
    const state = createDefaultEmergencyState();

    expect(state.emergencyMode).toBe(true);
    expect(state.pricing).toMatchObject({
      dailyRate: "160.00",
      deliveryFee: "0.00",
      cartName: "Breezy Golf Cart",
    });
    expect(state.availabilityBlocks).toEqual([]);
    expect(state.bookings).toEqual([]);
  });
});
