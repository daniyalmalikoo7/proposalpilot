import { initTRPC, TRPCError } from "@trpc/server";
import { type FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { auth, clerkClient } from "@clerk/nextjs/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";

// ─── Context ──────────────────────────────────────────────────────────────────

export type Context = {
  db: typeof db;
  clerkUserId: string | null;
  orgId: string | null; // Clerk org ID (e.g. "org_xxx")
};

export async function createContext(
  _opts: FetchCreateContextFnOptions,
): Promise<Context> {
  const { userId, orgId } = await auth();
  return {
    db,
    clerkUserId: userId,
    orgId: orgId ?? null,
  };
}

// ─── tRPC Initialization ──────────────────────────────────────────────────────

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

// ─── Timing Middleware ────────────────────────────────────────────────────────

const timingMiddleware = t.middleware(async (opts) => {
  const start = performance.now();
  const result = await opts.next();
  const durationMs = Math.round(performance.now() - start);
  logger.info(`[PERF] ${opts.path}: ${durationMs}ms`, {
    procedure: opts.path,
    type: opts.type,
    durationMs,
  });
  return result;
});

// ─── Router & Procedure Builders ──────────────────────────────────────────────

export const router = t.router;
export const publicProcedure = t.procedure.use(timingMiddleware);

/**
 * Protected procedure — requires a valid Clerk session.
 */
export const protectedProcedure = publicProcedure.use(({ ctx, next }) => {
  if (!ctx.clerkUserId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Authentication required.",
    });
  }
  return next({
    ctx: {
      ...ctx,
      clerkUserId: ctx.clerkUserId,
    },
  });
});

/**
 * Organization-scoped procedure — requires an active Clerk org in the session,
 * looks up the internal Organization record by clerkOrgId, and injects
 * internalOrgId (the DB primary key CUID) into ctx.
 *
 * SEC-003: Org access is derived entirely from the Clerk session JWT — never
 * from client-supplied input — to prevent IDOR attacks. Individual procedures
 * must use ctx.internalOrgId for all DB queries; they must NOT trust input.orgId.
 */
export const orgProtectedProcedure = protectedProcedure.use(
  async ({ ctx, next }) => {
    if (!ctx.orgId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "No active organization in session.",
      });
    }

    let org = await ctx.db.organization.findUnique({
      where: { clerkOrgId: ctx.orgId },
      select: { id: true },
    });

    if (!org) {
      // Auto-provision: first request after org creation in Clerk
      const client = await clerkClient();
      const clerkOrg = await client.organizations.getOrganization({
        organizationId: ctx.orgId,
      });
      org = await ctx.db.organization.create({
        data: { clerkOrgId: ctx.orgId, name: clerkOrg.name },
        select: { id: true },
      });
    }

    return next({ ctx: { ...ctx, internalOrgId: org.id } });
  },
);
