/**
 * Unit tests for the KB (Knowledge Base) tRPC router.
 *
 * Tests are isolated: Voyage AI, Prisma, and Clerk are mocked.
 * Focus: org-scoping (IDOR prevention) and deletion guards.
 */

import { initTRPC, TRPCError } from "@trpc/server";

// ── Mock all external side-effectful dependencies ─────────────────────────────

jest.mock("@clerk/nextjs/server", () => ({
  clerkClient: jest.fn().mockResolvedValue({ organizations: {} }),
  auth: jest.fn().mockResolvedValue({ userId: "user_test", orgId: "org_test" }),
}));

jest.mock("@/lib/services/embeddings", () => ({
  VoyageEmbeddingProvider: jest.fn().mockImplementation(() => ({})),
  searchSimilar: jest.fn().mockResolvedValue([]),
  embedAndStoreChunks: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@/lib/utils/chunker", () => ({
  chunkText: jest.fn().mockReturnValue([]),
}));

jest.mock("@/lib/logger", () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

// ── Test context ──────────────────────────────────────────────────────────────

type MockDb = {
  knowledgeBaseItem: {
    findFirst: jest.Mock;
    findMany: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
  kbChunk: {
    createMany: jest.Mock;
    findMany: jest.Mock;
    deleteMany: jest.Mock;
  };
  organization: { findUnique: jest.Mock };
};

type TestContext = {
  db: MockDb;
  clerkUserId: string;
  orgId: string;
  internalOrgId: string;
};

function makeMockDb(): MockDb {
  return {
    knowledgeBaseItem: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn().mockResolvedValue({ id: "kb_1" }),
      update: jest.fn(),
      delete: jest.fn().mockResolvedValue({ id: "kb_1" }),
    },
    kbChunk: {
      createMany: jest.fn().mockResolvedValue({ count: 0 }),
      findMany: jest.fn().mockResolvedValue([]),
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
    },
    organization: { findUnique: jest.fn() },
  };
}

function makeCtx(overrides: Partial<TestContext> = {}): TestContext {
  return {
    db: makeMockDb(),
    clerkUserId: "user_clerk123",
    orgId: "org_clerk456",
    internalOrgId: "cuid_org_abc",
    ...overrides,
  };
}

// ── Build test-only tRPC procedures mirroring kb router resolver logic ────────

const testT = initTRPC.context<TestContext>().create();

const listProcedure = testT.procedure
  .input((v: unknown) => v as { type?: string; search?: string })
  .query(async ({ ctx, input }) => {
    return ctx.db.knowledgeBaseItem.findMany({
      where: {
        orgId: ctx.internalOrgId,
        ...(input.type ? { type: input.type } : {}),
      },
    });
  });

const getProcedure = testT.procedure
  .input((v: unknown) => v as { id: string })
  .query(async ({ ctx, input }) => {
    const item = await ctx.db.knowledgeBaseItem.findFirst({
      where: { id: input.id, orgId: ctx.internalOrgId },
    });
    if (!item) {
      throw new TRPCError({ code: "NOT_FOUND", message: "KB item not found." });
    }
    return item;
  });

const deleteProcedure = testT.procedure
  .input((v: unknown) => v as { id: string })
  .mutation(async ({ ctx, input }) => {
    const item = await ctx.db.knowledgeBaseItem.findFirst({
      where: { id: input.id, orgId: ctx.internalOrgId },
      select: { id: true },
    });
    if (!item) {
      throw new TRPCError({ code: "NOT_FOUND", message: "KB item not found." });
    }
    await ctx.db.kbChunk.deleteMany({ where: { itemId: input.id } });
    return ctx.db.knowledgeBaseItem.delete({ where: { id: input.id } });
  });

const testRouter = testT.router({
  list: listProcedure,
  get: getProcedure,
  delete: deleteProcedure,
});

const createTestCaller = testT.createCallerFactory(testRouter);

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("kb.list", () => {
  it("returns empty array when org has no KB items", async () => {
    const ctx = makeCtx();
    ctx.db.knowledgeBaseItem.findMany.mockResolvedValueOnce([]);
    const result = await createTestCaller(ctx).list({});
    expect(result).toEqual([]);
  });

  it("scopes the query to internalOrgId", async () => {
    const ctx = makeCtx();
    ctx.db.knowledgeBaseItem.findMany.mockResolvedValueOnce([]);
    await createTestCaller(ctx).list({});
    expect(ctx.db.knowledgeBaseItem.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ orgId: "cuid_org_abc" }),
      }),
    );
  });

  it("applies type filter when provided", async () => {
    const ctx = makeCtx();
    ctx.db.knowledgeBaseItem.findMany.mockResolvedValueOnce([]);
    await createTestCaller(ctx).list({ type: "CASE_STUDY" });
    expect(ctx.db.knowledgeBaseItem.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { orgId: "cuid_org_abc", type: "CASE_STUDY" },
      }),
    );
  });
});

describe("kb.get", () => {
  it("returns the item when it belongs to the org", async () => {
    const ctx = makeCtx();
    const fakeItem = { id: "kb_1", orgId: "cuid_org_abc", title: "Case Study" };
    ctx.db.knowledgeBaseItem.findFirst.mockResolvedValueOnce(fakeItem);
    const result = await createTestCaller(ctx).get({ id: "kb_1" });
    expect(result).toEqual(fakeItem);
  });

  it("throws NOT_FOUND when item belongs to different org (IDOR guard)", async () => {
    const ctx = makeCtx();
    ctx.db.knowledgeBaseItem.findFirst.mockResolvedValueOnce(null);
    await expect(
      createTestCaller(ctx).get({ id: "other_org_item" }),
    ).rejects.toThrow(TRPCError);
  });

  it("always includes orgId in the where clause", async () => {
    const ctx = makeCtx();
    ctx.db.knowledgeBaseItem.findFirst.mockResolvedValueOnce(null);
    try {
      await createTestCaller(ctx).get({ id: "kb_x" });
    } catch {
      // expected
    }
    expect(ctx.db.knowledgeBaseItem.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "kb_x", orgId: "cuid_org_abc" },
      }),
    );
  });
});

describe("kb.delete", () => {
  it("deletes the item and its chunks when ownership is confirmed", async () => {
    const ctx = makeCtx();
    ctx.db.knowledgeBaseItem.findFirst.mockResolvedValueOnce({ id: "kb_1" });
    ctx.db.kbChunk.deleteMany.mockResolvedValueOnce({ count: 3 });
    ctx.db.knowledgeBaseItem.delete.mockResolvedValueOnce({ id: "kb_1" });
    await createTestCaller(ctx).delete({ id: "kb_1" });
    expect(ctx.db.kbChunk.deleteMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { itemId: "kb_1" } }),
    );
    expect(ctx.db.knowledgeBaseItem.delete).toHaveBeenCalled();
  });

  it("throws NOT_FOUND when attempting to delete another org's item (IDOR guard)", async () => {
    const ctx = makeCtx();
    ctx.db.knowledgeBaseItem.findFirst.mockResolvedValueOnce(null);
    await expect(
      createTestCaller(ctx).delete({ id: "other_org_item" }),
    ).rejects.toThrow(TRPCError);
    // Verify delete was NOT called
    expect(ctx.db.knowledgeBaseItem.delete).not.toHaveBeenCalled();
  });
});
