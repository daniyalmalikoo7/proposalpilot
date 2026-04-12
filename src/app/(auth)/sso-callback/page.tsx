import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

// Handles the OAuth redirect from Google (and any other OAuth providers).
// Clerk resolves the token and redirects to redirectUrlComplete.
export default function SSOCallbackPage() {
  return <AuthenticateWithRedirectCallback />;
}
