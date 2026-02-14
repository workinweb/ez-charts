"use client";

import { createContext, useContext, useCallback, useEffect, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { AttachedChartContext } from "@/stores/chatbot-store";
import { useChatbotStore } from "@/stores/chatbot-store";
import { useChartsStore } from "@/stores/charts-store";

type UseChatReturn = ReturnType<typeof useChat>;

interface ChatContextValue {
  messages: UseChatReturn["messages"];
  status: UseChatReturn["status"];
  error: UseChatReturn["error"];
  sendMessage: UseChatReturn["sendMessage"];
  stop: UseChatReturn["stop"];
  input: string;
  setInput: (value: string) => void;
  handleSubmit: (e?: React.FormEvent) => void;
  startNewChat: () => void;
  attachedFiles: ReturnType<typeof useChatbotStore.getState>["attachedFiles"];
  addFiles: (files: FileList | File[]) => void;
  removeFile: (index: number) => void;
  clearFiles: () => void;
  attachedChartContext: ReturnType<typeof useChatbotStore.getState>["attachedChartContext"];
  setAttachedChartContext: (ctx: AttachedChartContext | null) => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

/** Serialize messages for chatConversations/chatMessages (internal prompt improvement). */
function serializeMessagesForChat(
  messages: Array<{
    id?: string;
    role?: string;
    parts?: Array<{
      type?: string;
      text?: string;
      state?: string;
      output?: unknown;
    }>;
  }>,
  feedbackMap: Record<string, "liked" | "disliked">,
): Array<{ role: string; content: string; chartType?: string; feedback?: "liked" | "disliked" }> {
  return messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((msg) => {
      let content = "";
      let chartType: string | undefined;
      if (msg.parts) {
        for (const p of msg.parts) {
          if (p?.type === "text" && p.text) {
            content += p.text;
          } else if (
            p?.type === "tool-createChart" &&
            p?.state === "output-available" &&
            p?.output &&
            typeof p.output === "object" &&
            "chartType" in p.output
          ) {
            chartType = (p.output as { chartType: string }).chartType;
          }
        }
      }
      const feedback = msg.id ? feedbackMap[msg.id] : undefined;
      return {
        role: msg.role ?? "user",
        content: content.slice(0, 8000),
        ...(chartType && { chartType }),
        ...(feedback && { feedback }),
      };
    })
    .filter((m) => m.content.trim().length > 0);
}

function extractChartFromToolPart(
  part: { type?: string; state?: string; output?: unknown },
): { chartType: string; title: string; data: unknown } | null {
  if (
    part?.type === "tool-createChart" &&
    part?.state === "output-available" &&
    part?.output &&
    typeof part.output === "object" &&
    "chartType" in part.output &&
    "data" in part.output
  ) {
    const o = part.output as { chartType: string; title?: string; data: unknown };
    return {
      chartType: o.chartType,
      title: o.title ?? "Chart",
      data: o.data,
    };
  }
  return null;
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const chat = useChat();
  const saveConversationMutation = useMutation(api.chat.saveEndedConversation);
  const {
    input,
    setInput,
    attachedFiles,
    addFiles,
    removeFile,
    clearFiles,
    attachedChartContext,
    setAttachedChartContext,
    selectedChartKey,
    chartFeedbackMap,
    clearChartFeedback,
  } = useChatbotStore();
  const addChartFromTool = useChartsStore((s) => s.addChartFromTool);
  const processedToolCalls = useRef<Set<string>>(new Set());

  // Extract createChart tool results and add to charts store
  useEffect(() => {
    for (const msg of chat.messages) {
      if (msg.role !== "assistant" || !msg.parts) continue;
      for (const part of msg.parts) {
        const p = part as { type?: string; state?: string; output?: unknown; toolCallId?: string };
        const toolCallId = p.toolCallId;
        if (!toolCallId || processedToolCalls.current.has(toolCallId)) continue;
        const chart = extractChartFromToolPart(p);
        if (chart) {
          processedToolCalls.current.add(toolCallId);
          addChartFromTool(chart as { chartType: import("@/components/rosencharts").ChartTypeKey; title: string; data: unknown });
        }
      }
    }
  }, [chat.messages, addChartFromTool]);

  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      const trimmed = input.trim();
      const hasFiles = attachedFiles.some((f) => f.parsedContent);
      const hasChart = !!attachedChartContext;

      if (!trimmed && !hasFiles && !hasChart) return;

      let messageText = trimmed;

      const contextParts: string[] = [];
      if (hasFiles) {
        const fileParts = attachedFiles
          .filter((f) => f.parsedContent)
          .map((f) => `[Attached file: ${f.name}]\n${f.parsedContent}`);
        contextParts.push(...fileParts);
      }
      if (hasChart) {
        const chartCtx = `[Attached chart: ${attachedChartContext.title}]\nChart type: ${attachedChartContext.chartType}\nData:\n${JSON.stringify(attachedChartContext.data, null, 2)}`;
        contextParts.push(chartCtx);
      }
      if (contextParts.length > 0) {
        const combined = contextParts.join("\n\n");
        messageText = messageText ? `${messageText}\n\n---\n${combined}` : combined;
      }

      const chartKey = selectedChartKey ?? (hasChart ? attachedChartContext!.chartType : undefined);
      chat.sendMessage(
        { text: messageText },
        chartKey ? { body: { selectedChartKey: chartKey } } : undefined,
      );
      setInput("");
      clearFiles();
      setAttachedChartContext(null);
    },
    [input, chat, attachedFiles, attachedChartContext, setInput, clearFiles, selectedChartKey, setAttachedChartContext],
  );

  const startNewChat = useCallback(() => {
    const current = chat.messages;
    if (current.length > 0) {
      const messages = serializeMessagesForChat(current, chartFeedbackMap);
      if (messages.length > 0) {
        saveConversationMutation({ messages }).catch(() => {
          /* fire-and-forget */
        });
      }
    }
    chat.setMessages([]);
    chat.clearError();
    clearChartFeedback();
    setInput("");
    clearFiles();
    setAttachedChartContext(null);
  }, [chat, saveConversationMutation, chartFeedbackMap, clearChartFeedback, setInput, clearFiles, setAttachedChartContext]);

  return (
    <ChatContext.Provider
      value={{
        messages: chat.messages,
        status: chat.status,
        error: chat.error,
        sendMessage: chat.sendMessage,
        stop: chat.stop,
        input,
        setInput,
        handleSubmit,
        startNewChat,
        attachedFiles,
        addFiles,
        removeFile,
        clearFiles,
        attachedChartContext,
        setAttachedChartContext,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChatContext must be used within ChatProvider");
  return ctx;
}
