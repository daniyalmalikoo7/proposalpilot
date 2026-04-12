import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/proposals(.*)",
  "/knowledge-base(.*)",
  "/settings(.*)",
  "/onboarding(.*)",
]);

// Auth pages that signed-in users should be bounced away from immediately.
const isAuthRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  const { userId } = await auth();

  // Already authenticated → skip auth pages, go straight to dashboard.
  if (isAuthRoute(request) && userId) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isProtectedRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
