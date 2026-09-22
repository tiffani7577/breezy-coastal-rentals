import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { isDatabaseReady } from "../db";
import { notifyOwner } from "./notification";
import { adminProcedure, publicProcedure, router } from "./trpc";

export const systemRouter = router({
  health: publicProcedure
    .query(() => ({
      ok: true,
    })),

  readiness: publicProcedure.query(async () => {
    if (!(await isDatabaseReady())) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database is temporarily unavailable",
      });
    }

    return { ok: true, database: "ready" } as const;
  }),

  notifyOwner: adminProcedure
    .input(
      z.object({
        title: z.string().min(1, "title is required"),
        content: z.string().min(1, "content is required"),
      })
    )
    .mutation(async ({ input }) => {
      const delivered = await notifyOwner(input);
      return {
        success: delivered,
      } as const;
    }),
});
