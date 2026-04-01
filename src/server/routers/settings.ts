import { z } from "zod";
import {
  router,
  orgProtectedProcedure,
  protectedProcedure,
} from "@/server/trpc";

export const settingsRouter = router({
  /**
   * Get the current organization record.
   * Uses protectedProcedure (not orgProtectedProcedure) so it works even when
   * the org record hasn't been created yet (e.g. mid-onboarding).
   */
  getOrg: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.orgId) return null;
    return ctx.db.organization.findUnique({
      where: { clerkOrgId: ctx.orgId },
      select: {
        id: true,
        name: true,
        plan: true,
        monthlyProposalLimit: true,
        stripeCustomerId: true,
        createdAt: true,
      },
    });
  }),

  /**
   * Update the organization's display name.
   */
  updateOrg: orgProtectedProcedure
    .input(z.object({ name: z.string().min(1).max(255) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.organization.update({
        where: { id: ctx.internalOrgId },
        data: { name: input.name },
        select: { id: true, name: true },
      });
    }),
});
