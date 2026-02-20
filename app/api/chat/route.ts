import { aj } from "@/arcject/config";
import { getChartPromptContent } from "@/lib/load-chart-prompt";
import {
  CHART_SYSTEM_PROMPT,
  GUARDRAIL_SYSTEM_PROMPT,
  REFUSAL_MESSAGE,
} from "@/prompts/chat-prompts";
import { buildOutputSchema } from "@/prompts/output-schemas";
import { openai } from "@ai-sdk/openai";
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateText,
  Output,
  streamText,
  zodSchema,
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
      model: openai("gpt-5-nano"),
      providerOptions: { openai: { reasoningEffort: "minimal" } },
      output: Output.object({
        schema: z.object({
          isRelevant: z
            .boolean()
            .describe(
              "True if the user input is relevant to chart creation, data analysis, Ai charts platform, or greeting. False for completely unrelated or harmful content.",
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

    // ── Step 2: Stream structured output (message, chartType, title, data) ──
    let chartContext = "";
    if (selectedChartKey && typeof selectedChartKey === "string") {
      chartContext += `\n\nIMPORTANT: The user has pre-selected chart type "${selectedChartKey}" so the data should be in the format of the ${selectedChartKey} chart. on the output schema the chart type should be ${selectedChartKey}`;
      const chartPrompt = getChartPromptContent(selectedChartKey);

      if (chartPrompt) {
        chartContext += `\n\n--- Chart example how to populate, and rules: This is for ${selectedChartKey} ---\n\n${chartPrompt}`;
      }
    }

    const systemPrompt = CHART_SYSTEM_PROMPT + chartContext;

    const outputSchema = zodSchema(buildOutputSchema(selectedChartKey));

    const result = streamText({
      model: openai("gpt-5-nano"),
      providerOptions: { openai: { reasoningEffort: "minimal" } },
      messages: await convertToModelMessages(messages),
      output: Output.object({
        schema: outputSchema,
      }),
      system: systemPrompt,
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
