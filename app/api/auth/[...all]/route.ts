import { handler } from "@/lib/auth-server";

// Proxy Better Auth requests from Next.js to the Convex deployment.
// All /api/auth/* requests are handled here.
export const { GET, POST } = handler;
