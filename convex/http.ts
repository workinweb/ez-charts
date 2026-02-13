import { httpRouter } from "convex/server";
import { authComponent, createAuth } from "./betterAuth/auth";

const http = httpRouter();

// Register Better Auth routes on the Convex HTTP deployment.
// This handles /api/auth/* endpoints (sign-in, sign-up, sign-out, session, etc.)
authComponent.registerRoutes(http, createAuth);

export default http;
