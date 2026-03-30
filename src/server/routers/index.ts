import { router } from "@/server/trpc";
import { proposalRouter } from "./proposal";
import { kbRouter } from "./kb";
import { aiRouter } from "./ai";

export const appRouter = router({
  proposal: proposalRouter,
  kb: kbRouter,
  ai: aiRouter,
});

export type AppRouter = typeof appRouter;
