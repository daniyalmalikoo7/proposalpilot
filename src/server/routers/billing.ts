// Stripe billing — checkout session creation and customer portal.
// Tiers: starter ($49/10 proposals) | growth ($149/30) | scale ($399/100) | enterprise (custom/999)
// Price IDs are configured via env vars — see .env.example.

import Stripe from "stripe";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, orgProtectedProcedure } from "@/server/trpc";
import { logger } from "@/lib/logger";
import { env } from "@/lib/config";

const PLAN_CONFIG = {
  starter: {
    envField: "STRIPE_PRICE_STARTER" as const,
    monthlyProposalLimit: 10,
  },
  growth: {
    envField: "STRIPE_PRICE_GROWTH" as const,
    monthlyProposalLimit: 30,
  },
  scale: { envField: "STRIPE_PRICE_SCALE" as const, monthlyProposalLimit: 100 },
  enterprise: {
    envField: "STRIPE_PRICE_ENTERPRISE" as const,
    monthlyProposalLimit: 999,
  },
} as const;

type Plan = keyof typeof PLAN_CONFIG;

function getStripe(): Stripe {
  return new Stripe(env.STRIPE_SECRET_KEY);
}

function getPriceId(plan: Plan): string {
  const envField = PLAN_CONFIG[plan].envField;
  const priceId = env[envField];
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
   */
  createCheckout: orgProtectedProcedure
    .input(
      z.object({
        plan: z.enum(["starter", "growth", "scale", "enterprise"]),
        successUrl: z.string().url(),
        cancelUrl: z.string().url(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const org = await ctx.db.organization.findUnique({
        where: { id: ctx.internalOrgId },
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
  createPortalSession: orgProtectedProcedure
    .input(
      z.object({
        returnUrl: z.string().url(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const org = await ctx.db.organization.findUnique({
        where: { id: ctx.internalOrgId },
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
