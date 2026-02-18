import { aj } from "@/arcject/config";
import { generateChartImageUrl } from "@/lib/chart-image-utils";
import { getChartPromptContent } from "@/lib/load-chart-prompt";
import { CHART_DATA_SCHEMAS } from "@/prompts/chart-schemas";
import {
  CHART_SYSTEM_PROMPT,
  GUARDRAIL_SYSTEM_PROMPT,
  REFUSAL_MESSAGE,
} from "@/prompts/chat-prompts";
import { CHART_TYPE_KEYS } from "@/prompts/chat-schema";
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

/** Fallback generic data schema when no specific chart type is selected */
const GENERIC_DATA_SCHEMA = z.union([
  z.array(z.record(z.string(), z.unknown())).min(1),
  z.object({
    _data: z.array(z.record(z.string(), z.unknown())).min(1),
    _seriesColors: z.record(z.string(), z.string()).optional(),
  }),
]);

/**
 * Build the createChart tool input schema dynamically.
 * When selectedChartKey is known, `data` uses the EXACT per-chart Zod schema
 * so the LLM sees the precise fields it must produce.
 */
function buildCreateChartSchema(selectedChartKey?: string) {
  const dataSchema = selectedChartKey
    ? ((CHART_DATA_SCHEMAS[selectedChartKey] as z.ZodType<unknown>) ??
      GENERIC_DATA_SCHEMA)
    : GENERIC_DATA_SCHEMA;

  return z.object({
    chartType: z.enum(CHART_TYPE_KEYS).describe("Chart type key"),
    title: z.string().optional().describe("Chart title"),
    data: dataSchema.describe(
      selectedChartKey
        ? `Data for ${selectedChartKey}. Follow the exact schema.`
        : "Data array — shape depends on chartType.",
    ),
  });
}

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
    let chartContext = "";
    if (selectedChartKey && typeof selectedChartKey === "string") {
      chartContext += `\n\nIMPORTANT: The user has pre-selected chart type "${selectedChartKey}". You MUST use chartType "${selectedChartKey}" when calling createChart.`;
      const chartPrompt = getChartPromptContent(selectedChartKey);
      if (chartPrompt) {
        chartContext += `\n\n--- Chart-specific schema and rules for ${selectedChartKey} ---\n\n${chartPrompt}`;
      }
    }
    const systemPrompt = CHART_SYSTEM_PROMPT + chartContext;

    const inputSchema = buildCreateChartSchema(selectedChartKey);

    const result = streamText({
      model: openai("gpt-5-nano"),
      providerOptions: { openai: { reasoningEffort: "minimal" } },
      messages: await convertToModelMessages(messages),
      system: systemPrompt,
      stopWhen: stepCountIs(2),
      tools: {
        createChart: tool({
          description:
            "Create a chart with the given configuration. Call this to create the chart with the given data or the requested one.",
          inputSchema,
          execute: async ({ chartType, title, data }) => {
            let processedData = data;

            // ── Shadcn Cartesian post-processing: fix color format ──
            const SHADCN_CARTESIAN = [
              "shadcn:bar",
              "shadcn:area",
              "shadcn:line",
              "shadcn:radar",
            ];
            if (
              SHADCN_CARTESIAN.includes(chartType) &&
              Array.isArray(data) &&
              data.length > 0
            ) {
              // AI may have added "color" to items (Rosencharts style) — convert to _seriesColors wrapper
              const first = data[0] as Record<string, unknown>;
              const categoryKey =
                chartType === "shadcn:radar"
                  ? "subject"
                  : Object.keys(first).find(
                      (k) => typeof first[k] === "string" && k !== "color",
                    );
              const seriesKeys = Object.keys(first).filter(
                (k) => typeof first[k] === "number" && k !== "color",
              );

              // Check if AI put "color" on items or put hex strings on non-standard keys
              const hasColorProp = data.some(
                (item: Record<string, unknown>) => "color" in item,
              );
              const hasSeriesColorProps =
                seriesKeys.length > 0 &&
                data.some((item: Record<string, unknown>) => {
                  return Object.keys(item).some(
                    (k) =>
                      k !== "color" &&
                      k !== "fill" &&
                      k !== categoryKey &&
                      typeof item[k] === "string" &&
                      /^#[0-9a-fA-F]{3,8}$/.test(item[k] as string),
                  );
                });

              if (hasColorProp || hasSeriesColorProps) {
                const seriesColors: Record<string, string> = {};
                const cleanRows: Record<string, unknown>[] = [];

                for (const item of data as Record<string, unknown>[]) {
                  const row: Record<string, unknown> = {};
                  for (const [k, v] of Object.entries(item)) {
                    if (k === "color" && typeof v === "string") {
                      // AI put one "color" per row — assign to each series sequentially
                      if (seriesKeys.length === 1) {
                        seriesColors[seriesKeys[0]] = v;
                      }
                    } else {
                      row[k] = v;
                    }
                  }
                  cleanRows.push(row);
                }

                // If AI put separate color keys like "desktop_color": "#hex", try to match
                if (
                  Object.keys(seriesColors).length === 0 &&
                  hasSeriesColorProps
                ) {
                  for (const item of data as Record<string, unknown>[]) {
                    for (const [k, v] of Object.entries(item)) {
                      if (
                        k !== "color" &&
                        k !== "fill" &&
                        k !== categoryKey &&
                        typeof v === "string" &&
                        /^#[0-9a-fA-F]{3,8}$/.test(v)
                      ) {
                        // Key might be "seriesName" with a hex value, or a color key
                        const matchedSeries = seriesKeys.find((sk) =>
                          k.toLowerCase().includes(sk.toLowerCase()),
                        );
                        if (matchedSeries) {
                          seriesColors[matchedSeries] = v;
                        }
                      }
                    }
                    break; // Only need first row for color extraction
                  }
                }

                if (Object.keys(seriesColors).length > 0) {
                  processedData = {
                    _data: cleanRows,
                    _seriesColors: seriesColors,
                  };
                }
              }
            }

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
