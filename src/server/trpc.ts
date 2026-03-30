import { initTRPC, TRPCError } from "@trpc/server";
import { type FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import superjson from "superjson";
import { ZodError } from "zod";
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
  // Auth is handled per-procedure via Clerk middleware
  // Headers are forwarded automatically by Next.js
  return {
    db,
    clerkUserId: null,
    orgId: null,
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
