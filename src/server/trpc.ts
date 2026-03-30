import { initTRPC, TRPCError } from "@trpc/server";
import { type FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { auth } from "@clerk/nextjs/server";
import superjson from "superjson";
import { z, ZodError } from "zod";
import { db } from "@/lib/db";

// ─── Context ──────────────────────────────────────────────────────────────────

export type Context = {
  db: typeof db;
  clerkUserId: string | null;
  orgId: string | null;
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

// ─── Router & Procedure Builders ──────────────────────────────────────────────

export const router = t.router;
export const publicProcedure = t.procedure;

/**
 * Protected procedure — requires a valid Clerk session.
 * The orgId is injected from the Clerk session claims.
 */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
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
 * Organization-scoped procedure — requires auth AND enforces that
 * ctx.orgId (from Clerk session) matches input.orgId.
 * SEC-003: Prevents IDOR by never trusting client-provided orgId.
 */
export const orgProtectedProcedure = protectedProcedure
  .input(z.object({ orgId: z.string() }).passthrough())
  .use(async ({ ctx, input, next }) => {
    const { orgId } = input as { orgId: string };
    if (!ctx.orgId || ctx.orgId !== orgId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Organization access denied.",
      });
    }
    return next({ ctx: { ...ctx, orgId: ctx.orgId } });
  });
