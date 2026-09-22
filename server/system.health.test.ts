import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function publicContext(): TrpcContext {
  return {
    user: null,
    req: {} as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("system health", () => {
  it("returns application health without requiring an input payload or database access", async () => {
    const caller = appRouter.createCaller(publicContext());

    await expect(caller.system.health()).resolves.toEqual({ ok: true });
  });
});
