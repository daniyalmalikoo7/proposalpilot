// C1 fix: Server Component wrapper forces dynamic rendering so Clerk is never
// called during static prerender. NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is only
// available at runtime, not build time. Route segment config only works in
// Server Components — not in "use client" files.
export const dynamic = "force-dynamic";

import { BrandVoiceClient } from "./brand-voice-client";

export default function BrandVoicePage() {
  return <BrandVoiceClient />;
}
