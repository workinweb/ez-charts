import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.daily(
  "finalize-expired-downgrades",
  { hourUTC: 0, minuteUTC: 0 },
  internal.tiers.planLimits.finalizeExpiredDowngrades,
);

export default crons;
