// Stripe webhook handler — processes billing events and syncs org plan state.
// Events handled: checkout.session.completed, customer.subscription.updated/deleted
// Security: signature verified via STRIPE_WEBHOOK_SECRET before any processing.

import { type NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";

// Build price-id → plan mapping at module load (values come from env vars)
const PRICE_TO_PLAN: Record<
  string,
  { plan: string; monthlyProposalLimit: number }
> = {};

(function buildPriceMap() {
  const entries = [
    { envKey: "STRIPE_PRICE_STARTER", plan: "starter", limit: 10 },
    { envKey: "STRIPE_PRICE_GROWTH", plan: "growth", limit: 30 },
    { envKey: "STRIPE_PRICE_SCALE", plan: "scale", limit: 100 },
    { envKey: "STRIPE_PRICE_ENTERPRISE", plan: "enterprise", limit: 999 },
  ];
  for (const entry of entries) {
    const id = process.env[entry.envKey];
    if (id) {
      PRICE_TO_PLAN[id] = {
        plan: entry.plan,
        monthlyProposalLimit: entry.limit,
      };
    }
  }
})();

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !secret) {
    logger.warn("Stripe webhook: missing signature or secret");
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    logger.warn("Stripe webhook: signature verification failed", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    await handleEvent(event);
  } catch (err) {
    logger.error("Stripe webhook: handler threw", {
      eventType: event.type,
      eventId: event.id,
      error: err instanceof Error ? err.message : String(err),
    });
    // Return 500 so Stripe retries the event
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleEvent(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const orgId = session.metadata?.orgId;
      const plan = session.metadata?.plan;
      const customerId =
        typeof session.customer === "string" ? session.customer : null;

      if (!orgId || !plan) {
        logger.warn(
          "checkout.session.completed: missing orgId or plan in metadata",
          {
            sessionId: session.id,
          },
        );
        return;
      }

      const config = Object.values(PRICE_TO_PLAN).find((c) => c.plan === plan);
      await db.organization.update({
        where: { id: orgId },
        data: {
          plan,
          monthlyProposalLimit: config?.monthlyProposalLimit ?? 10,
          ...(customerId ? { stripeCustomerId: customerId } : {}),
        },
      });

      logger.info("Org plan activated via checkout", { orgId, plan });
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const orgId = sub.metadata?.orgId;
      const priceId = sub.items.data[0]?.price.id;

      if (!orgId) {
        logger.warn(
          "customer.subscription.updated: missing orgId in metadata",
          {
            subscriptionId: sub.id,
          },
        );
        return;
      }

      if (priceId) {
        const config = PRICE_TO_PLAN[priceId];
        if (config) {
          await db.organization.update({
            where: { id: orgId },
            data: {
              plan: config.plan,
              monthlyProposalLimit: config.monthlyProposalLimit,
            },
          });
          logger.info("Org plan updated via subscription change", {
            orgId,
            plan: config.plan,
          });
        }
      }
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const orgId = sub.metadata?.orgId;

      if (!orgId) {
        logger.warn(
          "customer.subscription.deleted: missing orgId in metadata",
          {
            subscriptionId: sub.id,
          },
        );
        return;
      }

      await db.organization.update({
        where: { id: orgId },
        data: { plan: "starter", monthlyProposalLimit: 10 },
      });

      logger.info("Org reverted to starter on subscription cancellation", {
        orgId,
      });
      break;
    }

    default:
      break;
  }
}
