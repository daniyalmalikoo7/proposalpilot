import { router } from "@/server/trpc";
import { proposalRouter } from "./proposal";
import { kbRouter } from "./kb";
import { aiRouter } from "./ai";
import { billingRouter } from "./billing";

export const appRouter = router({
  proposal: proposalRouter,
  kb: kbRouter,
  ai: aiRouter,
  billing: billingRouter,
});

export type AppRouter = typeof appRouter;
