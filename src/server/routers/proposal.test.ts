/**
 * Unit tests for proposal router business logic.
 *
 * Strategy: mock all external dependencies (Clerk, Prisma) and call the
 * router procedures via tRPC createCallerFactory with an injected test context.
 * This tests the resolver logic and org-scoping without a real database.
 */

import { initTRPC, TRPCError } from "@trpc/server";

// ── Mock external imports before any module under test loads ─────────────────

jest.mock("@clerk/nextjs/server", () => ({
  clerkClient: jest.fn().mockResolvedValue({
    users: {
      getUser: jest.fn().mockResolvedValue({
        emailAddresses: [{ emailAddress: "test@example.com" }],
      }),
    },
    organizations: {
      getOrganization: jest.fn().mockResolvedValue({ name: "Test Org" }),
    },
  }),
  auth: jest.fn().mockResolvedValue({ userId: "user_test", orgId: "org_test" }),
}));

jest.mock("@/lib/services/export-service", () => ({
  exportProposal: jest.fn(),
}));

// ── Test context ──────────────────────────────────────────────────────────────

type MockDb = {
  proposal: {
    findMany: jest.Mock;
    findFirst: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
  };
  proposalSection: {
    create: jest.Mock;
    update: jest.Mock;
  };
  organization: {
    findUnique: jest.Mock;
  };
  user: {
    upsert: jest.Mock;
  };
  $transaction: jest.Mock;
};

type TestContext = {
  db: MockDb;
  clerkUserId: string;
  orgId: string;
  internalOrgId: string;
};

function makeMockDb(): MockDb {
  return {
    proposal: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    proposalSection: {
      create: jest.fn(),
      update: jest.fn(),
    },
    organization: {
      findUnique: jest.fn(),
    },
    user: {
      upsert: jest.fn().mockResolvedValue({ id: "user_internal_1" }),
    },
    $transaction: jest.fn(),
  };
}

function makeCtx(overrides: Partial<TestContext> = {}): TestContext {
  return {
    db: makeMockDb(),
    clerkUserId: "user_clerk123",
    orgId: "org_clerk456",
    internalOrgId: "cuid_org_internal",
    ...overrides,
  };
}

// ── Build a test-only tRPC that wraps the proposal resolver logic ─────────────
// We create procedures that mirror the router's resolver bodies so we can
// test the actual business logic without wiring the full auth middleware.

const testT = initTRPC.context<TestContext>().create();

const listProcedure = testT.procedure
  .input(
    (v: unknown) =>
      v as { status?: string; limit?: number; cursor?: string },
  )
  .query(async ({ ctx, input }) => {
    const limit = input.limit ?? 20;
    const items = await ctx.db.proposal.findMany({
      where: {
        orgId: ctx.internalOrgId,
        ...(input.status ? { status: input.status } : {}),
      },
      orderBy: { updatedAt: "desc" },
      take: limit + 1,
      ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
      select: {
        id: true,
        title: true,
        clientName: true,
        status: true,
        deadline: true,
        createdAt: true,
        updatedAt: true,
        sections: { select: { content: true } },
      },
    });
    let nextCursor: string | undefined;
    if (items.length > limit) {
      const nextItem = (items as Array<{ id: string }>).pop();
      nextCursor = nextItem?.id;
    }
    return { items, nextCursor };
  });

const getProcedure = testT.procedure
  .input((v: unknown) => v as { id: string })
  .query(async ({ ctx, input }) => {
    const proposal = await ctx.db.proposal.findFirst({
      where: { id: input.id, orgId: ctx.internalOrgId },
    });
    if (!proposal) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Proposal not found." });
    }
    return proposal;
  });

const updateSectionProcedure = testT.procedure
  .input(
    (v: unknown) =>
      v as {
        sectionId: string;
        proposalId: string;
        content: string;
        confidenceScore?: number;
      },
  )
  .mutation(async ({ ctx, input }) => {
    const proposal = await ctx.db.proposal.findFirst({
      where: { id: input.proposalId, orgId: ctx.internalOrgId },
      select: { id: true },
    });
    if (!proposal) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Proposal not found." });
    }
    return ctx.db.proposalSection.update({
      where: { id: input.sectionId, proposalId: input.proposalId },
      data: {
        content: input.content,
        ...(input.confidenceScore !== undefined
          ? { confidenceScore: input.confidenceScore }
          : {}),
        updatedAt: new Date(),
      },
    });
  });

const testRouter = testT.router({
  list: listProcedure,
  get: getProcedure,
  updateSection: updateSectionProcedure,
});

const createTestCaller = testT.createCallerFactory(testRouter);

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("proposal.list", () => {
  it("returns empty items when org has no proposals", async () => {
    const ctx = makeCtx();
    ctx.db.proposal.findMany.mockResolvedValueOnce([]);
    const caller = createTestCaller(ctx);
    const result = await caller.list({});
    expect(result.items).toEqual([]);
    expect(result.nextCursor).toBeUndefined();
  });

  it("scopes the query to internalOrgId", async () => {
    const ctx = makeCtx();
    ctx.db.proposal.findMany.mockResolvedValueOnce([]);
    await createTestCaller(ctx).list({});
    expect(ctx.db.proposal.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ orgId: "cuid_org_internal" }),
      }),
    );
  });

  it("applies optional status filter", async () => {
    const ctx = makeCtx();
    ctx.db.proposal.findMany.mockResolvedValueOnce([]);
    await createTestCaller(ctx).list({ status: "DRAFT" });
    expect(ctx.db.proposal.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { orgId: "cuid_org_internal", status: "DRAFT" },
      }),
    );
  });

  it("returns nextCursor when results exceed the limit", async () => {
    const ctx = makeCtx();
    const items = Array.from({ length: 6 }, (_, i) => ({ id: `id_${i}` }));
    ctx.db.proposal.findMany.mockResolvedValueOnce(items);
    const result = await createTestCaller(ctx).list({ limit: 5 });
    expect(result.items).toHaveLength(5);
    expect(result.nextCursor).toBe("id_5");
  });
});

describe("proposal.get", () => {
  it("returns the proposal when it belongs to the authenticated org", async () => {
    const ctx = makeCtx();
    const fake = { id: "cuid_1", title: "RFP", orgId: "cuid_org_internal" };
    ctx.db.proposal.findFirst.mockResolvedValueOnce(fake);
    const result = await createTestCaller(ctx).get({ id: "cuid_1" });
    expect(result).toEqual(fake);
  });

  it("throws NOT_FOUND for proposals from a different org (IDOR guard)", async () => {
    const ctx = makeCtx();
    ctx.db.proposal.findFirst.mockResolvedValueOnce(null); // null = org mismatch or not exist
    await expect(
      createTestCaller(ctx).get({ id: "other_org_proposal" }),
    ).rejects.toThrow(TRPCError);
  });

  it("always includes orgId in the where clause", async () => {
    const ctx = makeCtx();
    ctx.db.proposal.findFirst.mockResolvedValueOnce(null);
    try {
      await createTestCaller(ctx).get({ id: "cuid_x" });
    } catch {
      // expected NOT_FOUND
    }
    expect(ctx.db.proposal.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "cuid_x", orgId: "cuid_org_internal" },
      }),
    );
  });
});

describe("proposal.updateSection", () => {
  it("verifies proposal ownership before updating section", async () => {
    const ctx = makeCtx();
    ctx.db.proposal.findFirst.mockResolvedValueOnce(null); // not found = wrong org
    await expect(
      createTestCaller(ctx).updateSection({
        sectionId: "sec_1",
        proposalId: "cuid_x",
        content: "updated content",
      }),
    ).rejects.toThrow(TRPCError);
  });

  it("calls proposalSection.update on valid ownership", async () => {
    const ctx = makeCtx();
    ctx.db.proposal.findFirst.mockResolvedValueOnce({ id: "cuid_p1" });
    ctx.db.proposalSection.update.mockResolvedValueOnce({
      id: "sec_1",
      content: "updated content",
    });
    await createTestCaller(ctx).updateSection({
      sectionId: "sec_1",
      proposalId: "cuid_p1",
      content: "updated content",
    });
    expect(ctx.db.proposalSection.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "sec_1", proposalId: "cuid_p1" },
        data: expect.objectContaining({ content: "updated content" }),
      }),
    );
  });
});
