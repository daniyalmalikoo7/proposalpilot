// Stripe billing — checkout session creation and customer portal.
// Tiers: starter ($49/10 proposals) | growth ($149/30) | scale ($399/100) | enterprise (custom/999)
// Price IDs are configured via env vars — see .env.example.

import Stripe from "stripe";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, protectedProcedure } from "@/server/trpc";
import { logger } from "@/lib/logger";

const PLAN_CONFIG = {
  starter: { envKey: "STRIPE_PRICE_STARTER", monthlyProposalLimit: 10 },
  growth: { envKey: "STRIPE_PRICE_GROWTH", monthlyProposalLimit: 30 },
  scale: { envKey: "STRIPE_PRICE_SCALE", monthlyProposalLimit: 100 },
  enterprise: { envKey: "STRIPE_PRICE_ENTERPRISE", monthlyProposalLimit: 999 },
} as const;

type Plan = keyof typeof PLAN_CONFIG;

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");
  return new Stripe(key);
}

function getPriceId(plan: Plan): string {
  const envKey = PLAN_CONFIG[plan].envKey;
  const priceId = process.env[envKey];
  if (!priceId) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Stripe price ID not configured for plan: ${plan}`,
    });
  }
  return priceId;
}

export const billingRouter = router({
  /**
   * Create a Stripe Checkout session for upgrading/subscribing to a plan.
   * Reuses an existing Stripe customer if the org has one.
   */
  createCheckout: protectedProcedure
    .input(
      z.object({
        orgId: z.string().cuid(),
        plan: z.enum(["starter", "growth", "scale", "enterprise"]),
        successUrl: z.string().url(),
        cancelUrl: z.string().url(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const org = await ctx.db.organization.findUnique({
        where: { id: input.orgId },
        select: {
          id: true,
          name: true,
          clerkOrgId: true,
          stripeCustomerId: true,
        },
      });

      if (!org) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Organization not found.",
        });
      }

      const stripe = getStripe();
      const priceId = getPriceId(input.plan);

      // Reuse existing Stripe customer or create one
      let customerId = org.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          name: org.name,
          metadata: {
            clerkOrgId: org.clerkOrgId,
            internalOrgId: org.id,
          },
        });
        customerId = customer.id;
        await ctx.db.organization.update({
          where: { id: org.id },
          data: { stripeCustomerId: customerId },
        });
      }

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: "subscription",
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: input.successUrl,
        cancel_url: input.cancelUrl,
        metadata: { orgId: org.id, plan: input.plan },
        subscription_data: {
          metadata: { orgId: org.id, plan: input.plan },
        },
      });

      logger.info("Stripe checkout session created", {
        orgId: org.id,
        plan: input.plan,
        sessionId: session.id,
      });

      return { url: session.url };
    }),

  /**
   * Create a Stripe customer portal session for managing an existing subscription.
   */
  createPortalSession: protectedProcedure
    .input(
      z.object({
        orgId: z.string().cuid(),
        returnUrl: z.string().url(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const org = await ctx.db.organization.findUnique({
        where: { id: input.orgId },
        select: { id: true, stripeCustomerId: true },
      });

      if (!org?.stripeCustomerId) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "No active Stripe subscription found for this organization.",
        });
      }

      const stripe = getStripe();
      const session = await stripe.billingPortal.sessions.create({
        customer: org.stripeCustomerId,
        return_url: input.returnUrl,
      });

      return { url: session.url };
    }),
});
