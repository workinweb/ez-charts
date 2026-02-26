import { ajOpinions } from "@/arcject/config";
import { api } from "@/convex/_generated/api";
import { fetchAuthMutation, fetchAuthQuery } from "@/lib/(auth)/auth-server";
import { OPINION_CATEGORIES } from "@/convex/opinions";
import type { OpinionCategory } from "@/convex/opinions";
import { NextResponse } from "next/server";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    // Auth check — need userId for Arcjet and Convex
    const userId = await fetchAuthQuery(api.opinions.getCurrentUserId);
    if (!userId) {
      return NextResponse.json(
        { error: "Sign in to submit feedback." },
        { status: 401 },
      );
    }

    // Arcjet rate limit: 3 feedbacks per user per 24h
    const decision = await ajOpinions.protect(req, {
      userId,
    });
    if (decision.isDenied()) {
      return NextResponse.json(
        {
          error:
            "You've reached the limit of 3 feedback submissions per day. Please try again tomorrow.",
        },
        { status: 429 },
      );
    }

    const body = await req.json();
    const { content, category, categoryCustom } = body as {
      content?: unknown;
      category?: unknown;
      categoryCustom?: unknown;
    };

    const contentStr =
      typeof content === "string" ? content.trim() : "";
    if (!contentStr || contentStr.length > 2000) {
      return NextResponse.json(
        { error: "Feedback must be 1–2000 characters." },
        { status: 400 },
      );
    }
    if (
      !category ||
      typeof category !== "string" ||
      !OPINION_CATEGORIES.includes(category as OpinionCategory)
    ) {
      return NextResponse.json(
        { error: "Invalid category." },
        { status: 400 },
      );
    }
    const categoryCustomStr =
      category === "other" && typeof categoryCustom === "string"
        ? categoryCustom.trim().slice(0, 60)
        : undefined;

    const opinionId = await fetchAuthMutation(api.opinions.create, {
      content: contentStr,
      category: category as OpinionCategory,
      categoryCustom: categoryCustomStr,
    });

    return NextResponse.json({ opinionId });
  } catch (err) {
    console.error("Error creating opinion:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to submit feedback.",
      },
      { status: 500 },
    );
  }
}
