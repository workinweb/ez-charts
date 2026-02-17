import { aj } from "@/arcject/config";
import { createChartInputSchema } from "@/lib/chat-chart-schema";
import { generateChartImageUrl } from "@/lib/chart-image-utils";
import {
  CHART_SYSTEM_PROMPT,
  GUARDRAIL_SYSTEM_PROMPT,
  REFUSAL_MESSAGE,
} from "@/prompts/chat-prompts";
import { openai } from "@ai-sdk/openai";
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateText,
  Output,
  stepCountIs,
  streamText,
  tool,
} from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    // ── Arcjet protection ──────────────────────────────────────────
    if (!process.env.NEXT_PUBLIC_IS_DEV_MODE) {
      const decision = await aj.protect(req, { requested: 15 });

      if (decision.reason.isRateLimit()) {
        return NextResponse.json(
          {
            error: "Too Many Requests",
            message:
              "You have reached the rate limit for today. Please try again tomorrow.",
          },
          { status: 429 },
        );
      }
    }

    const { messages, selectedChartKey } = await req.json();

    // ── Step 1: Guardrail ──────────────────────────────────────────
    const { output: guardrail } = await generateText({
      model: openai("gpt-4o-mini"),
      output: Output.object({
        schema: z.object({
          isRelevant: z
            .boolean()
            .describe(
              "True if the user input is relevant to chart creation, data analysis, Aicharts platform, or greeting. False for completely unrelated or harmful content.",
            ),
          reasoning: z.string().describe("Brief explanation."),
        }),
      }),
      system: GUARDRAIL_SYSTEM_PROMPT,
      messages: await convertToModelMessages(messages),
    });

    if (!guardrail.isRelevant) {
      const stream = createUIMessageStream({
        async execute({ writer }) {
          const textId = "refusal-text";
          writer.write({ type: "text-start", id: textId });
          for (const char of REFUSAL_MESSAGE) {
            writer.write({ type: "text-delta", id: textId, delta: char });
            await new Promise((r) => setTimeout(r, 8));
          }
          writer.write({ type: "text-end", id: textId });
        },
      });
      return createUIMessageStreamResponse({ stream });
    }

    // ── Step 2: Stream the AI response; chart config via createChart tool ──
    const chartTypeHint =
      selectedChartKey && typeof selectedChartKey === "string"
        ? `\n\nIMPORTANT: The user has pre-selected chart type "${selectedChartKey}". You MUST use chartType "${selectedChartKey}" when calling createChart.`
        : "";
    const systemPrompt = CHART_SYSTEM_PROMPT + chartTypeHint;

    const result = streamText({
      model: openai("gpt-4.1-nano"),
      messages: await convertToModelMessages(messages),
      system: systemPrompt,
      stopWhen: stepCountIs(2),
      tools: {
        createChart: tool({
          description:
            "Create a chart with the given configuration. Call this when the user asks for a chart and you have the data ready.",
          inputSchema: createChartInputSchema,
          execute: async ({ chartType, title, data }) => {
            let processedData = data;

            if (chartType === "horizontal-bar-image") {
              processedData = (data as Array<Record<string, unknown>>).map(
                (item) => {
                  const key =
                    (item.key as string) ?? (item.name as string) ?? "";
                  return {
                    ...item,
                    image: (item.image as string) ?? generateChartImageUrl(key),
                  };
                },
              );
            } else if (chartType === "pie-image") {
              processedData = (data as Array<Record<string, unknown>>).map(
                (item) => {
                  const name =
                    (item.name as string) ?? (item.key as string) ?? "";
                  return {
                    ...item,
                    logo: (item.logo as string) ?? generateChartImageUrl(name),
                  };
                },
              );
            }

            return {
              chartType,
              title: title ?? "Chart",
              data: processedData,
            };
          },
        }),
      },
    });

    return result.toUIMessageStreamResponse({
      messageMetadata: ({ part }) => {
        if (part.type === "finish" && part.totalUsage) {
          return {
            inputTokens: part.totalUsage.inputTokens,
            outputTokens: part.totalUsage.outputTokens,
            totalTokens: part.totalUsage.totalTokens,
          };
        }
      },
    });
  } catch (error) {
    console.error("Error in chat route:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again later." },
      { status: 500 },
    );
  }
}
